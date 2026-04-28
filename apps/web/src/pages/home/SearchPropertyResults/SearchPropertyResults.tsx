import { useEffect, useMemo } from "react";
import { AlertCircle, Building2, Loader2 } from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import FilterBar from "./FilterBar";
import { PropertyCard } from "@/components/home/PropertyCard";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useLocation } from "react-router-dom";
import { defaultSearchFilters } from "@/types/search.types";
import MapPreviewCard from "./MapPreviewCard";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { searchHotels } from "@/services/api/hotelService";
import { searchApartments } from "@/services/api/apartmentService";
import { getSearchResultsThemeTokens } from "./searchResultsTheme";

const PROPERTIES_PER_PAGE = 9;

const SearchPropertyResults = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
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
    setFilters,
    setPropertyType,
    setHotelFilters,
    setApartmentFilters,
    resetFilters,
  } = useSearchFilters(initialFilters);

  // Set filters from navigation state
  useEffect(() => {
    if (state) {
      if (state.destination) {
        setHotelFilters({ searchTerm: state.destination });
        setApartmentFilters({ searchTerm: state.destination });
      }

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
  }, [
    state,
    setFilters,
    setHotelFilters,
    setApartmentFilters,
    filters.hotelFilters.rooms?.max,
    filters.apartmentFilters.beds?.max,
    filters.apartmentFilters.rooms?.max,
  ]);

  // Infinite Query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["searchProperties", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const propertyType = filters.propertyType;
      const shouldFetchHotels = propertyType === "hotel";
      const shouldFetchApartments = propertyType === "apartment";

      const [hotelsRes, apartmentsRes] = await Promise.all([
        shouldFetchHotels
          ? searchHotels(filters, pageParam, PROPERTIES_PER_PAGE)
          : Promise.resolve({ data: [], total: 0 }),
        shouldFetchApartments
          ? searchApartments(filters, pageParam, PROPERTIES_PER_PAGE)
          : Promise.resolve({ data: [], total: 0 }),
      ]);

      const combinedData = [...hotelsRes.data, ...apartmentsRes.data];

      return {
        combined: combinedData,
        total: hotelsRes.total + apartmentsRes.total,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.combined.length, 0);
      if (totalLoaded < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const combinedResults = useMemo(() => {
    return data?.pages.flatMap((page) => page.combined) || [];
  }, [data]);

  const totalResults = useMemo(() => {
    return data?.pages[0]?.total || 0;
  }, [data]);

  const applyFilters = () => {
    // With react-query, queryKey change triggers refetch automatically.
    // This is just a dummy func to pass down if needed, but the button shouldn't strictly be needed 
    // since it updates in real time. We'll leave it to force a refetch if desired.
    refetch();
  };

  const handleDateChange = (dates: {
    checkInDate?: string | null;
    checkOutDate?: string | null;
  }) => {
    setFilters({
      checkInDate: dates.checkInDate ?? filters.checkInDate,
      checkOutDate: dates.checkOutDate ?? filters.checkOutDate,
    });
  };

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
    if (filters.propertyType === "hotel") {
      setHotelFilters({
        rooms: {
          min: guests.rooms || 1,
          max: filters.hotelFilters.rooms?.max,
        },
      });
    }
  };

  const handlePropertyClick = (id: number, isHotel: boolean) => {
    if (isHotel) {
      navigate(`/hotelReservation/${id}`);
    } else {
      navigate(`/apartmentReservation/${id}`);
    }
  };

  // Theme tokens
  const tk = getSearchResultsThemeTokens({ isDark, isBlue });

  const renderSkeletons = (count: number = 6) =>
    Array.from({ length: count }).map((_, idx) => (
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
          <div className="alb-skeleton-pulse" style={{ height: 14, width: '40%', borderRadius: 2 }} />
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${tk.skeletonBorder}`, display: 'flex', justifyContent: 'space-between' }}>
            <div className="alb-skeleton-pulse" style={{ height: 14, width: '25%', borderRadius: 2 }} />
            <div className="alb-skeleton-pulse" style={{ height: 22, width: '30%', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    ));

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
              Albania — Properties
            </p>
            <h1 className="alb-title" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', color: tk.headingColor, lineHeight: 0.95, marginBottom: 0, transition: 'color 0.3s' }}>
              {t("searchResults.properties.title")}
            </h1>
            <div className="alb-red-line" style={{ marginTop: 16, width: 'min(200px, 40%)' }} />
          </div>
        </div>

        <main className="container mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar & Map Preview */}
            <div className="w-full lg:w-[280px]" style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
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
                loading={isFetching}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full">
              {/* Result count */}
              {!isLoading && status !== "error" && (
                <div style={{ marginBottom: 28 }}>
                  <span className="alb-count-badge alb-body">
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: tk.brand, flexShrink: 0 }} />
                    {t("searchResults.properties.found", { count: totalResults })}
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
                    {error instanceof Error ? error.message : "Failed to fetch properties"}
                  </span>
                  <button className="alb-retry-btn" onClick={() => fetchNextPage()}>
                    {t("searchResults.cars.tryAgain", "Try Again")}
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && status !== "error" && combinedResults.length === 0 && (
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
                    <Building2 style={{ width: 32, height: 32, color: tk.brand, opacity: 0.7 }} />
                  </div>
                  <h3 className="alb-title" style={{ fontSize: '1.8rem', color: tk.headingColor, marginBottom: 10, transition: 'color 0.3s' }}>
                    {t("searchResults.properties.emptyTitle")}
                  </h3>
                  <p className="alb-body" style={{ color: tk.bodyText, fontSize: '1.1rem', maxWidth: 360 }}>
                    {t("searchResults.properties.emptyDescription")}
                  </p>
                  <button
                    className="alb-clear-btn"
                    onClick={resetFilters}
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
                    {t("searchResults.properties.resetFilters")}
                  </button>
                </div>
              )}

              {/* Results Grid */}
              <div className="alb-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {combinedResults.map((property, index) => {
                  const isHotel = "occupancy" in property;
                  const propertyType = isHotel ? "hotel" : "apartment";
                  const uniqueKey = `${propertyType}-${property.id}-${index}`;
                  return (
                    <div key={uniqueKey} style={{ animationDelay: `${(index % PROPERTIES_PER_PAGE) * 0.05}s`, animation: 'fadeUpGrid 0.5s ease both' }}>
                      <PropertyCard
                        id={property.id}
                        name={property.name}
                        image={property.imageUrls?.[0]}
                        rating={property.rating}
                        price={'pricePerNight' in property ? property.pricePerNight : property.price}
                        location={property.location}
                        address={property.address}
                        rooms={property.rooms}
                        amenities={property.amenities || []}
                        status={property.status}
                        propertyType={propertyType}
                        onClick={() => handlePropertyClick(property.id, isHotel)}
                      />
                    </div>
                  );
                })}
                
                {/* Initial Loading or Fetching Next Page State */}
                {(isLoading || isFetchingNextPage) && renderSkeletons(isLoading ? 6 : 3)}
              </div>

              {/* Intersection Observer target for infinite scrolling */}
              <div ref={ref} style={{ height: '40px', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isFetchingNextPage && <Loader2 className="animate-spin text-red-600" size={24} />}
              </div>
              
              {!hasNextPage && combinedResults.length > 0 && (
                <p className="text-center text-sm alb-body opacity-60 mt-8">
                  {t("searchResults.properties.noMoreResults", "No more properties to load")}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPropertyResults;
