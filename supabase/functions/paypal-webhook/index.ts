import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const PAYPAL_WEBHOOK_ID = Deno.env.get("PAYPAL_WEBHOOK_ID");
const PAYPAL_BASE_URL =
  Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: {
      currency_code: string;
      value: string;
    };
    purchase_units?: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount: {
            currency_code: string;
            value: string;
          };
        }>;
      };
    }>;
  };
  create_time: string;
}

/**
 * Get PayPal access token for webhook verification
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[PayPal Webhook] Failed to get access token:", error);
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Verify PayPal webhook signature
 * Note: PayPal webhook verification requires the raw request body and headers
 */
async function verifyWebhookSignature(
  accessToken: string,
  webhookId: string,
  headers: Headers,
  body: string
): Promise<boolean> {
  try {
    // Get the required headers
    const authAlgo = headers.get("PAYPAL-AUTH-ALGO");
    const certUrl = headers.get("PAYPAL-CERT-URL");
    const transmissionId = headers.get("PAYPAL-TRANSMISSION-ID");
    const transmissionSig = headers.get("PAYPAL-TRANSMISSION-SIG");
    const transmissionTime = headers.get("PAYPAL-TRANSMISSION-TIME");

    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      console.error("[PayPal Webhook] Missing required headers for verification");
      return false;
    }

    // Verify webhook signature with PayPal API
    const verifyBody = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verifyBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[PayPal Webhook] Verification failed:", error);
      return false;
    }

    const verification = await response.json();
    return verification.verification_status === "SUCCESS";
  } catch (error) {
    console.error("[PayPal Webhook] Error verifying signature:", error);
    return false;
  }
}

/**
 * Handle PAYMENT.CAPTURE.COMPLETED event
 */
async function handlePaymentCaptureCompleted(
  supabase: ReturnType<typeof createClient>,
  event: PayPalWebhookEvent
): Promise<void> {
  const captureId = event.resource?.id;
  if (!captureId) {
    console.error("[PayPal Webhook] No capture ID in event");
    return;
  }

  // Find transaction by capture ID
  const { data: transaction, error: transactionError } = await supabase
    .from("payment_transactions")
    .select("*, booking:booking_id(*)")
    .eq("paypal_capture_id", captureId)
    .single();

  if (transactionError || !transaction) {
    // Try to find by order ID from purchase_units
    const orderId = event.resource?.purchase_units?.[0]?.reference_id;
    if (orderId) {
      const { data: orderTransaction } = await supabase
        .from("payment_transactions")
        .select("*, booking:booking_id(*)")
        .eq("paypal_order_id", orderId)
        .single();

      if (orderTransaction && orderTransaction.status !== "completed") {
        // Update transaction
        await supabase
          .from("payment_transactions")
          .update({
            paypal_capture_id: captureId,
            status: "completed",
            webhook_event_id: event.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderTransaction.id);

        // Update booking if not already paid
        if (orderTransaction.booking && orderTransaction.booking.payment_status !== "paid") {
          await supabase
            .from("booking")
            .update({
              payment_status: "paid",
              status: "confirmed",
              payment_intent_id: captureId,
              paid_at: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .eq("id", orderTransaction.booking.id);
        }
      }
    }
    return;
  }

  // Transaction already exists - check if needs update
  if (transaction.status === "completed") {
    // Already processed, idempotent
    return;
  }

  // Update transaction status
  await supabase
    .from("payment_transactions")
    .update({
      status: "completed",
      webhook_event_id: event.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.id);

  // Update booking if not already paid
  if (transaction.booking && transaction.booking.payment_status !== "paid") {
    await supabase
      .from("booking")
      .update({
        payment_status: "paid",
        status: "confirmed",
        payment_intent_id: captureId,
        paid_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", transaction.booking.id);
  }
}

/**
 * Handle PAYMENT.CAPTURE.DENIED event
 */
async function handlePaymentCaptureDenied(
  supabase: ReturnType<typeof createClient>,
  event: PayPalWebhookEvent
): Promise<void> {
  const captureId = event.resource?.id;
  if (!captureId) return;

  await supabase
    .from("payment_transactions")
    .update({
      status: "denied",
      webhook_event_id: event.id,
      updated_at: new Date().toISOString(),
    })
    .eq("paypal_capture_id", captureId);
}

/**
 * Handle PAYMENT.CAPTURE.REFUNDED event
 */
async function handlePaymentCaptureRefunded(
  supabase: ReturnType<typeof createClient>,
  event: PayPalWebhookEvent
): Promise<void> {
  const captureId = event.resource?.id;
  if (!captureId) return;

  // Update transaction
  await supabase
    .from("payment_transactions")
    .update({
      status: "refunded",
      webhook_event_id: event.id,
      updated_at: new Date().toISOString(),
    })
    .eq("paypal_capture_id", captureId);

  // Optionally update booking status
  const { data: transaction } = await supabase
    .from("payment_transactions")
    .select("booking_id")
    .eq("paypal_capture_id", captureId)
    .single();

  if (transaction) {
    await supabase
      .from("booking")
      .update({
        payment_status: "failed",
        status: "canceled",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", transaction.booking_id);
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, x-client-info, apikey",
      },
    });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get raw body for signature verification
    const body = await req.text();
    const event: PayPalWebhookEvent = JSON.parse(body);

    // Verify webhook signature
    if (PAYPAL_WEBHOOK_ID) {
      const accessToken = await getPayPalAccessToken();
      const isValid = await verifyWebhookSignature(
        accessToken,
        PAYPAL_WEBHOOK_ID,
        req.headers,
        body
      );

      if (!isValid) {
        console.error("[PayPal Webhook] Invalid signature");
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      console.warn("[PayPal Webhook] PAYPAL_WEBHOOK_ID not set, skipping signature verification");
    }

    // Handle different event types
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(supabase, event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentCaptureDenied(supabase, event);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentCaptureRefunded(supabase, event);
        break;

      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${event.event_type}`);
    }

    // Always return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("[PayPal Webhook] Error:", error);
    // Still return 200 to prevent PayPal from retrying
    // Log the error for investigation
    return new Response(
      JSON.stringify({ 
        received: true,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
