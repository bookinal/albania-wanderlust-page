import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Bed,
  DollarSign,
  Mail,
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
import { useTheme } from "@/context/ThemeContext";

const HotelReservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? "#0d0d0d" : "#f5f4f1",
    pageText: isDark ? "#ffffff" : "#111115",
    cardBg: isDark ? "#111115" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#ede9e5",
    cardShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(15,23,42,0.08)",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : "#6b6663",
    dimText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    statBg: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
    statBorder: isDark ? "rgba(255,255,255,0.07)" : "#e5e2de",
    thumbBg: isDark ? "#0a0a0a" : "#f0ece8",
    amenityBg: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
    backBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    iconCircle: isDark ? "rgba(232,25,44,0.12)" : "#fef2f2",
  };

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

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
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: tk.pageBg }}
      >
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: "#E8192C" }}
          />
          <p style={{ color: tk.mutedText, fontWeight: 500 }}>
            {t("hotel.loadingHotelDetails")}
          </p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: tk.pageBg }}
      >
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center border"
          style={{
            background: tk.cardBg,
            borderColor: tk.cardBorder,
            boxShadow: tk.cardShadow,
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: tk.iconCircle }}
          >
            <Home size={40} style={{ color: "#E8192C" }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: tk.pageText }}>
            {t("hotel.hotelNotFound")}
          </h3>
          <p className="mb-6" style={{ color: tk.mutedText }}>
            {t("hotel.hotelNotFoundDescription")}
          </p>
          <button
            onClick={() => navigate("/searchResults")}
            className="w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "#E8192C", color: "#ffffff" }}
          >
            <ArrowLeft size={16} />
            {t("hotel.backToHotels")}
          </button>
        </div>
      </div>
    );
  }

  const amenities = [
    { icon: Wifi, label: t("hotel.amenities.freeWifi"), available: hotel.wifi },
    { icon: Car, label: t("hotel.amenities.parking"), available: hotel.parking },
    { icon: Dumbbell, label: t("hotel.amenities.fitnessCenter"), available: hotel.gym },
    { icon: UtensilsCrossed, label: t("hotel.amenities.restaurant"), available: hotel.restaurant },
    { icon: Wine, label: t("hotel.amenities.bar"), available: hotel.bar },
    { icon: Spa, label: t("hotel.amenities.spa"), available: hotel.spa },
    { icon: Pool, label: t("hotel.amenities.swimmingPool"), available: hotel.pool },
  ];

  return (
    <div style={{ background: tk.pageBg, minHeight: "100vh", color: tk.pageText }}>
      <PrimarySearchAppBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Button */}
        <button
          onClick={() => navigate("/searchResults")}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: tk.backBg, color: tk.dimText }}
        >
          <ArrowLeft size={16} />
          Back to Hotels
        </button>

        {/* Hero Gallery */}
        <div
          className="rounded-3xl overflow-hidden mb-8 border"
          style={{
            background: tk.cardBg,
            borderColor: tk.cardBorder,
            boxShadow: tk.cardShadow,
          }}
        >
          <div className="relative">
            {images.length > 0 ? (
              <div className="relative h-96 sm:h-[500px]">
                <img
                  src={images[photoIndex]}
                  alt={`${hotel.name} - Image ${photoIndex + 1}`}
                  onClick={() => setIsOpen(true)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft size={24} className="text-gray-900" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((photoIndex + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight size={24} className="text-gray-900" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-gray-900 transition-all hover:scale-105"
                >
                  <ImageIcon size={20} />
                  {t("hotel.viewAllPhotos", { count: images.length })}
                </button>

                <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {photoIndex + 1} / {images.length}
                </div>

                <div className="absolute top-6 right-6">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                      hotel.status === "active" ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"
                    }`}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {hotel.status}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h1 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-lg">{hotel.name}</h1>
                  <div className="flex items-center gap-2 text-lg mb-4">
                    <MapPin size={20} />
                    <span className="drop-shadow">{hotel.location}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Star size={20} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold text-lg">{hotel.rating}</span>
                      <span className="text-sm opacity-90">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Users size={20} />
                      <span className="font-medium">{hotel.occupancy}% occupied</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 sm:h-[500px] flex items-center justify-center" style={{ background: tk.statBg }}>
                <p style={{ color: tk.mutedText }}>{t("hotel.noImagesAvailable")}</p>
              </div>
            )}

            {images.length > 1 && (
              <div className="p-4 overflow-x-auto" style={{ background: tk.thumbBg }}>
                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setPhotoIndex(index)}
                      className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all"
                      style={{
                        outline: index === photoIndex ? "3px solid #E8192C" : `2px solid ${tk.statBorder}`,
                        opacity: index === photoIndex ? 1 : 0.6,
                        transform: index === photoIndex ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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

          {/* Reservation Card */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 sticky top-8 border"
              style={{ background: tk.cardBg, borderColor: tk.cardBorder, boxShadow: tk.cardShadow }}
            >
              <div className="text-center mb-6">
                <p className="text-sm mb-2" style={{ color: tk.mutedText }}>{t("hotel.pricePerNight")}</p>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign size={32} className="text-emerald-500" />
                  <span className="text-5xl font-bold" style={{ color: tk.pageText }}>{hotel.price}</span>
                </div>
                <p className="text-sm mt-2" style={{ color: tk.mutedText }}>{t("hotel.taxesAndFees")}</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: Bed, label: t("hotel.roomsAvailable"), value: String(hotel.rooms) },
                  { icon: Clock, label: t("hotel.checkIn"), value: "2:00 PM" },
                  { icon: Clock, label: t("hotel.checkOut"), value: "12:00 PM" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} style={{ color: "#E8192C" }} />
                      <span className="font-medium text-sm" style={{ color: tk.dimText }}>{item.label}</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: tk.pageText }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReservation}
                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "#E8192C", color: "#ffffff" }}
              >
                <Calendar size={20} />
                {t("hotel.bookNow")}
              </button>
              <p className="text-center text-xs mt-4" style={{ color: tk.mutedText }}>{t("hotel.freeCancellation")}</p>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div
              className="rounded-2xl p-8 border"
              style={{ background: tk.cardBg, borderColor: tk.cardBorder, boxShadow: tk.cardShadow }}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: tk.pageText }}>
                <Home size={24} style={{ color: "#E8192C" }} />
                {t("hotel.aboutThisHotel")}
              </h2>
              <p className="leading-relaxed text-lg" style={{ color: tk.dimText }}>
                {hotel.description || "Experience luxury and comfort at this exceptional hotel. Our dedicated staff ensures your stay is memorable with top-notch service and modern amenities."}
              </p>
            </div>

            {/* Amenities */}
            {amenities.filter((a) => a.available).length > 0 && (
              <div
                className="rounded-2xl p-8 border"
                style={{ background: tk.cardBg, borderColor: tk.cardBorder, boxShadow: tk.cardShadow }}
              >
                <h2 className="text-2xl font-bold mb-6" style={{ color: tk.pageText }}>
                  {t("hotel.amenitiesAndServices")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {amenities.filter((a) => a.available).map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: tk.amenityBg, border: `1px solid ${tk.statBorder}` }}
                    >
                      <amenity.icon size={24} style={{ color: "#E8192C" }} />
                      <span className="font-medium text-sm" style={{ color: tk.dimText }}>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div
              className="rounded-2xl p-8 border"
              style={{ background: tk.cardBg, borderColor: tk.cardBorder, boxShadow: tk.cardShadow }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: tk.pageText }}>
                {t("hotel.contactInformation")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-xl md:col-span-2" style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tk.iconCircle }}>
                    <Mail size={20} style={{ color: "#E8192C" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: tk.mutedText }}>
                      {t("hotel.contactInformation")}
                    </p>
                    <p className="font-medium" style={{ color: tk.pageText }}>
                      {t(
                        "hotel.contactUnlockedAfterPayment",
                        "Direct host contact details are shared after a booking is confirmed and paid through Bookinal.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl md:col-span-2" style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tk.iconCircle }}>
                    <MapPin size={20} style={{ color: "#E8192C" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: tk.mutedText }}>{t("hotel.address")}</p>
                    <p className="font-medium" style={{ color: tk.pageText }}>{hotel.address || `${hotel.location}, Complete Address`}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            {hotel.lat !== undefined && hotel.lng !== undefined && (
              <div
                className="rounded-2xl p-8 border"
                style={{ background: tk.cardBg, borderColor: tk.cardBorder, boxShadow: tk.cardShadow }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: tk.pageText }}>
                  <MapPin size={24} style={{ color: "#E8192C" }} />
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
