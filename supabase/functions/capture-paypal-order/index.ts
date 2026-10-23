import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const PAYPAL_BASE_URL =
  Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// The booking fee is charged in EUR (see create-paypal-order)
const PAYMENT_CURRENCY = "EUR";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-client-info, apikey",
};

/** JSON response; every response carries the CORS headers so the browser can read errors. */
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

interface CaptureOrderRequest {
  orderId: string;
  bookingId: string;
}

interface PayPalAmount {
  currency_code: string;
  value: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units?: Array<{ amount?: PayPalAmount }>;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: PayPalAmount;
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

async function parsePayPalError(response: Response) {
  const errorText = await response.text();
  try {
    return JSON.parse(errorText);
  } catch {
    return { message: errorText };
  }
}

/**
 * Read a PayPal order (used to check the amount before capturing it)
 */
async function getPayPalOrder(
  accessToken: string,
  orderId: string,
): Promise<PayPalOrder> {
  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    const errorData = await parsePayPalError(response);
    console.error("[PayPal] Failed to read order. Status:", response.status);
    console.error("[PayPal] Error response:", JSON.stringify(errorData, null, 2));
    throw new Error(
      errorData?.message ||
        `PayPal API Error (${response.status}): Failed to read order`,
    );
  }

  return await response.json();
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
    const errorData = await parsePayPalError(response);

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

/** True when a PayPal amount equals the expected fee (to the cent) in EUR. */
const amountMatches = (amount: PayPalAmount | undefined, expected: number) =>
  !!amount &&
  amount.currency_code === PAYMENT_CURRENCY &&
  Math.abs(parseFloat(amount.value) - expected) <= 0.01;

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    // Initialize Supabase admin client for database operations
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Create client with anon key for JWT verification
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
    } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Parse request body
    const body: CaptureOrderRequest = await req.json();
    const { orderId, bookingId } = body;

    if (!orderId || !bookingId) {
      return json({ error: "Missing orderId or bookingId" }, 400);
    }

    // Fetch booking from database
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("booking")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("[Capture PayPal Order] Booking not found:", bookingError);
      return json({ error: "Booking not found" }, 404);
    }

    // Validate booking ownership
    if (booking.userId !== user.id) {
      console.error("[Capture PayPal Order] Unauthorized booking access:", {
        bookingUserId: booking.userId,
        requestUserId: user.id,
      });
      return json({ error: "Unauthorized: You don't own this booking" }, 403);
    }

    // Validate PayPal order ID matches
    if (booking.paypal_order_id !== orderId) {
      return json({ error: "PayPal order ID mismatch" }, 400);
    }

    // Check if already paid (idempotency check)
    if (booking.payment_status === "paid") {
      // Check if this order was already captured
      const { data: existingTransaction } = await supabaseAdmin
        .from("payment_transactions")
        .select("*")
        .eq("paypal_order_id", orderId)
        .eq("status", "completed")
        .single();

      if (existingTransaction) {
        return json({
          success: true,
          message: "Payment already processed",
          captureId: existingTransaction.paypal_capture_id,
        });
      }
    }

    // The amount charged is the booking fee stored on the booking
    // (same source as create-paypal-order and the Stripe flow)
    const expectedAmount = Math.round(Number(booking.fee ?? 0) * 100) / 100;
    if (!(expectedAmount > 0)) {
      console.error("[Capture PayPal Order] No fee on booking:", bookingId);
      return json({ error: "No fee amount found for this booking" }, 400);
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
      return json(
        {
          error: "Failed to authenticate with PayPal",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }

    // Check the order amount BEFORE capturing, so a wrong amount is never charged
    try {
      const order = await getPayPalOrder(accessToken, orderId);
      const orderAmount = order.purchase_units?.[0]?.amount;
      if (!amountMatches(orderAmount, expectedAmount)) {
        console.error("[Capture PayPal Order] Order amount mismatch:", {
          order: orderAmount,
          expected: expectedAmount,
        });
        return json(
          {
            error:
              "Amount mismatch. The PayPal order does not match the booking fee.",
          },
          400,
        );
      }
    } catch (error) {
      console.error("[Capture PayPal Order] Failed to read PayPal order:", error);
      return json(
        {
          error: "Failed to read PayPal order",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        502,
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
      return json(
        {
          error: "Failed to capture PayPal order",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }

    // Verify capture status
    if (captureResponse.status !== "COMPLETED") {
      console.error(
        "[Capture PayPal Order] Capture not completed:",
        captureResponse,
      );

      // Update transaction status
      await supabaseAdmin
        .from("payment_transactions")
        .update({ status: "denied" })
        .eq("paypal_order_id", orderId);

      return json(
        {
          error: "Payment capture failed",
          status: captureResponse.status,
        },
        400,
      );
    }

    // Extract capture ID and amount from response
    const capture =
      captureResponse.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) {
      throw new Error("No capture found in PayPal response");
    }

    const captureId = capture.id;

    // Integrity check on what was actually captured. The order was checked
    // before capturing, so this should never trigger; if it does, the money
    // was taken: log loudly so it can be refunded, and don't mark as paid.
    if (!amountMatches(capture.amount, expectedAmount)) {
      console.error(
        "[Capture PayPal Order] CRITICAL captured amount mismatch, needs manual refund:",
        { captureId, captured: capture.amount, expected: expectedAmount, bookingId },
      );
      return json(
        {
          error:
            "Amount mismatch. Payment amount does not match the booking fee.",
        },
        400,
      );
    }

    // First, check for idempotency using unique constraint on paypal_capture_id
    const { data: existingCapture } = await supabaseAdmin
      .from("payment_transactions")
      .select("*")
      .eq("paypal_capture_id", captureId)
      .single();

    if (existingCapture) {
      // Already processed, return success
      return json({
        success: true,
        message: "Payment already processed",
        captureId: captureId,
      });
    }

    // Update payment transaction
    const { error: transactionError } = await supabaseAdmin
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
        return json({
          success: true,
          message: "Payment already processed",
          captureId: captureId,
        });
      }
      console.error(
        "[Capture PayPal Order] Failed to update transaction:",
        transactionError,
      );
      throw transactionError;
    }

    // Update booking atomically
    const { error: bookingUpdateError } = await supabaseAdmin
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

    return json({
      success: true,
      captureId: captureId,
      message: "Payment captured successfully",
    });
  } catch (error) {
    console.error("[Capture PayPal Order] Error:", error);
    return json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
