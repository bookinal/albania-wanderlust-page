import { apiClient } from "./apiClient";
import { authService } from "./authService";
import {
  Hotel,
  CreateHotelDto,
  UpdateHotelDto,
  HotelFilters,
} from "@albania/shared-types";
import {
  uploadHotelImages,
  deleteHotelImages,
  deleteImagesByUrls,
} from "./storageService";
import { getBookingsByPropertyIdAndType, getUnavailablePropertyIds } from "./bookingService";

// In-memory cache for hotels with TTL
let hotelsCache: { data: Hotel[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "hotels_cache";

/**
 * Load cache from localStorage
 */
const loadCacheFromStorage = (): {
  data: Hotel[];
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
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (err) {
    console.warn("[Hotel Service] Error loading cache from localStorage:", err);
  }
  return null;
};

/**
 * Save cache to localStorage
 */
const saveCacheToStorage = (data: Hotel[], timestamp: number): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp }));
  } catch (err) {
    console.warn("[Hotel Service] Error saving cache to localStorage:", err);
  }
};

/**
 * Invalidate the hotels cache (call after creating, updating, or deleting hotels)
 */
export const invalidateHotelsCache = (): void => {
  hotelsCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.warn("[Hotel Service] Error clearing localStorage cache:", err);
  }
};

/**
 * Fetch all hotels (with persistent caching using localStorage)
 */
export const getAllHotels = async (): Promise<Hotel[]> => {
  // Try loading from memory cache first
  if (!hotelsCache) {
    hotelsCache = loadCacheFromStorage();
  }

  // Check if cache is valid
  if (hotelsCache && Date.now() - hotelsCache.timestamp < CACHE_TTL) {
    console.log(
      "[Hotel Service] 🎯 Returning cached hotels data (age: " +
        Math.round((Date.now() - hotelsCache.timestamp) / 1000) +
        "s)",
    );
    return hotelsCache.data;
  }

  const { data, error } = await apiClient.from("hotel").select("*");
  if (error) {
    console.error("[Hotel Service] Error fetching hotels:", error);
    throw error;
  }

  // Update cache
  const timestamp = Date.now();
  hotelsCache = { data: data || [], timestamp };
  saveCacheToStorage(data || [], timestamp);
  return data || [];
};

/**
 * Fetch hotles by providerId
 */
export const getAllHotelsByProviderId = async (
  providerId: string,
): Promise<Hotel[]> => {
  const { data, error } = await apiClient
    .from("hotel")
    .select("*")
    .eq("providerId", providerId);
  if (error) {
    console.error("[Hotel Service] Error fetching hotels:", error);
    throw error;
  }
  return data;
};

/**
 * Fetch a single hotel by ID
 */
export const getHotelById = async (id: number): Promise<Hotel | null> => {
  const { data, error } = await apiClient
    .from("hotel")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`[Hotel Service] Error fetching hotel ID ${id}:`, error);
    throw error;
  }
  return data;
};

/**
 * Create a new hotel with image uploads
 */
