/**
 * Hotel Type Definitions
 *
 * TypeScript interfaces for hotel data models and API operations
 */

export interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  rooms: number;
  occupancy: number;
  price: number;
  status: "active" | "maintenance";
  imageUrls?: string[];
  description?: string;
  providerId?: string;
  amenities?: string[];
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  wifi?: boolean;
  parking?: boolean;
  pool?: boolean;
  gym?: boolean;
  spa?: boolean;
  restaurant?: boolean;
  bar?: boolean;
  lat?: number;
  lng?: number;
}

export interface CreateHotelDto {
  name: string;
  location: string;
  rating: number;
  rooms: number;
  occupancy: number;
  price: number;
  status: "active" | "maintenance";
  imageUrls?: string[];
  description?: string;
  providerId?: string;
  amenities?: string[];
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateHotelDto {
  name?: string;
  location?: string;
  rating?: number;
  rooms?: number;
  occupancy?: number;
  price?: number;
  status?: "active" | "maintenance";
  imageUrls?: string[];
  description?: string;
  amenities?: string[];
  contactEmail?: string;
  contactPhone?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

/**
 * Extended hotel filter options for search
 */
export interface HotelFilters {
  searchTerm?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: "all" | "3+" | "3.5+" | "4+" | "4.5+";
  status?: "all" | "active" | "maintenance";
  rooms?: {
    min?: number;
    max?: number;
  };
  amenities?: {
    wifi?: boolean;
    parking?: boolean;
    pool?: boolean;
    gym?: boolean;
    spa?: boolean;
    restaurant?: boolean;
    bar?: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}
