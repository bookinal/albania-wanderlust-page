import { apiClient } from "./apiClient";
import { authService } from "./authService";
import { Review, CreateReviewDto } from "@albania/shared-types";

/**
 * Create a new review for a property booking
 */
export const createReview = async (dto: CreateReviewDto): Promise<Review> => {
  const userId = await authService.getCurrentUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await apiClient
    .from("reviews")
    .insert({
      ...dto,
      user_id: userId,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[Review Service] Error creating review:", error);
    throw error;
  }

  return data as Review;
};

/**
 * Get all reviews for a specific property
 */
export const getReviewsByProperty = async (
  propertyId: number,
  propertyType: "car" | "apartment",
): Promise<Review[]> => {
  const { data, error } = await apiClient
    .from("reviews")
    .select("*")
    .eq("property_id", propertyId)
    .eq("property_type", propertyType)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Review Service] Error fetching reviews:", error);
    throw error;
  }

  return (data || []) as Review[];
};

/**
 * Check if the current user already submitted a review for a specific booking
 */
export const hasUserReviewedBooking = async (
  bookingId: string,
): Promise<boolean> => {
  const userId = await authService.getCurrentUserId();

  if (!userId) return false;

  const { data, error } = await apiClient
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Review Service] Error checking existing review:", error);
    return false;
  }

  return !!data;
};

/**
 * Get the average rating for a property
 */
export const getPropertyAverageRating = async (
  propertyId: number,
  propertyType: "car" | "apartment",
): Promise<{ average: number; count: number }> => {
  const { data, error } = await apiClient
    .from("reviews")
    .select("rating")
    .eq("property_id", propertyId)
    .eq("property_type", propertyType);

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = data.reduce(
    (sum: number, r: { rating: number }) => sum + r.rating,
    0,
  );
  return {
    average: parseFloat((total / data.length).toFixed(1)),
    count: data.length,
  };
};
