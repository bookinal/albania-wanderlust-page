import { apiClient } from "./apiClient";
import {
  MonthlyPrice,
  MonthlyPriceInput,
  PropertyType,
  Month,
} from "@albania/shared-types";

/**
 * Map database column names to TypeScript property names
 */
const mapDbToMonthlyPrice = (dbRecord: any): MonthlyPrice => ({
  id: dbRecord.id,
  propertyId: dbRecord.property_id,
  propertyType: dbRecord.property_type,
  month: dbRecord.month,
  pricePerDay: parseFloat(dbRecord.price_per_day),
  createdAt: dbRecord.created_at,
  updatedAt: dbRecord.updated_at,
});

/**
 * Get monthly prices for a specific property
 */
export const getMonthlyPrices = async (
  propertyId: number,
  propertyType: PropertyType,
): Promise<MonthlyPrice[]> => {

  const { data, error } = await apiClient
    .from("monthly_prices")
    .select("*")
    .eq("property_id", propertyId)
    .eq("property_type", propertyType)
    .order("month");

  if (error) {
    console.error(
      "[Monthly Price Service] Error fetching monthly prices:",
      error,
    );
    throw error;
  }

  return (data || []).map(mapDbToMonthlyPrice);
};

/**
 * Get the price for a specific month
 */
export const getPriceForMonth = async (
  propertyId: number,
  propertyType: PropertyType,
  month: Month,
): Promise<number | null> => {
  const { data, error } = await apiClient
    .from("monthly_prices")
    .select("price_per_day")
    .eq("property_id", propertyId)
    .eq("property_type", propertyType)
    .eq("month", month)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No record found
      return null;
    }
    console.error(
      "[Monthly Price Service] Error fetching price for month:",
      error,
    );
    throw error;
  }

  return data ? parseFloat(data.price_per_day) : null;
};

/**
 * Get prices for multiple properties for a specific month
 */
export const getPricesForPropertiesByMonth = async (
  propertyIds: number[],
  propertyType: PropertyType,
  month: Month,
): Promise<Record<number, number>> => {
  if (!propertyIds.length) return {};

  const { data, error } = await apiClient
    .from("monthly_prices")
    .select("property_id, price_per_day")
    .in("property_id", propertyIds)
    .eq("property_type", propertyType)
    .eq("month", month);

  if (error) {
    console.error(
      "[Monthly Price Service] Error fetching batch prices for month:",
      error,
    );
    throw error;
  }

  const result: Record<number, number> = {};
  data?.forEach(record => {
    result[record.property_id] = parseFloat(record.price_per_day);
  });
  
  return result;
};

/**
 * Set monthly prices for a property (upsert - insert or update)
 */
export const setMonthlyPrices = async (
  propertyId: number,
  propertyType: PropertyType,
  prices: MonthlyPriceInput[],
): Promise<MonthlyPrice[]> => {

  // Prepare data for upsert
  const records = prices.map((price) => ({
    property_id: propertyId,
    property_type: propertyType,
    month: price.month,
    price_per_day: price.pricePerDay,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await apiClient
    .from("monthly_prices")
    .upsert(records, {
      onConflict: "property_id,property_type,month",
    })
    .select();

  if (error) {
    console.error(
      "[Monthly Price Service] Error setting monthly prices:",
      error,
    );
    throw error;
  }

  return (data || []).map(mapDbToMonthlyPrice);
};

/**
 * Delete all monthly prices for a property
 */
export const deleteMonthlyPrices = async (
  propertyId: number,
  propertyType: PropertyType,
): Promise<void> => {

  const { error } = await apiClient
    .from("monthly_prices")
    .delete()
    .eq("property_id", propertyId)
    .eq("property_type", propertyType);

  if (error) {
    console.error(
      "[Monthly Price Service] Error deleting monthly prices:",
      error,
    );
    throw error;
  }
};

/**
 * Calculate total price for a date range using monthly pricing
 * Falls back to base price if no monthly price is set
 */
export const calculateTotalPrice = async (
  propertyId: number,
  propertyType: PropertyType,
  startDate: Date,
  endDate: Date,
  basePricePerDay: number,
): Promise<{
  totalPrice: number;
  breakdown: { date: string; month: Month; price: number }[];
}> => {
  // Get all monthly prices for this property
  const monthlyPrices = await getMonthlyPrices(propertyId, propertyType);

  // Create a map for quick lookup
  const priceMap = new Map<Month, number>();
  monthlyPrices.forEach((mp) => {
    priceMap.set(mp.month, mp.pricePerDay);
  });

  const breakdown: { date: string; month: Month; price: number }[] = [];
  let totalPrice = 0;

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const monthIndex = currentDate.getMonth();
    const monthNames: Month[] = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const month = monthNames[monthIndex];

    // Use monthly price if available, otherwise fallback to base price
    const dayPrice = priceMap.get(month) ?? basePricePerDay;

    breakdown.push({
      date: currentDate.toISOString().split("T")[0],
      month,
      price: dayPrice,
    });

    totalPrice += dayPrice;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { totalPrice, breakdown };
};
