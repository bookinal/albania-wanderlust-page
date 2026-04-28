import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertCircle, Car as CarIcon, Loader2 } from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { CarCard } from "@/components/home/CarCard";
import {
  searchCars,
  SearchCarFilters,
} from "@/services/api/carService";
import { Car } from "@/types/car.types";
import { CarFilterBar, CarFilterState } from "./CarFilterBar";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getSearchResultsThemeTokens } from "./searchResultsTheme";

interface LocationState {
  type?: string;
  destination?: string;
  pickupDate?: string | null;
  returnDate?: string | null;
}

const CARS_PER_PAGE = 9;

const SearchCarResults = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const navigate = useNavigate();

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

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["searchCars", filters],
    queryFn: async ({ pageParam = 1 }) => {
      // Map frontend CarFilterState to api-client SearchCarFilters
      const apiFilters: SearchCarFilters = {
        searchTerm: filters.searchTerm,
        status: filters.status,
        type: filters.type,
        transmission: filters.transmission,
        fuelType: filters.fuelType,
        priceRange: filters.priceRange,
        features: filters.features,
        seats: filters.seats,
        pickupDate: filters.pickupDate,
        returnDate: filters.returnDate,
      };

      const res = await searchCars(apiFilters, pageParam, CARS_PER_PAGE);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.data.length, 0);
      if (totalLoaded < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });

  // Setup infinite scrolling observer
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten infinite query data
  const filteredCars = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const carMonthlyPrices = useMemo(() => {
    let pricesMap: Record<number, number> = {};
    if (data?.pages) {
      data.pages.forEach(page => {
        pricesMap = { ...pricesMap, ...page.monthlyPrices };
      });
    }
    return pricesMap;
  }, [data]);

  const totalResults = useMemo(() => {
    return data?.pages[0]?.total || 0;
  }, [data]);

  // We are currently not fetching ALL cars just to extract features, 
  // since that defeats the purpose of pagination.
  // Assuming the `CarFilterBar` accepts standard available features or we can leave it empty if dynamic.
  // We'll extract them from loaded cars for now, but a robust app might query a distinct list of features.
  const availableFeatures = useMemo(() => {
    const featuresSet = new Set<string>();
    filteredCars.forEach((car) => {
      car.features?.forEach((feature) => featuresSet.add(feature));
    });
    return Array.from(featuresSet).sort();
  }, [filteredCars]);

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
    navigate(`/carReservation/${id}`);
  };

  // Theme tokens
  const tk = getSearchResultsThemeTokens({ isDark, isBlue });

  const renderSkeletons = (count: number = 6) => {
    return Array.from({ length: count }).map((_, idx) => (
      <div
        key={`skeleton-${idx}`}
        style={{
          background: tk.skeletonBg,
          border: `1px solid ${tk.skeletonBorder}`,
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animationDelay: `${idx * 0.07}s`,
          animation: 'fadeUpGrid 0.5s ease both',
        }}
      >
        <div className="alb-skeleton-pulse" style={{ height: 192, width: '100%' }} />
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="alb-skeleton-pulse" style={{ height: 10, width: '30%', borderRadius: 2 }} />
          <div className="alb-skeleton-pulse" style={{ height: 20, width: '70%', borderRadius: 2 }} />
          <div className="alb-skeleton-pulse" style={{ height: 14, width: '50%', borderRadius: 2 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[0,1,2,3].map(i => (
              <div key={i} className="alb-skeleton-pulse" style={{ height: 14, borderRadius: 2 }} />
            ))}
          </div>
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${tk.skeletonBorder}`, display: 'flex', justifyContent: 'space-between' }}>
            <div className="alb-skeleton-pulse" style={{ height: 14, width: '25%', borderRadius: 2 }} />
            <div className="alb-skeleton-pulse" style={{ height: 22, width: '30%', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    ));
  };

  const isLoading = status === "pending";

  return (
    <div className="min-h-screen" style={{ background: tk.pageBg, transition: 'background 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

        .alb-title {
          font-family: 'Bebas Neue', 'Impact', sans-serif;
          letter-spacing: 0.04em;
        }

        .alb-body {
          font-family: 'Crimson Pro', 'Georgia', serif;
        }

        .alb-card-grid {
          animation: fadeUpGrid 0.6s ease both;
        }

        @keyframes fadeUpGrid {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .alb-skeleton-pulse {
          background: linear-gradient(90deg, ${tk.skeletonPulseFrom} 25%, ${tk.skeletonPulseMid} 50%, ${tk.skeletonPulseFrom} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .alb-red-line {
          height: 3px;
          background: linear-gradient(90deg, ${tk.brand}, ${tk.brand} 60%, transparent);
        }

        .alb-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: ${tk.brandSoft};
          border: 1px solid ${tk.brandBorder};
          color: ${tk.brand};
          font-family: 'Crimson Pro', serif;
          font-size: 0.95rem;
          letter-spacing: 0.03em;
          padding: 3px 12px;
          border-radius: 2px;
        }

        .alb-retry-btn {
          margin-left: auto;
          background: transparent;
          border: 1px solid ${tk.brandBorder};
          color: ${tk.brand};
          font-family: 'Crimson Pro', serif;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .alb-retry-btn:hover {
          background: ${tk.brandSoftStrong};
          color: ${tk.brand};
        }

        .alb-clear-btn:hover {
          border-color: ${tk.brand} !important;
          color: ${tk.brand} !important;
        }

        .alb-bg-texture {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: ${tk.textureBg};
          opacity: 0.025;
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, transition: 'all 0.3s' }}>
        <div className="alb-bg-texture" />
        <PrimarySearchAppBar />

        {/* Hero band */}
        <div style={{
          background: tk.heroBg,
          borderBottom: `1px solid ${tk.heroBorder}`,
          padding: '32px 0 0',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div className="container mx-auto px-4 pb-6">
            <p className="alb-body" style={{ color: tk.labelColor, fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
              Albania — Car Rentals
            </p>
            <h1 className="alb-title" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', color: tk.headingColor, lineHeight: 0.95, marginBottom: 0, transition: 'color 0.3s' }}>
              {t("searchResults.cars.title")}
            </h1>
            <div className="alb-red-line" style={{ marginTop: 16, width: 'min(200px, 40%)' }} />
          </div>
        </div>

        <main className="container mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <CarFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              availableFeatures={availableFeatures}
              featuresLoading={isLoading}
            />

            {/* Main Content */}
            <div className="flex-1 w-full">
              {/* Result count */}
              {!isLoading && status !== "error" && (
                <div style={{ marginBottom: 28 }}>
                  <span className="alb-count-badge alb-body">
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: tk.brand, flexShrink: 0 }} />
                    {t("searchResults.cars.found", { count: totalResults })}
                  </span>
                </div>
              )}

              {/* Error State */}
              {status === "error" && (
                <div style={{
                  background: tk.brandSoft,
                  border: `1px solid ${tk.brandBorder}`,
                  borderLeft: `4px solid ${tk.brand}`,
                  borderRadius: 4,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  color: tk.errorText,
                  marginBottom: 24,
                  transition: 'background 0.3s',
                }}>
                  <AlertCircle style={{ color: tk.brand, width: 20, height: 20, flexShrink: 0 }} />
                  <span className="alb-body" style={{ flex: 1, fontSize: '1rem' }}>
                    {error instanceof Error ? error.message : t("searchResults.cars.errorFetch")}
                  </span>
                  <button className="alb-retry-btn" onClick={() => fetchNextPage()}>
                    {t("searchResults.cars.tryAgain")}
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && status !== "error" && filteredCars.length === 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '80px 24px',
                  textAlign: 'center',
                  background: tk.emptyStateBg,
                  border: `1px dashed ${tk.emptyStateBorder}`,
                  borderRadius: 6,
                  transition: 'background 0.3s',
                }}>
                  <div style={{
                    width: 72, height: 72,
                    border: `1px solid ${tk.brandBorder}`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                    background: tk.brandSoft,
                  }}>
                    <CarIcon style={{ width: 32, height: 32, color: tk.brand, opacity: 0.7 }} />
                  </div>
                  <h3 className="alb-title" style={{ fontSize: '1.8rem', color: tk.headingColor, marginBottom: 10, transition: 'color 0.3s' }}>
                    {t("searchResults.cars.emptyTitle")}
                  </h3>
                  <p className="alb-body" style={{ color: tk.bodyText, fontSize: '1.1rem', maxWidth: 360 }}>
                    {t("searchResults.cars.emptyDescription")}
                  </p>
                  <button
                    className="alb-clear-btn"
                    onClick={handleResetFilters}
                    style={{
                      marginTop: 24,
                      background: 'transparent',
                      border: `1px solid ${tk.clearBtnBorder}`,
                      color: tk.clearBtnColor,
                      fontFamily: 'Crimson Pro, Georgia, serif',
                      fontSize: '1rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '10px 28px',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                  >
                    {t("searchResults.cars.clearFilters")}
                  </button>
                </div>
              )}

              {/* Results Grid */}
              <div className="alb-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car, idx) => (
                  <div key={`${car.id}-${idx}`} style={{ animationDelay: `${(idx % CARS_PER_PAGE) * 0.05}s`, animation: 'fadeUpGrid 0.5s ease both' }}>
                    <CarCard
                      {...car}
                      currentMonthPrice={carMonthlyPrices[car.id] ?? undefined}
                      onClick={() => handleCarClick(car.id)}
                    />
                  </div>
                ))}
                
                {/* Initial Loading or Fetching Next Page State */}
                {(isLoading || isFetchingNextPage) && renderSkeletons(isLoading ? 6 : 3)}
              </div>

              {/* Intersection Observer target for infinite scrolling */}
              <div ref={ref} style={{ height: '40px', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isFetchingNextPage && <Loader2 className="animate-spin text-red-600" size={24} />}
              </div>
              
              {!hasNextPage && filteredCars.length > 0 && (
                <p className="text-center text-sm alb-body opacity-60 mt-8">
                  {t("searchResults.cars.noMoreResults", "No more cars to load")}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchCarResults;
