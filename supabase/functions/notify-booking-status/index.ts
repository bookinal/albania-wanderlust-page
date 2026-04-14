import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getClientBookingStatusTemplate } from "../_shared/clientBookingStatusTemplate.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type BookingStatusType = "confirmed" | "pending" | "canceled" | "completed";

interface NotifyRequest {
  bookingId: string;
  status: BookingStatusType;
  statusMessage: string;
  cancellationReason?: string;
}

const getEmailSubject = (status: BookingStatusType, bookingId: string): string => {
  switch (status) {
    case "confirmed":
      return `Booking Confirmed - ${bookingId}`;
    case "canceled":
      return `Booking Canceled - ${bookingId}`;
    case "completed":
      return `Booking Completed - ${bookingId}`;
    case "pending":
    default:
      return `Booking Status Update - ${bookingId}`;
  }
};

const getPropertyTypeLabel = (propertyType: string): string => {
  switch (propertyType) {
    case "apartment":
      return "Apartment";
    case "car":
      return "Car";
    case "hotel":
    default:
      return "Hotel";
  }
};

const getPropertyName = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  propertyId: string,
  propertyType: string,
): Promise<string> => {
  const table =
    propertyType === "car"
      ? "car"
      : propertyType === "apartment"
        ? "apartment"
        : "hotel";

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("name, brand")
    .eq("id", Number(propertyId))
    .single();

  if (error || !data) {
    console.warn("[Notify Booking Status] Failed to resolve property name:", {
      propertyId,
      propertyType,
      error,
    });
    return propertyId;
  }

  if (propertyType === "car") {
    return `${data.brand || ""} ${data.name || ""}`.trim() || propertyId;
  }

  return data.name || propertyId;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Function not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as NotifyRequest;

    if (!body.bookingId || !body.status || !body.statusMessage) {
      return new Response(
        JSON.stringify({ error: "bookingId, status, and statusMessage are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");
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

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("booking")
      .select("*")
      .eq("id", body.bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.providerId !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!booking.contactMail) {
      return new Response(
        JSON.stringify({ error: "Booking has no client email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const propertyName = await getPropertyName(
      supabaseAdmin,
      booking.propertyId,
      booking.propertyType,
    );
    const propertyTypeLabel = getPropertyTypeLabel(booking.propertyType);
    const dashboardUrl = `${req.headers.get("origin") || "https://www.bookinal.com"}/myBookings`;

    const html = getClientBookingStatusTemplate({
      clientName: booking.requesterName,
      bookingId: booking.id,
      propertyName,
      propertyType: propertyTypeLabel,
      checkInDate: new Date(booking.startDate).toLocaleDateString(),
      checkOutDate: new Date(booking.endDate).toLocaleDateString(),
      totalPrice: booking.totalPrice,
      status: body.status,
      statusMessage: body.statusMessage,
      cancellationReason: body.cancellationReason,
      dashboardUrl,
    });

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to: booking.contactMail,
        subject: getEmailSubject(body.status, booking.id),
        html,
        tags: {
          type: "booking-status-update",
          bookingId: booking.id,
          status: body.status,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(text, {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Notify Booking Status] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
