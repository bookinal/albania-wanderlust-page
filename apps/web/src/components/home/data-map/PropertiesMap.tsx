import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { getAllHotels } from "@/services/api/hotelService";
import { getAllApartments } from "@/services/api/apartmentService";
import { getAllDestinations } from "@/services/api/destinationService";
import { Apartment } from "@/types/apartment.type";
import { Hotel } from "@/types/hotel.types";
import { Destination } from "@/types/destination.types";
import { SearchFiltersState } from "@/types/search.types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "../homeTheme";

type Selected =
  | { type: "hotel"; data: Hotel }
  | { type: "apartment"; data: Apartment }
  | { type: "destination"; data: Destination }
  | null;

interface PropertiesMapProps {
  onSelect?: (selected: Selected) => void;
  filters?: SearchFiltersState;
}

/**
 * Creates a speech-bubble DivIcon that combines the type emoji + price/label
 * into one element — eliminates the overlap caused by L.Icon + Tooltip permanent.
 * The transform translate(-50%, -100%) anchors the bubble's bottom-center on the
 * map coordinate regardless of text width, so iconAnchor can stay [0, 0].
 */
function createPriceMarker(
  type: "hotel" | "apartment" | "destination",
  label: string,
  accent: { brand: string; destinationBorder: string; hover: string; text: string; bg: string },
): L.DivIcon {
  const emoji = type === "hotel" ? "🏨" : type === "apartment" ? "🏠" : "📍";
  const borderColor = type === "destination" ? accent.destinationBorder : accent.brand;
  const bgHover = type === "destination" ? accent.destinationBorder : accent.hover;

  const html = `
    <div style="
      transform:translate(-50%,-100%);
      display:inline-flex;
      flex-direction:column;
      align-items:center;
      cursor:pointer;
    ">
      <div style="
        background:${accent.bg};
        border:2.5px solid ${borderColor};
        border-radius:20px;
        padding:4px 10px;
        font-size:12px;
        font-weight:700;
        white-space:nowrap;
        color:${accent.text};
        display:flex;
        align-items:center;
        gap:5px;
        box-shadow:0 2px 8px rgba(0,0,0,0.28);
        font-family:system-ui,-apple-system,sans-serif;
        line-height:1.4;
        transition:background 0.15s,color 0.15s;
      "
        onmouseover="this.style.background='${bgHover}';this.style.color='white';"
        onmouseout="this.style.background='${accent.bg}';this.style.color='${accent.text}';"
      >
        <span>${emoji}</span>
        <span>${label}</span>
      </div>
      <div style="
        width:0;
        height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:8px solid ${borderColor};
        margin-top:-1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconAnchor: [0, 0],
  });
}

// Center of Albania (Tirana)
const ALBANIA_CENTER: [number, number] = [41.3275, 19.8187];

export default function PropertiesMap({ onSelect, filters }: PropertiesMapProps) {
  const { localize } = useLocalized();
  const { isDark, isBlue } = useTheme();
  const [hotelsData, setHotelsData] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [apartmentsData, setApartmentsData] = useState<Apartment[]>([]);
  const [destinationsData, setDestinationsData] = useState<Destination[]>([]);

  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const tk = {
    sidebarBg: isDark ? "#111115" : isBlue ? "rgba(255,255,255,0.82)" : "#ffffff",
    sidebarBorder: isDark ? "rgba(255,255,255,0.07)" : isBlue ? "rgba(2,132,199,0.14)" : "#e5e2de",
    filterBtnBg: isDark ? "#1a1a1e" : isBlue ? "rgba(255,255,255,0.92)" : "#ffffff",
    filterBtnText: isDark ? "rgba(255,255,255,0.80)" : isBlue ? "hsl(212 48% 18%)" : "#374151",
    filterBtnShadow: "0 2px 8px rgba(0,0,0,0.28)",
    closeBtnHover: isDark ? "rgba(255,255,255,0.08)" : isBlue ? "rgba(2,132,199,0.08)" : "#f3f4f6",
    closeIconColor: isDark ? "rgba(255,255,255,0.60)" : isBlue ? "#0369a1" : "#4b5563",
    overlayBg: "rgba(0,0,0,0.55)",
    markerAccent: {
      brand: homeTk.brand,
      destinationBorder: isBlue ? "#0f4c81" : "#374151",
      hover: isBlue ? "#0284c7" : "#dc2626",
      text: isBlue ? "#082f49" : "#111111",
      bg: isBlue ? "#f0f9ff" : "white",
    },
  };

  // Remove the local MapFilters states since we rely on `filters` prop now.
  // Filter data based on selected types and price range
  
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await getAllHotels();
        setHotelsData(data || []);
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
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
      }
    };
    fetchDestinations();
  }, []);

  const propertyType = filters?.propertyType || "hotel";
  const hotelFilters = filters?.hotelFilters;
  const apartmentFilters = filters?.apartmentFilters;
  const destinationFilters = filters?.destinationFilters;

  const filteredHotels = hotelsData.filter((hotel) => {
    if (propertyType !== "hotel") return false;
    
    // Default filter logic for hotels
    if (hotelFilters) {
      if (hotelFilters.searchTerm && !hotel.name.toLowerCase().includes(hotelFilters.searchTerm.toLowerCase())) return false;
      if (hotelFilters.priceRange) {
        if (hotel.price < hotelFilters.priceRange.min || hotel.price > hotelFilters.priceRange.max) return false;
      }
      // Add more local filters if needed (status, rating, etc.)
    }
    return true;
  });

  const filteredApartments = apartmentsData.filter((apartment) => {
    if (propertyType !== "apartment") return false;
    
    // Default filter logic for apartments
    if (apartmentFilters) {
      if (apartmentFilters.searchTerm && !apartment.name.toLowerCase().includes(apartmentFilters.searchTerm.toLowerCase())) return false;
      if (apartmentFilters.priceRange) {
        if (apartment.price < apartmentFilters.priceRange.min || apartment.price > apartmentFilters.priceRange.max) return false;
      }
      // Add more local filters if needed
    }
    return true;
  });

  const filteredDestinations = destinationsData.filter((destination) => {
    if (propertyType !== "destination") return false;
    
    if (destinationFilters) {
      if (destinationFilters.searchTerm && !localize(destination.name).toLowerCase().includes(destinationFilters.searchTerm.toLowerCase())) return false;
      if (destinationFilters.categories && destinationFilters.categories.length > 0) {
        if (!destinationFilters.categories.includes(destination.category)) return false;
      }
    }
    return true;
  });

  return (
    <div className="w-full h-full flex relative">
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
              icon={createPriceMarker(
                "hotel",
                hotel.price ? `$${hotel.price}` : "Hotel",
                tk.markerAccent,
              )}
              eventHandlers={{
                click: () => onSelect?.({ type: "hotel", data: hotel }),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.92}>
                {hotel.name}
              </Tooltip>
            </Marker>
          ))}

          {filteredApartments?.map((apartment: Apartment) => (
            <Marker
              key={`apartment-${apartment.id}`}
              position={[apartment.lat, apartment.lng]}
              icon={createPriceMarker(
                "apartment",
                apartment.price ? `$${apartment.price}` : "Apartment",
                tk.markerAccent,
              )}
              eventHandlers={{
                click: () => onSelect?.({ type: "apartment", data: apartment }),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.92}>
                {apartment.name}
              </Tooltip>
            </Marker>
          ))}

          {filteredDestinations?.map((destination: Destination) => (
            <Marker
              key={`destination-${destination.id}`}
              position={[destination.lat || 0, destination.lng || 0]}
              icon={createPriceMarker("destination", destination.category, tk.markerAccent)}
              eventHandlers={{
                click: () =>
                  onSelect?.({ type: "destination", data: destination }),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.92}>
                {localize(destination.name)}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
