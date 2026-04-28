import { Destination } from "@/types/destination.types";
import { MapPin, Compass } from "lucide-react";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "../homeTheme";

interface DestinationPopupProps {
  destination: Destination;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Adventure: { bg: "bg-orange-100", text: "text-orange-800" },
  Historic: { bg: "bg-amber-100", text: "text-amber-800" },
  Beach: { bg: "bg-cyan-100", text: "text-cyan-800" },
};

export function DestinationPopup({ destination }: DestinationPopupProps) {
  const { localize } = useLocalized();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const categoryStyle = categoryColors[destination.category] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return (
    <div className="w-64 space-y-3" style={{ color: isDark ? '#f5f5f5' : isBlue ? 'hsl(212 48% 18%)' : '#111115' }}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-base">
            {localize(destination.name)}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
          >
            {destination.category}
          </span>
        </div>
        {destination.imageUrls && destination.imageUrls.length > 0 && (
          <img
            src={destination.imageUrls[0]}
            alt={localize(destination.name)}
            className="w-full h-32 object-cover rounded-md my-2"
          />
        )}
      </div>

      <div className="space-y-2 text-sm">
        {localize(destination.description) && (
          <p className="line-clamp-3" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : isBlue ? 'hsl(211 22% 42%)' : '#4b5563' }}>
            {localize(destination.description)}
          </p>
        )}

        {destination.lat && destination.lng && (
          <p className="flex items-center gap-1 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : isBlue ? 'hsl(211 22% 42%)' : '#6b7280' }}>
            <MapPin className="w-3 h-3" />
            {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: homeTk.brandBorder }}>
        <Compass className="w-4 h-4" style={{ color: homeTk.brand }} />
        <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : isBlue ? 'hsl(211 22% 42%)' : '#4b5563' }}>
          Explore this {destination.category.toLowerCase()} destination
        </span>
      </div>
    </div>
  );
}
