import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
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
} from "lucide-react";
import { Hotel } from "@/types/hotel.types";
import { getHotelById } from "@/services/api/hotelService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import Swal from "sweetalert2";
import { Pool, Spa } from "@mui/icons-material";
import PrimarySearchAppBar from "@/components/home/AppBar";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import { useTranslation } from "react-i18next";

const HotelReservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch hotel data
  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getHotelById(parseInt(id));
        if (!data) {
          setHotel(null);
        } else {
          setHotel(data);
          setImages(data.imageUrls || []);
        }
      } catch (error) {
        console.error("Error fetching hotel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const handleReservation = () => {
    Swal.fire({
      icon: "info",
      title: t("hotel.reservation"),
      text: t("hotel.reservationComingSoon"),
    });
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
            {t("hotel.loadingHotelDetails")}
          </p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-red-600" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {t("hotel.hotelNotFound")}
          </h3>
          <p className="text-gray-500 mb-6">
            {t("hotel.hotelNotFoundDescription")}
          </p>
          <Button
            onClick={() => navigate("/searchResults")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="mr-2" size={16} />
            {t("hotel.backToHotels")}
          </Button>
        </div>
      </div>
    );
  }

  const amenities = [
    { icon: Wifi, label: t("hotel.amenities.freeWifi"), available: hotel.wifi },
    {
      icon: Car,
      label: t("hotel.amenities.parking"),
      available: hotel.parking,
    },
    {
      icon: Dumbbell,
      label: t("hotel.amenities.fitnessCenter"),
      available: hotel.gym,
    },
    {
      icon: UtensilsCrossed,
      label: t("hotel.amenities.restaurant"),
      available: hotel.restaurant,
    },
    { icon: Wine, label: t("hotel.amenities.bar"), available: hotel.bar },
    { icon: Spa, label: t("hotel.amenities.spa"), available: hotel.spa },
    {
      icon: Pool,
      label: t("hotel.amenities.swimmingPool"),
      available: hotel.pool,
    },
  ];

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
          Back to Hotels
        </Button>

        {/* Hero Section with Image Gallery */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="relative">
            {/* Main Image Display */}
            {images.length > 0 ? (
              <div className="relative h-96 sm:h-[500px]">
                <img
                  src={images[photoIndex]}
                  alt={`${hotel.name} - Image ${photoIndex + 1}`}
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
                  {t("hotel.viewAllPhotos", { count: images.length })}
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {photoIndex + 1} / {images.length}
                </div>

                {/* Floating Status Badge */}
                <div className="absolute top-6 right-6">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                      hotel.status === "active"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                    }`}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {hotel.status}
                  </span>
                </div>

                {/* Hotel Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-lg">
                        {hotel.name}
                      </h1>
                      <div className="flex items-center gap-2 text-lg mb-4">
                        <MapPin size={20} />
                        <span className="drop-shadow">{hotel.location}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Star
                            size={20}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span className="font-bold text-lg">
                            {hotel.rating}
                          </span>
                          <span className="text-sm opacity-90">/ 5.0</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Users size={20} />
                          <span className="font-medium">
                            {hotel.occupancy}% occupied
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 sm:h-[500px] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">{t("hotel.noImagesAvailable")}</p>
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
                  {t("hotel.pricePerNight")}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign size={32} className="text-emerald-600" />
                  <span className="text-5xl font-bold text-gray-900">
                    {hotel.price}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {t("hotel.taxesAndFees")}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bed size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">
                      {t("hotel.roomsAvailable")}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">{hotel.rooms}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">
                      {t("hotel.checkIn")}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">2:00 PM</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">
                      {t("hotel.checkOut")}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">12:00 PM</span>
                </div>
              </div>

              <Button
                onClick={handleReservation}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Calendar className="mr-2" size={20} />
                {t("hotel.bookNow")}
              </Button>

              <p className="text-center text-xs text-gray-500 mt-4">
                {t("hotel.freeCancellation")}
              </p>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="text-blue-600" size={24} />
                {t("hotel.aboutThisHotel")}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {hotel.description ||
                  "Experience luxury and comfort at this exceptional hotel. Our dedicated staff ensures your stay is memorable with top-notch service and modern amenities."}
              </p>
            </div>

            {/* Amenities */}
            {amenities.filter((a) => a.available).length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("hotel.amenitiesAndServices")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {amenities
                    .filter((amenity) => amenity.available)
                    .map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <amenity.icon size={24} className="text-blue-600" />
                        <span className="font-medium text-gray-700">
                          {amenity.label}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("hotel.contactInformation")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1 block">
                      {t("hotel.emailAddress")}
                    </Label>
                    <p className="text-gray-900 font-medium break-all">
                      {hotel.contactEmail || "contact@hotel.com"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1 block">
                      {t("hotel.phoneNumber")}
                    </Label>
                    <p className="text-gray-900 font-medium">
                      {hotel.contactPhone || "+1 (555) 123-4567"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl md:col-span-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 mb-1 block">
                      {t("hotel.address")}
                    </Label>
                    <p className="text-gray-900 font-medium">
                      {hotel.address || `${hotel.location}, Complete Address`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Location */}
            {hotel.lat !== undefined && hotel.lng !== undefined && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={24} />
                  {t("hotel.location")}
                </h2>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <MapPicker
                    lat={hotel.lat}
                    lng={hotel.lng}
                    onLocationSelect={() => {}}
                    label=""
                    defaultCenter={[hotel.lat, hotel.lng]}
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

export default HotelReservation;
