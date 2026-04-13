import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Validate required environment variables
if (!STRIPE_SECRET_KEY) {
  console.error(
    "[Create Stripe PaymentIntent] Missing Stripe credentials. Please set STRIPE_SECRET_KEY in Supabase secrets.",
  );
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error(
    "[Create Stripe PaymentIntent] Missing Supabase credentials. SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY should be auto-set.",
  );
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

interface CreatePaymentIntentRequest {
  bookingId: string;
}

interface BookingData {
  id: string;
  totalPrice: number;
  userId: string;
  propertyType: string;
  propertyId: string;
  status: string;
  payment_status: string;
  contactMail: string;
  requesterName: string;
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
      console.error("[Stripe] Missing STRIPE_SECRET_KEY");
      return new Response(
        JSON.stringify({
          error: "Payment service not configured",
          message: "Stripe is not properly configured. Please contact support.",
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
      console.error("[Stripe] No authorization header provided");
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "No authorization token provided",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse request body
    const body: CreatePaymentIntentRequest = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      console.error("[Stripe] Missing bookingId in request");
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "bookingId is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("[Stripe] Creating PaymentIntent for booking:", bookingId);

    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Create Supabase client with anon key to verify user's JWT token
    const supabaseUser = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!, // Use anon key for JWT verification
    );
    const token = authHeader.replace("Bearer ", "");

    // Verify the user's token
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      console.error("[Stripe] Authentication failed:", authError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid or expired token",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("[Stripe] Authenticated user:", user.id);

    // Fetch booking from database
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("booking")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("[Stripe] Booking not found:", bookingError);
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Booking not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const bookingData = booking as BookingData;

    // Verify the user owns this booking
    if (bookingData.userId !== user.id) {
      console.error(
        "[Stripe] User does not own booking. User:",
        user.id,
        "Booking owner:",
        bookingData.userId,
      );
      return new Response(
        JSON.stringify({
          error: "Forbidden",
          message: "You are not authorized to pay for this booking",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if booking is in a valid state for payment
    if (bookingData.status !== "confirmed") {
      console.error(
        "[Stripe] Booking not confirmed. Status:",
        bookingData.status,
      );
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Booking must be confirmed before payment",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if already paid
    if (bookingData.payment_status === "paid") {
      console.error("[Stripe] Booking already paid");
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "This booking has already been paid",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check for existing pending Stripe payment intent
    const { data: existingTransaction } = await supabaseAdmin
      .from("payment_transactions")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("payment_provider", "stripe")
      .eq("status", "pending")
      .single();

    if (existingTransaction?.stripe_payment_intent_id) {
      // Retrieve existing payment intent from Stripe
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          existingTransaction.stripe_payment_intent_id,
        );

        // If still valid, return it
        if (
          existingIntent.status === "requires_payment_method" ||
          existingIntent.status === "requires_confirmation" ||
          existingIntent.status === "requires_action"
        ) {
          console.log(
            "[Stripe] Returning existing PaymentIntent:",
            existingIntent.id,
          );
          return new Response(
            JSON.stringify({
              clientSecret: existingIntent.client_secret,
              paymentIntentId: existingIntent.id,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
      } catch (e) {
        console.log("[Stripe] Could not retrieve existing payment intent:", e);
        // Continue to create a new one
      }
    }

    // Create Stripe PaymentIntent
    const amountInCents = Math.round(bookingData.totalPrice * 100);

    console.log("[Stripe] Creating PaymentIntent for amount:", amountInCents);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: bookingId,
        user_id: user.id,
        property_type: bookingData.propertyType,
        property_id: bookingData.propertyId,
      },
      receipt_email: bookingData.contactMail || user.email,
      description: `Booking payment for ${bookingData.propertyType} - ${bookingData.requesterName}`,
    });

    console.log("[Stripe] PaymentIntent created:", paymentIntent.id);

    // Store the payment intent in the database
    const { error: insertError } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        booking_id: bookingId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: bookingData.totalPrice,
        currency: "USD",
        status: "pending",
        payment_provider: "stripe",
      });

    if (insertError) {
      console.error("[Stripe] Error storing payment transaction:", insertError);
      // Don't fail the request, the payment intent is still valid
    }

    // Update booking with stripe_payment_intent_id
    await supabaseAdmin
      .from("booking")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Stripe] Error creating PaymentIntent:", error);
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
