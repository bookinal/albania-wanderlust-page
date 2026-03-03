import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  MapPin,
  Star,
  Bed,
  DollarSign,
  Mail,
  Phone,
  Home,
  Loader2,
  Calendar,
  Clock,
  Wifi,
  Car,
  Dumbbell,
  Wine,
  UtensilsCrossed,
  CheckCircle2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Bath,
  ChefHat,
  Sofa,
  AirVent,
  Flame,
  Tv,
  Briefcase,
  Shield,
  Building,
  Wind,
} from "lucide-react";
import { Apartment, PREDEFINED_AMENITIES } from "@/types/apartment.type";
import { getApartmentById } from "@/services/api/apartmentService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { Pool, Spa } from "@mui/icons-material";
import PrimarySearchAppBar from "@/components/home/AppBar";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import { useTranslation } from "react-i18next";
import ReviewsSection from "@/components/reviews/ReviewsSection";

const ApartmentReservation = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch apartment data
  useEffect(() => {
    const fetchApartment = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getApartmentById(parseInt(id));
        if (!data) {
          setApartment(null);
        } else {
          setApartment(data);
          setImages(data.imageUrls || []);
        }
      } catch (error) {
        console.error("Error fetching apartment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  const handleReservation = () => {
    navigate(`/apartmentBilling/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600 font-medium">
            Loading apartment details...
          </p>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-red-600" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Apartment Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The apartment you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate("/searchResults")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="mr-2" size={16} />
            {t("navigation.backToApartments")}
          </Button>
        </div>
      </div>
    );
  }

  // Parse amenities from string array using PREDEFINED_AMENITIES
  const amenitiesMap: { [key: string]: { icon?: any; label: string } } = {
    WiFi: { icon: Wifi, label: "WiFi" },
    "Air Conditioning": { icon: AirVent, label: "Air Conditioning" },
    Heating: { icon: Flame, label: "Heating" },
    Parking: { icon: Car, label: "Parking" },
    Elevator: { icon: Building, label: "Elevator" },
    Kitchen: { icon: ChefHat, label: "Kitchen" },
    "Washing Machine": { label: "Washing Machine" },
    TV: { icon: Tv, label: "TV" },
    Workspace: { icon: Briefcase, label: "Workspace" },
    Balcony: { icon: Wind, label: "Balcony" },
    Pool: { icon: Pool, label: "Pool" },
    Security: { icon: Shield, label: "Security" },
  };

  const availableAmenities = (apartment.amenities || [])
    .map((amenity) => amenitiesMap[amenity])
    .filter(Boolean);

  // Get status badge color
  const getStatusColor = () => {
    switch (apartment.status) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <PrimarySearchAppBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/searchResults")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2" size={16} />
          {t("navigation.backToApartments")}
        </Button>

        {/* Hero Section with Image Gallery */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="relative">
            {/* Main Image Display */}
            {images.length > 0 ? (
              <div className="relative h-96 sm:h-[500px]">
                <img
                  src={images[photoIndex]}
                  alt={`${apartment.name} - Image ${photoIndex + 1}`}
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
                <button
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-gray-900 transition-all hover:scale-105"
                >
                  <ImageIcon size={20} />
                  View All {images.length} Photos
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {photoIndex + 1} / {images.length}
                </div>

                {/* Floating Status Badge */}
                <div className="absolute top-6 right-6">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${getStatusColor()}`}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {apartment.status}
                  </span>
                </div>

                {/* Apartment Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-lg">
                        {apartment.name}
                      </h1>
                      <div className="flex items-center gap-2 text-lg mb-4">
                        <MapPin size={20} />
                        <span className="drop-shadow">
                          {apartment.location || "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Star
                            size={20}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span className="font-bold text-lg">
                            {apartment.rating}
                          </span>
                          <span className="text-sm opacity-90">/ 5.0</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Home size={20} />
                          <span className="font-medium">
                            {apartment.rooms} {t("searchResults.filters.rooms")}
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
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm mb-2">
                  {t("billing.pricePerDay")}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign size={32} className="text-emerald-600" />
                  <span className="text-5xl font-bold text-gray-900">
                    {apartment.price}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">+ utilities</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Home size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">
                      {t("searchResults.filters.rooms")}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {apartment.rooms}
                  </span>
                </div>

                {apartment.beds !== undefined && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bed size={20} className="text-blue-600" />
                      <span className="font-medium text-gray-700">
                        {t("searchResults.filters.beds")}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {apartment.beds}
                    </span>
                  </div>
                )}

                {apartment.bathrooms !== undefined && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bath size={20} className="text-blue-600" />
                      <span className="font-medium text-gray-700">
                        {t("searchResults.filters.bathrooms")}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {apartment.bathrooms}
                    </span>
                  </div>
                )}

                {apartment.kitchens !== undefined && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ChefHat size={20} className="text-blue-600" />
                      <span className="font-medium text-gray-700">
                        {t("searchResults.filters.kitchens")}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {apartment.kitchens}
                    </span>
                  </div>
                )}

                {apartment.livingRooms !== undefined && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Sofa size={20} className="text-blue-600" />
                      <span className="font-medium text-gray-700">
                        {t("searchResults.filters.livingRooms")}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {apartment.livingRooms}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleReservation}
                disabled={apartment.status !== "available"}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="mr-2" size={20} />
                {apartment.status === "available"
                  ? t("booking.bookNow")
                  : apartment.status === "rented"
                    ? "Already Rented"
                    : "Under Maintenance"}
              </Button>

              {apartment.status === "available" && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  {t("billing.flexibleCancellation")}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="text-blue-600" size={24} />
                {t("billing.aboutThisApartment")}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {apartment.description ||
                  "A beautiful and comfortable apartment perfect for your needs. This property offers modern amenities and a great location for convenient living."}
              </p>
            </div>

            {/* Amenities */}
            {availableAmenities.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("billing.featuresAndEquipment")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {availableAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-shadow"
                    >
                      {amenity.icon && (
                        <amenity.icon size={24} className="text-blue-600" />
                      )}
                      <span className="font-medium text-gray-700">
                        {amenity.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <AvailabilityCalendar
                propertyId={parseInt(id!)}
                propertyType="apartment"
              />
            </div>

            {/* Guest Reviews */}
            <ReviewsSection
              propertyId={parseInt(id!)}
              propertyType="apartment"
            />

            {/* Map Location */}
            {apartment.lat !== undefined && apartment.lng !== undefined && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={24} />
                  {t("map.locationOnMap")}
                </h2>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <MapPicker
                    lat={apartment.lat}
                    lng={apartment.lng}
                    onLocationSelect={() => {}}
                    label=""
                    defaultCenter={[apartment.lat, apartment.lng]}
                    defaultZoom={15}
                    showCoordinates={false}
                    openOnGoogleMaps={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentReservation;
