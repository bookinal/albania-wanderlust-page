import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  getWhatsAppConfig,
  sendWhatsAppTemplate,
  toWhatsAppNumber,
} from "../_shared/whatsapp.ts";

/**
 * WhatsApp alert to the provider when a client sends a new booking request,
 * so requests don't wait for someone to check their email.
 *
 * Called by the app right after the booking is created. Only the client who
 * made the booking can trigger it, only while it is a fresh pending request,
 * and only once per booking (booking.provider_whatsapp_status).
 *
 * Template (WhatsApp Manager, category Utility), body variables:
 *   {{1}} provider name   {{2}} property   {{3}} dates   {{4}} guest name   {{5}} total
 * The guest's phone and email are never sent: they unlock after payment/confirmation.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const TEMPLATE_NAME = Deno.env.get("WHATSAPP_TEMPLATE_NEW_REQUEST") || "new_booking_request";
const TEMPLATE_LANGUAGE = Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") || "en";

/** A request older than this is not "new" any more: no alert for it. */
const MAX_REQUEST_AGE_MS = 15 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const getPropertyLabel = async (
  supabaseAdmin: SupabaseClient,
  propertyType: string,
  propertyId: string,
): Promise<string> => {
  const isCar = propertyType === "car";
  const { data } = await supabaseAdmin
    .from(isCar ? "car" : "apartment")
    .select("*")
    .eq("id", Number(propertyId))
    .maybeSingle<{ name?: string | null; brand?: string | null }>();

  const name = isCar
    ? `${data?.brand ?? ""} ${data?.name ?? ""}`.trim()
    : (data?.name ?? "");
  return `${isCar ? "Car" : "Apartment"}: ${name || `#${propertyId}`}`;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    return json({ error: "Function not configured" }, 500);
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseUser.auth.getUser(token);
  if (authError || !user) return json({ error: "Invalid or expired token" }, 401);

  let bookingId: string | undefined;
  try {
    bookingId = (await req.json())?.bookingId;
  } catch {
    // handled below
  }
  if (!bookingId) return json({ error: "bookingId is required" }, 400);

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("booking")
    .select(
      'id, "userId", "providerId", "propertyId", "propertyType", "requesterName", "startDate", "endDate", "totalPrice", status, "createdAt", provider_whatsapp_status',
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) return json({ error: "Booking not found" }, 404);
  if (booking.userId !== user.id) return json({ error: "Forbidden" }, 403);
  if (booking.status !== "pending") return json({ skipped: "not_pending" });
  if (booking.provider_whatsapp_status) return json({ skipped: "already_notified" });
  if (Date.now() - new Date(booking.createdAt).getTime() > MAX_REQUEST_AGE_MS) {
    return json({ skipped: "request_too_old" });
  }

  // Claim the booking first so two calls can never send two messages
  const { data: claimed } = await supabaseAdmin
    .from("booking")
    .update({ provider_whatsapp_status: "sending" })
    .eq("id", booking.id)
    .is("provider_whatsapp_status", null)
    .select("id");
  if (!claimed?.length) return json({ skipped: "already_notified" });

  const finish = async (
    status: "sent" | "failed" | "no_phone" | "not_configured",
    extra: { provider_whatsapp_message_id?: string; provider_whatsapp_error?: string } = {},
  ) => {
    await supabaseAdmin
      .from("booking")
      .update({
        provider_whatsapp_status: status,
        provider_whatsapp_sent_at: status === "sent" ? new Date().toISOString() : null,
        ...extra,
      })
      .eq("id", booking.id);
    return json({ status });
  };

  const config = getWhatsAppConfig();
  if (!config) return finish("not_configured");

  if (!booking.providerId) return finish("no_phone"); // admin-managed property
  const { data: provider } = await supabaseAdmin
    .from("users")
    .select("full_name, phone")
    .eq("id", booking.providerId)
    .maybeSingle();

  const to = toWhatsAppNumber(provider?.phone);
  if (!to) return finish("no_phone");

  const propertyLabel = await getPropertyLabel(
    supabaseAdmin,
    booking.propertyType,
    booking.propertyId,
  );

  const result = await sendWhatsAppTemplate(config, {
    to,
    template: TEMPLATE_NAME,
    language: TEMPLATE_LANGUAGE,
    bodyParams: [
      provider?.full_name?.split(" ")[0] || "there",
      propertyLabel,
      `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`,
      booking.requesterName || "A guest",
      `€${Number(booking.totalPrice).toFixed(2)}`,
    ],
  });

  if (!result.ok) {
    console.error("[notify-provider-whatsapp] Send failed:", booking.id, result.error);
    return finish("failed", { provider_whatsapp_error: result.error?.slice(0, 500) });
  }
  return finish("sent", { provider_whatsapp_message_id: result.messageId });
});
