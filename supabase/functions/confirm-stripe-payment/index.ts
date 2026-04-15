import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";
import { sendContactUnlockNotifications } from "../_shared/contactUnlockNotifications.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

interface ConfirmPaymentRequest {
  paymentIntentId: string;
  bookingId: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment service not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse request body
    const body: ConfirmPaymentRequest = await req.json();
    const { paymentIntentId, bookingId } = body;

    if (!paymentIntentId || !bookingId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "paymentIntentId and bookingId are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      "[Stripe Confirm] Confirming payment:",
      paymentIntentId,
      "for booking:",
      bookingId,
    );

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Create Supabase client with anon key to verify user's JWT token
    const supabaseUser = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or expired token",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify user owns the booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("booking")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Booking not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (booking.userId !== user.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You are not authorized to confirm this payment",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Retrieve the payment intent from Stripe to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("[Stripe Confirm] PaymentIntent status:", paymentIntent.status);

    if (paymentIntent.status === "succeeded") {
      // Payment is successful, update the database
      const chargeId = paymentIntent.latest_charge as string | null;

      // Update payment transaction
      const { error: txError } = await supabaseAdmin
        .from("payment_transactions")
        .update({
          status: "completed",
          stripe_charge_id: chargeId,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", paymentIntentId);

      if (txError) {
        console.error("[Stripe Confirm] Error updating transaction:", txError);
      }

      // Update booking status
      const { data: updatedBookings, error: updateError } = await supabaseAdmin
        .from("booking")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .eq("payment_status", "pending")
        .select("*");

      if (updateError) {
        console.error("[Stripe Confirm] Error updating booking:", updateError);
      }

      const updatedBooking = updatedBookings?.[0];

      if (updatedBooking) {
        try {
          await sendContactUnlockNotifications(supabaseAdmin, updatedBooking, {
            supabaseUrl: SUPABASE_URL!,
            serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY!,
            origin: req.headers.get("origin") || undefined,
          });
        } catch (emailError) {
          console.error(
            "[Stripe Confirm] Error sending contact unlock notifications:",
            emailError,
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment confirmed successfully",
          status: "paid",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else if (paymentIntent.status === "processing") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment is being processed",
          status: "processing",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else if (
      paymentIntent.status === "requires_payment_method" ||
      paymentIntent.status === "requires_confirmation" ||
      paymentIntent.status === "requires_action"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment requires additional action",
          status: paymentIntent.status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else if (paymentIntent.status === "canceled") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment was canceled",
          status: "canceled",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Payment status: ${paymentIntent.status}`,
          status: paymentIntent.status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("[Stripe Confirm] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
