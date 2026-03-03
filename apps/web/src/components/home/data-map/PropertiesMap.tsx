import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { getAllHotels } from "@/services/api/hotelService";
import { getAllApartments } from "@/services/api/apartmentService";
import { getAllDestinations } from "@/services/api/destinationService";
import { Apartment } from "@/types/apartment.type";
import { Hotel } from "@/types/hotel.types";
import { Destination } from "@/types/destination.types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import hotelIcon from "@/assets/map/hotel_icon.png";
import apartmentIcon from "@/assets/map/home.png";
import { MapFilters } from "./MapFilters";
import { IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

type Selected =
  | { type: "hotel"; data: Hotel }
  | { type: "apartment"; data: Apartment }
  | { type: "destination"; data: Destination }
  | null;

interface PropertiesMapProps {
  onSelect?: (selected: Selected) => void;
}

const HotelIcon = new L.Icon({
  iconUrl: hotelIcon,
  iconSize: [30, 30],
  iconAnchor: [12, 41],
});

const ApartmentIcon = new L.Icon({
  iconUrl: apartmentIcon,
  iconSize: [30, 30],
  iconAnchor: [12, 41],
});

// Destination icon using a colored marker
const DestinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Center of Albania (Tirana)
const ALBANIA_CENTER: [number, number] = [41.3275, 19.8187];

export default function PropertiesMap({ onSelect }: PropertiesMapProps) {
  const [hotelsData, setHotelsData] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [apartmentsData, setApartmentsData] = useState<Apartment[]>([]);
  const [destinationsData, setDestinationsData] = useState<Destination[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "hotel",
    "apartment",
    "destination",
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Adventure",
    "Historic",
    "Beach",
  ]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await getAllHotels();
        setHotelsData(data || []);
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
        setHotelsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const data = await getAllApartments();
        setApartmentsData(data || []);
      } catch (error) {
        console.error("Failed to fetch apartments:", error);
        setApartmentsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await getAllDestinations();
        setDestinationsData(data || []);
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
        setDestinationsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Filter data based on selected types and price range
  const filteredHotels = hotelsData.filter(
    (hotel) =>
      selectedTypes.includes("hotel") &&
      hotel.price >= priceRange[0] &&
      hotel.price <= priceRange[1],
  );

  const filteredApartments = apartmentsData.filter(
    (apartment) =>
      selectedTypes.includes("apartment") &&
      apartment.price >= priceRange[0] &&
      apartment.price <= priceRange[1],
  );

  const filteredDestinations = destinationsData.filter(
    (destination) =>
      selectedTypes.includes("destination") &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(destination.category)),
  );

  const handleResetFilters = () => {
    setSelectedTypes(["hotel", "apartment", "destination"]);
    setPriceRange([0, 500]);
    setSelectedCategories(["Adventure", "Historic", "Beach"]);
  };

  return (
    <div className="w-full h-full flex relative">
      {/* Mobile Filter Toggle Button */}
      <IconButton
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="lg:hidden"
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          "&:hover": {
            backgroundColor: "white",
          },
        }}
      >
        <FilterListIcon />
      </IconButton>

      {/* Sidebar Filters */}
      <div
        className={`
          ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          fixed lg:relative
          top-0 left-0
          w-80 h-full
          bg-white shadow-lg border-r border-gray-200 p-4 overflow-y-auto
          transition-transform duration-300 ease-in-out
          z-[999]
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end mb-2">
          <IconButton onClick={() => setIsFilterOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        <MapFilters
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          onReset={handleResetFilters}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isFilterOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[998]"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Map Container */}
      <div className="flex-1 relative w-full h-full">
        <MapContainer
          center={ALBANIA_CENTER}
          zoom={8}
          className="w-full h-full"
          attributionControl={false}
        >
          {/* Base map */}
          <TileLayer
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Markers */}
          {filteredHotels?.map((hotel: Hotel) => (
            <Marker
              key={`hotel-${hotel.id}`}
              position={[hotel.lat || 0, hotel.lng || 0]}
              icon={HotelIcon}
              eventHandlers={{
                click: () => onSelect?.({ type: "hotel", data: hotel }),
              }}
            >
              {hotel.price && (
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  opacity={1}
                  permanent
                >
                  {typeof hotel.price === "number"
                    ? `$${hotel.price}`
                    : hotel.price}
                </Tooltip>
              )}
            </Marker>
          ))}

          {filteredApartments?.map((apartment: Apartment) => (
            <Marker
              key={`apartment-${apartment.id}`}
              position={[apartment.lat, apartment.lng]}
              icon={ApartmentIcon}
              eventHandlers={{
                click: () => onSelect?.({ type: "apartment", data: apartment }),
              }}
            >
              {apartment.price && (
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  opacity={1}
                  permanent
                >
                  {typeof apartment.price === "number"
                    ? `$${apartment.price}`
                    : apartment.price}
                </Tooltip>
              )}
            </Marker>
          ))}

          {filteredDestinations?.map((destination: Destination) => (
            <Marker
              key={`destination-${destination.id}`}
              position={[destination.lat || 0, destination.lng || 0]}
              icon={DestinationIcon}
              eventHandlers={{
                click: () =>
                  onSelect?.({ type: "destination", data: destination }),
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                {destination.category}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
