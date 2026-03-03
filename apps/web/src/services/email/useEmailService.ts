/**
 * Email Service Hook
 * React hook wrapper for the email service from @albania/api-client
 */

import { useState, useCallback } from "react";
import { sendEmailDirect } from "@/services/api/emailService";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  userId?: string;
  tags?: Record<string, string>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * React hook for sending emails
 * Provides loading state and error handling
 */
export function useEmailService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = useCallback(
    async (payload: EmailPayload): Promise<EmailResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sendEmailDirect({
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          replyTo: payload.replyTo,
          from: payload.from,
          tags: payload.tags,
        });

        if (!result.success) {
          setError(result.error || "Failed to send email");
        }

        return {
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    sendEmail,
    isLoading,
    error,
  };
}

/**
 * HTML Email Template for Booking Confirmation
 */
export const getBookingConfirmationTemplate = (data: {
  userName: string;
  bookingId: string;
  bookingDate: string;
  property: string;
  totalPrice: number;
  confirmationUrl: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #111827; }
        .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hello ${data.userName},</p>
          <p>Your booking has been confirmed! Here are the details:</p>
          
          <div class="booking-details">
            <h2>Booking Details</h2>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span class="detail-value">${data.property}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Dates:</span>
              <span class="detail-value">${data.bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Price:</span>
              <span class="detail-value">$${data.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <center>
            <a href="${data.confirmationUrl}" class="button">View Booking Details</a>
          </center>

          <p>Thank you for choosing Discover Albania!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation from Discover Albania.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default useEmailService;
