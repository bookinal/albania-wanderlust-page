import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  canEdit: boolean;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  position,
  setPosition,
  canEdit,
}) => {
  useMapEvents({
    click(e) {
      if (!canEdit) return;
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

interface MapPickerProps {
  lat?: number;
  lng?: number;
  canEdit?: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressSelect?: (address: string) => void;
  apiKey?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  label?: string;
  showCoordinates?: boolean;
  openOnGoogleMaps?: boolean;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  lat,
  lng,
  canEdit = true,
  onLocationSelect,
  onAddressSelect,
  apiKey,
  defaultCenter = [41.327953, 19.819025],
  defaultZoom = 8,
  label = "Select Location on Map",
  showCoordinates = true,
  openOnGoogleMaps = true,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [address, setAddress] = React.useState<string>("");
  const [isLoadingAddress, setIsLoadingAddress] = React.useState(false);

  const previousLocation = React.useRef<{ lat: number; lng: number } | null>(
    null,
  );

  React.useEffect(() => {
    const fetchAddress = async () => {
      const activeApiKey = apiKey || import.meta.env.VITE_GEOCODE_MAPS_API_KEY;

      if (lat === undefined || lng === undefined || !activeApiKey) return;

      // Prevent refetching if the location hasn't actually changed
      if (
        previousLocation.current &&
        previousLocation.current.lat === lat &&
        previousLocation.current.lng === lng
      ) {
        return;
      }

      previousLocation.current = { lat, lng };

      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&api_key=${activeApiKey}`,
        );
        if (!response.ok) throw new Error("Failed to fetch address");
        const data = await response.json();
        const displayName = data.display_name || "";
        setAddress(displayName);
        if (onAddressSelect) {
          onAddressSelect(displayName);
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [lat, lng, apiKey, onAddressSelect]);

  const tk = {
    wrapperBg: isDark ? "rgba(232,25,44,0.06)" : "#fff7f7",
    wrapperBorder: isDark ? "rgba(232,25,44,0.25)" : "#fca5a5",
    mapBorder: isDark ? "rgba(232,25,44,0.30)" : "#fca5a5",
    labelText: isDark ? "rgba(255,255,255,0.80)" : "#111115",
    hintText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    coordBg: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
    coordBorder: isDark ? "rgba(255,255,255,0.10)" : "#fca5a5",
    coordLabel: isDark ? "rgba(255,255,255,0.55)" : "#6b6663",
    coordValue: "#E8192C",
    linkColor: "#E8192C",
  };

  const mapPosition: [number, number] | null =
    lat !== undefined && lng !== undefined ? [lat, lng] : null;

  const handlePositionChange = (pos: [number, number]) => {
    onLocationSelect(pos[0], pos[1]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        border: `1px solid ${tk.wrapperBorder}`,
        borderRadius: "10px",
        padding: "16px",
        background: tk.wrapperBg,
      }}
    >
      <label style={{ fontSize: "13px", fontWeight: 600, color: tk.labelText }}>
        {label}
      </label>

      {/* Map */}
      <div
        style={{
          height: "256px",
          borderRadius: "8px",
          overflow: "hidden",
          border: `1px solid ${tk.mapBorder}`,
        }}
      >
        <MapContainer
          center={mapPosition || defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={mapPosition}
            setPosition={handlePositionChange}
            canEdit={canEdit}
          />
        </MapContainer>
      </div>

      {/* Coordinates Display */}
      {showCoordinates && (
        <div style={{ fontSize: "13px" }}>
          <p style={{ color: tk.hintText, marginBottom: "8px" }}>
            {canEdit
              ? "Click on the map to select a location"
              : "Location editing is disabled"}
          </p>
          {lat !== undefined && lng !== undefined ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    background: tk.coordBg,
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${tk.coordBorder}`,
                  }}
                >
                  <span style={{ fontWeight: 600, color: tk.coordLabel }}>
                    Latitude:
                  </span>
                  <p style={{ color: tk.coordValue, fontWeight: 700 }}>
                    {lat.toFixed(6)}
                  </p>
                </div>
                <div
                  style={{
                    background: tk.coordBg,
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${tk.coordBorder}`,
                  }}
                >
                  <span style={{ fontWeight: 600, color: tk.coordLabel }}>
                    Longitude:
                  </span>
                  <p style={{ color: tk.coordValue, fontWeight: 700 }}>
                    {lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Address Display */}
              {(apiKey || import.meta.env.VITE_GEOCODE_MAPS_API_KEY) && (
                <div
                  style={{
                    background: tk.coordBg,
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${tk.coordBorder}`,
                  }}
                >
                  <span style={{ fontWeight: 600, color: tk.coordLabel }}>
                    Address:
                  </span>
                  <p
                    style={{
                      color: tk.labelText,
                      fontWeight: 500,
                      marginTop: "2px",
                    }}
                  >
                    {isLoadingAddress
                      ? "Loading address..."
                      : address || "Address not found"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                color: tk.hintText,
                padding: "8px",
                background: tk.coordBg,
                borderRadius: "6px",
                border: `1px solid ${tk.coordBorder}`,
              }}
            >
              No location selected yet
            </div>
          )}
        </div>
      )}

      {/* Google Maps Link */}
      {openOnGoogleMaps && lat !== undefined && lng !== undefined && (
        <div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: tk.linkColor,
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            {t("map.openInGoogleMaps")}
          </a>
        </div>
      )}
    </div>
  );
};
