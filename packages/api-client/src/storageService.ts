import { apiClient } from "./apiClient";

/**
 * Supabase Storage Service
 * Handles file uploads and management for various entity types (hotels, apartments, cars, etc.)
 */

// Supported entity types for storage organization
export type StorageEntityType = "hotel" | "apartment" | "car" | "destination";

const BUCKET_NAME = "hotel-images"; // Main bucket for all property images
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadResult {
  path: string;
  publicUrl: string;
  fileName: string;
}

/**
 * Upload a single image file to Supabase Storage (Generic)
 * @param file - File object to upload
 * @param entityType - Type of entity (hotel, apartment, car)
 * @param entityId - Entity ID (optional for folder organization)
 * @returns Upload result with public URL
 */
export const uploadImage = async (
  file: File,
  entityType: StorageEntityType,
  entityId?: string | number,
): Promise<UploadResult> => {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 5MB limit`);
  }

  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedFileName = file.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-\.]/g, "");

    // Create folder structure: {entityType}-{entityId}/{timestamp}-{fileName}
    const folderPath = entityId
      ? `${entityType}-${entityId}`
      : `${entityType}-temp`;
    const filePath = `${folderPath}/${timestamp}-${randomString}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await apiClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[Storage Service] Upload error details:", {
        message: error.message,
        status: (error as any).status,
        statusText: (error as any).statusText,
      });

      // Provide helpful error messages
      if ((error as any).status === 400) {
        throw new Error(
          `Bad Request: The storage bucket may not exist or RLS policies are not configured. Make sure '${BUCKET_NAME}' bucket exists and has proper RLS policies. Details: ${error.message}`,
        );
      } else if ((error as any).status === 403) {
        throw new Error(
          `Access Denied: RLS policies are blocking the upload. Verify bucket permissions. Details: ${error.message}`,
        );
      } else if ((error as any).status === 404) {
        throw new Error(
          `Storage bucket '${BUCKET_NAME}' not found. Please create it in Supabase Dashboard > Storage. Details: ${error.message}`,
        );
      }

      throw error;
    }

    if (!data) {
      throw new Error("Upload failed: No data returned from server");
    }

    // Get public URL
    const { data: publicUrlData } = apiClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
      fileName: file.name,
    };
  } catch (err) {
    console.error("[Storage Service] Error uploading file:", err);
    throw err;
  }
};

/**
 * Upload multiple image files to Supabase Storage (Generic)
 * @param files - Array of File objects to upload
 * @param entityType - Type of entity (hotel, apartment, car)
 * @param entityId - Entity ID (optional for folder organization)
 * @returns Array of upload results
 */
export const uploadImages = async (
  files: File[],
  entityType: StorageEntityType,
  entityId?: string | number,
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadImage(file, entityType, entityId),
    );
    return await Promise.all(uploadPromises);
  } catch (err) {
    console.error("[Storage Service] Error during batch upload:", err);
    throw err;
  }
};

/**
 * Extract the storage file path from a Supabase public URL
 * E.g., "https://xxx.supabase.co/storage/v1/object/public/hotel-images/car-5/img.jpg" → "car-5/img.jpg"
 * @param publicUrl - The full public URL of the image
 * @returns The relative file path within the bucket, or null if parsing fails
 */
export const extractStoragePath = (publicUrl: string): string | null => {
  try {
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) return null;
    return publicUrl.substring(index + marker.length);
  } catch {
    console.error(
      "[Storage Service] Failed to extract path from URL:",
      publicUrl,
    );
    return null;
  }
};

/**
 * Delete images from storage given their public URLs
 * Extracts the storage paths from the URLs and removes them from the bucket
 * @param publicUrls - Array of public image URLs
 */
export const deleteImagesByUrls = async (
  publicUrls: string[],
): Promise<void> => {
  const paths = publicUrls
    .map(extractStoragePath)
    .filter((p): p is string => p !== null);

  if (paths.length === 0) return;

  await deleteImages(paths);
};

/**
 * Delete an image from Supabase Storage
 * @param filePath - Full path of the file to delete
 */
export const deleteImage = async (filePath: string): Promise<void> => {
  try {
    const { error } = await apiClient.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("[Storage Service] Delete error:", error);
      throw error;
    }
  } catch (err) {
    console.error("[Storage Service] Error deleting file:", err);
    throw err;
  }
};

/**
 * Delete multiple images from Supabase Storage
 * @param filePaths - Array of file paths to delete
 */
export const deleteImages = async (filePaths: string[]): Promise<void> => {
  try {
    if (filePaths.length === 0) return;

    const { error } = await apiClient.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      console.error("[Storage Service] Batch delete error:", error);
      throw error;
    }
  } catch (err) {
    console.error("[Storage Service] Error during batch delete:", err);
    throw err;
  }
};

/**
 * Get public URL for a file
 * @param filePath - File path in storage
 * @returns Public URL
 */
export const getPublicUrl = (filePath: string): string => {
  const { data } = apiClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
};

// ============================================================================
// BACKWARDS COMPATIBLE HOTEL-SPECIFIC FUNCTIONS
// These delegate to the generic functions for backwards compatibility
// ============================================================================

/**
 * Upload a single hotel image (backwards compatible)
 * @deprecated Use uploadImage(file, 'hotel', hotelId) instead
 */
export const uploadHotelImage = async (
  file: File,
  hotelId?: string | number,
): Promise<UploadResult> => {
  return uploadImage(file, "hotel", hotelId);
};

/**
 * Upload multiple hotel images (backwards compatible)
 * @deprecated Use uploadImages(files, 'hotel', hotelId) instead
 */
export const uploadHotelImages = async (
  files: File[],
  hotelId?: string | number,
): Promise<UploadResult[]> => {
  return uploadImages(files, "hotel", hotelId);
};

/**
 * Delete a hotel image (backwards compatible)
 * @deprecated Use deleteImage(filePath) instead
 */
export const deleteHotelImage = async (filePath: string): Promise<void> => {
  return deleteImage(filePath);
};

/**
 * Delete multiple hotel images (backwards compatible)
 * @deprecated Use deleteImages(filePaths) instead
 */
export const deleteHotelImages = async (filePaths: string[]): Promise<void> => {
  return deleteImages(filePaths);
};

// ============================================================================
// CAR-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Upload a single car image
 */
export const uploadCarImage = async (
  file: File,
  carId?: string | number,
): Promise<UploadResult> => {
  return uploadImage(file, "car", carId);
};

/**
 * Upload multiple car images
 */
export const uploadCarImages = async (
  files: File[],
  carId?: string | number,
): Promise<UploadResult[]> => {
  return uploadImages(files, "car", carId);
};

// Export all services
const storageService = {
  // Generic functions
  uploadImage,
  uploadImages,
  deleteImage,
  deleteImages,
  deleteImagesByUrls,
  extractStoragePath,
  getPublicUrl,
  // Backwards compatible hotel functions
  uploadHotelImage,
  uploadHotelImages,
  deleteHotelImage,
  deleteHotelImages,
  // Car functions
  uploadCarImage,
  uploadCarImages,
};

export default storageService;
