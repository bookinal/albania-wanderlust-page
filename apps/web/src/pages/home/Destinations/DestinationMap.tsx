import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLocalized } from "@/hooks/useLocalized";
import { Destination } from "@/types/destination.types";
import { useTheme } from "@/context/ThemeContext";

interface DestinationMapProps {
  destinations: Destination[];
}

function createMapMarker(label: string, isDark: boolean, isBlue: boolean): L.DivIcon {
  const bg = isBlue ? "#f0f9ff" : "white";
  const border = isBlue ? "#0f4c81" : "#374151";
  const text = isBlue ? "#082f49" : "#111111";

  const html = `
    <div style="
      transform:translate(-50%,-100%);
      display:inline-flex;
      flex-direction:column;
      align-items:center;
    ">
      <div style="
        background:${bg};
        border:2.5px solid ${border};
        border-radius:20px;
        padding:4px 10px;
        font-size:12px;
        font-weight:700;
        white-space:nowrap;
        color:${text};
        display:flex;
        align-items:center;
        gap:5px;
        box-shadow:0 2px 8px rgba(0,0,0,0.28);
        font-family:system-ui,-apple-system,sans-serif;
      "
      >
        <span>📍</span>
        <span>${label}</span>
      </div>
      <div style="
        width:0;
        height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:8px solid ${border};
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

export default function DestinationMap({ destinations }: DestinationMapProps) {
  const { localize } = useLocalized();
  const { isDark, isBlue } = useTheme();

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: "1.5rem", overflow: "hidden" }}>
      <MapContainer
        center={ALBANIA_CENTER}
        zoom={7}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {destinations.map(
          (destination, index) =>
            typeof destination.lat === "number" &&
            typeof destination.lng === "number" && (
              <Marker
                key={destination.id}
                position={[destination.lat, destination.lng]}
                icon={createMapMarker((index + 1).toString(), isDark, isBlue)}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.92}>
                  {localize(destination.name)}
                </Tooltip>
              </Marker>
            ),
        )}
      </MapContainer>
    </div>
  );
}
