import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Images,
  X,
} from "lucide-react";
import { Apartment, PREDEFINED_AMENITIES } from "@/types/apartment.type";
import { getApartmentById } from "@/services/api/apartmentService";
import { MapPicker } from "@/components/dashboard/mapPicker";
import { Pool, Spa } from "@mui/icons-material";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { AvailabilityCalendar } from "@/components/dashboard/AvailabilityCalendar";
import { useTranslation } from "react-i18next";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import Swal from "sweetalert2";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { useTheme } from "@/context/ThemeContext";
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

const ApartmentReservation = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const tk = getBookingThemeTokens({ isDark, isBlue });

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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

  const handleBack = () => {
    if (typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate("/searchResults");
    }
  };

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
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            style={{ background: tk.backBg, color: tk.dimText }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={16} />
            {t("common.back")}
          </button>
        </div>

        {/* Mosaic Gallery Hero Section */}
        <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }} className="rounded-3xl overflow-hidden mb-8">
          <div className="relative h-96 sm:h-[500px]">
            {images.length > 0 ? (
              <MosaicGallery
                images={images}
                onOpen={(idx) => setLightboxIndex(idx)}
                alt={apartment.name}
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

            {/* Top Right Status Badge */}
            <div className="absolute top-6 right-6 pointer-events-none z-10">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${getStatusColor()}`}>
                <CheckCircle2 size={16} className="mr-2" />
                {apartment.status}
              </span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white pointer-events-none z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-5xl font-bold mb-3 drop-shadow-lg">{apartment.name}</h1>
                  <div className="flex items-center gap-2 text-base sm:text-lg mb-4">
                    <MapPin size={20} />
                    <span className="drop-shadow">{apartment.location || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
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
        </div>

        {/* Fullscreen Lightbox Modal */}
        {lightboxIndex !== null && (
          <LightboxModal
            images={images.length > 0 ? images : ["/placeholder.svg"]}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            alt={apartment.name}
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
