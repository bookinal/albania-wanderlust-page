import { Hotel } from "@/types/hotel.types";
import { Apartment } from "@/types/apartment.type";
import { Destination } from "@/types/destination.types";
import { Link } from "react-router-dom";
import {
  X,
  MapPin,
  Star,
  BedDouble,
  Users,
  DollarSign,
  Compass,
  Tag,
  Wifi,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalized } from "@/hooks/useLocalized";

type Selected =
  | { type: "hotel"; data: Hotel }
  | { type: "apartment"; data: Apartment }
  | { type: "destination"; data: Destination }
  | null;

interface MapPropertySidebarProps {
  selected: Selected;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  Adventure: "bg-orange-100 text-orange-700 border-orange-200",
  Historic: "bg-amber-100 text-amber-700 border-amber-200",
  Beach: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

/* ─── Hotel Panel ─────────────────────────────────────────── */
function HotelPanel({ hotel }: { hotel: Hotel }) {
  return (
    <>
      {/* Image */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
        {hotel.imageUrls?.[0] ? (
          <img
            src={hotel.imageUrls[0]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-blue-50 flex items-center justify-center">
            <BedDouble className="w-12 h-12 text-blue-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
            Hotel
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Name + location */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {hotel.name}
          </h2>
          {hotel.location && (
            <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {hotel.location}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {hotel.price && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-500 font-medium mb-0.5">
                Price / night
              </p>
              <p className="text-lg font-bold text-blue-700">€{hotel.price}</p>
            </div>
          )}
          {hotel.rating && (
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs text-yellow-500 font-medium mb-0.5">
                Rating
              </p>
              <p className="text-lg font-bold text-yellow-700 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {hotel.rating}
              </p>
            </div>
          )}
          {hotel.rooms && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Rooms</p>
              <p className="text-lg font-bold text-gray-700 flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-gray-400" />
                {hotel.rooms}
              </p>
            </div>
          )}
          {hotel.occupancy && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                Capacity
              </p>
              <p className="text-lg font-bold text-gray-700 flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                {hotel.occupancy} guests
              </p>
            </div>
          )}
        </div>

        {/* Status */}
        {hotel.status && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                hotel.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {hotel.status === "active" ? "● Available" : hotel.status}
            </span>
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Amenities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hotel.amenities.slice(0, 6).map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                >
                  <Wifi className="w-3 h-3" />
                  {a}
                </span>
              ))}
              {hotel.amenities.length > 6 && (
                <span className="text-xs text-gray-400 self-center">
                  +{hotel.amenities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <Link to={`/hotelReservation/${hotel.id}`} className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl shadow-md">
            Book Now
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </>
  );
}

/* ─── Apartment Panel ─────────────────────────────────────── */
function ApartmentPanel({ apartment }: { apartment: Apartment }) {
  return (
    <>
      {/* Image */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
        {apartment.imageUrls?.[0] ? (
          <img
            src={apartment.imageUrls[0]}
            alt={apartment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-purple-50 flex items-center justify-center">
            <BedDouble className="w-12 h-12 text-purple-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
            Apartment
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {apartment.name}
          </h2>
          {apartment.location && (
            <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {apartment.location}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {apartment.price && (
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs text-purple-500 font-medium mb-0.5">
                Price / night
              </p>
              <p className="text-lg font-bold text-purple-700">
                €{apartment.price}
              </p>
            </div>
          )}
          {apartment.rating && (
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs text-yellow-500 font-medium mb-0.5">
                Rating
              </p>
              <p className="text-lg font-bold text-yellow-700 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {apartment.rating}
              </p>
            </div>
          )}
          {apartment.rooms && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Rooms</p>
              <p className="text-lg font-bold text-gray-700 flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-gray-400" />
                {apartment.rooms}
              </p>
            </div>
          )}
          {apartment.status && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Status</p>
              <span
                className={`text-sm font-semibold ${
                  apartment.status === "available"
                    ? "text-emerald-600"
                    : "text-gray-500"
                }`}
              >
                {apartment.status === "available"
                  ? "● Available"
                  : apartment.status}
              </span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {apartment.amenities && apartment.amenities.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Amenities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {apartment.amenities.slice(0, 6).map((a, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100"
                >
                  {a}
                </span>
              ))}
              {apartment.amenities.length > 6 && (
                <span className="text-xs text-gray-400 self-center">
                  +{apartment.amenities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <Link to={`/apartmentReservation/${apartment.id}`} className="block">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 rounded-xl shadow-md">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </>
  );
}

/* ─── Destination Panel ───────────────────────────────────── */
function DestinationPanel({ destination }: { destination: Destination }) {
  const { localize } = useLocalized();
  const categoryStyle =
    categoryColors[destination.category] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <>
      {/* Image */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
        {destination.imageUrls?.[0] ? (
          <img
            src={destination.imageUrls[0]}
            alt={localize(destination.name)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-violet-50 flex items-center justify-center">
            <Compass className="w-12 h-12 text-violet-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle}`}
          >
            <Tag className="w-3 h-3" />
            {destination.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {localize(destination.name)}
          </h2>
          {destination.lat && destination.lng && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
            </p>
          )}
        </div>

        {localize(destination.description) && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">About</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {localize(destination.description)}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
          <Compass className="w-6 h-6 text-violet-500 flex-shrink-0" />
          <p className="text-sm text-violet-700 font-medium">
            Explore this {destination.category.toLowerCase()} destination in
            Albania
          </p>
        </div>
      </div>
    </>
  );
}

/* ─── Main Sidebar ────────────────────────────────────────── */
export default function MapPropertySidebar({
  selected,
  onClose,
}: MapPropertySidebarProps) {
  const isOpen = !!selected;

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[1099] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`
          fixed lg:absolute top-0 right-0 h-full w-full sm:w-96
          bg-white shadow-2xl z-[1100]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {selected?.type === "hotel" && (
          <HotelPanel hotel={selected.data as Hotel} />
        )}
        {selected?.type === "apartment" && (
          <ApartmentPanel apartment={selected.data as Apartment} />
        )}
        {selected?.type === "destination" && (
          <DestinationPanel destination={selected.data as Destination} />
        )}
      </div>
    </>
  );
}
