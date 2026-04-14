/**
 * Booking status types
 */
export type BookingStatusType =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

/**
 * HTML Email Template for Client Booking Status Update
 */
export const getClientBookingStatusTemplate = (data: {
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
}): string => {
  console.log(
    "[Email Service] 📝 Generating client booking status template with data:",
    data,
  );

  // Status-specific styling and icons
  const statusConfig: Record<
    BookingStatusType,
    { color: string; icon: string; bgColor: string }
  > = {
    confirmed: {
      color: "#10b981",
      icon: "✅",
      bgColor: "#ecfdf5",
    },
    pending: {
      color: "#f59e0b",
      icon: "⏳",
      bgColor: "#fffbeb",
    },
    cancelled: {
      color: "#ef4444",
      icon: "❌",
      bgColor: "#fef2f2",
    },
    completed: {
      color: "#8b5cf6",
      icon: "🎉",
      bgColor: "#faf5ff",
    },
  };

  const config = statusConfig[data.status];

  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1f4f75; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .status-badge { 
          background-color: ${config.bgColor}; 
          border-left: 4px solid ${config.color}; 
          padding: 20px; 
          border-radius: 6px; 
          margin: 20px 0; 
          text-align: center;
        }
        .status-text { 
          font-size: 24px; 
          font-weight: bold; 
          color: ${config.color}; 
          margin: 10px 0;
        }
        .status-message { 
          color: #6b7280; 
          font-size: 16px; 
          margin: 10px 0;
        }
        .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #111827; }
        .button { 
          display: inline-block; 
          background-color: #4F46E5; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0; 
        }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .support-info { margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 6px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bookinal Booking Update</h1>
        </div>
        <div class="content">
          <p>Hello ${data.clientName},</p>
          <p>Here is the latest update on your booking.</p>
          
          <div class="status-badge">
            <div class="status-text">${config.icon} ${data.status.toUpperCase()}</div>
            <div class="status-message">${data.statusMessage}</div>
          </div>

          <div class="booking-details">
            <h2>Booking Information</h2>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${data.propertyType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span class="detail-value">${data.checkInDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span class="detail-value">${data.checkOutDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Price:</span>
              <span class="detail-value">$${data.totalPrice}</span>
            </div>
          </div>

          <center>
            <a href="${data.dashboardUrl}" class="button">View Booking Details</a>
          </center>

          ${
            data.supportEmail
              ? `
          <div class="support-info">
             <p style="margin: 0;"><strong>Need help?</strong></p>
             <p style="margin: 5px 0 0 0;">If you have any questions, please contact Bookinal support at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
           </div>
           `
              : ""
          }
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Bookinal.</p>
          <p>Please manage your booking from the platform for the latest updates.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(
    "[Email Service] ✅ Client booking status template generated, length:",
    template.length,
  );
  return template;
};
