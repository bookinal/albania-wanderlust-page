import { Star, MapPin, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyCardProps } from "@/types/search.types";

/**
 * Reusable property card component for hotels and apartments
 */
export const PropertyCard = ({
  id,
  name,
  image,
  rating,
  price,
  location,
  address,
  rooms,
  amenities = [],
  status,
  propertyType,
  onClick,
}: PropertyCardProps) => {
  const isAvailable =
    propertyType === "hotel"
      ? status?.toLowerCase() === "active"
      : status?.toLowerCase() === "available";

  const priceLabel = propertyType === "hotel" ? "per night" : "per day";

  // Get first 3 amenities for preview
  const displayAmenities =
    amenities && amenities.length > 0 ? amenities.slice(0, 3) : [];

  return (
    <Card
      onClick={() => onClick(id)}
      className="cursor-pointer overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-200 h-48 w-full">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isAvailable ? "default" : "destructive"}
            className="capitalize"
          >
            {isAvailable ? "Available" : "Not Available"}
          </Badge>
        </div>

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90">
            {propertyType === "hotel" ? "Hotel" : "Apartment"}
          </Badge>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name and Rating */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-grow">
            {name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Location */}
        {(location || address) && (
          <p className="text-sm text-gray-600 flex items-start gap-1 mb-3 line-clamp-1">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{location || address}</span>
          </p>
        )}

        {/* Rooms Info */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
          <Zap className="w-4 h-4" />
          <span>
            {rooms} room{rooms !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Amenities Preview */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayAmenities.map((amenity, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">{priceLabel}</span>
            <span className="text-lg font-bold text-blue-600">€{price}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
