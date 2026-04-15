import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";
import { sendContactUnlockNotifications } from "../_shared/contactUnlockNotifications.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Validate required environment variables
if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  console.error(
    "[Stripe Webhook] Missing Stripe credentials. Please set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Supabase secrets.",
  );
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[Stripe Webhook] Missing Supabase credentials.");
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      console.error("[Stripe Webhook] Missing required environment variables");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[Stripe Webhook] No signature provided");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[Stripe Webhook] Event received:", event.type, event.id);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          "[Stripe Webhook] PaymentIntent succeeded:",
          paymentIntent.id,
        );

        const bookingId = paymentIntent.metadata.booking_id;
        if (!bookingId) {
          console.error("[Stripe Webhook] No booking_id in metadata");
          break;
        }

        // Get charge ID (first charge)
        const chargeId = paymentIntent.latest_charge as string | null;

        // Update payment transaction
        const { error: txError } = await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "completed",
            stripe_charge_id: chargeId,
            webhook_event_id: event.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (txError) {
          console.error(
            "[Stripe Webhook] Error updating transaction:",
            txError,
          );
        }

        // Update booking status
        const { data: updatedBookings, error: bookingError } = await supabaseAdmin
          .from("booking")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq("id", bookingId)
          .eq("payment_status", "pending")
          .select("*");

        if (bookingError) {
          console.error(
            "[Stripe Webhook] Error updating booking:",
            bookingError,
          );
        }

        const updatedBooking = updatedBookings?.[0];

        if (updatedBooking) {
          try {
            await sendContactUnlockNotifications(supabaseAdmin, updatedBooking, {
              supabaseUrl: SUPABASE_URL!,
              serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY!,
            });
          } catch (emailError) {
            console.error(
              "[Stripe Webhook] Error sending contact unlock notifications:",
              emailError,
            );
          }
        }

        console.log(
          "[Stripe Webhook] Payment completed for booking:",
          bookingId,
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Stripe Webhook] PaymentIntent failed:", paymentIntent.id);

        const bookingId = paymentIntent.metadata.booking_id;
        if (!bookingId) {
          console.error("[Stripe Webhook] No booking_id in metadata");
          break;
        }

        // Update payment transaction
        const { error: txError } = await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "denied",
            webhook_event_id: event.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (txError) {
          console.error(
            "[Stripe Webhook] Error updating transaction:",
            txError,
          );
        }

        // Update booking payment status
        const { error: bookingError } = await supabaseAdmin
          .from("booking")
          .update({
            payment_status: "failed",
            updatedAt: new Date().toISOString(),
          })
          .eq("id", bookingId);

        if (bookingError) {
          console.error(
            "[Stripe Webhook] Error updating booking:",
            bookingError,
          );
        }

        console.log("[Stripe Webhook] Payment failed for booking:", bookingId);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          "[Stripe Webhook] PaymentIntent canceled:",
          paymentIntent.id,
        );

        // Update payment transaction
        const { error: txError } = await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "canceled",
            webhook_event_id: event.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (txError) {
          console.error(
            "[Stripe Webhook] Error updating transaction:",
            txError,
          );
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("[Stripe Webhook] Charge refunded:", charge.id);

        // Update payment transaction
        const { error: txError } = await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "refunded",
            webhook_event_id: event.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_charge_id", charge.id);

        if (txError) {
          console.error(
            "[Stripe Webhook] Error updating transaction:",
            txError,
          );
        }

        // Get the payment intent to find the booking
        if (charge.payment_intent) {
          const { data: transaction } = await supabaseAdmin
            .from("payment_transactions")
            .select("booking_id")
            .eq("stripe_payment_intent_id", charge.payment_intent as string)
            .single();

          if (transaction?.booking_id) {
            const { error: bookingError } = await supabaseAdmin
              .from("booking")
              .update({
                payment_status: "refunded",
                updatedAt: new Date().toISOString(),
              })
              .eq("id", transaction.booking_id);

            if (bookingError) {
              console.error(
                "[Stripe Webhook] Error updating booking:",
                bookingError,
              );
            }
          }
        }
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
