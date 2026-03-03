import { apiClient } from "./apiClient";
import { Car, CreateCarDto, UpdateCarDto } from "@albania/shared-types";
import { authService } from "./authService";
import { uploadCarImages, deleteImagesByUrls } from "./storageService";
import { getBookingsByPropertyIdAndType } from "./bookingService";
import { getMonthlyPrices, setMonthlyPrices } from "./monthlyPriceService";
import { MonthlyPriceInput } from "@albania/shared-types";

// In-memory cache for cars with TTL
let carsCache: { data: Car[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "cars_cache";

/**
 * Load cache from localStorage
 */
const loadCacheFromStorage = (): { data: Car[]; timestamp: number } | null => {
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
    console.warn("[Car Service] Error loading cache from localStorage:", err);
  }
  return null;
};

/**
 * Save cache to localStorage
 */
const saveCacheToStorage = (data: Car[], timestamp: number): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp }));
  } catch (err) {
    console.warn("[Car Service] Error saving cache to localStorage:", err);
  }
};

/**
 * Fetch all cars (with persistent caching using localStorage)
 */
export const getAllCars = async (): Promise<Car[]> => {
  // Try loading from memory cache first
  if (!carsCache) {
    carsCache = loadCacheFromStorage();
  }

  // Check if cache is valid
  if (carsCache && Date.now() - carsCache.timestamp < CACHE_TTL) {
    return carsCache.data;
  }

  const { data, error } = await apiClient.from("car").select("*");
  if (error) {
    console.error("[Car Service] Error fetching cars:", error);
    throw error;
  }

  // Update cache
  const timestamp = Date.now();
  carsCache = { data, timestamp };
  saveCacheToStorage(data, timestamp);
  return data;
};

/**
 * Invalidate the cars cache (call after creating, updating, or deleting cars)
 */
export const invalidateCarsCache = (): void => {
  carsCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.warn("[Car Service] Error clearing localStorage cache:", err);
  }
};

/**
 * fetch cars by owner id
 */
export const getCarsByOwnerId = async (providerId: string): Promise<Car[]> => {
  const { data, error } = await apiClient
    .from("car")
    .select("*")
    .eq("providerId", providerId);
  if (error) {
    console.error(
      `[Car Service] Error fetching cars for owner ID ${providerId}:`,
      error,
    );
    throw error;
  }
  return data;
};

/**
 * Fetch car by id (includes monthly prices)
 */
export const getCarById = async (id: number): Promise<Car | null> => {
  const { data, error } = await apiClient
    .from("car")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`[Car Service] Error fetching car ID ${id}:`, error);
    throw error;
  }

  // Fetch monthly prices for this car
  let monthlyPrices: MonthlyPriceInput[] = [];
  try {
    const prices = await getMonthlyPrices(id, "car");
    monthlyPrices = prices.map((p) => ({
      month: p.month,
      pricePerDay: p.pricePerDay,
    }));
  } catch (priceError) {
    console.warn(
      `[Car Service] Could not fetch monthly prices for car ${id}:`,
      priceError,
    );
  }

  return { ...data, monthlyPrices };
};

/*
 * Get car unavailability dates by car id using booking service getBookingByPropertyIdAndType
 */
export const getCarUnavailabilityDates = async (
  carId: number,
): Promise<string[]> => {
  const bookings = await getBookingsByPropertyIdAndType(
    carId.toString(),
    "car",
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
 * add a new car with optional image uploads and monthly pricing
 */
export const addCar = async (
  car: CreateCarDto,
  imageFiles?: File[],
): Promise<Car> => {
  const providerId = await authService.getCurrentUserId();

  if (!providerId) {
    throw new Error("User not authenticated");
  }

  // Upload images first if provided
  let imageUrls: string[] = [];
  if (imageFiles && imageFiles.length > 0) {
    try {
      const uploadResults = await uploadCarImages(imageFiles);
      imageUrls = uploadResults.map((result) => result.publicUrl);
    } catch (err) {
      console.error("[Car Service] Error uploading images:", err);
      throw new Error(
        `Failed to upload images: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  // Extract monthly prices from payload (they go to a separate table)
  const { monthlyPrices, ...carData } = car;

  const payload = {
    ...carData,
    providerId: providerId,
    imageUrls: imageUrls.length > 0 ? imageUrls : car.imageUrls,
  };

  const { data, error } = await apiClient
    .from("car")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[Car Service] Error adding car:", error);
    throw error;
  }

  // Save monthly prices if provided
  if (monthlyPrices && monthlyPrices.length > 0 && data?.id) {
    try {
      await setMonthlyPrices(data.id, "car", monthlyPrices);
    } catch (priceError) {
      console.error("[Car Service] Error saving monthly prices:", priceError);
      // Don't throw - car was created successfully, just log the error
    }
  }

  // Invalidate cache after adding new car
  invalidateCarsCache();

  return { ...data, monthlyPrices: monthlyPrices || [] };
};

/**
 * update car by id with optional new image uploads and monthly pricing
 */
export const updateCar = async (
  id: number,
  car: UpdateCarDto,
  newImageFiles?: File[],
): Promise<Car> => {
  // Remove system fields that shouldn't be updated
  const { monthlyPrices, ...updateData } = car;
  delete (updateData as any).id;
  delete (updateData as any).created_at;

  // Handle new image uploads
  if (newImageFiles && newImageFiles.length > 0) {
    try {
      const uploadResults = await uploadCarImages(newImageFiles, id);
      const newImageUrls = uploadResults.map((result) => result.publicUrl);
      // Append new images to existing ones
      updateData.imageUrls = [...(updateData.imageUrls || []), ...newImageUrls];
    } catch (err) {
      console.error("[Car Service] Error uploading images:", err);
      throw new Error(
        `Failed to upload images: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  const { data, error } = await apiClient
    .from("car")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`[Car Service] Error updating car ID ${id}:`, error);
    throw error;
  }

  // Update monthly prices if provided
  if (monthlyPrices && monthlyPrices.length > 0) {
    try {
      await setMonthlyPrices(id, "car", monthlyPrices);
    } catch (priceError) {
      console.error("[Car Service] Error updating monthly prices:", priceError);
      // Don't throw - car was updated successfully, just log the error
    }
  }

  // Invalidate cache after updating car
  invalidateCarsCache();
  return { ...data, monthlyPrices: monthlyPrices || [] };
};

/**
 * delete car by id
 */
export const deleteCar = async (id: number): Promise<void> => {
  // Check for active bookings (pending or confirmed)
  const activeBookings = await getBookingsByPropertyIdAndType(
    id.toString(),
    "car",
  );
  if (activeBookings && activeBookings.length > 0) {
    throw new Error(
      `Cannot delete this car because it has ${activeBookings.length} active booking(s). Please wait until all bookings are completed or cancelled.`,
    );
  }

  // Fetch the car to get its image URLs
  try {
    const car = await getCarById(id);
    if (car && car.imageUrls && car.imageUrls.length > 0) {
      await deleteImagesByUrls(car.imageUrls);
    }
  } catch (err) {
    console.warn(
      `[Car Service] Could not delete images for car ID ${id}:`,
      err,
    );
    // Continue with car deletion even if image cleanup fails
  }

  const { error } = await apiClient.from("car").delete().eq("id", id);

  if (error) {
    console.error(`[Car Service] Error deleting car ID ${id}:`, error);
    throw error;
  }

  // Invalidate cache after deleting car
  invalidateCarsCache();
};
