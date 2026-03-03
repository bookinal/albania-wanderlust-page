import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

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
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  position,
  setPosition,
}) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  label?: string;
  showCoordinates?: boolean;
  openOnGoogleMaps?: boolean;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  lat,
  lng,
  onLocationSelect,
  defaultCenter = [41.327953, 19.819025],
  defaultZoom = 8,
  label = "Select Location on Map",
  showCoordinates = true,
  openOnGoogleMaps = true,
}) => {
  const { t } = useTranslation();
  const mapPosition: [number, number] | null =
    lat !== undefined && lng !== undefined ? [lat, lng] : null;

  const handlePositionChange = (pos: [number, number]) => {
    onLocationSelect(pos[0], pos[1]);
  };

  return (
    <div className="space-y-3 border border-blue-200 rounded-lg p-4 bg-blue-50">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Map */}
      <div className="h-64 rounded-lg overflow-hidden border border-blue-300">
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
          />
        </MapContainer>
      </div>

      {/* Coordinates Display */}
      {showCoordinates && (
        <div className="text-sm">
          <p className="text-gray-600 mb-2">
            Click on the map to select a location
          </p>
          {lat !== undefined && lng !== undefined ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border border-blue-200">
                <span className="font-medium text-gray-600">Latitude:</span>
                <p className="text-blue-600 font-semibold">{lat.toFixed(6)}</p>
              </div>
              <div className="bg-white p-2 rounded border border-blue-200">
                <span className="font-medium text-gray-600">Longitude:</span>
                <p className="text-blue-600 font-semibold">{lng.toFixed(6)}</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 p-2 bg-white rounded border border-blue-200">
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
            className="text-blue-600 hover:underline text-sm font-medium"
          > 
            {t("map.openInGoogleMaps")}
          </a>
        </div>
      )}
    </div>
  );
};
