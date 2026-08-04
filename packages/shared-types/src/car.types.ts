import { MonthlyPriceInput } from "./price.type";

export interface Car {
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

export interface CreateCarDto {
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

export interface UpdateCarDto {
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
