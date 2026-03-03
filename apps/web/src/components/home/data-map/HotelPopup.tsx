import { Hotel } from "@/types/hotel.types";
import { Link } from "react-router-dom";

interface HotelPopupProps {
  hotel: Hotel;
}

export function HotelPopup({ hotel }: HotelPopupProps) {
  return (
    <div className="w-64 space-y-3">
      <div>
        <h3 className="font-semibold text-base">{hotel.name}</h3>
        <img 
          src={hotel.imageUrls[0]}
          alt={hotel.name}
          className="w-full h-32 object-cover rounded-md my-2"
        />
        <p className="text-sm text-gray-600">{hotel.location}</p>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <span className="font-medium">Price:</span> €{hotel.price} / night
        </p>
        <p>
          <span className="font-medium">Rooms:</span> {hotel.rooms}
        </p>
        <p>
          <span className="font-medium">Occupancy:</span> {hotel.occupancy}{" "}
          guests
        </p>
        {hotel.rating && (
          <p className="text-yellow-600">
            <span className="font-medium">Rating:</span> ★ {hotel.rating}
          </p>
        )}
        {hotel.status && (
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                hotel.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {hotel.status}
            </span>
          </p>
        )}
      </div>

      {hotel.amenities && hotel.amenities.length > 0 && (
        <div>
          <p className="font-medium text-sm mb-1">Amenities:</p>
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <Link to={`/hotelReservation/${hotel.id}`}>
        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
          Book Now
        </button>
      </Link>
    </div>
  );
}
