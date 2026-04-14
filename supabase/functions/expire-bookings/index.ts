import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getBookingCancellationTemplate } from "../_shared/bookingCancellationTemplate.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CANCELLATION_REASON =
  "Booking automatically cancelled — payment not received before check-in date.";

Deno.serve(async (req) => {
  // Allow manual invocation via GET or POST (pg_net uses POST)
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── 1. Find expired bookings ─────────────────────────────────────────────
  // Eligible: still pending, OR confirmed but payment not yet received,
  // where the check-in date is today or in the past (i.e. 1 day before = yesterday).
  // We use startDate <= CURRENT_DATE (covers "should have been paid by now").
  const { data: expiredBookings, error: fetchError } = await supabase
    .from("booking")
    .select(
      "id, requesterName, contactMail, startDate, endDate, propertyType, totalPrice",
    )
    .lte("startDate", new Date().toISOString().split("T")[0]) // startDate <= today
    .or("status.eq.pending,and(status.eq.confirmed,payment_status.eq.pending)");

  if (fetchError) {
    console.error("Error fetching expired bookings:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!expiredBookings || expiredBookings.length === 0) {
    return new Response(JSON.stringify({ cancelled: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── 2. Cancel each booking ───────────────────────────────────────────────
  const now = new Date().toISOString();
  const ids = expiredBookings.map((b: any) => b.id);

  const { error: updateError } = await supabase
    .from("booking")
    .update({
      status: "canceled",
      cancellation_reason: CANCELLATION_REASON,
      updatedAt: now,
    })
    .in("id", ids);

  if (updateError) {
    console.error("Error cancelling expired bookings:", updateError);
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── 3. Send cancellation emails ──────────────────────────────────────────
  const emailResults = await Promise.allSettled(
    expiredBookings.map((booking: any) => sendCancellationEmail(booking)),
  );

  const emailFailures = emailResults.filter((r) => r.status === "rejected");
  if (emailFailures.length > 0) {
    console.warn(
      `${emailFailures.length} cancellation email(s) failed to send.`,
    );
  }

  console.log(
    `Auto-cancelled ${expiredBookings.length} expired booking(s). Emails sent: ${expiredBookings.length - emailFailures.length}/${expiredBookings.length}`,
  );

  return new Response(
    JSON.stringify({
      cancelled: expiredBookings.length,
      emailsSent: expiredBookings.length - emailFailures.length,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sendCancellationEmail(booking: {
  id: string;
  requesterName: string;
  contactMail: string;
  startDate: string;
  endDate: string;
  propertyType: string;
  totalPrice: number;
}) {
  const checkIn = new Date(booking.startDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const checkOut = new Date(booking.endDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = getBookingCancellationTemplate({
    requesterName: booking.requesterName,
    propertyType: booking.propertyType,
    checkIn,
    checkOut,
    totalPrice: booking.totalPrice,
  });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      to: booking.contactMail,
      subject: "Your BOOKinAL booking has been cancelled",
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email failed for booking ${booking.id}: ${body}`);
  }
}
