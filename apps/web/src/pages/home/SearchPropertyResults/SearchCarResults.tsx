import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router";
import { AlertCircle, Car as CarIcon } from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { CarCard } from "@/components/home/CarCard";
import {
  getAllCars,
  getCarUnavailabilityDates,
} from "@/services/api/carService";
import { getMonthlyPrices } from "@/services/api/monthlyPriceService";
import { Car } from "@/types/car.types";
import { Month, MONTHS } from "@/types/price.type";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CarFilterBar, CarFilterState } from "./CarFilterBar";
import { useTranslation } from "react-i18next";

// Helper to get current month as Month type
const getCurrentMonth = (): Month => {
  const monthIndex = new Date().getMonth();
  return MONTHS[monthIndex];
};

interface LocationState {
  type?: string;
  destination?: string;
  pickupDate?: string | null;
  returnDate?: string | null;
}

const SearchCarResults = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [cars, setCars] = useState<Car[]>([]);
  const [carUnavailability, setCarUnavailability] = useState<
    Record<number, string[]>
  >({});
  const [carMonthlyPrices, setCarMonthlyPrices] = useState<
    Record<number, number | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current month for pricing
  const currentMonth = getCurrentMonth();

  // Extract search params from navigation state
  const initialDestination = state?.destination || "";
  const pickupDate = state?.pickupDate ? new Date(state.pickupDate) : null;
  const returnDate = state?.returnDate ? new Date(state.returnDate) : null;

  // Filter State
  const [filters, setFilters] = useState<CarFilterState>({
    searchTerm: initialDestination,
    status: "all",
    type: "all",
    transmission: "all",
    fuelType: "all",
    priceRange: { min: 0, max: 1000 },
    features: [],
    seats: undefined,
    pickupDate: pickupDate,
    returnDate: returnDate,
  });

  useEffect(() => {
    fetchCars();
  }, []);

  // Fetch monthly prices for all cars when loaded
  useEffect(() => {
    const fetchMonthlyPrices = async () => {
      if (cars.length === 0) return;

      const pricesMap: Record<number, number | null> = {};
      await Promise.all(
        cars.map(async (car) => {
          try {
            const prices = await getMonthlyPrices(car.id, "car");
            const currentMonthPrice = prices.find(
              (p) => p.month === currentMonth,
            );
            pricesMap[car.id] = currentMonthPrice?.pricePerDay ?? null;
          } catch (err) {
            console.error(
              `Error fetching monthly prices for car ${car.id}:`,
              err,
            );
            pricesMap[car.id] = null;
          }
        }),
      );
      setCarMonthlyPrices(pricesMap);
    };

    fetchMonthlyPrices();
  }, [cars, currentMonth]);

  // Fetch unavailability dates when cars are loaded or date filters change
  useEffect(() => {
    const fetchUnavailability = async () => {
      if (cars.length === 0) return;
      if (!filters.pickupDate && !filters.returnDate) {
        setCarUnavailability({});
        return;
      }

      const unavailabilityMap: Record<number, string[]> = {};
      await Promise.all(
        cars.map(async (car) => {
          try {
            const dates = await getCarUnavailabilityDates(car.id);
            unavailabilityMap[car.id] = dates;
          } catch (err) {
            console.error(
              `Error fetching unavailability for car ${car.id}:`,
              err,
            );
            unavailabilityMap[car.id] = [];
          }
        }),
      );
      setCarUnavailability(unavailabilityMap);
    };

    fetchUnavailability();
  }, [cars, filters.pickupDate, filters.returnDate]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCars();
      setCars(data);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError(t("searchResults.cars.errorFetch"));
    } finally {
      setLoading(false);
    }
  };

  // Extract unique features from all cars
  const availableFeatures = useMemo(() => {
    const featuresSet = new Set<string>();
    cars.forEach((car) => {
      car.features?.forEach((feature) => featuresSet.add(feature));
    });
    return Array.from(featuresSet).sort();
  }, [cars]);

  // Helper function to check if car is available for the selected date range
  const isCarAvailableForDateRange = (
    carId: number,
    pickup: Date | null,
    returnD: Date | null,
  ): boolean => {
    if (!pickup || !returnD) return true; // No date filter applied

    const unavailableDates = carUnavailability[carId] || [];
    if (unavailableDates.length === 0) return true;

    // Get all dates in the requested range
    const requestedDates: string[] = [];
    const currentDate = new Date(pickup);
    while (currentDate <= returnD) {
      requestedDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check if any requested date is unavailable
    return !requestedDates.some((date) => unavailableDates.includes(date));
  };

  // Filter logic
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search Term (Brand, Name, Location)
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchName = car.name.toLowerCase().includes(term);
        const matchBrand = car.brand.toLowerCase().includes(term);
        const matchLocation = car.pickUpLocation?.toLowerCase().includes(term);
        if (!matchName && !matchBrand && !matchLocation) return false;
      }

      // Status
      if (
        filters.status &&
        filters.status !== "all" &&
        car.status !== filters.status
      )
        return false;

      // Type
      if (filters.type && filters.type !== "all" && car.type !== filters.type)
        return false;

      // Transmission
      if (
        filters.transmission &&
        filters.transmission !== "all" &&
        car.transmission !== filters.transmission
      )
        return false;

      // Fuel Type
      if (
        filters.fuelType &&
        filters.fuelType !== "all" &&
        car.fuelType !== filters.fuelType
      )
        return false;

      // Price Range (use current month price if available, otherwise base price)
      if (filters.priceRange) {
        const effectivePrice = carMonthlyPrices[car.id] ?? car.pricePerDay;
        if (
          effectivePrice < filters.priceRange.min ||
          effectivePrice > filters.priceRange.max
        )
          return false;
      }

      // Seats
      if (filters.seats && car.seats < filters.seats) return false;

      // Features (Must have all selected features)
      if (filters.features && filters.features.length > 0) {
        const hasAllFeatures = filters.features.every((f) =>
          car.features?.includes(f),
        );
        if (!hasAllFeatures) return false;
      }

      // Date Availability
      if (filters.pickupDate || filters.returnDate) {
        if (
          !isCarAvailableForDateRange(
            car.id,
            filters.pickupDate ?? null,
            filters.returnDate ?? null,
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [cars, filters, carUnavailability, carMonthlyPrices]);

  const handleFilterChange = (newFilters: Partial<CarFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      status: "all",
      type: "all",
      transmission: "all",
      fuelType: "all",
      priceRange: { min: 0, max: 1000 },
      features: [],
      seats: undefined,
      pickupDate: null,
      returnDate: null,
    });
  };

  const handleCarClick = (id: number) => {
    // Navigate to car reservation page
    window.open(`/carReservation/${id}`, "_blank", "noopener,noreferrer");
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-xl border bg-card text-card-foreground shadow-sm h-full overflow-hidden flex flex-col"
      >
        <Skeleton className="h-48 w-full" />
        <div className="p-4 flex flex-col flex-grow space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="mt-auto pt-3 border-t flex justify-between items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PrimarySearchAppBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <CarFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableFeatures={availableFeatures}
            featuresLoading={loading}
          />

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Header */}
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("searchResults.cars.title")}
                </h1>
                {!loading && (
                  <p className="text-gray-600">
                    {t("searchResults.cars.found", {
                      count: filteredCars.length,
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCars}
                  className="ml-auto bg-white hover:bg-gray-100 text-red-600 border-red-200"
                >
                  {t("searchResults.cars.tryAgain")}
                </Button>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {renderSkeletons()}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredCars.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <CarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("searchResults.cars.emptyTitle")}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {t("searchResults.cars.emptyDescription")}
                </p>
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="mt-6"
                >
                  {t("searchResults.cars.clearFilters")}
                </Button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && filteredCars.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id}
                    {...car}
                    currentMonthPrice={carMonthlyPrices[car.id] ?? undefined}
                    onClick={() => handleCarClick(car.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchCarResults;
