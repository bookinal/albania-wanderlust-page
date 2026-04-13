import { useState, useCallback } from "react";
import {
  SearchFiltersState,
  HotelFiltersInput,
  ApartmentFiltersInput,
  DestinationFiltersInput,
  defaultSearchFilters,
} from "@/types/search.types";

interface UseSearchFiltersReturn {
  filters: SearchFiltersState;
  setFilters: (filters: Partial<SearchFiltersState>) => void;
  setPropertyType: (type: "hotel" | "apartment" | "destination") => void;
  setHotelFilters: (filters: Partial<HotelFiltersInput>) => void;
  setApartmentFilters: (filters: Partial<ApartmentFiltersInput>) => void;
  setDestinationFilters: (filters: Partial<DestinationFiltersInput>) => void;
  resetFilters: () => void;
}

/**
 * Custom hook to manage search filters state
 */
export const useSearchFilters = (
  initialFilters?: Partial<SearchFiltersState>,
): UseSearchFiltersReturn => {
  const [filters, setFiltersState] = useState<SearchFiltersState>({
    ...defaultSearchFilters,
    ...initialFilters,
  });

  /**
   * Update filters
   */
  const setFilters = useCallback((newFilters: Partial<SearchFiltersState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Update property type
   */
  const setPropertyType = useCallback(
    (type: "hotel" | "apartment" | "destination") => {
      setFiltersState((prev) => ({
        ...prev,
        propertyType: type,
      }));
    },
    [],
  );

  /**
   * Update hotel filters
   */
  const setHotelFilters = useCallback(
    (newFilters: Partial<HotelFiltersInput>) => {
      setFiltersState((prev) => ({
        ...prev,
        hotelFilters: { ...prev.hotelFilters, ...newFilters },
      }));
    },
    [],
  );

  /**
   * Update apartment filters
   */
  const setApartmentFilters = useCallback(
    (newFilters: Partial<ApartmentFiltersInput>) => {
      setFiltersState((prev) => ({
        ...prev,
        apartmentFilters: { ...prev.apartmentFilters, ...newFilters },
      }));
    },
    [],
  );

  /**
   * Update destination filters
   */
  const setDestinationFilters = useCallback(
    (newFilters: Partial<DestinationFiltersInput>) => {
      setFiltersState((prev) => ({
        ...prev,
        destinationFilters: { ...prev.destinationFilters, ...newFilters },
      }));
    },
    [],
  );

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    setFiltersState(defaultSearchFilters);
  }, []);

  return {
    filters,
    setFilters,
    setPropertyType,
    setHotelFilters,
    setApartmentFilters,
    setDestinationFilters,
    resetFilters,
  };
};
