export type Month =
  | "JAN"
  | "FEB"
  | "MAR"
  | "APR"
  | "MAY"
  | "JUN"
  | "JUL"
  | "AUG"
  | "SEP"
  | "OCT"
  | "NOV"
  | "DEC";

export const MONTHS: Month[] = [
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

export const MONTH_NAMES: Record<Month, string> = {
  JAN: "January",
  FEB: "February",
  MAR: "March",
  APR: "April",
  MAY: "May",
  JUN: "June",
  JUL: "July",
  AUG: "August",
  SEP: "September",
  OCT: "October",
  NOV: "November",
  DEC: "December",
};

export type PropertyType = "car" | "apartment" | "hotel";

export interface MonthlyPrice {
  id?: number;
  propertyId: number;
  propertyType: PropertyType;
  month: Month;
  pricePerDay: number;
  createdAt?: string;
  updatedAt?: string;
}

// For creating/updating monthly prices (without id and timestamps)
export interface MonthlyPriceInput {
  month: Month;
  pricePerDay: number;
}

// Legacy interface for backwards compatibility
export interface Price {
  month: Month;
  pricePerDay: number;
}
