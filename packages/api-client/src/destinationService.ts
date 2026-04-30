import { apiClient } from "./apiClient";
import {
  Destination,
  DestinationDto,
  Wishlist,
  WishlistDto,
} from "@albania/shared-types";
import { deleteImagesByUrls, uploadImages } from "./storageService";
import { authService } from "./authService";

/**
 * Get all destinations
 */
export const getAllDestinations = async (): Promise<Destination[]> => {
  const { data, error } = await apiClient.from("destination").select("*");
  if (error) {
    console.error("[Destination Service] Error fetching destinations:", error);
    throw error;
  }
  return data;
};

/**
 * Get a destination by ID
 */
export const getDestinationById = async (id: string): Promise<Destination> => {
  const { data, error } = await apiClient
    .from("destination")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("[Destination Service] Error fetching destination:", error);
    throw error;
  }
  return data;
};

/**
 * Create a new destination
 */
export const createDestination = async (
  data: DestinationDto,
): Promise<Destination> => {
  const { data: newDestination, error } = await apiClient
    .from("destination")
    .insert([data])
    .select()
    .single();
  if (error) {
    console.error("[Destination Service] Error creating destination:", error);
    throw error;
  }
  return newDestination;
};

/**
 * Update a destination
 * @param id - Destination UUID (string)
 * @param data - Destination data to update
 */
export const updateDestination = async (
  id: string,
  data: DestinationDto,
): Promise<Destination> => {
  const { data: updatedDestination, error } = await apiClient
    .from("destination")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[Destination Service] Error updating destination:", error);
    throw error;
  }
  return updatedDestination;
};

/**
 * Delete a destination
 * @param id - Destination UUID (string)
 */
export const deleteDestination = async (id: string): Promise<void> => {
  try {
    const destination = await getDestinationById(id);
    if (destination.imageUrls && destination.imageUrls.length > 0) {
      await deleteImagesByUrls(destination.imageUrls);
    }
  } catch (err) {
    console.warn(
      `[Destination Service] Could not delete images for destination ID ${id}:`,
      err,
    );
  }

  const { error } = await apiClient.from("destination").delete().eq("id", id);
  if (error) {
    console.error("[Destination Service] Error deleting destination:", error);
    throw error;
  }
};

export const addDestinationToCurrentUserWishlist = async (
  destinationId: string,
): Promise<Wishlist> => {

  const userId = await authService.getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  // 1️⃣ Check if wishlist exists
  const { data: existingWishlist, error: fetchError } = await apiClient
    .from("wishlist")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError; // real error
  }

  let wishlist = existingWishlist;

  // 2️⃣ If not exists → create wishlist
  if (!wishlist) {
    const { data: newWishlist, error: createError } = await apiClient
      .from("wishlist")
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (createError) throw createError;
    wishlist = newWishlist;
  }

  // 3️⃣ Add destination to wishlist
  const { error: linkError } = await apiClient
    .from("wishlist_destinations")
    .insert([{ wishlist_id: wishlist.id, destination_id: destinationId }]);

  if (linkError) throw linkError;

  return wishlist;
};

export const removeDestinationFromCurrentUserWishlist = async (
  destinationId: string,
): Promise<void> => {

  const userId = await authService.getCurrentUserId();
  if (!userId) throw new Error("User not authenticated");

  // 1️⃣ Get the user's wishlist ID
  const { data: wishlist, error: wishlistError } = await apiClient
    .from("wishlist")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (wishlistError || !wishlist) {
    throw wishlistError || new Error("Wishlist not found");
  }

  // 2️⃣ Delete the destination from join table
  const { error: deleteError } = await apiClient
    .from("wishlist_destinations")
    .delete()
    .eq("wishlist_id", wishlist.id)
    .eq("destination_id", destinationId);

  if (deleteError) throw deleteError;
};

export const getCurrentUserWishlist = async (): Promise<Wishlist | null> => {
  const userId = await authService.getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await apiClient
    .from("wishlist")
    .select(
      `
      id,
      user_id,
      wishlist_destinations (
        destination:destination_id (
          id,
          name,
          description,
          imageUrls,
          category,
          lat,
          lng
        )
      )
    `,
    )
    .eq("user_id", userId)
    .single();

  // No wishlist yet → not an error
  if (error?.code === "PGRST116") {
    return null;
  }

  if (error) {
    console.error("[Wishlist] Failed to fetch wishlist:", error);
    throw error;
  }

  // Map nested join into clean Wishlist shape
  const destinations =
    data.wishlist_destinations?.map((w: any) => w.destination) ?? [];

  return {
    id: data.id,
    user: { id: userId } as any, // you can hydrate later if needed
    destinations,
  };
};
