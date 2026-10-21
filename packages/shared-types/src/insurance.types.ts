/**
 * Insurance plan types
 *
 * Providers create their own insurance plans (one of four tiers) and attach
 * them to their cars; the client picks one plan when booking a car.
 */

export type InsuranceTier =
  | "third_party"
  | "mini_kasko_70"
  | "kasko_80"
  | "full";

export type InsuranceCoverageKey =
  | "third_party"
  | "accidents"
  | "natural_disasters"
  | "fire_lightning"
  | "parking"
  | "glass_mirrors"
  | "tyres"
  | "theft"
  | "under_car"
  | "abroad"
  | "roadside_assistance";

export interface InsurancePlan {
  id: number;
  providerId: string;
  tier: InsuranceTier;
  name: string;
  pricePerDay: number; // 0 means free
  coveragePercent: number | null; // Share of damage covered (e.g. 70, 80, 100); null for third party only
  coverage: InsuranceCoverageKey[]; // Risks covered by the plan
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInsurancePlanDto {
  tier: InsuranceTier;
  name: string;
  pricePerDay: number;
  coveragePercent: number | null;
  coverage: InsuranceCoverageKey[];
}

export type UpdateInsurancePlanDto = Partial<CreateInsurancePlanDto>;
