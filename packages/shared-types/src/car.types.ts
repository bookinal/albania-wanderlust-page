import { MonthlyPriceInput } from "./price.type";

export interface Car {
  id: number;
  name: string;
  brand: string;
  type: "Sedan" | "SUV" | "Sports";
  year: number;
  transmission: "Manual" | "Automatic";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  seats: number;
  mileage: number;
  pricePerDay: number; // Base/default price (can be used as fallback)
  status: "available" | "rented" | "maintenance" | "review";
  providerId: string;
  color: string;
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
  seats: number;
  mileage: number;
  pricePerDay: number; // Base/default price
  status: "available" | "rented" | "maintenance" | "review";
  providerId?: string;
  color: string;
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
  seats?: number;
  mileage?: number;
  pricePerDay?: number;
  imageUrls?: string[];
  status?: "available" | "rented" | "maintenance" | "review";
  color?: string;
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
