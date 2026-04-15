import { createClient } from "jsr:@supabase/supabase-js@2";

interface BookingRecord {
  id: string;
  providerId: string;
  propertyId: string;
  propertyType: "hotel" | "apartment" | "car";
  requesterName: string;
  contactMail: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface UserContact {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value: number): string => `$${value.toFixed(2)}`;

const getPropertyTypeLabel = (propertyType: BookingRecord["propertyType"]): string => {
  switch (propertyType) {
    case "apartment":
      return "Apartment";
    case "car":
      return "Car";
    case "hotel":
    default:
      return "Hotel";
  }
};

const getPropertyDetails = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  booking: BookingRecord,
): Promise<{ name: string; typeLabel: string }> => {
  const id = Number(booking.propertyId);

  if (!Number.isFinite(id)) {
    return {
      name: booking.propertyId,
      typeLabel: getPropertyTypeLabel(booking.propertyType),
    };
  }

  if (booking.propertyType === "car") {
    const { data } = await supabaseAdmin
      .from("car")
      .select("name, brand")
      .eq("id", id)
      .single();

    return {
      name: `${data?.brand || ""} ${data?.name || ""}`.trim() || booking.propertyId,
      typeLabel: "Car",
    };
  }

  const table = booking.propertyType === "apartment" ? "apartment" : "hotel";
  const { data } = await supabaseAdmin
    .from(table)
    .select("name")
    .eq("id", id)
    .single();

  return {
    name: data?.name || booking.propertyId,
    typeLabel: getPropertyTypeLabel(booking.propertyType),
  };
};

const getProviderContact = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  providerId: string,
): Promise<UserContact | null> => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, phone")
    .eq("id", providerId)
    .single();

  if (error || !data) {
    console.error("[Contact Unlock] Failed to fetch provider contact:", error);
    return null;
  }

  return data as UserContact;
};

