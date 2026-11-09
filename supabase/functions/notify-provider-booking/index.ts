import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { getProviderBookingNotificationTemplate } from "../_shared/providerBookingTemplate.ts";

/**
 * Email to the provider when a client sends a new booking request.
 *
 * The app only sends the booking id: the recipient and the content all come from
 * the database, so a logged-in user can't use this to send their own email.
 * Only the client who made the booking can trigger it, only while it is a fresh
 * pending request, and only once per booking (booking.provider_email_sent_at).
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

/** A request older than this is not "new" any more: no email for it. */
const MAX_REQUEST_AGE_MS = 15 * 60 * 1000;

/** Fixed, not the Origin header: the caller controls that one. */
const DASHBOARD_URL = "https://www.bookinal.com/dashboard/bookings";

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

const getPropertyName = async (
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
  return name || `#${propertyId}`;
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
      'id, "userId", "providerId", "propertyId", "propertyType", "requesterName", "startDate", "endDate", "totalPrice", status, payment_status, "createdAt", provider_email_sent_at',
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) console.error("[notify-provider-booking] Booking lookup failed:", bookingError);
  if (bookingError || !booking) return json({ error: "Booking not found" }, 404);
  if (booking.userId !== user.id) return json({ error: "Forbidden" }, 403);
  if (booking.status !== "pending") return json({ skipped: "not_pending" });
  if (booking.provider_email_sent_at) return json({ skipped: "already_notified" });
  if (Date.now() - new Date(booking.createdAt).getTime() > MAX_REQUEST_AGE_MS) {
    return json({ skipped: "request_too_old" });
  }

  if (!booking.providerId) return json({ skipped: "no_provider" }); // admin-managed property
  const { data: provider } = await supabaseAdmin
    .from("users")
    .select("email, full_name")
    .eq("id", booking.providerId)
    .maybeSingle();
  if (!provider?.email) return json({ skipped: "no_provider_email" });

  // Claim the booking first so two calls can never send two emails
  const { data: claimed } = await supabaseAdmin
    .from("booking")
    .update({ provider_email_sent_at: new Date().toISOString() })
    .eq("id", booking.id)
    .is("provider_email_sent_at", null)
    .select("id");
  if (!claimed?.length) return json({ skipped: "already_notified" });

  const propertyName = await getPropertyName(
    supabaseAdmin,
    booking.propertyType,
    booking.propertyId,
  );

  const html = getProviderBookingNotificationTemplate({
    providerName: provider.full_name || "Provider",
    propertyName,
    propertyType: booking.propertyType === "car" ? "Car" : "Apartment",
    guestName: booking.requesterName || "A guest",
    // Still locked on a new request: they unlock after payment or confirmation
    guestEmail: "",
    guestPhone: "",
    showGuestContact: false,
    checkInDate: formatDate(booking.startDate),
    checkOutDate: formatDate(booking.endDate),
    totalPrice: Number(booking.totalPrice),
    bookingId: booking.id,
    isFreeBooking: booking.payment_status === "not_required",
    dashboardUrl: DASHBOARD_URL,
  });

  let failure: string | null = null;
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to: provider.email,
        subject: `New booking request for ${propertyName}`,
        html,
        tags: {
          category: "booking_notification",
          bookingId: booking.id,
          providerId: booking.providerId,
        },
      }),
    });
    if (!response.ok) failure = `send-email ${response.status}: ${await response.text()}`;
  } catch (err) {
    failure = err instanceof Error ? err.message : "Network error";
  }

  if (failure) {
    console.error("[notify-provider-booking] Send failed:", booking.id, failure);
    await supabaseAdmin
      .from("booking")
      .update({ provider_email_sent_at: null })
      .eq("id", booking.id);
    return json({ error: "Failed to send email" }, 502);
  }

  return json({ status: "sent" });
});
