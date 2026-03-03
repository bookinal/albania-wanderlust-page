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
import { getBookingsByPropertyIdAndType } from "./bookingService";

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
 * Search hotels with filters (client-side filtering)
 */
export const searchHotels = async (
  filters?: HotelFilters,
): Promise<Hotel[]> => {
  try {
    const hotels = await getAllHotels();

    if (!filters) {
      return hotels;
    }

    return hotels.filter((hotel) => {
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesSearch =
          hotel.name.toLowerCase().includes(term) ||
          hotel.location?.toLowerCase().includes(term) ||
          hotel.address?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (filters.priceRange) {
        if (
          hotel.price < filters.priceRange.min ||
          hotel.price > filters.priceRange.max
        ) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && filters.rating !== "all") {
        const threshold = parseFloat(filters.rating);
        if (hotel.rating < threshold) return false;
      }

      // Status filter
      if (filters.status && filters.status !== "all") {
        if (hotel.status !== filters.status) return false;
      }

      // Rooms filter
      if (filters.rooms) {
        if (filters.rooms.min && hotel.rooms < filters.rooms.min) return false;
        if (filters.rooms.max && hotel.rooms > filters.rooms.max) return false;
      }

      // Amenities filter
      if (filters.amenities) {
        if (filters.amenities.wifi && !hotel.wifi) return false;
        if (filters.amenities.parking && !hotel.parking) return false;
        if (filters.amenities.pool && !hotel.pool) return false;
        if (filters.amenities.gym && !hotel.gym) return false;
        if (filters.amenities.spa && !hotel.spa) return false;
        if (filters.amenities.restaurant && !hotel.restaurant) return false;
        if (filters.amenities.bar && !hotel.bar) return false;
      }

      return true;
    });
  } catch (err) {
    console.error("[Hotel Service] Error searching hotels:", err);
    throw err;
  }
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
