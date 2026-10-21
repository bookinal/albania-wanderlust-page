import { MonthlyPriceInput } from "./price.type";

export type FuelPolicy = "full_to_full" | "same_to_same" | "pre_purchase";

export type CarPaymentMethod = "cash" | "debit_card" | "credit_card";

/** Rental conditions set by the provider for each car. */
export interface CarRentalTerms {
  depositAmount: number; // Security deposit required at pick-up; 0 means none
  dailyKmLimit: number | null; // Kilometres allowed per day; null means unlimited
  minimumAge: number; // Minimum driver age
  drivingLicenseYears: number; // Driving licence held for at least N years
  fuelPolicy: FuelPolicy;
  crossBorderDeposit: number; // Extra deposit to take the car abroad; 0 means none
  crossBorderAssistance: boolean; // Roadside assistance abroad
  acceptedPaymentMethods: CarPaymentMethod[]; // Ways the provider accepts payment at pick-up
}

export interface Car extends CarRentalTerms {
  id: number;
  name: string;
  brand: string;
  type: "Sedan" | "SUV" | "Sports";
  year: number;
  transmission: "Manual" | "Automatic";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  pricePerDay: number; // Base/default price (can be used as fallback)
  insurance: number; // Fixed insurance price for a car booking
  childSeatPrice: number; // Price for adding a child seat; 0 means not offered
  additionalDriverPrice: number; // Price for adding an additional driver; 0 means not offered
  status: "available" | "rented" | "maintenance" | "review";
  providerId: string;
  plateNumber: string;
  features: string[];
  imageUrls?: string[];
  pickUpLocation: string;
  lat?: number;
  lng?: number;
  monthlyPrices?: MonthlyPriceInput[]; // Dynamic monthly pricing
}

export interface CreateCarDto extends CarRentalTerms {
  name: string;
  brand: string;
  type: "Sedan" | "SUV" | "Sports";
  year: number;
  transmission: "Manual" | "Automatic";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  pricePerDay: number; // Base/default price
  insurance: number; // Fixed insurance price for a car booking
  childSeatPrice: number; // Price for adding a child seat; 0 means not offered
  additionalDriverPrice: number; // Price for adding an additional driver; 0 means not offered
  status: "available" | "rented" | "maintenance" | "review";
  providerId?: string;
  plateNumber: string;
  features: string[];
  imageUrls?: string[];
  pickUpLocation: string;
  lat: number;
  lng: number;
  monthlyPrices?: MonthlyPriceInput[]; // Dynamic monthly pricing
}

export interface UpdateCarDto extends Partial<CarRentalTerms> {
  name?: string;
  brand?: string;
  type?: "Sedan" | "SUV" | "Sports";
  year?: number;
  transmission?: "Manual" | "Automatic";
  fuelType?: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  pricePerDay?: number;
  insurance?: number; // Fixed insurance price for a car booking
  childSeatPrice?: number; // Price for adding a child seat; 0 means not offered
  additionalDriverPrice?: number; // Price for adding an additional driver; 0 means not offered
  imageUrls?: string[];
  status?: "available" | "rented" | "maintenance" | "review";
  plateNumber?: string;
  features?: string[];
  pickUpLocation?: string;
  lat?: number;
  lng?: number;
  monthlyPrices?: MonthlyPriceInput[]; // Dynamic monthly pricing
}

export interface CarFilters {
  searchTerm?: string;
  status?: "all" | "available" | "rented" | "maintenance" | "review";
  type?: "all" | "Sedan" | "SUV" | "Sports";
  transmission?: "all" | "Automatic" | "Manual";
  fuelType?: "all" | "Petrol" | "Diesel" | "Hybrid" | "Electric";
}

export interface PaginationParams {
  page: number;
  limit: number;
}
