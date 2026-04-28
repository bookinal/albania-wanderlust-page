import { apiClient } from "./apiClient";
import { authService } from "./authService";
import { Booking } from "@albania/shared-types";
import { CreateBookingDto } from "@albania/shared-types";
import { getCarById } from "./carService";
import { getApartmentById } from "./apartmentService";
import { getHotelById } from "./hotelService";
import { sendEmailDirect } from "./emailService";
import { getProviderBookingNotificationTemplate } from "./emailTemplates";
/**
 * Provider data interface
 */
interface ProviderData {
  email: string;
  full_name: string;
}

const canShareContactDetails = (
  paymentStatus: Booking["payment_status"] | undefined,
): boolean => paymentStatus === "paid";

const maskContactDetailsForProvider = (booking: Booking): Booking => {
  if (canShareContactDetails(booking.payment_status)) {
    return booking;
  }

  return {
    ...booking,
    contactMail: "",
    contactPhone: "",
  };
};

const getPropertyTypeLabel = (
  propertyType: CreateBookingDto["propertyType"],
): string => {
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

const getPropertyDisplayName = async (
  propertyId: string,
  propertyType: CreateBookingDto["propertyType"],
): Promise<string> => {
  const numericId = Number(propertyId);

  if (!Number.isFinite(numericId)) {
    return propertyId;
  }

  try {
    switch (propertyType) {
      case "car": {
        const car = await getCarById(numericId);
        return car ? `${car.brand} ${car.name}`.trim() : propertyId;
      }
      case "apartment": {
        const apartment = await getApartmentById(numericId);
        return apartment?.name || propertyId;
      }
      case "hotel":
      default: {
        const hotel = await getHotelById(numericId);
        return hotel?.name || propertyId;
      }
    }
  } catch (error) {
    console.warn("[Booking Service] Unable to resolve property name:", {
      propertyId,
      propertyType,
      error,
    });
    return propertyId;
  }
};

/**
 * Get provider details by ID
 */
const getProviderEmail = async (
  providerId: string,
): Promise<ProviderData | null> => {
  const { data, error } = await apiClient
    .from("users")
    .select("email, full_name")
    .eq("id", providerId)
    .single();

  if (error) {
    console.error("[Booking Service] Error fetching provider:", error);
    return null;
  }

  return data as ProviderData;
};

/**
 * Create a new booking for the currently authenticated user
 */
export const createBooking = async (
  payload: CreateBookingDto,
): Promise<Booking> => {
  const userId = await authService.getCurrentUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await apiClient
    .from("booking")
    .insert({
      ...payload,
      userId,
      status: "pending",
      payment_status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    console.error("[Booking Service] Error creating booking:", error);
    throw error;
  }

  const booking = data as Booking;
  // Send email notification to provider
  try {
    console.log("[Booking Service] 📧 Starting email notification process...");
    console.log("[Booking Service] Provider ID:", payload.providerId);

    const [providerData, propertyName] = await Promise.all([
      getProviderEmail(payload.providerId),
      getPropertyDisplayName(payload.propertyId, payload.propertyType),
    ]);
    const propertyTypeLabel = getPropertyTypeLabel(payload.propertyType);
    const shareGuestContact = canShareContactDetails(booking.payment_status);

    console.log("[Booking Service] Provider data retrieved:", {
      email: providerData?.email,
      fullName: providerData?.full_name,
      hasData: !!providerData,
    });
    console.log("[Booking Service] Property details retrieved:", {
      propertyId: payload.propertyId,
      propertyName,
      propertyType: propertyTypeLabel,
    });

    if (providerData?.email) {
      console.log("[Booking Service] Generating email template...");
      console.log("[Booking Service] Template data:", {
        providerName: providerData.full_name || "Provider",
        propertyName,
        propertyType: propertyTypeLabel,
        guestName: payload.requesterName,
        guestEmail: shareGuestContact ? payload.contactMail : "",
        guestPhone: shareGuestContact ? payload.contactPhone : "",
        checkInDate: new Date(payload.startDate).toLocaleDateString(),
        checkOutDate: new Date(payload.endDate).toLocaleDateString(),
        totalPrice: payload.totalPrice,
        bookingId: booking.id,
        showGuestContact: shareGuestContact,
      });

      const html = getProviderBookingNotificationTemplate({
        providerName: providerData.full_name || "Provider",
        propertyName,
        propertyType: propertyTypeLabel,
        guestName: payload.requesterName,
        guestEmail: shareGuestContact ? payload.contactMail : "",
        guestPhone: shareGuestContact ? payload.contactPhone : "",
        checkInDate: new Date(payload.startDate).toLocaleDateString(),
        checkOutDate: new Date(payload.endDate).toLocaleDateString(),
        totalPrice: payload.totalPrice,
        bookingId: booking.id,
        showGuestContact: shareGuestContact,
        dashboardUrl: `${window.location.origin}/dashboard/bookings`,
      });

      console.log(
        "[Booking Service] ✅ Email HTML generated, length:",
        html?.length || 0,
      );
      console.log(
        "[Booking Service] HTML preview (first 200 chars):",
        html?.substring(0, 200),
      );

      // Validate email data before sending
      const emailPayload = {
        to: providerData.email, // For testing
        subject: `New booking request for ${propertyName}`,
        html,
        replyTo: shareGuestContact ? payload.contactMail : undefined,
        tags: {
          category: "booking_notification",
          bookingId: booking.id,
          providerId: payload.providerId,
        },
      };

      console.log("[Booking Service] 📤 Email payload prepared:", {
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasHtml: !!emailPayload.html,
        htmlLength: emailPayload.html?.length || 0,
        replyTo: emailPayload.replyTo,
        tags: emailPayload.tags,
      });

      // Validate required fields
      if (!emailPayload.to || !emailPayload.subject || !emailPayload.html) {
        console.error("[Booking Service] ❌ Missing required email fields:", {
          hasTo: !!emailPayload.to,
          hasSubject: !!emailPayload.subject,
          hasHtml: !!emailPayload.html,
        });
        throw new Error("Missing required email fields");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailPayload.to)) {
        console.error(
          "[Booking Service] ❌ Invalid email format:",
          emailPayload.to,
        );
        throw new Error(`Invalid email format: ${emailPayload.to}`);
      }

      if (emailPayload.replyTo && !emailRegex.test(emailPayload.replyTo)) {
        console.error(
          "[Booking Service] ❌ Invalid replyTo email format:",
          emailPayload.replyTo,
        );
        throw new Error(
          `Invalid replyTo email format: ${emailPayload.replyTo}`,
        );
      }

      console.log("[Booking Service] ✅ Email validation passed");
      console.log("[Booking Service] Calling sendEmailDirect...");

      const emailResult = await sendEmailDirect(emailPayload);

      console.log("[Booking Service] 📨 Email result received:", {
        success: emailResult?.success,
        messageId: emailResult?.messageId,
        error: emailResult?.error,
        statusCode: emailResult?.statusCode,
        fullResult: emailResult,
      });

      if (emailResult?.success) {
        console.log(
          "[Booking Service] ✅ Provider notification email sent successfully!",
          emailResult.messageId,
        );
      } else {
        console.warn(
          "[Booking Service] ⚠️ Failed to send provider notification:",
          {
            error: emailResult?.error,
            statusCode: emailResult?.statusCode,
            fullResult: emailResult,
          },
        );
      }
    } else {
      console.warn(
        "[Booking Service] ⚠️ No provider email found, skipping notification",
      );
    }
  } catch (err) {
    // Don't fail the booking creation if email sending fails
    console.error("[Booking Service] ❌ Error sending provider notification:", {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  return booking;
};

/**
 * Paginated result shape for user bookings
 */
export interface BookingPage {
  data: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get a single page of bookings for the currently authenticated user.
 * Uses Supabase .range() for DB-level pagination so only `pageSize` rows
 * are fetched and enriched instead of the entire table.
 */
export const getCurrentUserBookingsPaginated = async (
  page: number = 1,
  pageSize: number = 5,
): Promise<BookingPage> => {
  const userId = await authService.getCurrentUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await apiClient
    .from("booking")
    .select("*", { count: "exact" })
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[Booking Service] Error fetching paginated bookings:", error);
    throw error;
  }

  // Enrich only the current page's bookings with property data
  for (const booking of data || []) {
    try {
      if (booking.propertyType === "car") {
        booking.propertyData = await getCarById(Number(booking.propertyId));
      } else if (booking.propertyType === "apartment") {
        booking.propertyData = await getApartmentById(Number(booking.propertyId));
      } else if (booking.propertyType === "hotel") {
        booking.propertyData = await getHotelById(Number(booking.propertyId));
      }
    } catch {
      booking.propertyData = null;
    }
  }

  const total = count ?? 0;

  return {
    data: data || [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

/**
 * Get all bookings for the currently authenticated user (customer bookings)
 */
export const getCurrentUserBookings = async (): Promise<Booking[]> => {
  const userId = await authService.getCurrentUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await apiClient
    .from("booking")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[Booking Service] Error fetching user bookings:", error);
    throw error;
  }

  // get properties data for each booking
  for (const booking of data || []) {
    if (booking.propertyType === "car") {
      booking.propertyData = await getCarById(Number(booking.propertyId));
    } else if (booking.propertyType === "apartment") {
      booking.propertyData = await getApartmentById(Number(booking.propertyId));
    } else if (booking.propertyType === "hotel") {
      booking.propertyData = await getHotelById(Number(booking.propertyId));
    }
  }
  return data || [];
};

/**
 * Get all bookings for a given provider ID (admin use — no auth restriction)
 */
export const getBookingsByProviderIdForAdmin = async (
  providerId: string,
): Promise<Booking[]> => {
  const { data, error } = await apiClient
    .from("booking")
    .select("*")
    .eq("providerId", providerId)
    .order("createdAt", { ascending: false });
  if (error) {
    console.error(
      "[Booking Service] Error fetching bookings for provider (admin):",
      error,
    );
    throw error;
  }
  // Enrich with property data
  for (const booking of data || []) {
    try {
      if (booking.propertyType === "car") {
        booking.propertyData = await getCarById(Number(booking.propertyId));
      } else if (booking.propertyType === "apartment") {
        booking.propertyData = await getApartmentById(Number(booking.propertyId));
      } else if (booking.propertyType === "hotel") {
        booking.propertyData = await getHotelById(Number(booking.propertyId));
      }
    } catch {
      booking.propertyData = null;
    }
  }
  return data || [];
};

/*
 * Get all bookings for a specific provider (provider bookings)
 */
export const getBookingsByProviderId = async (): Promise<Booking[]> => {
  const providerId = await authService.getCurrentUserId();
  const { data, error } = await apiClient
    .from("booking")
    .select("*")
    .eq("providerId", providerId)
    .order("createdAt", { ascending: false });
  if (error) {
    console.error(
      "[Booking Service] Error fetching bookings for provider:",
      error,
    );
    throw error;
  }
  return (data || []).map((booking) => maskContactDetailsForProvider(booking));
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: Booking["status"],
  cancellationReason?: string,
): Promise<Booking> => {
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === "canceled" && cancellationReason) {
    updateData.cancellation_reason = cancellationReason;
  }

  const { data, error } = await apiClient
    .from("booking")
    .update(updateData)
    .eq("id", bookingId)
    .select("*")
    .single();

  if (error) {
    console.error("[Booking Service] Error updating booking status:", error);
    throw error;
  }

  return data as Booking;
};

/**
 * Get Booking by property id and type - Only confirmed bookings block availability
 */
export const getBookingsByPropertyIdAndType = async (
  propertyId: string,
  propertyType: Booking["propertyType"],
): Promise<Booking[] | null> => {
  const { data, error } = await apiClient
    .from("booking")
    .select("*")
    .eq("status", "confirmed")
    .eq("propertyId", propertyId)
    .eq("propertyType", propertyType);

  if (error) {
    console.error(
      "[Booking Service] Error fetching booking by property id and type:",
      error,
    );
    throw error;
  }

  return data as Booking[] | null;
};

/**
 * Get IDs of properties of a specific type that are unavailable for a given date range.
 * This checks for overlapping 'confirmed' bookings.
 */
export const getUnavailablePropertyIds = async (
  propertyType: Booking["propertyType"],
  startDate: Date,
  endDate: Date,
): Promise<number[]> => {
  // Convert dates to ISO strings for DB comparison
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  // We find any confirmed booking where the booking period overlaps with the requested period:
  // Overlap condition: booking.startDate <= requested.endDate AND booking.endDate >= requested.startDate
  const { data, error } = await apiClient
    .from("booking")
    .select("propertyId")
    .eq("propertyType", propertyType)
    .eq("status", "confirmed")
    .lte("startDate", endStr)
    .gte("endDate", startStr);

  if (error) {
    console.error("[Booking Service] Error fetching unavailable property IDs:", error);
    return [];
  }

  // Ensure propertyIds are parsed as numbers since DB might store them as strings sometimes
  const ids = data?.map((b) => parseInt(b.propertyId, 10)).filter(id => !isNaN(id)) || [];
  // Return unique IDs
  return Array.from(new Set(ids));
};

const bookingService = {
  createBooking,
  getCurrentUserBookings,
  getCurrentUserBookingsPaginated,
  getBookingsByProviderId,
  updateBookingStatus,
  getBookingsByPropertyIdAndType,
};

export default bookingService;
