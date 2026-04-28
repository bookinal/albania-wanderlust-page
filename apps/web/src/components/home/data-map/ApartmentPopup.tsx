import { Apartment } from "@/types/apartment.type";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "../homeTheme";

interface ApartmentPopupProps {
  apartment: Apartment;
}

export function ApartmentPopup({ apartment }: ApartmentPopupProps) {
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  return (
    <div className="w-64 space-y-3" style={{ color: isDark ? '#f5f5f5' : isBlue ? 'hsl(212 48% 18%)' : '#111115' }}>
      <div>
        <h3 className="font-semibold text-base">{apartment.name}</h3>
        <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : isBlue ? 'hsl(211 22% 42%)' : '#6b6663' }}>{apartment.location}</p>
      </div>
      <img
        src={apartment.imageUrls[0]}
        className="w-full h-32 object-cover rounded-md"
      />

      <div className="space-y-1 text-sm">
        {apartment.price && (
          <p>
            <span className="font-medium">Price:</span> €{apartment.price} /
            night
          </p>
        )}
        {apartment.rooms && (
          <p>
            <span className="font-medium">Rooms:</span> {apartment.rooms}
          </p>
        )}
        {apartment.rating && (
          <p className="text-yellow-600">
            <span className="font-medium">Rating:</span> ★ {apartment.rating}
          </p>
        )}
        {apartment.status && (
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                apartment.status === "available"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {apartment.status}
            </span>
          </p>
        )}
      </div>

      <Link to={`/apartmentReservation/${apartment.id}`}>
         <button className="w-full text-white px-4 py-2 rounded-md transition font-medium text-sm" style={{ background: homeTk.brand }}>
           View Details
         </button>
      </Link>
    </div>
  );
}
