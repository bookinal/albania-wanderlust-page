import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  Images,
  X,
} from "lucide-react";
import { Hotel } from "@/types/hotel.types";
import { getHotelById } from "@/services/api/hotelService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import Swal from "sweetalert2";
import { Pool, Spa } from "@mui/icons-material";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getBookingThemeTokens } from "./booking/bookingTheme";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";

function MosaicGallery({
  images,
  onOpen,
  alt,
}: {
  images: string[];
  onOpen: (index: number) => void;
  alt: string;
}) {
  const total = images.length;
  if (total === 0) return null;

  const cellButtonStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    width: "100%",
    height: "100%",
    padding: 0,
    border: "none",
    background: "none",
    cursor: "pointer",
    overflow: "hidden",
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease",
  };

  const renderCell = (
    index: number,
    gridArea: React.CSSProperties,
    overlay?: React.ReactNode,
  ) => (
    <button
      key={index}
      onClick={() => onOpen(index)}
      style={{ ...cellButtonStyle, ...gridArea }}
      className="group"
    >
      <img
        src={images[index]}
        alt={`${alt} ${index + 1}`}
        style={imgStyle}
        className="group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
        }}
      />
      {overlay}
    </button>
  );

  const viewAllOverlay =
    total > 4 ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,23,42,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 0.9rem",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.95)",
            color: "#111827",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          <Images className="w-4 h-4" />
          View all {total}
        </span>
      </div>
    ) : null;

  let columns = "1fr";
  let rows = "1fr";
  let cells: React.ReactNode[];

  if (total === 1) {
    cells = [renderCell(0, {})];
  } else if (total === 2) {
    columns = "1fr 1fr";
    cells = [renderCell(0, {}), renderCell(1, {})];
  } else if (total === 3) {
    columns = "1.3fr 1fr";
    rows = "1fr 1fr";
    cells = [
      renderCell(0, { gridRow: "1 / span 2", gridColumn: "1" }),
      renderCell(1, { gridRow: "1", gridColumn: "2" }),
      renderCell(2, { gridRow: "2", gridColumn: "2" }),
    ];
  } else {
    columns = "1fr 1.3fr 1fr";
    rows = "1fr 1fr";
    cells = [
      renderCell(0, { gridRow: "1 / span 2", gridColumn: "1" }),
      renderCell(1, { gridRow: "1 / span 2", gridColumn: "2" }),
      renderCell(2, { gridRow: "1", gridColumn: "3" }),
      renderCell(3, { gridRow: "2", gridColumn: "3" }, viewAllOverlay),
    ];
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
        gap: "4px",
      }}
    >
      {cells}
    </div>
  );
}

function LightboxModal({
  images,
  initialIndex,
  onClose,
  alt,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  alt: string;
}) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;

  const goNext = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [goNext, goPrev, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const arrowButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "3rem",
    height: "3rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          width: "2.75rem",
          height: "2.75rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.22)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <X className="w-5 h-5" />
      </button>

      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            style={{ ...arrowButtonStyle, left: "1rem" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            style={{ ...arrowButtonStyle, right: "1rem" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={`${alt} ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          objectFit: "contain",
          borderRadius: "0.75rem",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
        }}
      />

      {total > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "0.4rem 0.9rem",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            backdropFilter: "blur(8px)",
          }}
        >
          {index + 1} / {total}
        </div>
      )}
    </div>
  );
}

const HotelReservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();

  const tk = getBookingThemeTokens({ isDark, isBlue });

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchHotel();
    fetchUser();
  }, [id]);

  const handleReservation = () => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", `/hotelBilling/${id}`);
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
    navigate(`/hotelBilling/${id}`);
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
            style={{ color: tk.brand }}
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
            style={{ background: tk.brandSoftStrong }}
          >
            <Home size={40} style={{ color: tk.brand }} />
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
            style={{ background: tk.brand, color: "#ffffff" }}
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

        {/* Hero Gallery Section */}
        <div
          className="rounded-3xl overflow-hidden mb-8 border"
          style={{
            background: tk.cardBg,
            borderColor: tk.cardBorder,
            boxShadow: tk.cardShadow,
          }}
        >
          <div className="relative h-96 sm:h-[500px]">
            {images.length > 0 ? (
              <MosaicGallery
                images={images}
                onOpen={(idx) => setLightboxIndex(idx)}
                alt={hotel.name}
              />
            ) : (
              <div className="h-full flex items-center justify-center" style={{ background: tk.statBg }}>
                <p style={{ color: tk.mutedText }}>{t("hotel.noImagesAvailable")}</p>
              </div>
            )}

            {/* Gradient Overlay for Text Visibility */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.01) 35%, rgba(0,0,0,0.65) 100%)`,
              }}
            />

            {/* Top Right Status Badge */}
            <div className="absolute top-6 right-6 pointer-events-none z-10">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                  hotel.status === "active" ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"
                }`}
              >
                <CheckCircle2 size={16} className="mr-2" />
                {hotel.status}
              </span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white pointer-events-none z-10">
              <h1 className="text-3xl sm:text-5xl font-bold mb-3 drop-shadow-lg">{hotel.name}</h1>
              <div className="flex items-center gap-2 text-base sm:text-lg mb-4">
                <MapPin size={20} />
                <span className="drop-shadow">{hotel.location}</span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
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
        </div>

        {/* Fullscreen Lightbox Modal */}
        {lightboxIndex !== null && (
          <LightboxModal
            images={images.length > 0 ? images : ["/placeholder.svg"]}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            alt={hotel.name}
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
                      <item.icon size={20} style={{ color: tk.brand }} />
                      <span className="font-medium text-sm" style={{ color: tk.dimText }}>{item.label}</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: tk.pageText }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReservation}
                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: tk.brand, color: "#ffffff" }}
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
                <Home size={24} style={{ color: tk.brand }} />
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
                      <amenity.icon size={24} style={{ color: tk.brand }} />
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
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tk.brandSoftStrong }}>
                    <Mail size={20} style={{ color: tk.brand }} />
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
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tk.brandSoftStrong }}>
                    <MapPin size={20} style={{ color: tk.brand }} />
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
                  <MapPin size={24} style={{ color: tk.brand }} />
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
