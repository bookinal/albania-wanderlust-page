import { apiClient } from "./apiClient";
import {
  Apartment,
  CreateApartmentDto,
  UpdateApartmentDto,
  ApartmentFilters,
} from "@albania/shared-types";
import { uploadImages, deleteImagesByUrls } from "./storageService";
import { authService } from "./authService";
import { getBookingsByPropertyIdAndType, getUnavailablePropertyIds } from "./bookingService";

// In-memory cache for apartments with TTL
let apartmentsCache: { data: Apartment[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "apartments_cache";

/**
 * Load cache from localStorage
 */
const loadCacheFromStorage = (): {
  data: Apartment[];
  timestamp: number;
} | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Validate cache hasn't expired
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed;
      } else {
        console.log("[Apartment Service] localStorage cache expired, clearing");
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (err) {
    console.warn(
      "[Apartment Service] Error loading cache from localStorage:",
      err,
    );
  }
  return null;
};

/**
 * Save cache to localStorage
 */
const saveCacheToStorage = (data: Apartment[], timestamp: number): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp }));
  } catch (err) {
    console.warn(
      "[Apartment Service] Error saving cache to localStorage:",
      err,
    );
  }
};

/**
 * Search apartments with DB-level filtering and pagination
 */
export const searchApartments = async (
  filters: any,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Apartment[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = apiClient.from("apartment").select("*", { count: "exact" });

  const f = filters.apartmentFilters || {};

  // Status filter
  if (f.status && f.status !== "all") {
    query = query.eq("status", f.status);
  } else {
    query = query.not("status", "in", '("maintenance","review")');
  }

  // Search term
  const searchTerm = f.searchTerm || filters.destination || "";
  if (searchTerm && searchTerm.trim()) {
    const term = `%${searchTerm}%`;
    query = query.or(`name.ilike.${term},location.ilike.${term},address.ilike.${term}`);
  }

  // Rooms and Beds
  if (f.rooms?.min) query = query.gte("rooms", f.rooms.min);
  if (f.rooms?.max) query = query.lte("rooms", f.rooms.max);
  
  if (f.beds?.min) query = query.gte("beds", f.beds.min);
  if (f.beds?.max) query = query.lte("beds", f.beds.max);

  if (f.bathrooms?.min) query = query.gte("bathrooms", f.bathrooms.min);
  if (f.bathrooms?.max) query = query.lte("bathrooms", f.bathrooms.max);

  // Price Range
  if (f.priceRange) {
    query = query.gte("price", f.priceRange.min).lte("price", f.priceRange.max);
  }

  // Rating
  if (f.rating && f.rating !== "all") {
    query = query.gte("rating", parseFloat(f.rating));
  }
  
  // Amenities filter
  if (f.amenities && f.amenities.length > 0) {
    query = query.contains("amenities", f.amenities);
  }

  // Date Availability
  if (filters.checkInDate && filters.checkOutDate) {
    const unavailableIds = await getUnavailablePropertyIds(
      "apartment",
      new Date(filters.checkInDate),
      new Date(filters.checkOutDate)
    );
    if (unavailableIds.length > 0) {
      query = query.not("id", "in", `(${unavailableIds.join(",")})`);
    }
  }

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[Apartment Service] Error searching apartments:", error);
    throw error;
  }

  return {
    data: data as Apartment[],
    total: count || 0,
  };
};

/**
 * Invalidate the apartments cache (call after creating, updating, or deleting apartments)
 */
export const invalidateApartmentsCache = (): void => {
  apartmentsCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.warn("[Apartment Service] Error clearing localStorage cache:", err);
  }
};

/**
 * Fetch all apartments (with persistent caching using localStorage)
 */
export const getAllApartments = async (): Promise<Apartment[]> => {
  // Try loading from memory cache first
  if (!apartmentsCache) {
    apartmentsCache = loadCacheFromStorage();
  }

  // Check if cache is valid
  if (apartmentsCache && Date.now() - apartmentsCache.timestamp < CACHE_TTL) {
    console.log(
      "[Apartment Service] 🎯 Returning cached apartments data (age: " +
        Math.round((Date.now() - apartmentsCache.timestamp) / 1000) +
        "s)",
    );
    return apartmentsCache.data;
  }

  const { data, error } = await apiClient
    .from("apartment")
    .select("*")
    .not("status", "in", '("maintenance","review")');
  if (error) throw error;

  // Update cache
  const timestamp = Date.now();
  apartmentsCache = { data: data || [], timestamp };
  saveCacheToStorage(data || [], timestamp);
  return data || [];
};

/**
 * fetch apartments by provider ID
 */
export const getApartmentsByProviderId = async (
  providerId: string,
): Promise<Apartment[]> => {
  const { data, error } = await apiClient
    .from("apartment")
    .select("*")
    .eq("providerId", providerId);
  if (error) throw error;
  return data;
};

/**
 * Get dashboard apartments with server-side pagination and filtering
 */
