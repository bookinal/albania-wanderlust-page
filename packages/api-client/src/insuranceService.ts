import { apiClient } from "./apiClient";
import { authService } from "./authService";
import {
  CreateInsurancePlanDto,
  InsurancePlan,
  UpdateInsurancePlanDto,
} from "@albania/shared-types";

const TIER_ORDER: Record<InsurancePlan["tier"], number> = {
  third_party: 0,
  mini_kasko_70: 1,
  kasko_80: 2,
  full: 3,
};

/** Cheapest / least coverage first, as shown to clients. */
export const sortInsurancePlans = (plans: InsurancePlan[]): InsurancePlan[] =>
  [...plans].sort(
    (a, b) =>
      TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
      Number(a.pricePerDay) - Number(b.pricePerDay) ||
      a.id - b.id,
  );

const normalizePlan = (row: any): InsurancePlan => ({
  ...row,
  pricePerDay: Number(row.pricePerDay ?? 0),
  coverage: row.coverage ?? [],
});

/**
 * Insurance plans of the current provider (used in the car forms).
 */
export const getMyInsurancePlans = async (): Promise<InsurancePlan[]> => {
  const providerId = await authService.getCurrentUserId();
  if (!providerId) throw new Error("User not authenticated");

  const { data, error } = await apiClient
    .from("insurance_plan")
    .select("*")
    .eq("providerId", providerId);

  if (error) {
    console.error("[Insurance Service] Error fetching plans:", error);
    throw error;
  }
  return sortInsurancePlans((data || []).map(normalizePlan));
};

export const createInsurancePlan = async (
  plan: CreateInsurancePlanDto,
): Promise<InsurancePlan> => {
  const providerId = await authService.getCurrentUserId();
  if (!providerId) throw new Error("User not authenticated");

  const { data, error } = await apiClient
    .from("insurance_plan")
    .insert({ ...plan, providerId })
    .select()
    .single();

  if (error) {
    console.error("[Insurance Service] Error creating plan:", error);
    throw error;
  }
  return normalizePlan(data);
};

export const updateInsurancePlan = async (
  id: number,
  plan: UpdateInsurancePlanDto,
): Promise<InsurancePlan> => {
  const { data, error } = await apiClient
    .from("insurance_plan")
    .update(plan)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Insurance Service] Error updating plan:", error);
    throw error;
  }
  return normalizePlan(data);
};

/** Also detaches the plan from every car; past bookings keep their snapshot. */
export const deleteInsurancePlan = async (id: number): Promise<void> => {
  const { error } = await apiClient.from("insurance_plan").delete().eq("id", id);
  if (error) {
    console.error("[Insurance Service] Error deleting plan:", error);
    throw error;
  }
};

/**
 * Insurance plans offered with a car (public: car + booking pages).
 */
export const getCarInsurancePlans = async (
  carId: number,
): Promise<InsurancePlan[]> => {
  const { data, error } = await apiClient
    .from("car_insurance_plan")
    .select("insurance_plan(*)")
    .eq("carId", carId);

  if (error) {
    console.error("[Insurance Service] Error fetching car plans:", error);
    throw error;
  }
  const plans = (data || [])
    .map((row: any) => row.insurance_plan)
    .filter(Boolean)
    .map(normalizePlan);
  return sortInsurancePlans(plans);
};

/**
 * Replaces the set of plans attached to a car.
 */
export const setCarInsurancePlans = async (
  carId: number,
  planIds: number[],
): Promise<void> => {
  const { data: current, error: readError } = await apiClient
    .from("car_insurance_plan")
    .select("insurancePlanId")
    .eq("carId", carId);

  if (readError) {
    console.error("[Insurance Service] Error reading car plans:", readError);
    throw readError;
  }

  const currentIds = new Set((current || []).map((r: any) => Number(r.insurancePlanId)));
  const wantedIds = new Set(planIds);
  const toRemove = [...currentIds].filter((id) => !wantedIds.has(id));
  const toAdd = [...wantedIds].filter((id) => !currentIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await apiClient
      .from("car_insurance_plan")
      .delete()
      .eq("carId", carId)
      .in("insurancePlanId", toRemove);
    if (error) {
      console.error("[Insurance Service] Error detaching plans:", error);
      throw error;
    }
  }

  if (toAdd.length > 0) {
    const { error } = await apiClient
      .from("car_insurance_plan")
      .insert(toAdd.map((insurancePlanId) => ({ carId, insurancePlanId })));
    if (error) {
      console.error("[Insurance Service] Error attaching plans:", error);
      throw error;
    }
  }
};
