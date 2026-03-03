import {
  Fuel,
  Users,
  Gauge,
  MapPin,
  Settings,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface CarCardProps {
  id: number;
  name: string;
  brand: string;
  type: "Sedan" | "SUV" | "Sports";
  year: number;
  transmission: "Manual" | "Automatic";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  seats: number;
  mileage: number;
  pricePerDay: number;
  currentMonthPrice?: number; // Dynamic price based on current month
  status: "available" | "rented" | "maintenance" | "review";
  color: string;
  plateNumber: string;
  features?: string[];
  imageUrls?: string[];
  pickUpLocation: string;
  onClick: (id: number) => void;
}

/**
 * Reusable car card component for car rentals
 */
export const CarCard = ({
  id,
  name,
  brand,
  type,
  year,
  transmission,
  fuelType,
  seats,
  mileage,
  pricePerDay,
  currentMonthPrice,
  status,
  color,
  features = [],
  imageUrls,
  pickUpLocation,
  onClick,
}: CarCardProps) => {
  const { t } = useTranslation();
  // Use current month price if available, otherwise fall back to base price

  const displayPrice = currentMonthPrice ?? pricePerDay;
  const hasSeasonalPrice =
    currentMonthPrice !== undefined && currentMonthPrice !== pricePerDay;
  const isPriceHigher = hasSeasonalPrice && currentMonthPrice > pricePerDay;
  const isPriceLower = hasSeasonalPrice && currentMonthPrice < pricePerDay;
  const isAvailable = status.toLowerCase() === "available";

  const getStatusVariant = () => {
    switch (status.toLowerCase()) {
      case "available":
        return "default";
      case "rented":
        return "secondary";
      case "maintenance":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = () => {
    switch (status.toLowerCase()) {
      case "available":
        return "Available";
      case "rented":
        return "Rented";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  // Get first 3 features for preview
  const displayFeatures =
    features && features.length > 0 ? features.slice(0, 3) : [];

  return (
    <Card
      onClick={() => onClick(id)}
      className="cursor-pointer overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-200 h-48 w-full">
        <img
          src={imageUrls[0]}
          alt={`${brand} ${name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={getStatusVariant()} className="capitalize">
            {getStatusLabel()}
          </Badge>
        </div>

        {/* Car Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90">
            {type}
          </Badge>
        </div>

        {/* Year Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="bg-white/90">
            {year}
          </Badge>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand and Name */}
        <div className="mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {brand}
          </p>
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
        </div>

        {/* Pickup Location */}
        {pickUpLocation && (
          <p className="text-sm text-gray-600 flex items-start gap-1 mb-3 line-clamp-1">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{pickUpLocation}</span>
          </p>
        )}

        {/* Car Specs */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{seats} {t("home.carsPreview.seats")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-4 h-4 text-gray-500" />
            <span>{transmission}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-4 h-4 text-gray-500" />
            <span>{fuelType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4 text-gray-500" />
            <span>{mileage.toLocaleString()} km</span>
          </div>
        </div>

        {/* Features Preview */}
        {displayFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayFeatures.map((feature, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{features.length - 3} {t("home.carsPreview.more")}
              </Badge>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">{t("billing.pricePerDay")}</span>
              {isPriceHigher && (
                <div title="Peak season pricing">
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                </div>
              )}
              {isPriceLower && (
                <div title="Off-season discount">
                  <TrendingDown className="w-3 h-3 text-green-500" />
                </div>
              )}
            </div>
            <div className="text-right">
              <span
                className={`text-lg font-bold ${isPriceLower ? "text-green-600" : "text-red-600"}`}
              >
                €{displayPrice}
              </span>
              {hasSeasonalPrice && (
                <span className="text-xs text-gray-400 line-through ml-1">
                  €{pricePerDay}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
