/**
 * Search and Filter Type Definitions
 *
 * Unified types for search results page with dynamic filtering
 */

/**
 * Hotel-specific filter options
 */
export interface HotelFiltersInput {
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

/**
 * Apartment-specific filter options
 */
export interface ApartmentFiltersInput {
  searchTerm?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: "all" | "3+" | "3.5+" | "4+" | "4.5+";
  status?: "all" | "available" | "rented" | "maintenance";
  rooms?: {
    min?: number;
    max?: number;
  };
  beds?: {
    min?: number;
    max?: number;
  };
  bathrooms?: {
    min?: number;
    max?: number;
  };
  amenities?: string[];
}

/**
 * Unified search filter state
 */
export interface SearchFiltersState {
  propertyType: "hotel" | "apartment" | "both";
  hotelFilters: HotelFiltersInput;
  apartmentFilters: ApartmentFiltersInput;
  // Date and guest filters from navigation state
  destination?: string;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  adults?: number;
  children?: number;
  rooms?: number;
}

/**
 * Default filter values
 */
export const defaultSearchFilters: SearchFiltersState = {
  propertyType: "both",
  hotelFilters: {
    searchTerm: "",
    priceRange: { min: 0, max: 500 },
    rating: "all",
    status: "all",
    rooms: { min: undefined, max: undefined },
    amenities: {
      wifi: false,
      parking: false,
      pool: false,
      gym: false,
      spa: false,
      restaurant: false,
      bar: false,
    },
  },
  apartmentFilters: {
    searchTerm: "",
    priceRange: { min: 0, max: 500 },
    rating: "all",
    status: "all",
    rooms: { min: undefined, max: undefined },
    beds: { min: undefined, max: undefined },
    bathrooms: { min: undefined, max: undefined },
    amenities: [],
  },
  destination: "",
  checkInDate: null,
  checkOutDate: null,
  adults: 2,
  children: 0,
  rooms: 1,
};

/**
 * Property card component props
 */
export interface PropertyCardProps {
  id: number;
  name: string;
  image: string;
  rating: number;
  price: number;
  location?: string;
  address?: string;
  rooms: number;
  amenities?: string[];
  status: string;
  propertyType: "hotel" | "apartment";
  onClick: (id: number) => void;
}

/**
 * Search results state
 */
export interface SearchResultsState {
  hotels: Array<any>;
  apartments: Array<any>;
  loading: boolean;
  error: string | null;
}
