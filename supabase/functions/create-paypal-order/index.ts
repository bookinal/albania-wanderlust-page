import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const PAYPAL_BASE_URL =
  Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Validate required environment variables
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error(
    "[Create PayPal Order] Missing PayPal credentials. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Supabase secrets.",
  );
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "[Create PayPal Order] Missing Supabase credentials. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY should be auto-set.",
  );
}

interface CreateOrderRequest {
  bookingId: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[PayPal] Failed to get access token:", error);
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create PayPal order
 */
async function createPayPalOrder(
  accessToken: string,
  amount: number,
  currency: string = "USD",
): Promise<PayPalOrderResponse> {
  // Get the frontend origin for return URLs
  const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:8081";

  // Validate amount
  if (!amount || amount <= 0) {
    console.error("[PayPal] Invalid amount:", amount);
    throw new Error(
      `Invalid amount: ${amount}. Amount must be greater than 0.`,
    );
  }

  const formattedAmount = amount.toFixed(2);

  console.log("[PayPal] Creating order with:", {
    amount: formattedAmount,
    currency,
    frontendUrl,
  });

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": crypto.randomUUID(), // Idempotency
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: formattedAmount,
          },
        },
      ],
      application_context: {
        brand_name: "Albania Travels",
        locale: "en-US",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${frontendUrl}/myBookings`,
        cancel_url: `${frontendUrl}/myBookings`,
      },
    }),
  });

  console.log("[PayPal] Order creation response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    const errorData = (() => {
      try {
        return JSON.parse(errorText);
      } catch {
        return { message: errorText };
      }
    })();

    console.error("[PayPal] Failed to create order. Status:", response.status);
    console.error(
      "[PayPal] Error response:",
      JSON.stringify(errorData, null, 2),
    );
    console.error("[PayPal] Full error details:", errorData);

    throw new Error(
      errorData?.message ||
        errorData?.details?.[0]?.issue ||
        `PayPal API Error (${response.status}): Failed to create order`,
    );
  }

  const result = await response.json();
  console.log(
    "[PayPal] Order created successfully:",
    result.id,
    "Status:",
    result.status,
  );
  return result;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, content-type, x-client-info, apikey",
      },
    });
  }

  try {
    // Validate environment variables
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error("[Create PayPal Order] PayPal credentials not configured");
      return new Response(
        JSON.stringify({
          error: "Payment service not configured. Please contact support.",
          details: "PayPal credentials missing",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(
        "[Create PayPal Order] Supabase credentials not configured",
      );
      return new Response(
        JSON.stringify({
          error: "Server configuration error. Please contact support.",
          details: "Supabase credentials missing",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Initialize Supabase client with service role for server-side operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("[Create PayPal Order] Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Parse request body
    const body: CreateOrderRequest = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "Missing bookingId" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Fetch booking from database
    const { data: booking, error: bookingError } = await supabase
      .from("booking")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("[Create PayPal Order] Booking not found:", bookingError);
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Log booking details for debugging
    console.log("[Create PayPal Order] Booking found:", {
      id: booking.id,
      userId: booking.userId,
      status: booking.status,
      payment_status: booking.payment_status,
      totalPrice: booking.totalPrice,
      type: typeof booking.totalPrice,
    });

    // Validate booking ownership
    if (booking.userId !== user.id) {
      console.error("[Create PayPal Order] Unauthorized booking access:", {
        bookingUserId: booking.userId,
        requestUserId: user.id,
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized: You don't own this booking" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Validate booking status
    if (booking.status !== "confirmed") {
      return new Response(
        JSON.stringify({
          error: `Booking is not confirmed. Current status: ${booking.status}`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Validate payment status
    if (booking.payment_status === "paid") {
      return new Response(
        JSON.stringify({ error: "Booking is already paid" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Get PayPal access token
    let accessToken: string;
    try {
      accessToken = await getPayPalAccessToken();
    } catch (error) {
      console.error(
        "[Create PayPal Order] Failed to get PayPal access token:",
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to authenticate with PayPal",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Create PayPal order with server-validated price
    let paypalOrder: PayPalOrderResponse;
    try {
      paypalOrder = await createPayPalOrder(
        accessToken,
        Number(booking.totalPrice),
        "USD",
      );
    } catch (error) {
      console.error(
        "[Create PayPal Order] Failed to create PayPal order:",
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to create PayPal order",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Store PayPal order ID in booking (for tracking)
    const { error: updateError } = await supabase
      .from("booking")
      .update({ paypal_order_id: paypalOrder.id })
      .eq("id", bookingId);

    if (updateError) {
      console.error(
        "[Create PayPal Order] Failed to update booking:",
        updateError,
      );
      // Don't fail the request, but log the error
    }

    // Create payment transaction record for audit trail
    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        booking_id: bookingId,
        paypal_order_id: paypalOrder.id,
        amount: Number(booking.totalPrice),
        currency: "USD",
        status: "pending",
      });

    if (transactionError) {
      console.error(
        "[Create PayPal Order] Failed to create transaction record:",
        transactionError,
      );
      // Don't fail the request, but log the error
    }

    return new Response(JSON.stringify({ orderId: paypalOrder.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[Create PayPal Order] Unexpected error:", error);
    console.error(
      "[Create PayPal Order] Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.constructor.name : typeof error,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
