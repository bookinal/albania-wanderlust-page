import { apiClient } from "./apiClient";

export type AdminRatedPropertyType = "car" | "apartment";

/** Lowest and highest rating accepted by the database */
export const ADMIN_RATING_MIN = 1;
export const ADMIN_RATING_MAX = 5;

const SOURCES = {
  car: { table: "car_admin_rating", idColumn: "carId" },
  apartment: { table: "apartment_admin_rating", idColumn: "apartmentId" },
} as const;

/**
 * Get the private admin ratings of some properties (property ID -> rating).
 * Admin only: the row level security returns nothing to anyone else.
 */
export const getAdminRatings = async (
  propertyType: AdminRatedPropertyType,
  propertyIds: number[],
): Promise<Record<number, number>> => {
  if (propertyIds.length === 0) return {};

  const { table, idColumn } = SOURCES[propertyType];
  const { data, error } = await apiClient
    .from(table)
    .select(`${idColumn}, rating`)
    .in(idColumn, propertyIds);

  if (error) {
    console.error("[Admin Rating Service] Error fetching ratings:", error);
    throw error;
  }

  const ratings: Record<number, number> = {};
  for (const row of (data ?? []) as Record<string, unknown>[]) {
    ratings[Number(row[idColumn])] = Number(row.rating);
  }
  return ratings;
};

/**
 * Set the private admin rating of a property (admin only).
 * @param rating - From 1 to 5, or null to remove the rating
 */
export const setAdminRating = async (
  propertyType: AdminRatedPropertyType,
  propertyId: number,
  rating: number | null,
): Promise<void> => {
  const { table, idColumn } = SOURCES[propertyType];
  const { error } =
    rating === null
      ? await apiClient.from(table).delete().eq(idColumn, propertyId)
      : await apiClient
          .from(table)
          .upsert({ [idColumn]: propertyId, rating }, { onConflict: idColumn });

  if (error) {
    console.error("[Admin Rating Service] Error saving rating:", error);
    throw error;
  }
};
