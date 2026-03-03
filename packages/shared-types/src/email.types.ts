/**
 * Email Types
 * Shared between frontend and Edge Function
 */

export interface EmailTemplateData {
  bookingId?: string;
  userName?: string;
  userEmail?: string;
  bookingDetails?: Record<string, unknown>;
  confirmationUrl?: string;
  [key: string]: unknown;
}

export interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  templateId?: string;
  templateData?: EmailTemplateData;
  userId?: string;
  tags?: Record<string, string>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode: number;
}

export type EmailTemplate =
  | "booking_confirmation"
  | "booking_cancellation"
  | "payment_receipt"
  | "password_reset"
  | "welcome";

export interface TemplateConfig {
  name: EmailTemplate;
  subject: string;
  htmlFile: string;
  textFile?: string;
}
