import { apiClient } from "./apiClient";
import {
  Apartment,
  CreateApartmentDto,
  UpdateApartmentDto,
  ApartmentFilters,
} from "@albania/shared-types";
import { uploadImages, deleteImagesByUrls } from "./storageService";
import { authService } from "./authService";
import { getBookingsByPropertyIdAndType } from "./bookingService";

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

  const { data, error } = await apiClient.from("apartment").select("*");
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

/**
 * Search apartments with filters (client-side filtering)
 */
export const searchApartments = async (
  filters?: ApartmentFilters,
): Promise<Apartment[]> => {
  try {
    const apartments = await getAllApartments();

    if (!filters) {
      return apartments;
    }

    return apartments.filter((apt) => {
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesSearch =
          apt.name.toLowerCase().includes(term) ||
          apt.address?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (filters.priceRange) {
        if (
          apt.price < filters.priceRange.min ||
          apt.price > filters.priceRange.max
        ) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && filters.rating !== "all") {
        const threshold = parseFloat(filters.rating);
        if (apt.rating < threshold) return false;
      }

      // Status filter
      if (filters.status && filters.status !== "all") {
        if (apt.status !== filters.status) return false;
      }

      // Rooms filter
      if (filters.rooms) {
        if (filters.rooms.min && apt.rooms < filters.rooms.min) return false;
        if (filters.rooms.max && apt.rooms > filters.rooms.max) return false;
      }

      // Beds filter
      if (filters.beds && apt.beds) {
        if (filters.beds.min && apt.beds < filters.beds.min) return false;
        if (filters.beds.max && apt.beds > filters.beds.max) return false;
      }

      // Bathrooms filter
      if (filters.bathrooms && apt.bathrooms) {
        if (filters.bathrooms.min && apt.bathrooms < filters.bathrooms.min)
          return false;
        if (filters.bathrooms.max && apt.bathrooms > filters.bathrooms.max)
          return false;
      }

      // Amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        if (!apt.amenities) return false;
        const hasAllAmenities = filters.amenities.every((amenity) =>
          apt.amenities?.some((a) =>
            a.toLowerCase().includes(amenity.toLowerCase()),
          ),
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  } catch (err) {
    console.error("[Apartment Service] Error searching apartments:", err);
    throw err;
  }
};

const apartmentService = {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  searchApartments,
  getApartmentUnavailabilityDates,
};

export default apartmentService;
