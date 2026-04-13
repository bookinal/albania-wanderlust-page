/**
 * HTML Email Template for Provider Booking Notification
 */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value: number): string => `$${value.toLocaleString("en-US")}`;

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

  const providerName = escapeHtml(data.providerName || "Provider");
  const propertyName = escapeHtml(data.propertyName);
  const propertyType = escapeHtml(data.propertyType);
  const guestName = escapeHtml(data.guestName);
  const guestEmail = escapeHtml(data.guestEmail);
  const guestPhone = escapeHtml(data.guestPhone);
  const checkInDate = escapeHtml(data.checkInDate);
  const checkOutDate = escapeHtml(data.checkOutDate);
  const bookingId = escapeHtml(data.bookingId);
  const dashboardUrl = escapeHtml(data.dashboardUrl);
  const totalPrice = formatPrice(data.totalPrice);

  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta charset="UTF-8">
      <style>
        body { margin: 0; padding: 0; background-color: #eef3f8; font-family: Arial, sans-serif; color: #16324f; }
        .wrapper { width: 100%; padding: 24px 0; background: linear-gradient(180deg, #eef3f8 0%, #f7f9fc 100%); }
        .container { max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 48px rgba(22, 50, 79, 0.10); }
        .header { padding: 32px 36px 24px; background: linear-gradient(135deg, #16324f 0%, #24567a 100%); color: #ffffff; }
        .brand { font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.78; }
        .headline { margin: 14px 0 8px; font-size: 28px; line-height: 1.2; font-weight: 700; }
        .subhead { margin: 0; font-size: 15px; line-height: 1.7; color: rgba(255, 255, 255, 0.86); }
        .content { padding: 32px 36px 36px; }
        .eyebrow { display: inline-block; margin-bottom: 16px; padding: 7px 12px; border-radius: 999px; background-color: #edf6ff; color: #24567a; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
        .intro { margin: 0 0 22px; font-size: 16px; line-height: 1.7; color: #35506c; }
        .highlight { margin: 0 0 24px; padding: 24px; border-radius: 16px; background: linear-gradient(135deg, #f3f8fc 0%, #edf3f8 100%); border: 1px solid #dbe7f1; }
        .highlight-label { margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6a8198; }
        .highlight-name { margin: 0; font-size: 26px; line-height: 1.25; font-weight: 700; color: #16324f; }
        .highlight-type { margin: 10px 0 0; font-size: 15px; color: #527089; }
        .notice { margin: 0 0 24px; padding: 16px 18px; border-radius: 14px; background-color: #fff7e8; border: 1px solid #f0d49b; color: #7a5618; font-size: 14px; line-height: 1.6; }
        .section { margin: 0 0 20px; padding: 22px 24px; border: 1px solid #e1ebf2; border-radius: 16px; background-color: #ffffff; }
        .section-title { margin: 0 0 16px; font-size: 17px; font-weight: 700; color: #16324f; }
        .detail-table { width: 100%; border-collapse: collapse; }
        .detail-table td { padding: 11px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; line-height: 1.5; vertical-align: top; }
        .detail-table tr:last-child td { border-bottom: none; }
        .detail-label { width: 42%; color: #6a8198; font-weight: 700; }
        .detail-value { color: #16324f; text-align: right; }
        .detail-value strong { font-size: 16px; }
        .cta-wrap { padding: 8px 0 2px; text-align: center; }
        .button { display: inline-block; padding: 14px 28px; border-radius: 999px; background: linear-gradient(135deg, #24567a 0%, #16324f 100%); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; }
        .tip { margin: 24px 0 0; padding: 16px 18px; border-radius: 14px; background-color: #f2f8f4; border: 1px solid #cfe3d5; color: #345a42; font-size: 14px; line-height: 1.6; }
        .footer { padding: 0 36px 32px; text-align: center; color: #7a8da1; font-size: 13px; line-height: 1.7; }
        .footer a { color: #24567a; text-decoration: none; }
        .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; }
      </style>
    </head>
    <body>
      <div class="preheader">A new booking request for ${propertyName} is waiting for your review on Bookinal.</div>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="brand">Bookinal Host Updates</div>
            <h1 class="headline">You have a new booking request</h1>
            <p class="subhead">Review the guest details, travel dates, and total amount so you can respond promptly from your dashboard.</p>
          </div>
          <div class="content">
            <div class="eyebrow">Action needed</div>
            <p class="intro">Hello ${providerName}, a new request has arrived for one of your listings. The key details are below.</p>

            <div class="highlight">
              <p class="highlight-label">Property</p>
              <p class="highlight-name">${propertyName}</p>
              <p class="highlight-type">${propertyType}</p>
            </div>

            <div class="notice"><strong>Next step:</strong> open your dashboard to accept, review, or follow up with the guest as soon as possible.</div>

            <div class="section">
              <h2 class="section-title">Booking summary</h2>
              <table class="detail-table" role="presentation">
                <tr>
                  <td class="detail-label">Booking reference</td>
                  <td class="detail-value">${bookingId}</td>
                </tr>
                <tr>
                  <td class="detail-label">Check-in</td>
                  <td class="detail-value">${checkInDate}</td>
                </tr>
                <tr>
                  <td class="detail-label">Check-out</td>
                  <td class="detail-value">${checkOutDate}</td>
                </tr>
                <tr>
                  <td class="detail-label">Estimated total</td>
                  <td class="detail-value"><strong>${totalPrice}</strong></td>
                </tr>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">Guest details</h2>
              <table class="detail-table" role="presentation">
                <tr>
                  <td class="detail-label">Guest name</td>
                  <td class="detail-value">${guestName}</td>
                </tr>
                <tr>
                  <td class="detail-label">Email</td>
                  <td class="detail-value"><a href="mailto:${guestEmail}" style="color: #24567a; text-decoration: none;">${guestEmail}</a></td>
                </tr>
                <tr>
                  <td class="detail-label">Phone</td>
                  <td class="detail-value">${guestPhone}</td>
                </tr>
              </table>
            </div>

            <div class="cta-wrap">
              <a href="${dashboardUrl}" class="button">Open booking dashboard</a>
            </div>

            <div class="tip"><strong>Host tip:</strong> quick replies help guests feel confident and can improve the performance of your listing over time.</div>
          </div>

          <div class="footer">
            You are receiving this automated notification because your property is listed on Bookinal.<br>
            Please manage this request from your dashboard rather than replying to this email.
          </div>
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
