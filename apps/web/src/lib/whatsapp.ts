import type { TFunction } from "i18next";
import type { Booking } from "@/types/booking.type";

/**
 * Public site used in WhatsApp messages (they're read outside the app, so not
 * the current origin, which is localhost in development).
 */
const PUBLIC_SITE_URL = "https://bookinal.com";
/** Where the provider manages the booking */
const PROVIDER_BOOKINGS_URL = `${PUBLIC_SITE_URL}/dashboard/bookings`;
/** Where the client sees the booking */
const CLIENT_BOOKINGS_URL = `${PUBLIC_SITE_URL}/myBookings`;

/** Country code used for local numbers written without one (e.g. "069 123 4567"). */
const DEFAULT_COUNTRY_CODE = "355"; // Albania

/**
 * Phone number in the digits-only international form wa.me expects
 * ("+355 69 123 4567" -> "355691234567"), or null if it can't be one.
 */
export const toWhatsAppNumber = (phone?: string | null): string | null => {
  if (!phone) return null;
  const raw = phone.trim();
  let digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) {
    // already international
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  }
  // E.164: at most 15 digits; shorter than 8 can't be a full mobile number
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
};

/** "Open chat" link with a pre-written message, or null for an unusable number. */
export const buildWhatsAppLink = (phone: string | null | undefined, message: string): string | null => {
  const number = toWhatsAppNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
};

/** Booking reference as shown in the app: "#1A2B3C4D". */
export const formatBookingRef = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

const bookingPropertyName = (booking: Booking, t: TFunction) => {
  const data = booking.propertyData as { name?: string; brand?: string } | null | undefined;
  if (!data?.name) return t("whatsapp.yourBooking");
  // Cars are stored as brand + model ("Tesla" + "Model 3")
  return data.brand && !data.name.toLowerCase().startsWith(data.brand.toLowerCase())
    ? `${data.brand} ${data.name}`
    : data.name;
};

const bookingDates = (booking: Booking, language: string) => {
  const fmt = (value: string) =>
    new Date(value).toLocaleDateString(language, { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(booking.startDate)} – ${fmt(booking.endDate)}`;
};

/** Message a client sends to the provider of a paid booking. */
export const clientToProviderMessage = (
  booking: Booking,
  providerName: string | null | undefined,
  t: TFunction,
  language: string,
) =>
  t(providerName ? "whatsapp.clientToProviderNamed" : "whatsapp.clientToProvider", {
    name: providerName?.split(" ")[0],
    property: bookingPropertyName(booking, t),
    ref: formatBookingRef(booking.id),
    dates: bookingDates(booking, language),
    link: PROVIDER_BOOKINGS_URL,
    interpolation: { escapeValue: false },
  });

/** Message a provider sends to the client of a paid booking. */
export const providerToClientMessage = (booking: Booking, t: TFunction, language: string) =>
  t(booking.requesterName ? "whatsapp.providerToClientNamed" : "whatsapp.providerToClient", {
    name: booking.requesterName?.split(" ")[0],
    property: bookingPropertyName(booking, t),
    ref: formatBookingRef(booking.id),
    dates: bookingDates(booking, language),
    link: CLIENT_BOOKINGS_URL,
    interpolation: { escapeValue: false },
  });
