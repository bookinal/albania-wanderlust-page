import { useState } from "react";
import PropertiesMap from "../../components/home/data-map/PropertiesMap";
import MapPropertySidebar from "../../components/home/data-map/MapPropertySidebar";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTranslation } from "react-i18next";
import { MapPin, Building2, Car, Compass } from "lucide-react";
import { Hotel } from "@/types/hotel.types";
import { Apartment } from "@/types/apartment.type";
import { Destination } from "@/types/destination.types";

type Selected =
  | { type: "hotel"; data: Hotel }
  | { type: "apartment"; data: Apartment }
  | { type: "destination"; data: Destination }
  | null;

const PropertiesMapPage = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Selected>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900">
      {/* AppBar */}
      <div className="flex-shrink-0 z-50">
        <PrimarySearchAppBar />
      </div>

      {/* Full-screen map area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map fills entire remaining space */}
        <div className="absolute inset-0">
          <PropertiesMap onSelect={setSelected} />
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
