const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value: number): string => `$${value.toFixed(2)}`;

type BookingStatusType = "confirmed" | "pending" | "canceled" | "completed";

const statusConfig: Record<
  BookingStatusType,
  { color: string; bgColor: string; icon: string; title: string }
> = {
  confirmed: {
    color: "#1f7a4d",
    bgColor: "#edf8f1",
    icon: "OK",
    title: "Booking confirmed",
  },
  pending: {
    color: "#9a6700",
    bgColor: "#fff8e6",
    icon: "..",
    title: "Booking pending",
  },
  canceled: {
    color: "#b42318",
    bgColor: "#fff1f0",
    icon: "X",
    title: "Booking canceled",
  },
  completed: {
    color: "#24567a",
    bgColor: "#eef6fb",
    icon: "*",
    title: "Stay completed",
  },
};

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
  cancellationReason?: string;
  dashboardUrl: string;
}): string => {
  const config = statusConfig[data.status];

  const clientName = escapeHtml(data.clientName);
  const bookingId = escapeHtml(data.bookingId);
  const propertyName = escapeHtml(data.propertyName);
  const propertyType = escapeHtml(data.propertyType);
  const checkInDate = escapeHtml(data.checkInDate);
  const checkOutDate = escapeHtml(data.checkOutDate);
  const statusMessage = escapeHtml(data.statusMessage);
  const cancellationReason = data.cancellationReason
    ? escapeHtml(data.cancellationReason)
    : "";
  const dashboardUrl = escapeHtml(data.dashboardUrl);
  const totalPrice = formatPrice(data.totalPrice);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background: #eef3f8; font-family: Arial, sans-serif; color: #16324f; }
        .wrapper { width: 100%; padding: 24px 0; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 16px 40px rgba(22, 50, 79, 0.10); }
        .header { padding: 28px 32px; background: linear-gradient(135deg, #16324f 0%, #24567a 100%); color: #ffffff; }
        .eyebrow { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.78; }
        .title { margin: 12px 0 0; font-size: 28px; line-height: 1.2; }
        .content { padding: 30px 32px 34px; }
        .intro { margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: #415a73; }
        .status { margin: 0 0 22px; padding: 18px; border-radius: 14px; background: ${config.bgColor}; border-left: 4px solid ${config.color}; }
        .status-title { margin: 0 0 8px; font-size: 22px; color: ${config.color}; }
        .status-copy { margin: 0; font-size: 14px; line-height: 1.6; color: #415a73; }
        .card { padding: 20px 22px; border: 1px solid #e3ebf3; border-radius: 14px; background: #fbfdff; }
        .card-title { margin: 0 0 14px; font-size: 17px; color: #16324f; }
        .reason-box { margin: 18px 0 0; padding: 16px 18px; border-radius: 12px; background: #fff6f5; border: 1px solid #f3d0cb; }
        .reason-label { margin: 0 0 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #b42318; font-weight: 700; }
        .reason-copy { margin: 0; font-size: 14px; line-height: 1.6; color: #7a2e26; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
        tr:last-child td { border-bottom: none; }
        .label { width: 42%; color: #72859a; font-weight: 700; }
        .value { color: #16324f; text-align: right; }
        .cta-wrap { padding: 24px 0 4px; text-align: center; }
        .button { display: inline-block; padding: 14px 28px; border-radius: 999px; background: linear-gradient(135deg, #24567a 0%, #16324f 100%); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; }
        .footer { padding: 0 32px 30px; color: #6f8194; font-size: 13px; line-height: 1.7; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="eyebrow">Bookinal Booking Update</div>
            <h1 class="title">${config.title}</h1>
          </div>
          <div class="content">
            <p class="intro">Hello ${clientName},</p>
            <div class="status">
              <h2 class="status-title">${config.icon} ${config.title}</h2>
              <p class="status-copy">${statusMessage}</p>
            </div>
            ${
              cancellationReason
                ? `<div class="reason-box">
              <p class="reason-label">Cancellation reason</p>
              <p class="reason-copy">${cancellationReason}</p>
            </div>`
                : ""
            }
            <div class="card">
              <h2 class="card-title">Booking summary</h2>
              <table role="presentation">
                <tr>
                  <td class="label">Booking reference</td>
                  <td class="value">${bookingId}</td>
                </tr>
                <tr>
                  <td class="label">Property</td>
                  <td class="value">${propertyName}</td>
                </tr>
                <tr>
                  <td class="label">Type</td>
                  <td class="value">${propertyType}</td>
                </tr>
                <tr>
                  <td class="label">Check-in</td>
                  <td class="value">${checkInDate}</td>
                </tr>
                <tr>
                  <td class="label">Check-out</td>
                  <td class="value">${checkOutDate}</td>
                </tr>
                <tr>
                  <td class="label">Total price</td>
                  <td class="value">${totalPrice}</td>
                </tr>
              </table>
            </div>
            <div class="cta-wrap">
              <a href="${dashboardUrl}" class="button">Open my bookings</a>
            </div>
          </div>
          <div class="footer">
            This is an automated notification from Bookinal.<br>
            Please manage your booking through the platform for the latest status and payment steps.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
