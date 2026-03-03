import { useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import FilterBar from "./FilterBar";
import { PropertyCard } from "@/components/home/PropertyCard";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Hotel } from "@/types/hotel.types";
import { Apartment } from "@/types/apartment.type";
import { useLocation } from "react-router-dom";
import { defaultSearchFilters } from "@/types/search.types";
import MapPreviewCard from "./MapPreviewCard";
import { useTranslation } from "react-i18next";

const SearchPropertyResults = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state as {
    type: string;
    destination?: string;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    adults?: number;
    children?: number;
    rooms?: number;
  } | null;

  const initialFilters = state
    ? {
        destination: state.destination,
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        adults: state.adults,
        children: state.children,
        rooms: state.rooms,
        hotelFilters: {
          ...defaultSearchFilters.hotelFilters,
          searchTerm:
            state.destination || defaultSearchFilters.hotelFilters.searchTerm,
          rooms: state.rooms
            ? { ...defaultSearchFilters.hotelFilters.rooms, min: state.rooms }
            : defaultSearchFilters.hotelFilters.rooms,
        },
        apartmentFilters: {
          ...defaultSearchFilters.apartmentFilters,
          searchTerm:
            state.destination ||
            defaultSearchFilters.apartmentFilters.searchTerm,
          rooms: state.rooms
            ? {
                ...defaultSearchFilters.apartmentFilters.rooms,
                min: state.rooms,
              }
            : defaultSearchFilters.apartmentFilters.rooms,
          beds:
            state.adults || state.children
              ? {
                  ...defaultSearchFilters.apartmentFilters.beds,
                  min: (state.adults || 0) + (state.children || 0),
                }
              : defaultSearchFilters.apartmentFilters.beds,
        },
      }
    : undefined;

  const {
    filters,
    results,
    loading,
    error,
    setFilters,
    setPropertyType,
    setHotelFilters,
    setApartmentFilters,
    resetFilters,
    applyFilters,
  } = useSearchFilters(initialFilters);

  // Set filters from navigation state
  useEffect(() => {
    if (state) {
      // Set destination as search term
      if (state.destination) {
        setHotelFilters({ searchTerm: state.destination });
        setApartmentFilters({ searchTerm: state.destination });
      }

      // Set dates and guest info
      if (
        state.checkInDate ||
        state.checkOutDate ||
        state.adults !== undefined ||
        state.children !== undefined ||
        state.rooms !== undefined
      ) {
        setFilters({
          checkInDate: state.checkInDate,
          checkOutDate: state.checkOutDate,
          adults: state.adults,
          children: state.children,
          rooms: state.rooms,
        });

        // Update derived filters
        if (state.adults !== undefined || state.children !== undefined) {
          const requiredBeds = (state.adults || 0) + (state.children || 0);
          setApartmentFilters({
            beds: {
              min: requiredBeds,
              max: filters.apartmentFilters.beds?.max,
            },
          });
        }

        if (state.rooms !== undefined) {
          setHotelFilters({
            rooms: {
              min: state.rooms,
              max: filters.hotelFilters.rooms?.max,
            },
          });
          setApartmentFilters({
            rooms: {
              min: state.rooms,
              max: filters.apartmentFilters.rooms?.max,
            },
          });
        }
      }
    }
  }, [state, setFilters, setHotelFilters, setApartmentFilters]);

  // Fetch properties on component mount
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle date changes
  const handleDateChange = (dates: {
    checkInDate?: string | null;
    checkOutDate?: string | null;
  }) => {
    setFilters({
      checkInDate: dates.checkInDate ?? filters.checkInDate,
      checkOutDate: dates.checkOutDate ?? filters.checkOutDate,
    });
    // Re-apply filters when dates change
    setTimeout(() => applyFilters(), 0);
  };

  // Handle guests changes
  const handleGuestsChange = (guests: {
    adults?: number;
    children?: number;
    rooms?: number;
  }) => {
    setFilters({
      adults: guests.adults ?? filters.adults,
      children: guests.children ?? filters.children,
      rooms: guests.rooms ?? filters.rooms,
    });
    // Update apartment filters
    setApartmentFilters({
      beds: {
        min: (guests.adults || 2) + (guests.children || 0),
        max: filters.apartmentFilters.beds?.max,
      },
      rooms: {
        min: guests.rooms || 1,
        max: filters.apartmentFilters.rooms?.max,
      },
    });
    // If property type is hotel, update hotel rooms
    if (filters.propertyType === "hotel") {
      setHotelFilters({
        rooms: {
          min: guests.rooms || 1,
          max: filters.hotelFilters.rooms?.max,
        },
      });
    }
    // Re-apply filters when guests change
    setTimeout(() => applyFilters(), 0);
  };

  // Handle property click
  const handlePropertyClick = (id: number, isHotel: boolean) => {
    // Navigate to property details page
    if (isHotel) {
      window.open(`/hotelReservation/${id}`, "_blank", "noopener,noreferrer");
    } else {
      window.open(
        `/apartmentReservation/${id}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  // Render skeleton loaders
  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="space-y-3">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ));
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">
          {t("searchResults.properties.emptyTitle")}
        </h3>
        <p className="text-gray-600 max-w-sm">
          {t("searchResults.properties.emptyDescription")}
        </p>
        <button
          onClick={resetFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("searchResults.properties.resetFilters")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PrimarySearchAppBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar & Map Preview */}
          <div className="w-full lg:max-w-xs space-y-6">
            <MapPreviewCard />
            <FilterBar
              filters={filters}
              onPropertyTypeChange={setPropertyType}
              onHotelFiltersChange={setHotelFilters}
              onApartmentFiltersChange={setApartmentFilters}
              onDateChange={handleDateChange}
              onGuestsChange={handleGuestsChange}
              onResetFilters={resetFilters}
              onApplyFilters={applyFilters}
              loading={loading}
            />
          </div>

          {/* Results Section */}
          <div className="flex-1 w-full">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("searchResults.properties.title")}
              </h1>
              {!loading && results.combined.length > 0 && (
                <p className="text-gray-600">
                  {t("searchResults.properties.found", {
                    count: results.combined.length,
                  })}
                </p>
              )}
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderSkeletons()}
              </div>
            )}

            {/* Empty State */}
            {!loading && results.combined.length === 0 && renderEmptyState()}

            {/* Results Grid */}
            {!loading && results.combined.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.combined.map((property, index) => {
                  const isHotel = "occupancy" in property;
                  const propertyType = isHotel ? "hotel" : "apartment";
                  // Use a truly unique key combining type, id, and index
                  const uniqueKey = `${propertyType}-${property.id}-${index}`;

                  return (
                    <PropertyCard
                      key={uniqueKey}
                      id={property.id}
                      name={property.name}
                      image={property.imageUrls?.[0]}
                      rating={property.rating}
                      price={property.price}
                      location={property.location}
                      address={property.address}
                      rooms={property.rooms}
                      amenities={property.amenities || []}
                      status={property.status}
                      propertyType={propertyType}
                      onClick={() => handlePropertyClick(property.id, isHotel)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPropertyResults;
