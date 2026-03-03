import { apiClient } from "./apiClient";
import {
  getProviderBookingNotificationTemplate,
  getClientBookingStatusTemplate,
  type BookingStatusType,
} from "./emailTemplates";

/**
 * Email service for sending emails via Supabase Edge Function
 */

const EDGE_FUNCTION_URL =
  "https://futuwdbxszdovuliybfu.supabase.co/functions/v1/send-email";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  tags?: Record<string, string>;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode: number;
}

/**
 * Send email directly via edge function
 */
export const sendEmailDirect = async (
  emailData: EmailPayload,
): Promise<EmailResponse> => {
  console.log("[Email Service] 🚀 Starting email send process...");

  try {
    // Get current session
    console.log("[Email Service] 🔐 Getting session token...");
    const {
      data: { session },
      error: sessionError,
    } = await apiClient.auth.getSession();

    if (sessionError) {
      console.error("[Email Service] ❌ Session error:", sessionError);
      return {
        success: false,
        error: `Session error: ${sessionError.message}`,
        statusCode: 401,
      };
    }

    if (!session?.access_token) {
      console.error("[Email Service] ❌ No session token available");
      return {
        success: false,
        error: "Not authenticated - no session token",
        statusCode: 401,
      };
    }

    console.log("[Email Service] ✅ Session token obtained");
    console.log("[Email Service] 📦 Preparing request with payload:", {
      to: emailData.to,
      subject: emailData.subject,
      hasHtml: !!emailData.html,
      htmlLength: emailData.html?.length,
      replyTo: emailData.replyTo,
      from: emailData.from,
      hasTags: !!emailData.tags,
      tags: emailData.tags,
    });

    // Make request to edge function
    console.log(
      "[Email Service] 📤 Sending POST request to:",
      EDGE_FUNCTION_URL,
    );

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(emailData),
    });

    console.log("[Email Service] 📥 Response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    // Parse response
    let result;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      result = await response.json();
      console.log("[Email Service] 📄 Response JSON:", result);
    } else {
      const text = await response.text();
      console.log("[Email Service] 📄 Response text:", text);
      result = { error: text || "Non-JSON response received" };
    }

    // Handle non-OK responses
    if (!response.ok) {
      console.error("[Email Service] ❌ Request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        fullResponse: result,
      });

      return {
        success: false,
        error:
          result.error || `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    // Success
    console.log("[Email Service] ✅ Email sent successfully:", {
      messageId: result.messageId,
      success: result.success,
    });

    return {
      success: true,
      messageId: result.messageId,
      statusCode: 200,
    };
  } catch (error) {
    console.error("[Email Service] ❌ Unexpected error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
      statusCode: 500,
    };
  }
};

/**
 * Send booking status update email to client
 * Trigger this when booking status changes
 */
export const sendClientBookingStatusEmail = async (
  clientEmail: string,
  data: {
    clientName: string;
    bookingId: string;
    propertyName: string;
    propertyType: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    status: BookingStatusType;
    statusMessage: string;
    dashboardUrl: string;
    supportEmail?: string;
  },
): Promise<EmailResponse> => {
  console.log("[Email Service] 📬 Triggering client booking status email...", {
    clientEmail,
    bookingId: data.bookingId,
    status: data.status,
  });

  try {
    // Generate HTML template
    const htmlContent = getClientBookingStatusTemplate(data);

    // Prepare email payload
    const emailPayload: EmailPayload = {
      to: clientEmail,
      subject: `Booking Status Update - ${data.bookingId}`,
      html: htmlContent,
      text: `Your booking status has been updated to: ${data.status}. Booking ID: ${data.bookingId}`,
      replyTo: data.supportEmail,
      tags: {
        type: "booking-status-update",
        bookingId: data.bookingId,
        status: data.status,
      },
    };

    console.log(
      "[Email Service] 📧 Sending client booking status email to:",
      clientEmail,
    );

    // Send email via edge function
    return await sendEmailDirect(emailPayload);
  } catch (error) {
    console.error(
      "[Email Service] ❌ Error sending client booking status email:",
      {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send booking status email",
      statusCode: 500,
    };
  }
};
