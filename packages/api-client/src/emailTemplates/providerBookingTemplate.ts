/**
 * HTML Email Template for Provider Booking Notification
 */
export const getProviderBookingNotificationTemplate = (data: {
  providerName: string;
  propertyName: string;
  propertyType: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  bookingId: string;
  dashboardUrl: string;
}): string => {
  console.log(
    "[Email Service] 📝 Generating provider booking notification template with data:",
    data,
  );

  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .property-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .property-name {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
        }
        .property-type {
          font-size: 16px;
          opacity: 0.9;
        }
        .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .section-title {
          color: #4F46E5;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #111827; }
        .guest-info { background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .button { 
          display: inline-block; 
          background-color: #4F46E5; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
          font-weight: bold;
        }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .alert-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Booking Request</h1>
        </div>
        <div class="content">
          <p>Hello ${data.providerName},</p>
          
          <div class="property-highlight">
            <div class="property-name">📍 ${data.propertyName}</div>
            <div class="property-type">${data.propertyType.charAt(0).toUpperCase() + data.propertyType.slice(1)}</div>
          </div>

          <div class="alert-box">
            <strong>⚡ Action Required:</strong> You have received a new booking request. Please review and respond as soon as possible.
          </div>
          
          <div class="booking-details">
            <div class="section-title">📋 Booking Information</div>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${data.bookingId}</span>
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
              <span class="detail-value"><strong>$${data.totalPrice}</strong></span>
            </div>
          </div>

          <center>
            <a href="${data.dashboardUrl}" class="button">View & Manage Booking</a>
          </center>

          <div class="guest-info">
            <p style="margin: 0;"><strong>💡 Quick Tip:</strong></p>
            <p style="margin: 5px 0 0 0;">Responding quickly to booking requests increases your acceptance rate and improves your property's visibility.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Discover Albania.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(
    "[Email Service] ✅ Provider booking notification template generated, length:",
    template.length,
  );
  return template;
};
