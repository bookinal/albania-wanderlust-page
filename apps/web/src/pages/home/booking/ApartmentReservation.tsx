import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Bed,
  DollarSign,
  Home,
  Loader2,
  Calendar,
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
import Swal from "sweetalert2";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { useTheme } from "@/context/ThemeContext";
import { getBookingThemeTokens } from "./bookingTheme";

const ApartmentReservation = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const tk = getBookingThemeTokens({ isDark, isBlue });

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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

    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchApartment();
    fetchUser();
  }, [id]);

  const handleReservation = () => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", `/apartmentBilling/${id}`);
      Swal.fire({
        title: t("auth.loginRequired"),
        text: t("auth.loginToBook"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("auth.login"),
        cancelButtonText: t("common.cancel"),
      }).then((result) => {
        if (result.isConfirmed) navigate("/auth");
      });
      return;
    }
    navigate(`/apartmentBilling/${id}`);
  };

  if (loading) {
    return (
      <div style={{ background: tk.pageBg }} className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 style={{ color: tk.brand }} className="animate-spin mx-auto mb-4" size={48} />
          <p style={{ color: tk.mutedText }} className="font-medium">Loading apartment details...</p>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div style={{ background: tk.pageBg }} className="min-h-screen flex items-center justify-center p-4">
        <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="max-w-md w-full rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: tk.brandSoftStrong }}>
            <Home style={{ color: tk.brand }} size={40} />
          </div>
          <h3 style={{ color: tk.pageText }} className="text-2xl font-bold mb-2">Apartment Not Found</h3>
          <p style={{ color: tk.mutedText }} className="mb-6">The apartment you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/searchResults")}
            style={{ background: tk.brand, color: '#fff' }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} />
            {t("navigation.backToApartments")}
          </button>
        </div>
      </div>
    );
  }

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

  const getStatusColor = () => {
    switch (apartment.status) {
      case "available": return "bg-emerald-500/90 text-white";
      case "rented": return "bg-amber-500/90 text-white";
      case "maintenance": return "bg-red-500/90 text-white";
      default: return "bg-gray-500/90 text-white";
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: tk.pageBg }}>
      <PrimarySearchAppBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate("/searchResults")}
            style={{ background: tk.backBg, color: tk.dimText }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={16} />
            {t("navigation.backToApartments")}
          </button>
          <button
            onClick={() => navigate("/properties-map")}
            style={{ background: tk.backBg, color: tk.dimText }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={16} />
            {t("common.map")}
          </button>
        </div>

        {/* Hero Section */}
        <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-3xl overflow-hidden mb-8">
          <div className="relative">
            {images.length > 0 ? (
              <div className="relative h-96 sm:h-[500px]">
                <img
                  src={images[photoIndex]}
                  alt={`${apartment.name} - Image ${photoIndex + 1}`}
                  onClick={() => setIsOpen(true)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                      style={{ background: isBlue ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)' }}
                    >
                      <ChevronLeft size={24} style={{ color: tk.pageText }} />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((photoIndex + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                      style={{ background: isBlue ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)' }}
                    >
                      <ChevronRight size={24} style={{ color: tk.pageText }} />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold transition-all hover:scale-105"
                  style={{ background: isBlue ? 'rgba(255,255,255,0.96)' : '#ffffff', color: tk.pageText }}
                >
                  <ImageIcon size={20} />
                  View All {images.length} Photos
                </button>

                <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {photoIndex + 1} / {images.length}
                </div>

                <div className="absolute top-6 right-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${getStatusColor()}`}>
                    <CheckCircle2 size={16} className="mr-2" />
                    {apartment.status}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-lg">{apartment.name}</h1>
                      <div className="flex items-center gap-2 text-lg mb-4">
                        <MapPin size={20} />
                        <span className="drop-shadow">{apartment.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Star size={20} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-lg">{apartment.rating}</span>
                          <span className="text-sm opacity-90">/ 5.0</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Home size={20} />
                          <span className="font-medium">{apartment.rooms} {t("searchResults.filters.rooms")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 sm:h-[500px] flex items-center justify-center" style={{ background: tk.statBg }}>
                <p style={{ color: tk.mutedText }}>No images available</p>
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div style={{ background: tk.thumbBg }} className="p-4 overflow-x-auto">
                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setPhotoIndex(index)}
                      style={{
                        outline: index === photoIndex ? `3px solid ${tk.brand}` : `2px solid ${tk.cardBorder}`,
                        opacity: index === photoIndex ? 1 : 0.65,
                        transform: index === photoIndex ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.15s',
                      }}
                      className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden"
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
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
            on={{ view: ({ index }) => setPhotoIndex(index) }}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Reservation Card */}
          <div className="lg:col-span-1">
            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-6 sticky top-8">
              <div className="text-center mb-6">
                <p style={{ color: tk.mutedText }} className="text-sm mb-2">{t("billing.pricePerDay")}</p>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign size={32} className="text-emerald-500" />
                  <span style={{ color: tk.pageText }} className="text-5xl font-bold">{apartment.price}</span>
                </div>
                <p style={{ color: tk.mutedText }} className="text-sm mt-2">+ utilities</p>
              </div>

              <div className="space-y-4 mb-6">
                <div style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }} className="flex items-center justify-between p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Home size={20} style={{ color: tk.brand }} />
                    <span style={{ color: tk.dimText }} className="font-medium">{t("searchResults.filters.rooms")}</span>
                  </div>
                  <span style={{ color: tk.pageText }} className="font-bold">{apartment.rooms}</span>
                </div>

                {apartment.beds !== undefined && (
                  <div style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }} className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bed size={20} style={{ color: tk.brand }} />
                      <span style={{ color: tk.dimText }} className="font-medium">{t("searchResults.filters.beds")}</span>
                    </div>
                    <span style={{ color: tk.pageText }} className="font-bold">{apartment.beds}</span>
                  </div>
                )}

                {apartment.bathrooms !== undefined && (
                  <div style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }} className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bath size={20} style={{ color: tk.brand }} />
                      <span style={{ color: tk.dimText }} className="font-medium">{t("searchResults.filters.bathrooms")}</span>
                    </div>
                    <span style={{ color: tk.pageText }} className="font-bold">{apartment.bathrooms}</span>
                  </div>
                )}

                {apartment.kitchens !== undefined && (
                  <div style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }} className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ChefHat size={20} style={{ color: tk.brand }} />
                      <span style={{ color: tk.dimText }} className="font-medium">{t("searchResults.filters.kitchens")}</span>
                    </div>
                    <span style={{ color: tk.pageText }} className="font-bold">{apartment.kitchens}</span>
                  </div>
                )}

                {apartment.livingRooms !== undefined && (
                  <div style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }} className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Sofa size={20} style={{ color: tk.brand }} />
                      <span style={{ color: tk.dimText }} className="font-medium">{t("searchResults.filters.livingRooms")}</span>
                    </div>
                    <span style={{ color: tk.pageText }} className="font-bold">{apartment.livingRooms}</span>
                  </div>
                )}
              </div>

              {apartment.status === "rented" && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-medium text-amber-500">{t("booking.currentlyRented")}</span>
                </div>
              )}

              <button
                onClick={handleReservation}
                disabled={apartment.status === "maintenance" || apartment.status === "review"}
                style={{
                  background: (apartment.status === "maintenance" || apartment.status === "review") ? tk.statBg : tk.brand,
                  color: (apartment.status === "maintenance" || apartment.status === "review") ? tk.mutedText : '#fff',
                  cursor: (apartment.status === "maintenance" || apartment.status === "review") ? 'not-allowed' : 'pointer',
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-opacity hover:opacity-90"
              >
                <Calendar size={20} />
                {apartment.status === "maintenance" || apartment.status === "review"
                  ? t("booking.underMaintenance")
                  : t("booking.bookNow")}
              </button>

              {(apartment.status === "available" || apartment.status === "rented") && (
                <p style={{ color: tk.mutedText }} className="text-center text-xs mt-4">{t("billing.flexibleCancellation")}</p>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-8">
              <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Home style={{ color: tk.brand }} size={24} />
                {t("billing.aboutThisApartment")}
              </h2>
              <p style={{ color: tk.dimText }} className="leading-relaxed text-lg">
                {apartment.description || "A beautiful and comfortable apartment perfect for your needs. This property offers modern amenities and a great location for convenient living."}
              </p>
            </div>

            {/* Amenities */}
            {availableAmenities.length > 0 && (
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-8">
                <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-6">{t("billing.featuresAndEquipment")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {availableAmenities.map((amenity, index) => (
                    <div key={index} style={{ background: tk.amenityBg }} className="flex items-center gap-3 p-4 rounded-xl hover:opacity-90 transition-opacity">
                      {amenity.icon && <amenity.icon size={24} style={{ color: tk.brand }} />}
                      <span style={{ color: tk.dimText }} className="font-medium">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }} className="rounded-xl p-6">
              <AvailabilityCalendar propertyId={parseInt(id!)} propertyType="apartment" />
            </div>

            {/* Guest Reviews */}
            <ReviewsSection propertyId={parseInt(id!)} propertyType="apartment" />

            {/* Map Location */}
            {apartment.lat !== undefined && apartment.lng !== undefined && (
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-8">
                <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MapPin style={{ color: tk.brand }} size={24} />
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
