import { apiClient } from "./apiClient";
import { authService } from "./authService";
import { Booking } from "@albania/shared-types";
import { CreateBookingDto } from "@albania/shared-types";
import { getCarById } from "./carService";
import { getApartmentById } from "./apartmentService";

/**
 * Apartment bookings are free: no service fee and no online payment.
 */
export const isFreeBooking = (
  booking: Pick<Booking, "payment_status">,
): boolean => booking.payment_status === "not_required";

/**
 * Client and provider see each other's contact details once the service fee
 * is paid (cars), or once the provider confirms the request (free bookings).
 */
export const canShareContactDetails = (
  booking: Pick<Booking, "payment_status" | "status">,
): boolean => {
  if (booking.status === "canceled") return false;
  if (booking.payment_status === "paid") return true;
  return (
    isFreeBooking(booking) &&
    (booking.status === "confirmed" || booking.status === "completed")
  );
};

const maskContactDetailsForProvider = (booking: Booking): Booking => {
  if (canShareContactDetails(booking)) {
    return booking;
  }

  return {
    ...booking,
    contactMail: "",
    contactPhone: "",
  };
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
      // Apartments are free (the database enforces the same rule)
      ...(payload.propertyType === "apartment"
        ? { fee: 0, payment_status: "not_required" }
        : { payment_status: "pending" }),
    })
    .select("*")
    .single();

  if (error) {
    console.error("[Booking Service] Error creating booking:", error);
    throw error;
  }

  const booking = data as Booking;

  notifyProvider("notify-provider-booking", booking.id);
  notifyProvider("notify-provider-whatsapp", booking.id);

  return booking;
};

/**
 * Tells the provider about the new request, by email and by WhatsApp. The edge
 * functions build the messages from the booking. Fire-and-forget, one call each:
 * a problem with one never blocks the booking or the other alert.
 */
const notifyProvider = (
  functionName: "notify-provider-booking" | "notify-provider-whatsapp",
  bookingId: string,
): void => {
  apiClient.functions
    .invoke(functionName, { body: { bookingId } })
    .then(({ data, error }) => {
      if (error) {
        console.warn(`[Booking Service] ${functionName} failed:`, error.message);
      } else {
        console.log(`[Booking Service] ${functionName}:`, data);
      }
    })
    .catch((err) => console.warn(`[Booking Service] ${functionName} failed:`, err));
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
 * Get Booking by property id and type - Only confirmed bookings block availability.
 * Booking rows are private (RLS), so this uses the `get_booked_date_ranges` RPC
 * which only exposes the booked date ranges.
 */
export const getBookingsByPropertyIdAndType = async (
  propertyId: string,
  propertyType: Booking["propertyType"],
): Promise<Pick<Booking, "propertyId" | "startDate" | "endDate">[] | null> => {
  const { data, error } = await apiClient.rpc("get_booked_date_ranges", {
    p_property_type: propertyType,
    p_property_id: propertyId,
  });

  if (error) {
    console.error(
      "[Booking Service] Error fetching booking by property id and type:",
      error,
    );
    throw error;
  }

  return data;
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
  const { data, error } = await apiClient.rpc("get_booked_date_ranges", {
    p_property_type: propertyType,
    p_start: startStr,
    p_end: endStr,
  });

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