export const createHotel = async (
  data: CreateHotelDto,
  imageFiles?: File[],
): Promise<Hotel> => {
  const providerId = await authService.getCurrentUserId();

  if (!providerId) {
    throw new Error("User not authenticated");
  }

  // Upload images first if provided
  let imageUrls: string[] = [];
  if (imageFiles && imageFiles.length > 0) {
    try {
      const uploadResults = await uploadHotelImages(imageFiles);
      imageUrls = uploadResults.map((result) => result.publicUrl);
    } catch (err) {
      console.error("[Hotel Service] Error uploading images:", err);
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

  const { data: newHotel, error } = await apiClient
    .from("hotel")
    .insert(payload)
    .select()
    .single();

  if (error) {
    // If database insert fails, we should clean up uploaded images
    if (imageUrls.length > 0) {
      console.error(
        "[Hotel Service] Cleaning up uploaded images due to DB error",
      );
      // Note: Clean up is optional here - files can be deleted manually later
    }
    console.error("[Hotel Service] Error creating hotel:", error);
    throw error;
  }

  // Invalidate cache after creating hotel
  invalidateHotelsCache();

  return newHotel;
};

/**
 * Update an existing hotel with optional image uploads
 */
export const updateHotel = async (
  id: number,
  data: UpdateHotelDto,
  newImageFiles?: File[],
): Promise<Hotel> => {
  // Remove system fields that shouldn't be updated
  const updateData = { ...data };
  delete (updateData as any).id;
  delete (updateData as any).created_at;

  // Handle new image uploads
  if (newImageFiles && newImageFiles.length > 0) {
    try {
      const uploadResults = await uploadHotelImages(newImageFiles, id);
      const newImageUrls = uploadResults.map((result) => result.publicUrl);

      // Append new images to existing ones or replace
      if (updateData.imageUrls) {
        updateData.imageUrls = [
          ...(updateData.imageUrls || []),
          ...newImageUrls,
        ];
      } else {
        updateData.imageUrls = newImageUrls;
      }
    } catch (err) {
      console.error("[Hotel Service] Error uploading images:", err);
      throw new Error(
        `Failed to upload images: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  const { data: updatedHotel, error } = await apiClient
    .from("hotel")
    .update(updateData)
    .eq("id", id)
    .select("*");

  if (error) {
    console.error(`[Hotel Service] Error updating hotel ID ${id}:`, error);
    throw error;
  }

  if (!updatedHotel || updatedHotel.length === 0) {
    const error = new Error(
      "Update failed: Hotel not found or permission denied",
    );
    console.error(`[Hotel Service] Error updating hotel ID ${id}:`, error);
    throw error;
  }

  // Invalidate cache after updating hotel
  invalidateHotelsCache();

  return updatedHotel[0];
};

/**
 * Delete a hotel
 */
export const deleteHotel = async (id: number): Promise<void> => {
  // Check for active bookings (pending or confirmed)
  const activeBookings = await getBookingsByPropertyIdAndType(
    id.toString(),
    "hotel",
  );
  if (activeBookings && activeBookings.length > 0) {
    throw new Error(
      `Cannot delete this hotel because it has ${activeBookings.length} active booking(s). Please wait until all bookings are completed or cancelled.`,
    );
  }

  // Fetch the hotel to get its image URLs
  try {
    const hotel = await getHotelById(id);
    if (hotel && hotel.imageUrls && hotel.imageUrls.length > 0) {
      await deleteImagesByUrls(hotel.imageUrls);
    }
  } catch (err) {
    console.warn(
      `[Hotel Service] Could not delete images for hotel ID ${id}:`,
      err,
    );
    // Continue with hotel deletion even if image cleanup fails
  }

  const { error } = await apiClient.from("hotel").delete().eq("id", id);

  if (error) {
    console.error(`[Hotel Service] Error deleting hotel ID ${id}:`, error);
    throw error;
  }

  // Invalidate cache after deleting hotel
  invalidateHotelsCache();
};

/**
 * Fetch hotels for dashboard with server-side filtering and pagination
 */
export const getDashboardHotels = async (
  page: number = 1,
  limit: number = 6,
  filters: {
    searchTerm?: string;
    status?: string;
    rating?: string;
    providerId?: string;
  } = {}
): Promise<{ data: Hotel[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = apiClient.from("hotel").select("*", { count: "exact" });

  if (filters.providerId) {
    query = query.eq("providerId", filters.providerId);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.searchTerm && filters.searchTerm.trim()) {
    const term = `%${filters.searchTerm}%`;
    query = query.or(`name.ilike.${term},location.ilike.${term},address.ilike.${term}`);
  }

  if (filters.rating && filters.rating !== "all") {
    const minRating = parseFloat(filters.rating.replace("+", ""));
    if (!isNaN(minRating)) {
      query = query.gte("rating", minRating);
    }
  }

  // Ensure latest created are first (optional but good for dashboard)
  query = query.order("created_at", { ascending: false });
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[Hotel Service] Error fetching dashboard hotels:", error);
    throw error;
  }

  return {
    data: data as Hotel[],
    total: count || 0,
  };
};

/**
 * Get basic hotel stats for the dashboard (lightweight query)
 */
export const getHotelDashboardStats = async (providerId?: string) => {
  let query = apiClient.from("hotel").select("rooms, occupancy, rating");
  if (providerId) {
    query = query.eq("providerId", providerId);
  }

  const { data, error } = await query;
  if (error || !data) {
    return { totalHotels: 0, totalRooms: 0, avgOccupancy: 0, avgRating: 0 };
  }

  let totalRooms = 0, sumOccupancy = 0, sumRating = 0;
  data.forEach((h) => {
    totalRooms += h.rooms || 0;
    sumOccupancy += h.occupancy || 0;
    sumRating += h.rating || 0;
  });

  return {
    totalHotels: data.length,
    totalRooms,
    avgOccupancy: data.length > 0 ? sumOccupancy / data.length : 0,
    avgRating: data.length > 0 ? sumRating / data.length : 0,
  };
};

/**
 * Search hotels with DB-level filtering and pagination
 */
export const searchHotels = async (
  filters: any,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Hotel[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = apiClient.from("hotel").select("*", { count: "exact" });

  const f = filters.hotelFilters || {};

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

  // Rooms
  if (f.rooms?.min) query = query.gte("rooms", f.rooms.min);
  if (f.rooms?.max) query = query.lte("rooms", f.rooms.max);

  // Price Range
  if (f.priceRange) {
    query = query.gte("price", f.priceRange.min).lte("price", f.priceRange.max);
  }

  // Rating
  if (f.rating && f.rating !== "all") {
    query = query.gte("rating", parseFloat(f.rating));
  }

  // Amenities filter - Boolean fields in Hotel
  if (f.amenities) {
    if (f.amenities.wifi) query = query.eq("wifi", true);
    if (f.amenities.parking) query = query.eq("parking", true);
    if (f.amenities.pool) query = query.eq("pool", true);
    if (f.amenities.gym) query = query.eq("gym", true);
    if (f.amenities.spa) query = query.eq("spa", true);
    if (f.amenities.restaurant) query = query.eq("restaurant", true);
    if (f.amenities.bar) query = query.eq("bar", true);
  }

  // Date Availability - Removed: hotels are always available for any dates

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[Hotel Service] Error searching hotels:", error);
    throw error;
  }

  return {
    data: data as Hotel[],
    total: count || 0,
  };
};

// Export all services as a single object for easier imports
const hotelService = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  searchHotels,
};

export default hotelService;
