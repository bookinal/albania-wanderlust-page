import { apiClient } from "./apiClient";
import { authService } from "./authService";

export interface CreateCheckoutSessionRequest {
  bookingId: string;
  amount: number;
  currency: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
}

export interface CreatePayPalOrderRequest {
  bookingId: string;
}

export interface CreatePayPalOrderResponse {
  orderId: string;
}

export interface CapturePayPalOrderRequest {
  orderId: string;
  bookingId: string;
}

export interface CapturePayPalOrderResponse {
  success: boolean;
  captureId?: string;
  message?: string;
}

// Stripe interfaces
export interface CreateStripePaymentIntentRequest {
  bookingId: string;
}

export interface CreateStripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ConfirmStripePaymentRequest {
  paymentIntentId: string;
  bookingId: string;
}

export interface ConfirmStripePaymentResponse {
  success: boolean;
  message?: string;
  status?: string;
}

/**
 * Create a Stripe Checkout Session for a booking
 */
export const createCheckoutSession = async (
  payload: CreateCheckoutSessionRequest,
): Promise<CreateCheckoutSessionResponse> => {
  const { data, error } = await apiClient.functions.invoke(
    "create-checkout-session",
    {
      body: payload,
    },
  );

  if (error) {
    console.error("[Payment Service] Error creating checkout session:", error);
    throw error;
  }

  return data as CreateCheckoutSessionResponse;
};

/**
 * Create a PayPal order for a booking
 * Server-side validation ensures price integrity and booking ownership
 */
export const createPayPalOrder = async (
  payload: CreatePayPalOrderRequest,
): Promise<CreatePayPalOrderResponse> => {
  const {
    data: { session },
  } = await apiClient.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await apiClient.functions.invoke(
    "create-paypal-order",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (error) {
    console.error("[Payment Service] Error creating PayPal order:", error);
    throw error;
  }

  // Check if response contains an error field (edge function returned error with HTTP status)
  if (data?.error) {
    console.error(
      "[Payment Service] PayPal order creation failed:",
      data.error,
    );
    throw new Error(
      data.error || data.message || "Failed to create PayPal order",
    );
  }

  return data as CreatePayPalOrderResponse;
};

/**
 * Capture a PayPal order after user approval
 * Server-side validation ensures payment integrity
 */
export const capturePayPalOrder = async (
  payload: CapturePayPalOrderRequest,
): Promise<CapturePayPalOrderResponse> => {
  const {
    data: { session },
  } = await apiClient.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await apiClient.functions.invoke(
    "capture-paypal-order",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (error) {
    console.error("[Payment Service] Error capturing PayPal order:", error);
    throw error;
  }

  // Check if response contains an error field (edge function returned error with HTTP status)
  if (data?.error) {
    console.error("[Payment Service] PayPal order capture failed:", data.error);
    throw new Error(
      data.error || data.message || "Failed to capture PayPal order",
    );
  }

  return data as CapturePayPalOrderResponse;
};

/**
 * Create a Stripe PaymentIntent for a booking
 * Returns a client secret for use with Stripe Elements
 */
export const createStripePaymentIntent = async (
  payload: CreateStripePaymentIntentRequest,
): Promise<CreateStripePaymentIntentResponse> => {
  const {
    data: { session },
  } = await apiClient.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await apiClient.functions.invoke(
    "create-stripe-payment-intent",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (error) {
    console.error(
      "[Payment Service] Error creating Stripe PaymentIntent:",
      error,
    );
    throw error;
  }

  // Check if response contains an error field
  if (data?.error) {
    console.error(
      "[Payment Service] Stripe PaymentIntent creation failed:",
      data.error,
    );
    throw new Error(
      data.error || data.message || "Failed to create Stripe PaymentIntent",
    );
  }

  return data as CreateStripePaymentIntentResponse;
};

/**
 * Confirm a Stripe payment after user completes payment
 * This is a fallback for when webhooks are delayed
 */
export const confirmStripePayment = async (
  payload: ConfirmStripePaymentRequest,
): Promise<ConfirmStripePaymentResponse> => {
  const {
    data: { session },
  } = await apiClient.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await apiClient.functions.invoke(
    "confirm-stripe-payment",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (error) {
    console.error("[Payment Service] Error confirming Stripe payment:", error);
    throw error;
  }

  return data as ConfirmStripePaymentResponse;
};

const paymentService = {
  createCheckoutSession,
  createPayPalOrder,
  capturePayPalOrder,
  createStripePaymentIntent,
  confirmStripePayment,
};

export default paymentService;