const getClientContactUnlockTemplate = (data: {
  clientName: string;
  propertyName: string;
  propertyType: string;
  providerName: string;
  providerEmail: string;
  providerPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  dashboardUrl: string;
}): string => {
  const providerPhoneRow = data.providerPhone
    ? `<tr><td class="label">Provider phone</td><td class="value">${escapeHtml(data.providerPhone)}</td></tr>`
    : "";

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
        .notice { margin: 0 0 22px; padding: 18px; border-radius: 14px; background: #edf8f1; border-left: 4px solid #1f7a4d; }
        .notice-title { margin: 0 0 8px; font-size: 20px; color: #1f7a4d; }
        .notice-copy { margin: 0; font-size: 14px; line-height: 1.6; color: #415a73; }
        .card { margin-top: 18px; padding: 20px 22px; border: 1px solid #e3ebf3; border-radius: 14px; background: #fbfdff; }
        .card-title { margin: 0 0 14px; font-size: 17px; color: #16324f; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; vertical-align: top; }
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
            <div class="eyebrow">Bookinal Payment Update</div>
            <h1 class="title">Payment received, contact details unlocked</h1>
          </div>
          <div class="content">
            <p class="intro">Hello ${escapeHtml(data.clientName)},</p>
            <div class="notice">
              <h2 class="notice-title">You can now coordinate directly</h2>
              <p class="notice-copy">Bookinal has secured the platform booking fee for your reservation. The remaining rental amount and arrival arrangements should now be coordinated directly with the provider using the contact details below.</p>
            </div>
            <div class="card">
              <h2 class="card-title">Provider contact</h2>
              <table role="presentation">
                <tr><td class="label">Provider</td><td class="value">${escapeHtml(data.providerName)}</td></tr>
                <tr><td class="label">Email</td><td class="value">${escapeHtml(data.providerEmail)}</td></tr>
                ${providerPhoneRow}
              </table>
            </div>
            <div class="card">
              <h2 class="card-title">Booking summary</h2>
              <table role="presentation">
                <tr><td class="label">Property</td><td class="value">${escapeHtml(data.propertyName)}</td></tr>
                <tr><td class="label">Type</td><td class="value">${escapeHtml(data.propertyType)}</td></tr>
                <tr><td class="label">Check-in</td><td class="value">${escapeHtml(data.checkInDate)}</td></tr>
                <tr><td class="label">Check-out</td><td class="value">${escapeHtml(data.checkOutDate)}</td></tr>
                <tr><td class="label">Booking value</td><td class="value">${formatPrice(data.totalPrice)}</td></tr>
              </table>
            </div>
            <div class="cta-wrap">
              <a href="${escapeHtml(data.dashboardUrl)}" class="button">Open my bookings</a>
            </div>
          </div>
          <div class="footer">This is an automated notification from Bookinal. Please keep all booking details documented in the platform whenever possible.</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getProviderContactUnlockTemplate = (data: {
  providerName: string;
  propertyName: string;
  propertyType: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  dashboardUrl: string;
}): string => {
  const clientPhoneRow = data.clientPhone
    ? `<tr><td class="label">Client phone</td><td class="value">${escapeHtml(data.clientPhone)}</td></tr>`
    : "";

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
        .notice { margin: 0 0 22px; padding: 18px; border-radius: 14px; background: #edf8f1; border-left: 4px solid #1f7a4d; }
        .notice-title { margin: 0 0 8px; font-size: 20px; color: #1f7a4d; }
        .notice-copy { margin: 0; font-size: 14px; line-height: 1.6; color: #415a73; }
        .card { margin-top: 18px; padding: 20px 22px; border: 1px solid #e3ebf3; border-radius: 14px; background: #fbfdff; }
        .card-title { margin: 0 0 14px; font-size: 17px; color: #16324f; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; vertical-align: top; }
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
            <div class="eyebrow">Bookinal Payment Update</div>
            <h1 class="title">Booking fee received, guest contact unlocked</h1>
          </div>
          <div class="content">
            <p class="intro">Hello ${escapeHtml(data.providerName)},</p>
            <div class="notice">
              <h2 class="notice-title">You can now coordinate directly</h2>
              <p class="notice-copy">Bookinal has secured the platform booking fee for this reservation. You can now contact the guest directly to arrange check-in details and settle any remaining rental amount outside the application.</p>
            </div>
            <div class="card">
              <h2 class="card-title">Guest contact</h2>
              <table role="presentation">
                <tr><td class="label">Guest</td><td class="value">${escapeHtml(data.clientName)}</td></tr>
                <tr><td class="label">Email</td><td class="value">${escapeHtml(data.clientEmail)}</td></tr>
                ${clientPhoneRow}
              </table>
            </div>
            <div class="card">
              <h2 class="card-title">Booking summary</h2>
              <table role="presentation">
                <tr><td class="label">Property</td><td class="value">${escapeHtml(data.propertyName)}</td></tr>
                <tr><td class="label">Type</td><td class="value">${escapeHtml(data.propertyType)}</td></tr>
                <tr><td class="label">Check-in</td><td class="value">${escapeHtml(data.checkInDate)}</td></tr>
                <tr><td class="label">Check-out</td><td class="value">${escapeHtml(data.checkOutDate)}</td></tr>
                <tr><td class="label">Booking value</td><td class="value">${formatPrice(data.totalPrice)}</td></tr>
              </table>
            </div>
            <div class="cta-wrap">
              <a href="${escapeHtml(data.dashboardUrl)}" class="button">Open provider bookings</a>
            </div>
          </div>
          <div class="footer">This is an automated notification from Bookinal. Please keep the booking status up to date in the platform.</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendContactUnlockNotifications = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  booking: BookingRecord,
  options: {
    supabaseUrl: string;
    serviceRoleKey: string;
    origin?: string;
  },
): Promise<void> => {
  const provider = await getProviderContact(supabaseAdmin, booking.providerId);

  if (!provider?.email) {
    console.warn("[Contact Unlock] Skipping notifications: provider email missing");
    return;
  }

  const property = await getPropertyDetails(supabaseAdmin, booking);
  const checkInDate = new Date(booking.startDate).toLocaleDateString();
  const checkOutDate = new Date(booking.endDate).toLocaleDateString();
  const publicOrigin = options.origin || "https://www.bookinal.com";

  const clientHtml = getClientContactUnlockTemplate({
    clientName: booking.requesterName,
    propertyName: property.name,
    propertyType: property.typeLabel,
    providerName: provider.full_name || "Provider",
    providerEmail: provider.email,
    providerPhone: provider.phone,
    checkInDate,
    checkOutDate,
    totalPrice: booking.totalPrice,
    dashboardUrl: `${publicOrigin}/myBookings`,
  });

  const providerHtml = getProviderContactUnlockTemplate({
    providerName: provider.full_name || "Provider",
    propertyName: property.name,
    propertyType: property.typeLabel,
    clientName: booking.requesterName,
    clientEmail: booking.contactMail,
    clientPhone: booking.contactPhone,
    checkInDate,
    checkOutDate,
    totalPrice: booking.totalPrice,
    dashboardUrl: `${publicOrigin}/dashboard/bookings`,
  });

  const requests = [
    {
      to: booking.contactMail,
      subject: `Payment Received - Provider Contact Unlocked`,
      html: clientHtml,
      tags: {
        type: "contact-unlock-client",
        bookingId: booking.id,
      },
    },
    {
      to: provider.email,
      subject: `Booking Fee Received - Guest Contact Unlocked`,
      html: providerHtml,
      tags: {
        type: "contact-unlock-provider",
        bookingId: booking.id,
      },
    },
  ];

  for (const request of requests) {
    const response = await fetch(`${options.supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.serviceRoleKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to send contact unlock email: ${text}`);
    }
  }
};
