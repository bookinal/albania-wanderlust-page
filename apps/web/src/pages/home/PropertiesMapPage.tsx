import { useState } from "react";
import PropertiesMap from "../../components/home/data-map/PropertiesMap";
import MapPropertySidebar from "../../components/home/data-map/MapPropertySidebar";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTranslation } from "react-i18next";
import { FilterBar } from "./SearchPropertyResults/FilterBar";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { Hotel } from "@/types/hotel.types";
import { Apartment } from "@/types/apartment.type";
import { Destination } from "@/types/destination.types";
import { Filter, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type Selected =
  | { type: "hotel"; data: Hotel }
  | { type: "apartment"; data: Apartment }
  | { type: "destination"; data: Destination }
  | null;

const PropertiesMapPage = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [selected, setSelected] = useState<Selected>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const {
    filters,
    setFilters,
    setPropertyType,
    setHotelFilters,
    setApartmentFilters,
    setDestinationFilters,
    resetFilters,
  } = useSearchFilters({ propertyType: "hotel" });

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
  };

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: isDark ? '#111115' : '#f8f6f3' }}
    >
      {/* AppBar */}
      <div className="flex-shrink-0 z-50">
        <PrimarySearchAppBar />
      </div>

      {/* Main Map Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden absolute top-4 left-4 z-[1000] rounded-full p-2 bg-white text-gray-800 shadow-md border-none"
          aria-label="Toggle filters"
        >
          <Filter size={20} />
        </button>

        {/* Left Filter Sidebar */}
        <div 
          className={`
            ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            fixed lg:relative
            top-0 left-0
            w-80 lg:w-[320px] h-full
            overflow-y-auto bg-transparent z-[1001] lg:z-40 custom-scrollbar
            transition-transform duration-300 ease-in-out
          `}
        >
          <div className="p-4">
            {/* Mobile Close Button */}
            <div className="lg:hidden flex justify-end mb-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-white bg-transparent border-none"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <FilterBar
              filters={filters}
              onPropertyTypeChange={setPropertyType}
              onHotelFiltersChange={setHotelFilters}
              onApartmentFiltersChange={setApartmentFilters}
              onDestinationFiltersChange={setDestinationFilters}
              onDateChange={handleDateChange}
              onGuestsChange={handleGuestsChange}
              onResetFilters={resetFilters}
              onApplyFilters={() => setIsMobileFilterOpen(false)}
              loading={false}
              availableTypes={["hotel", "apartment", "destination"]}
            />
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileFilterOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[1000] bg-black/50"
            onClick={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* Map Area */}
        <div className="flex-1 relative h-full">
          <PropertiesMap onSelect={setSelected} filters={filters} />
        </div>

        {/* Property detail sidebar — slides in from the right */}
        <MapPropertySidebar
          selected={selected}
          onClose={() => setSelected(null)}
        />

        {/* Mobile description strip */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] sm:hidden pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md border-t border-white/60 px-4 py-3">
            <p className="text-xs text-gray-500 text-center">
              {t("propertiesMap.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesMapPage;