export const getDashboardApartments = async (params: {
  providerId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  rating?: string;
}): Promise<{ data: Apartment[]; total: number }> => {
  const { providerId, page = 1, limit = 6, search, status, rating } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = apiClient.from("apartment").select("*", { count: "exact" });

  if (providerId) {
    query = query.eq("providerId", providerId);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search && search.trim()) {
    const term = `%${search}%`;
    query = query.or(`name.ilike.${term},location.ilike.${term},address.ilike.${term}`);
  }

  if (rating && rating !== "all") {
    const threshold = parseFloat(rating);
    query = query.gte("rating", threshold);
  }

  query = query.order("created_at", { ascending: false });
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: (data as Apartment[]) || [], total: count || 0 };
};

/**
 * fetch a single apartment by ID
 */
export const getApartmentById = async (
  id: number,
): Promise<Apartment | null> => {
  const { data, error } = await apiClient
    .from("apartment")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};
/**
 * create a new apartment with image uploads
 */
export const createApartment = async (
  data: CreateApartmentDto,
  imageFiles?: File[],
): Promise<Apartment> => {
  const providerId = await authService.getCurrentUserId();
  if (!providerId) {
    throw new Error("User not authenticated");
  }
  // Upload images first if provided
  let imageUrls: string[] = [];
  if (imageFiles && imageFiles.length > 0) {
    try {
      const uploadResults = await uploadImages(imageFiles, "apartment");
      imageUrls = uploadResults.map((result) => result.publicUrl);
    } catch (err) {
      console.error("[Apartment Service] Error uploading images:", err);
      throw new Error(
        `Failed to upload images: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  const payload = {
    ...data,
    providerId: providerId,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
  };

  const { data: newApartment, error } = await apiClient
    .from("apartment")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[Apartment Service] Error creating apartment:", error);
    throw error;
  }
  // Invalidate cache after creating apartment
  invalidateApartmentsCache();

  return newApartment;
};

/**
 * update an existing apartment with optional image uploads
 */
export const updateApartment = async (
  id: number,
  updates: UpdateApartmentDto,
  newImageFiles?: File[],
): Promise<Apartment> => {
  // Remove system fields that shouldn't be updated
  const updateData = { ...updates };
  delete (updateData as any).id;
  delete (updateData as any).created_at;

  // Handle new image uploads
  if (newImageFiles && newImageFiles.length > 0) {
    try {
      const uploadResults = await uploadImages(newImageFiles, "apartment", id);
      const newImageUrls = uploadResults.map((result) => result.publicUrl);

      // Append new images to existing ones
      if (updateData.imageUrls) {
        updateData.imageUrls = [
          ...(updateData.imageUrls || []),
          ...newImageUrls,
        ];
      } else {
        updateData.imageUrls = newImageUrls;
      }
    } catch (err) {
      console.error("[Apartment Service] Error uploading images:", err);
      throw new Error(
        `Failed to upload images: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  const { data, error } = await apiClient
    .from("apartment")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      `[Apartment Service] Error updating apartment ID ${id}:`,
      error,
    );
    throw error;
  }

  // Invalidate cache after updating apartment
  invalidateApartmentsCache();

  return data;
};

/**
 * delete an apartment
 */
export const deleteApartment = async (id: number): Promise<void> => {
  // Check for active bookings (pending or confirmed)
  const activeBookings = await getBookingsByPropertyIdAndType(
    id.toString(),
    "apartment",
  );
  if (activeBookings && activeBookings.length > 0) {
    throw new Error(
      `Cannot delete this apartment because it has ${activeBookings.length} active booking(s). Please wait until all bookings are completed or cancelled.`,
    );
  }

  // Fetch the apartment to get its image URLs
  try {
    const apartment = await getApartmentById(id);
    if (apartment && apartment.imageUrls && apartment.imageUrls.length > 0) {
      await deleteImagesByUrls(apartment.imageUrls);
    }
  } catch (err) {
    console.warn(
      `[Apartment Service] Could not delete images for apartment ID ${id}:`,
      err,
    );
    // Continue with apartment deletion even if image cleanup fails
  }

  const { error } = await apiClient.from("apartment").delete().eq("id", id);
  if (error) throw error;

  // Invalidate cache after deleting apartment
  invalidateApartmentsCache();
};

/*
 * Get apartment unavailability dates by apartment id using booking service getBookingByPropertyIdAndType
 */
export const getApartmentUnavailabilityDates = async (
  apartmentId: number,
): Promise<string[]> => {
  const bookings = await getBookingsByPropertyIdAndType(
    apartmentId.toString(),
    "apartment",
  );

  if (!bookings || bookings.length === 0) {
    return [];
  }

  const unavailabilityDates: string[] = []; // Declare outside the loop

  bookings.forEach((booking) => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    while (startDate <= endDate) {
      unavailabilityDates.push(startDate.toISOString().split("T")[0]);
      startDate.setDate(startDate.getDate() + 1);
    }
  });

  return unavailabilityDates; // Return the accumulated dates
};

const apartmentService = {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  searchApartments,
  getDashboardApartments,
  getApartmentUnavailabilityDates,
};

export default apartmentService;
