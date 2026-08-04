import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Loader2,
  Calendar,
  Car as CarIcon,
  Fuel,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Hash,
  Package,
  MapPinned,
  TrendingUp,
  Baby,
  UserPlus,
  Images,
  X,
} from "lucide-react";
import { Car } from "@/types/car.types";
import { Month, MONTHS, MONTH_NAMES } from "@/types/price.type";
import { getCarById } from "@/services/api/carService";
import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { useTheme } from "@/context/ThemeContext";

// Helper to get current month as Month type
const getCurrentMonth = (): Month => {
  const monthIndex = new Date().getMonth();
  return MONTHS[monthIndex];
};
import { MapPicker } from "@/components/dashboard/mapPicker";
import PrimarySearchAppBar from "@/components/home/AppBar";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { getBookingThemeTokens } from "./bookingTheme";

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

const CarReservation = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const tk = getBookingThemeTokens({ isDark, isBlue });

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

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
          setImages(data.imageUrls || []);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
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

    fetchCar();
    fetchUser();
  }, [id]);

  const handleReservation = () => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", `/carBilling/${id}`);
      Swal.fire({
        title: t("auth.loginRequired"),
        text: t("auth.loginToBook"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("auth.login"),
        cancelButtonText: t("common.cancel"),
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        }
      });
      return;
    }
    navigate(`/carBilling/${id}`);
  };

  if (loading) {
    return (
      <div style={{ background: tk.pageBg }} className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 style={{ color: tk.brand }} className="animate-spin mx-auto mb-4" size={48} />
          <p style={{ color: tk.mutedText }} className="font-medium">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ background: tk.pageBg }} className="min-h-screen flex items-center justify-center p-4">
        <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="max-w-md w-full rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: tk.brandSoftStrong }}>
            <CarIcon style={{ color: tk.brand }} size={40} />
          </div>
          <h3 style={{ color: tk.pageText }} className="text-2xl font-bold mb-2">Car Not Found</h3>
          <p style={{ color: tk.mutedText }} className="mb-6">The car you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/searchCarResults")}
            style={{ background: tk.brand, color: '#fff' }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} />
            {t("navigation.backToCars")}
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (car.status) {
      case "available": return "bg-emerald-500/90 text-white";
      case "rented": return "bg-amber-500/90 text-white";
      case "maintenance": return "bg-red-500/90 text-white";
      default: return "bg-gray-500/90 text-white";
    }
  };

  const getFuelIcon = () => {
    switch (car.fuelType) {
      case "Electric":
      case "Hybrid":
        return Zap;
      default:
        return Fuel;
    }
  };

  const FuelIcon = getFuelIcon();

  const getTypeColor = () => {
    switch (car.type) {
      case "Sports": return "bg-red-500/90 text-white";
      case "SUV": return "bg-blue-500/90 text-white";
      case "Sedan": return "bg-purple-500/90 text-white";
      default: return "bg-gray-500/90 text-white";
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: tk.pageBg }}>
      <PrimarySearchAppBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/searchCarResults")}
          style={{ background: tk.backBg, color: tk.dimText }}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={16} />
          {t("navigation.backToCars")}
        </button>

        {/* Mosaic Gallery Hero Section */}
        <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-3xl overflow-hidden mb-8">
          <div className="relative h-96 sm:h-[500px]">
            {images.length > 0 ? (
              <MosaicGallery
                images={images}
                onOpen={(idx) => setLightboxIndex(idx)}
                alt={`${car.brand} ${car.name}`}
              />
            ) : (
              <div className="h-full flex items-center justify-center" style={{ background: tk.statBg }}>
                <p style={{ color: tk.mutedText }}>No images available</p>
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

            {/* Top Right Status & Type Badges */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none z-10">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${getStatusColor()}`}>
                <CheckCircle2 size={16} className="mr-2" />
                {car.status}
              </span>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${getTypeColor()}`}>
                <Package size={16} className="mr-2" />
                {car.type}
              </span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white pointer-events-none z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-lg font-semibold mb-1 opacity-90">{car.brand}</div>
                  <h1 className="text-3xl sm:text-5xl font-bold mb-3 drop-shadow-lg">{car.name}</h1>
                  <div className="flex items-center gap-2 text-base sm:text-lg mb-4">
                    <MapPin size={20} />
                    <span className="drop-shadow">{car.pickUpLocation || "Pick-up location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Calendar size={18} />
                      <span className="font-medium text-sm">{car.year}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Settings size={18} />
                      <span className="font-medium text-sm">{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <FuelIcon size={18} />
                      <span className="font-medium text-sm">{car.fuelType}</span>
                    </div>
                  </div>
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
            alt={`${car.brand} ${car.name}`}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Reservation Card */}
          <div className="lg:col-span-1">
            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-6 sticky top-8">
              {(() => {
                const currentMonth = getCurrentMonth();
                const monthlyPrice = car.monthlyPrices?.find((p) => p.month === currentMonth);
                const displayPrice = monthlyPrice?.pricePerDay ?? car.pricePerDay;
                const hasSeasonalPrice = monthlyPrice && monthlyPrice.pricePerDay !== car.pricePerDay;

                return (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p style={{ color: tk.mutedText }} className="text-sm">{t("billing.pricePerDay")}</p>
                      {hasSeasonalPrice && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <TrendingUp size={12} />
                          {MONTH_NAMES[currentMonth]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign size={32} className="text-emerald-500" />
                      <span style={{ color: tk.pageText }} className="text-5xl font-bold">{displayPrice}</span>
                    </div>
                    {hasSeasonalPrice && (
                      <p style={{ color: tk.mutedText }} className="text-sm mt-1 line-through">Base: ${car.pricePerDay}/day</p>
                    )}
                    <p style={{ color: tk.mutedText }} className="text-sm mt-2">+ {car.insurance ? `$${car.insurance} ` : ""}{t("billing.insurance")}</p>
                  </div>
                );
              })()}

              <div className="space-y-4 mb-6">
                {[
                  { icon: <Hash size={20} style={{ color: tk.brand }} />, label: t("searchResults.cars.plate"), value: car.plateNumber },
                  { icon: <Baby size={20} style={{ color: tk.brand }} />, label: t("searchResults.cars.childSeat", "Child seat"), value: car.childSeatPrice > 0 ? `+$${car.childSeatPrice}` : t("cars.carDetails.fields.notOffered", "Not offered") },
                  { icon: <UserPlus size={20} style={{ color: tk.brand }} />, label: t("searchResults.cars.additionalDriver", "Additional driver"), value: car.additionalDriverPrice > 0 ? `+$${car.additionalDriverPrice}` : t("cars.carDetails.fields.notOffered", "Not offered") },
                ].map(({ icon, label, value }, i) => (
                  <div key={i} style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }} className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      {icon}
                      <span style={{ color: tk.dimText }} className="font-medium">{label}</span>
                    </div>
                    <span style={{ color: tk.pageText }} className="font-bold font-mono">{value}</span>
                  </div>
                ))}
              </div>

              {car.status === "rented" && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-medium text-amber-500">{t("booking.currentlyRented")}</span>
                </div>
              )}

              <button
                onClick={handleReservation}
                disabled={car.status === "maintenance" || car.status === "review"}
                style={{
                  background: (car.status === "maintenance" || car.status === "review") ? tk.statBg : tk.brand,
                  color: (car.status === "maintenance" || car.status === "review") ? tk.mutedText : '#fff',
                  cursor: (car.status === "maintenance" || car.status === "review") ? 'not-allowed' : 'pointer',
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-opacity hover:opacity-90"
              >
                <Calendar size={20} />
                {car.status === "maintenance" || car.status === "review"
                  ? t("booking.underMaintenance")
                  : t("booking.bookNow")}
              </button>

              {(car.status === "available" || car.status === "rented") && (
                <p style={{ color: tk.mutedText }} className="text-center text-xs mt-4">{t("billing.flexibleCancellation")}</p>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Specifications */}
            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-8">
              <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CarIcon style={{ color: tk.brand }} size={24} />
                {t("billing.vehicleSpecifications")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { label: t("searchResults.cars.brand"), value: car.brand },
                  { label: t("searchResults.cars.year"), value: String(car.year) },
                  { label: t("searchResults.filters.carType"), value: car.type },
                  { label: t("searchResults.filters.transmission"), value: car.transmission },
                  { label: t("searchResults.filters.fuelType"), value: car.fuelType },
                ].map(({ label, value }, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <span style={{ color: tk.mutedText }} className="text-sm font-medium">{label}</span>
                    <span style={{ color: tk.pageText }} className="text-lg font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-8">
                <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-6">{t("billing.featuresAndEquipment")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} style={{ background: tk.amenityBg }} className="flex items-center gap-3 p-4 rounded-xl hover:opacity-90 transition-opacity">
                      <CheckCircle2 size={20} style={{ color: tk.brand }} className="flex-shrink-0" />
                      <span style={{ color: tk.dimText }} className="font-medium capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pick-up Location */}
            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-8">
              <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-6">{t("billing.pickUpAndContactInformation")}</h2>
              <div className="grid grid-cols-1 gap-6">
                <div style={{ background: tk.statBg }} className="flex items-start gap-4 p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tk.brandSoftStrong }}>
                    <MapPinned size={20} style={{ color: tk.brand }} />
                  </div>
                  <div>
                    <p style={{ color: tk.mutedText }} className="text-sm font-medium mb-1">{t("billing.pickUpLocation")}</p>
                    <p style={{ color: tk.pageText }} className="font-medium">{car.pickUpLocation || "Location not specified"}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Map Location */}
            {car.lat !== undefined && car.lng !== undefined && (
              <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-2xl p-8">
                <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MapPin style={{ color: tk.brand }} size={24} />
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

            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }} className="rounded-xl p-6">
              <AvailabilityCalendar propertyId={parseInt(id!)} propertyType="car" />
            </div>

            {/* Guest Reviews */}
            <ReviewsSection propertyId={parseInt(id!)} propertyType="car" />

            {/* Rental Terms */}
            <div style={{ background: tk.termsBg, border: `1px solid ${tk.termsBorder}` }} className="rounded-2xl p-8">
              <h2 style={{ color: tk.pageText }} className="text-2xl font-bold mb-4">{t("billing.rentalTermsAndConditions")}</h2>
              <ul className="space-y-3" style={{ color: tk.dimText }}>
                {[
                  t("terms.minimumRentalPeriod"),
                  t("terms.validDriversLicense"),
                  t("terms.fullInsuranceCoverageIncluded"),
                  t("terms.24/7RoadsideAssistance"),
                  t("terms.freeCancellation"),
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} style={{ color: tk.brand }} className="flex-shrink-0 mt-0.5" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarReservation;
