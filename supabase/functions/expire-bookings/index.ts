import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #0d0d0d; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #e41e20; font-size: 22px; margin: 0;">Booking Cancelled</h1>
      </div>
      <div style="background: #f9f9f9; padding: 28px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5;">
        <p style="margin-top: 0;">Hi <strong>${booking.requesterName}</strong>,</p>
        <p>
          Unfortunately your booking has been <strong>automatically cancelled</strong> because
          payment was not completed before the check-in date.
        </p>
        <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #666; font-size: 13px;">Property type</td>
              <td style="padding: 6px 0; font-weight: 600; text-transform: capitalize;">${booking.propertyType}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; font-size: 13px;">Check-in</td>
              <td style="padding: 6px 0; font-weight: 600;">${checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; font-size: 13px;">Check-out</td>
              <td style="padding: 6px 0; font-weight: 600;">${checkOut}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; font-size: 13px;">Total</td>
              <td style="padding: 6px 0; font-weight: 600;">$${booking.totalPrice.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        <p style="color: #555; font-size: 14px;">
          If you believe this is a mistake or need assistance, please contact us directly.
        </p>
        <p style="margin-bottom: 0;">The BOOKinAL Team</p>
      </div>
    </div>
  `;

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
