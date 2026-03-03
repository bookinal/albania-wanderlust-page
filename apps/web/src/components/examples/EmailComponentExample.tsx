/**
 * Example: Email Component
 * Demonstrates how to use the email service in a real component
 *
 * This is an example file showing best practices.
 * Copy and adapt for your use case.
 */

import { useState } from "react";
import {
  useEmailService,
  getBookingConfirmationTemplate,
} from "@/services/email/useEmailService";
import { toast } from "sonner";

interface BookingEmailProps {
  bookingId: string;
  userName: string;
  userEmail: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
}

/**
 * Component: Send Booking Confirmation Email
 *
 * Usage:
 * ```tsx
 * <SendBookingEmail
 *   bookingId="BOOK-123"
 *   userName="John Doe"
 *   userEmail="john@example.com"
 *   propertyName="Mountain Villa"
 *   checkInDate="2026-02-15"
 *   checkOutDate="2026-02-20"
 *   totalPrice={1250.00}
 * />
 * ```
 */
export function SendBookingEmail({
  bookingId,
  userName,
  userEmail,
  propertyName,
  checkInDate,
  checkOutDate,
  totalPrice,
}: BookingEmailProps) {
  const { sendEmail, isLoading, error } = useEmailService();
  const [hasSent, setHasSent] = useState(false);

  const handleSendEmail = async () => {
    // Generate HTML template
    const template = getBookingConfirmationTemplate({
      userName,
      bookingId,
      bookingDate: `${checkInDate} to ${checkOutDate}`,
      property: propertyName,
      totalPrice,
      confirmationUrl: `${window.location.origin}/bookings/${bookingId}`,
    });

    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject: `Booking Confirmation - ${bookingId}`,
      html: template,
      replyTo: "support@discover-albania.com",
      userId: "", // Optional: add user ID from auth context
      tags: {
        category: "booking_confirmation",
        bookingId,
        status: "completed",
      },
    });

    // Handle response
    if (result.success) {
      setHasSent(true);
      toast.success("✅ Confirmation email sent!", {
        description: `Message ID: ${result.messageId}`,
      });
    } else {
      toast.error("❌ Failed to send email", {
        description: result.error || "Unknown error",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSendEmail}
        disabled={isLoading || hasSent}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : hasSent ? "Sent ✓" : "Send Email"}
      </button>

      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}

// ============================================================================
// CONTACT FORM EXAMPLE
// ============================================================================

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Component: Contact Form with Email Notification
 *
 * Sends email to admin + confirmation to user
 */
export function ContactForm() {
  const { sendEmail, isLoading } = useEmailService();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send notification to admin
      const adminResult = await sendEmail({
        to: "admin@discover-albania.com",
        subject: `New Contact Form Submission from ${formData.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Message:</strong></p>
          <p>${formData.message.replace(/\n/g, "<br>")}</p>
        `,
        replyTo: formData.email,
        tags: {
          category: "contact_form",
          source: "website",
        },
      });

      if (!adminResult.success) {
        throw new Error(adminResult.error);
      }

      // Send confirmation to user
      const userResult = await sendEmail({
        to: formData.email,
        subject: "We received your message",
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Hi ${formData.name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br><strong>Discover Albania Team</strong></p>
        `,
        tags: {
          category: "contact_confirmation",
          status: "received",
        },
      });

      if (userResult.success) {
        toast.success("✅ Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send confirmation email");
      }
    } catch (err) {
      toast.error(
        "Error submitting form: " +
          (err instanceof Error ? err.message : "Unknown"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label className="block font-medium">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Message</label>
        <textarea
          required
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          rows={5}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

// ============================================================================
// ADMIN: VIEW EMAIL LOGS
// ============================================================================

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed";
  error?: string;
  created_at: string;
}

/**
 * Component: Email Logs Dashboard (Admin Only)
 *
 * Displays all sent emails and any errors
 */
export function EmailLogsDashboard() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In real app, fetch from your API
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      // TODO: Create an Edge Function to fetch logs
      // Or query Supabase directly if user is admin
      const response = await fetch("/api/email-logs");
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      toast.error("Failed to load email logs");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Email Activity</h2>

      <button
        onClick={fetchLogs}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Refresh
      </button>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Recipient</th>
            <th className="border p-2 text-left">Subject</th>
            <th className="border p-2">Status</th>
            <th className="border p-2 text-left">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="border p-2">{log.recipient}</td>
              <td className="border p-2">{log.subject}</td>
              <td className="border p-2 text-center">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    log.status === "sent"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {log.status.toUpperCase()}
                </span>
              </td>
              <td className="border p-2 text-sm text-gray-600">
                {new Date(log.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {logs.length === 0 && <p className="text-gray-500">No emails sent yet</p>}
    </div>
  );
}
