import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const PAYPAL_BASE_URL =
  Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CaptureOrderRequest {
  orderId: string;
  bookingId: string;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  amount?: {
    currency_code: string;
    value: string;
  };
  purchase_units?: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
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
 * Capture PayPal order
 */
async function capturePayPalOrder(
  accessToken: string,
  orderId: string,
): Promise<PayPalCaptureResponse> {
  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    const errorData = (() => {
      try {
        return JSON.parse(errorText);
      } catch {
        return { message: errorText };
      }
    })();

    console.error("[PayPal] Failed to capture order. Status:", response.status);
    console.error(
      "[PayPal] Error response:",
      JSON.stringify(errorData, null, 2),
    );
    console.error("[PayPal] Order ID:", orderId);

    throw new Error(
      errorData?.message ||
        errorData?.details?.[0]?.issue ||
        `PayPal API Error (${response.status}): Failed to capture order`,
    );
  }

  return await response.json();
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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // Initialize Supabase client with service role
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body: CaptureOrderRequest = await req.json();
    const { orderId, bookingId } = body;

    if (!orderId || !bookingId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId or bookingId" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Fetch booking from database
    const { data: booking, error: bookingError } = await supabase
      .from("booking")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("[Capture PayPal Order] Booking not found:", bookingError);
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate booking ownership
    if (booking.userId !== user.id) {
      console.error("[Capture PayPal Order] Unauthorized booking access:", {
        bookingUserId: booking.userId,
        requestUserId: user.id,
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized: You don't own this booking" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validate PayPal order ID matches
    if (booking.paypal_order_id !== orderId) {
      return new Response(
        JSON.stringify({ error: "PayPal order ID mismatch" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check if already paid (idempotency check)
    if (booking.payment_status === "paid") {
      // Check if this order was already captured
      const { data: existingTransaction } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("paypal_order_id", orderId)
        .eq("status", "completed")
        .single();

      if (existingTransaction) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment already processed",
            captureId: existingTransaction.paypal_capture_id,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // Get PayPal access token
    let accessToken: string;
    try {
      accessToken = await getPayPalAccessToken();
    } catch (error) {
      console.error(
        "[Capture PayPal Order] Failed to get PayPal access token:",
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

    // Capture PayPal order
    let captureResponse: PayPalCaptureResponse;
    try {
      captureResponse = await capturePayPalOrder(accessToken, orderId);
    } catch (error) {
      console.error(
        "[Capture PayPal Order] Failed to capture PayPal order:",
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to capture PayPal order",
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

    // Verify capture status
    if (captureResponse.status !== "COMPLETED") {
      console.error(
        "[Capture PayPal Order] Capture not completed:",
        captureResponse,
      );

      // Update transaction status
      await supabase
        .from("payment_transactions")
        .update({ status: "denied" })
        .eq("paypal_order_id", orderId);

      return new Response(
        JSON.stringify({
          error: "Payment capture failed",
          status: captureResponse.status,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Extract capture ID and amount from response
    const capture =
      captureResponse.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) {
      throw new Error("No capture found in PayPal response");
    }

    const captureId = capture.id;
    const capturedAmount = parseFloat(capture.amount.value);
    const expectedAmount = Number(booking.totalPrice);

    // Verify amount matches (price integrity check)
    if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
      console.error("[Capture PayPal Order] Amount mismatch:", {
        captured: capturedAmount,
        expected: expectedAmount,
      });
      return new Response(
        JSON.stringify({
          error:
            "Amount mismatch. Payment amount does not match booking price.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Atomic update: Update booking and transaction in a transaction-like manner
    // Since Supabase doesn't support multi-table transactions via client,
    // we'll use a database function or update sequentially with checks

    // First, check for idempotency using unique constraint on paypal_capture_id
    const { data: existingCapture } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("paypal_capture_id", captureId)
      .single();

    if (existingCapture) {
      // Already processed, return success
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment already processed",
          captureId: captureId,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Update payment transaction
    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .update({
        paypal_capture_id: captureId,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("paypal_order_id", orderId);

    if (transactionError) {
      // If unique constraint violation, it means another request processed it
      if (transactionError.code === "23505") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment already processed",
            captureId: captureId,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      console.error(
        "[Capture PayPal Order] Failed to update transaction:",
        transactionError,
      );
      throw transactionError;
    }

    // Update booking atomically
    const { error: bookingUpdateError } = await supabase
      .from("booking")
      .update({
        payment_status: "paid",
        status: "confirmed",
        payment_intent_id: captureId,
        paid_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("payment_status", "pending"); // Only update if still pending (optimistic locking)

    if (bookingUpdateError) {
      console.error(
        "[Capture PayPal Order] Failed to update booking:",
        bookingUpdateError,
      );
      // Transaction was recorded, but booking update failed
      // This is a critical error - we should log and alert
      throw new Error("Failed to update booking after payment capture");
    }

    return new Response(
      JSON.stringify({
        success: true,
        captureId: captureId,
        message: "Payment captured successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("[Capture PayPal Order] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
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
