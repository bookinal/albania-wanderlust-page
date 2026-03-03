import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Loader2,
  Calendar,
  Car as CarIcon,
  Gauge,
  Fuel,
  Users,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
  Palette,
  Hash,
  Package,
  MapPinned,
  TrendingUp,
} from "lucide-react";
import { Car } from "@/types/car.types";
import { Month, MONTHS, MONTH_NAMES } from "@/types/price.type";
import { getCarById } from "@/services/api/carService";
import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";
import { useTranslation } from "react-i18next";

// Helper to get current month as Month type
const getCurrentMonth = (): Month => {
  const monthIndex = new Date().getMonth();
  return MONTHS[monthIndex];
};
import { MapPicker } from "@/components/dashboard/mapPicker";
import PrimarySearchAppBar from "@/components/home/AppBar";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import ReviewsSection from "@/components/reviews/ReviewsSection";

const CarReservation = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch car data
  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getCarById(parseInt(id));
        if (!data) {
          setCar(null);
        } else {
          setCar(data);
          // If car has a single image string, convert to array
          setImages(data.imageUrls || []);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleReservation = () => {
    // navigate to /carBilling/{id}
    navigate(`/carBilling/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600 font-medium">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CarIcon className="text-red-600" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Car Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The car you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate("/searchCarResults")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="mr-2" size={16} />
            {t("navigation.backToCars")}
          </Button>
        </div>
      </div>
    );
  }

  // Get status badge color
  const getStatusColor = () => {
    switch (car.status) {
      case "available":
        return "bg-emerald-500/90 text-white";
      case "rented":
        return "bg-amber-500/90 text-white";
      case "maintenance":
        return "bg-red-500/90 text-white";
      default:
        return "bg-gray-500/90 text-white";
    }
  };

  // Get fuel type icon
  const getFuelIcon = () => {
    switch (car.fuelType) {
      case "Electric":
        return Zap;
      case "Hybrid":
        return Zap;
      default:
        return Fuel;
    }
  };

  const FuelIcon = getFuelIcon();

  // Get type badge color
  const getTypeColor = () => {
    switch (car.type) {
      case "Sports":
        return "bg-red-500/90 text-white";
      case "SUV":
        return "bg-blue-500/90 text-white";
      case "Sedan":
        return "bg-purple-500/90 text-white";
      default:
        return "bg-gray-500/90 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <PrimarySearchAppBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/searchCarResults")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2" size={16} />
          {t("navigation.backToCars")}
        </Button>

        {/* Hero Section with Image Gallery */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="relative">
            {/* Main Image Display */}
            {images.length > 0 ? (
              <div className="relative h-96 sm:h-[500px]">
                <img
                  src={images[photoIndex]}
                  alt={`${car.name} - Image ${photoIndex + 1}`}
                  onClick={() => setIsOpen(true)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setPhotoIndex(
                          (photoIndex + images.length - 1) % images.length,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft size={24} className="text-gray-900" />
                    </button>
                    <button
                      onClick={() =>
                        setPhotoIndex((photoIndex + 1) % images.length)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight size={24} className="text-gray-900" />
                    </button>
                  </>
                )}

                {/* View All Photos Button */}
                {images.length > 1 && (
                  <button
                    onClick={() => setIsOpen(true)}
                    className="absolute bottom-6 right-6 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-gray-900 transition-all hover:scale-105"
                  >
                    <ImageIcon size={20} />
                    View All {images.length} Photos
                  </button>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    {photoIndex + 1} / {images.length}
                  </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${getStatusColor()}`}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {car.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${getTypeColor()}`}
                  >
                    <Package size={16} className="mr-2" />
                    {car.type}
                  </span>
                </div>

                {/* Car Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-lg font-semibold mb-2 opacity-90">
                        {car.brand}
                      </div>
                      <h1 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-lg">
                        {car.name}
                      </h1>
                      <div className="flex items-center gap-2 text-lg mb-4">
                        <MapPin size={20} />
                        <span className="drop-shadow">
                          {car.pickUpLocation ||
                            "Pick-up location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Calendar size={18} />
                          <span className="font-medium text-sm">
                            {car.year}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Settings size={18} />
                          <span className="font-medium text-sm">
                            {car.transmission}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <FuelIcon size={18} />
                          <span className="font-medium text-sm">
                            {car.fuelType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Users size={18} />
                          <span className="font-medium text-sm">
                            {car.seats} {t("searchResults.cars.seats")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 sm:h-[500px] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-4 bg-gray-50 overflow-x-auto">
                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setPhotoIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all ${
                        index === photoIndex
                          ? "ring-4 ring-blue-600 scale-105"
                          : "ring-2 ring-gray-300 hover:ring-blue-400 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        {isOpen && images.length > 0 && (
          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            index={photoIndex}
            slides={images.map((src) => ({ src }))}
            plugins={[Zoom, Fullscreen]}
            on={{
              view: ({ index }) => setPhotoIndex(index),
            }}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Reservation Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-gray-100">
              {(() => {
                const currentMonth = getCurrentMonth();
                const monthlyPrice = car.monthlyPrices?.find(
                  (p) => p.month === currentMonth,
                );
                const displayPrice =
                  monthlyPrice?.pricePerDay ?? car.pricePerDay;
                const hasSeasonalPrice =
                  monthlyPrice && monthlyPrice.pricePerDay !== car.pricePerDay;

                return (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-gray-600 text-sm">{t("billing.pricePerDay")}</p>
                      {hasSeasonalPrice && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <TrendingUp size={12} />
                          {MONTH_NAMES[currentMonth]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign size={32} className="text-emerald-600" />
                      <span className="text-5xl font-bold text-gray-900">
                        {displayPrice}
                      </span>
                    </div>
                    {hasSeasonalPrice && (
                      <p className="text-gray-400 text-sm mt-1 line-through">
                        Base: ${car.pricePerDay}/day
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">+ {t("billing.insurance")}</p>
                  </div>
                );
              })()}

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Gauge size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">{t("searchResults.cars.Mileage")}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {car.mileage.toLocaleString()} km
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">{t("searchResults.cars.seats")}</span>
                  </div>
                  <span className="font-bold text-gray-900">{car.seats}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Palette size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">{t("searchResults.cars.color")}</span>
                  </div>
                  <span className="font-bold text-gray-900 capitalize">
                    {car.color}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Hash size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">{t("searchResults.cars.plate")}</span>
                  </div>
                  <span className="font-bold text-gray-900 font-mono">
                    {car.plateNumber}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleReservation}
                disabled={car.status !== "available"}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="mr-2" size={20} />
                {car.status === "available"
                  ? t("booking.bookNow")
                  : car.status === "rented"
                    ? "Currently Rented"
                    : "Under Maintenance"}
              </Button>

              {car.status === "available" && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  {t("billing.flexibleCancellation")}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Specifications */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CarIcon className="text-blue-600" size={24} />
                {t("billing.vehicleSpecifications")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {t("searchResults.cars.brand")}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {car.brand}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {t("searchResults.cars.year")}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {car.year}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {t("searchResults.filters.carType")}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {car.type}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {t("searchResults.filters.transmission")}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {car.transmission}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {t("searchResults.filters.fuelType")}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {car.fuelType}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {t("searchResults.cars.seats")}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {car.seats} Persons
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("billing.featuresAndEquipment")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <CheckCircle2
                        size={20}
                        className="text-blue-600 flex-shrink-0"
                      />
                      <span className="font-medium text-gray-700 capitalize">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pick-up Location */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("billing.pickUpAndContactInformation")}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPinned size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1 block">
                      {t("billing.pickUpLocation")}
                    </Label>
                    <p className="text-gray-900 font-medium">
                      {car.pickUpLocation || "Location not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CarIcon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1 block">
                      Provider ID
                    </Label>
                    <p className="text-gray-900 font-medium font-mono">
                      {car.providerId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Location */}
            {car.lat !== undefined && car.lng !== undefined && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={24} />
                  {t("map.locationOnMap")}
                </h2>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <MapPicker
                    lat={car.lat}
                    lng={car.lng}
                    onLocationSelect={() => {}}
                    label=""
                    defaultCenter={[car.lat, car.lng]}
                    defaultZoom={15}
                    showCoordinates={false}
                    openOnGoogleMaps={true}
                  />
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <AvailabilityCalendar
                propertyId={parseInt(id!)}
                propertyType="car"
              />
            </div>

            {/* Guest Reviews */}
            <ReviewsSection propertyId={parseInt(id!)} propertyType="car" />

            {/* Rental Terms */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("billing.rentalTermsAndConditions")}
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <span>{t("terms.minimumRentalPeriod")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <span>{t("terms.validDriversLicense")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <span>{t("terms.fullInsuranceCoverageIncluded")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <span>{t("terms.24/7RoadsideAssistance")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <span>{t("terms.freeCancellation")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarReservation;
