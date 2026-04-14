const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value: number): string => `$${value.toFixed(2)}`;

export const getBookingCancellationTemplate = (data: {
  requesterName: string;
  propertyType: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}): string => {
  const requesterName = escapeHtml(data.requesterName);
  const propertyType = escapeHtml(data.propertyType);
  const checkIn = escapeHtml(data.checkIn);
  const checkOut = escapeHtml(data.checkOut);
  const totalPrice = formatPrice(data.totalPrice);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background: #f4f7fb; font-family: Arial, sans-serif; color: #17324d; }
        .wrapper { width: 100%; padding: 24px 0; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 16px 40px rgba(23, 50, 77, 0.10); }
        .header { padding: 28px 32px; background: linear-gradient(135deg, #17324d 0%, #a61d24 100%); color: #ffffff; }
        .eyebrow { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.78; }
        .title { margin: 12px 0 0; font-size: 28px; line-height: 1.2; }
        .content { padding: 30px 32px 34px; }
        .intro { margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: #415a73; }
        .notice { margin: 0 0 22px; padding: 16px 18px; border-radius: 14px; background: #fff3f1; border: 1px solid #f1c6bf; color: #8a3229; font-size: 14px; line-height: 1.6; }
        .card { padding: 20px 22px; border: 1px solid #e3ebf3; border-radius: 14px; background: #fbfdff; }
        .card-title { margin: 0 0 14px; font-size: 17px; color: #17324d; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
        tr:last-child td { border-bottom: none; }
        .label { width: 42%; color: #72859a; font-weight: 700; }
        .value { color: #17324d; text-align: right; }
        .footer { padding: 0 32px 30px; color: #6f8194; font-size: 13px; line-height: 1.7; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="eyebrow">Bookinal Booking Update</div>
            <h1 class="title">Your booking was cancelled</h1>
          </div>
          <div class="content">
            <p class="intro">Hello ${requesterName},</p>
            <p class="intro">We were unable to keep this reservation active because payment was not completed before the stay date.</p>
            <div class="notice"><strong>What happened:</strong> the booking was automatically cancelled to reopen availability and keep calendars accurate.</div>
            <div class="card">
              <h2 class="card-title">Booking summary</h2>
              <table role="presentation">
                <tr>
                  <td class="label">Property type</td>
                  <td class="value">${propertyType}</td>
                </tr>
                <tr>
                  <td class="label">Check-in</td>
                  <td class="value">${checkIn}</td>
                </tr>
                <tr>
                  <td class="label">Check-out</td>
                  <td class="value">${checkOut}</td>
                </tr>
                <tr>
                  <td class="label">Total</td>
                  <td class="value">${totalPrice}</td>
                </tr>
              </table>
            </div>
          </div>
          <div class="footer">
            If you believe this was a mistake, please contact Bookinal support from the application.<br>
            This is an automated notification.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
