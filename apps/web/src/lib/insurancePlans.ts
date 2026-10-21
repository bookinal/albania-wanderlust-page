import type { TFunction } from "i18next";
import type {
  CreateInsurancePlanDto,
  InsuranceCoverageKey,
  InsurancePlan,
  InsuranceTier,
} from "@/types/insurance.types";

export const INSURANCE_TIERS: InsuranceTier[] = [
  "third_party",
  "mini_kasko_70",
  "kasko_80",
  "full",
];

/** Row order of the "Insurance packages overview" table. */
export const INSURANCE_COVERAGE_KEYS: InsuranceCoverageKey[] = [
  "third_party",
  "accidents",
  "natural_disasters",
  "fire_lightning",
  "parking",
  "glass_mirrors",
  "tyres",
  "theft",
  "under_car",
  "abroad",
  "roadside_assistance",
];

/** Stored as the plan name when the provider keeps the standard name. */
export const DEFAULT_INSURANCE_PLAN_NAMES: Record<InsuranceTier, string> = {
  third_party: "Third Party Liability",
  mini_kasko_70: "Mini Kasko 70%",
  kasko_80: "Kasko 80%",
  full: "Full insurance",
};

const KASKO_COVERAGE: InsuranceCoverageKey[] = [
  "third_party",
  "accidents",
  "natural_disasters",
  "fire_lightning",
  "parking",
  "glass_mirrors",
  "theft",
  "roadside_assistance",
];

/** Standard plans; the provider sets the prices and can adjust the coverage. */
export const INSURANCE_TIER_DEFAULTS: Record<
  InsuranceTier,
  Omit<CreateInsurancePlanDto, "pricePerDay"> & { suggestedPrice: number }
> = {
  third_party: {
    tier: "third_party",
    name: DEFAULT_INSURANCE_PLAN_NAMES.third_party,
    coveragePercent: null,
    coverage: ["third_party", "roadside_assistance"],
    suggestedPrice: 0,
  },
  mini_kasko_70: {
    tier: "mini_kasko_70",
    name: DEFAULT_INSURANCE_PLAN_NAMES.mini_kasko_70,
    coveragePercent: 70,
    coverage: ["third_party", "accidents", "roadside_assistance"],
    suggestedPrice: 7,
  },
  kasko_80: {
    tier: "kasko_80",
    name: DEFAULT_INSURANCE_PLAN_NAMES.kasko_80,
    coveragePercent: 80,
    coverage: KASKO_COVERAGE,
    suggestedPrice: 8,
  },
  full: {
    tier: "full",
    name: DEFAULT_INSURANCE_PLAN_NAMES.full,
    coveragePercent: 100,
    coverage: KASKO_COVERAGE,
    suggestedPrice: 10,
  },
};

/** Translated tier name for standard plans, the provider's own name otherwise. */
export const getInsurancePlanLabel = (
  plan: Pick<InsurancePlan, "tier" | "name">,
  t: TFunction,
): string =>
  !plan.name || plan.name === DEFAULT_INSURANCE_PLAN_NAMES[plan.tier]
    ? t(`insurance.tiers.${plan.tier}`)
    : plan.name;

/** Same as getInsurancePlanLabel, from a plan name saved on a booking. */
export const getInsurancePlanNameLabel = (name: string, t: TFunction): string => {
  const tier = INSURANCE_TIERS.find((x) => DEFAULT_INSURANCE_PLAN_NAMES[x] === name);
  return tier ? t(`insurance.tiers.${tier}`) : name;
};

export const formatInsurancePrice =(pricePerDay: number, t: TFunction): string =>
  pricePerDay > 0
    ? t("insurance.pricePerDay", { price: Number(pricePerDay).toFixed(2).replace(/\.00$/, "") })
    : t("insurance.free");

/** Returns a translation key of the first invalid field, or null when valid. */
export const validateInsurancePlan = (plan: CreateInsurancePlanDto): string | null => {
  if (!Number.isFinite(plan.pricePerDay) || plan.pricePerDay < 0) {
    return "insurance.validation.price";
  }
  if (
    plan.coveragePercent !== null &&
    (!Number.isInteger(plan.coveragePercent) ||
      plan.coveragePercent < 1 ||
      plan.coveragePercent > 100)
  ) {
    return "insurance.validation.coveragePercent";
  }
  if (plan.name.trim().length > 80) {
    return "insurance.validation.name";
  }
  return null;
};
