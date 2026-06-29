import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  ArrowLeft,
  MapPin,
  Heart,
  Share2,
  Loader2,
  Navigation,
  Waves,
  Droplets,
  Star,
  Users,
  CalendarRange,
  Wallet,
  Sunrise,
  Footprints,
  Backpack,
  Leaf,
  WifiOff,
  Car,
  Sailboat,
  Plus,
  Minus,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Camera,
  ExternalLink,
  ChefHat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { addDestinationToCurrentUserWishlist } from "@albania/api-client";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { useDestination, useDestinations } from "@/hooks/useDestinations";
import { DestinationCard } from "./DestinationCard";

const visitorTipIcons: Record<string, LucideIcon> = {
  Sunrise,
  Footprints,
  Backpack,
  Leaf,
  WifiOff,
};

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DestinationDetails = () => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const { data: destination, isLoading, error } = useDestination(id);
  const { data: allDestinations = [] } = useDestinations();

  const nearbyIds = destination
    ? ((destination as unknown as Record<string, unknown>).nearbyDestinationIds as string[] | undefined) || []
    : [];
  const nearbyDestinations = allDestinations.filter(
    (d) => nearbyIds.includes(d.id) && d.id !== destination?.id,
  );

  const [nearbyWishlistLoading, setNearbyWishlistLoading] = useState<string | null>(null);

  const handleNearbyAddToWishlist = async (destId: string) => {
    setNearbyWishlistLoading(destId);
    try {
      await addDestinationToCurrentUserWishlist(destId);
      toast({
        title: t("common.success"),
        description: t("home.destinations.addedToWishlist"),
      });
    } catch (err: any) {
      if (err.code === "23505") {
        toast({
          title: t("common.warning"),
          description: t("home.destinations.alreadyInWishlist"),
        });
      } else {
        toast({
          title: t("common.error"),
          description: t("home.destinations.loginToAddWishlist"),
          variant: "destructive",
        });
      }
    } finally {
      setNearbyWishlistLoading(null);
    }
  };

  const tk = {
    pageBg: isDark
      ? "#0a0a0c"
      : isBlue
        ? "linear-gradient(180deg, hsl(205 55% 96%) 0%, hsl(204 60% 98%) 100%)"
        : "#f5f4f1",
    pageText: homeTk.textMain,
    headerBg: isDark
      ? "rgba(10,10,12,0.92)"
      : isBlue
        ? "rgba(240,249,255,0.88)"
        : "rgba(255,255,255,0.92)",
    headerBorder: homeTk.dividerColor,
    cardBg: isDark
      ? "rgba(255,255,255,0.03)"
      : isBlue
        ? "rgba(255,255,255,0.86)"
        : "#ffffff",
    cardBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.14)"
        : "#ede9e5",
    cardShadow: isDark
      ? "0 12px 36px rgba(0,0,0,0.42)"
      : isBlue
        ? "0 18px 48px rgba(3,37,65,0.12)"
        : "0 8px 32px rgba(15,23,42,0.08)",
    mutedText: homeTk.textMuted,
    dimText: isDark
      ? "rgba(240,236,232,0.76)"
      : isBlue
        ? "hsl(211 22% 35%)"
        : "#44403c",
    backBg: isDark
      ? "rgba(255,255,255,0.06)"
      : isBlue
        ? "rgba(2,132,199,0.08)"
        : "rgba(0,0,0,0.06)",
    mapFallbackBg: isDark
      ? "rgba(255,255,255,0.04)"
      : isBlue
        ? "rgba(255,255,255,0.72)"
        : "#f0ece8",
    btnOutlineBg: isDark
      ? "rgba(255,255,255,0.06)"
      : isBlue
        ? "rgba(255,255,255,0.72)"
        : "rgba(0,0,0,0.04)",
    btnOutlineBorder: isDark
      ? "rgba(255,255,255,0.14)"
      : isBlue
        ? "rgba(2,132,199,0.18)"
        : "#d0ccc8",
    thumbBorder: isDark
      ? "rgba(255,255,255,0.10)"
      : isBlue
        ? "rgba(2,132,199,0.16)"
        : "#e5e2de",
    heroGradient: isBlue
      ? "linear-gradient(135deg, rgba(8,47,73,0.94), rgba(3,105,161,0.76), rgba(56,189,248,0.34))"
      : isDark
        ? "linear-gradient(135deg, rgba(17,17,21,0.92), rgba(40,40,48,0.72), rgba(17,17,21,0.92))"
        : "linear-gradient(135deg, rgba(232,25,44,0.88), rgba(127,29,29,0.72), rgba(17,17,21,0.5))",
    brand: homeTk.brand,
    brandSoft: homeTk.brandSoft,
    pillText: "#ffffff",
  };

  const cardTk = {
    panelBg: tk.cardBg,
    panelBorder: tk.cardBorder,
    panelShadow: tk.cardShadow,
    heroGradient: tk.heroGradient,
    textMain: tk.pageText,
    textMuted: tk.mutedText,
    brand: tk.brand,
    buttonGhostBg: tk.btnOutlineBg,
    buttonGhostBorder: tk.btnOutlineBorder,
  };

  const handleAddToWishlist = async () => {
    if (!destination) return;

    try {
      setIsAddingToWishlist(true);
      await addDestinationToCurrentUserWishlist(destination.id);
      toast({
        title: t("common.success"),
        description: t("home.destinations.addedToWishlist"),
      });
    } catch (err: any) {
      console.error("Failed to add to wishlist:", err);
      if (err.code === "23505") {
        toast({
          title: t("common.warning"),
          description: t("home.destinations.alreadyInWishlist"),
          variant: "default",
        });
      } else {
        toast({
          title: t("common.error"),
          description: t("home.destinations.loginToAddWishlist"),
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShare = async () => {
    if (!destination) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: localize(destination.name),
          text: localize(destination.description),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t("home.destinations.linkCopiedTitle"),
        description: t("home.destinations.linkCopiedDescription"),
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: tk.pageBg }}>
        <PrimarySearchAppBar />
        <div
          style={{
            minHeight: "calc(100vh - 4rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: tk.brand }}
          />
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div style={{ minHeight: "100vh", background: tk.pageBg }}>
        <PrimarySearchAppBar />
        <div
          style={{
            minHeight: "calc(100vh - 4rem)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: tk.pageText,
              marginBottom: "1rem",
            }}
          >
            {error
              ? t("home.destinations.loadDetailsError")
              : t("home.destinations.notFound")}
          </h2>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              background: tk.brand,
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("home.destinations.backToHome")}
          </button>
        </div>
      </div>
    );
  }

  const mapCenter: [number, number] = [
    destination.lat || 41.3275,
    destination.lng || 19.8187,
  ];
  const heroImage = destination.imageUrls[0] || "/placeholder.svg";
  const quickFacts = [
    {
      icon: MapPin,
      label: "Location",
      value: destination.location,
    },
    {
      icon: Waves,
      label: "Beach Type",
      value: destination.beachType,
    },
    {
      icon: ChefHat,
      label: "Cuisine Type",
      value: destination.cuisineType,
    },
    {
      icon: Droplets,
      label: "Water",
      value: destination.water,
    },
    {
      icon: Star,
      label: "Best For",
      value: destination.bestFor,
    },
    {
      icon: Users,
      label: "Crowd Level",
      value: destination.crowdLevel,
    },
    {
      icon: CalendarRange,
      label: "Best Months",
      value: destination.bestMonths,
    },
    {
      icon: Wallet,
      label: "Price Level",
      value: destination.priceLevel,
    },
  ].filter(
    (fact): fact is { icon: LucideIcon; label: string; value: string } =>
      typeof fact.value === "string" && fact.value.trim().length > 0,
  );
  const visitorTips = (destination.visitorTips || []).filter(
    (tip): tip is { icon: string; title: string; description: string } =>
      Boolean(tip?.title && tip?.description),
  );
  const transportOptions = [
    {
      icon: Car,
      title: "By Car",
      description: destination.byCar,
    },
    {
      icon: Footprints,
      title: "By Foot",
      description: destination.byFoot,
    },
    {
      icon: Sailboat,
      title: "By Boat",
      description: destination.byBoat,
    },
  ].filter(
    (option): option is {
      icon: typeof Car;
      title: string;
      description: string;
    } => typeof option.description === "string" && option.description.trim().length > 0,
  );

  return (
    <div
      style={{ minHeight: "100vh", background: tk.pageBg, color: tk.pageText }}
    >
      <PrimarySearchAppBar />

      {/* Top Hero */}
      <div style={{ width: "100%", padding: "1.25rem 1.5rem 0" }}>
        <div
          style={{
            position: "relative",
            height: "clamp(18rem, 42vw, 24rem)",
            borderRadius: "1.5rem",
            overflow: "hidden",
            boxShadow: tk.cardShadow,
            background: tk.mapFallbackBg,
          }}
        >
          <img
            src={heroImage}
            alt={localize(destination.name)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              // background: `linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.01) 32%, rgba(0,0,0,0.74) 100%), ${tk.heroGradient}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "clamp(1.25rem, 3vw, 2.5rem)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/destinations")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.7rem 1rem",
                  background: "rgba(15,23,42,0.32)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "9999px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                {t("home.destinations.back")}
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleShare}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.75rem",
                    height: "2.75rem",
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    borderRadius: "9999px",
                    color: "#fff",
                    cursor: "pointer",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.75rem",
                    height: "2.75rem",
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    borderRadius: "9999px",
                    color: "#fff",
                    cursor: isAddingToWishlist ? "not-allowed" : "pointer",
                    opacity: isAddingToWishlist ? 0.6 : 1,
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                  }}
                >
                  {isAddingToWishlist ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  maxWidth: "42rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.45rem 0.95rem",
                      borderRadius: "9999px",
                      background: "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.24)",
                      color: tk.pillText,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    {destination.category}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.45rem 0.95rem",
                      borderRadius: "9999px",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      color: "#fff",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                    Albania
                  </span>
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: "clamp(2.3rem, 5vw, 4.5rem)",
                      fontWeight: 800,
                      lineHeight: 0.95,
                      letterSpacing: "-0.04em",
                      color: "#fff",
                      margin: 0,
                      textShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    }}
                  >
                    {localize(destination.name)}
                  </h1>
                  <p
                    style={{
                      margin: "1rem 0 0",
                      maxWidth: "36rem",
                      fontSize: "clamp(1rem, 1.5vw, 1.1rem)",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.88)",
                    }}
                  >
                    {(() => {
                      const desc = localize(destination.description);
                      const limit = 400;
                      const needsTruncation = desc.length > limit;
                      return (
                        <>
                          {needsTruncation && !descriptionExpanded
                            ? desc.slice(0, limit) + "..."
                            : desc}
                        </>
                      );
                    })()}
                  </p>
                  {localize(destination.description).length > 400 && (
                    <button
                      onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.75)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        padding: 0,
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                      }}
                    >
                      {descriptionExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate("/destinations")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.9rem 1.2rem",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "1rem",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
                }}
              >
                {t("home.destinations.seeAllDestinations")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      {quickFacts.length > 0 && (
        <div
          style={{
            width: "100%",
            padding: "0 1.5rem",
            marginTop: "-2.75rem",
            position: "relative",
            zIndex: 3,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "1.75rem",
              boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
              border: "1px solid rgba(15,23,42,0.06)",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.9rem",
              }}
            >
              {quickFacts.map((fact) => {
                const Icon = fact.icon;

                return (
                  <div
                    key={fact.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.9rem",
                      padding: "1rem",
                      borderRadius: "1.25rem",
                      background:
                        "linear-gradient(180deg, rgba(240,253,250,0.92) 0%, rgba(255,255,255,1) 100%)",
                      border: "1px solid rgba(13,148,136,0.12)",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "0.9rem",
                        background: "rgba(13,148,136,0.12)",
                        color: "#0f766e",
                        flexShrink: 0,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#6b7280",
                        }}
                      >
                        {fact.label}
                      </p>
                      <p
                        style={{
                          margin: "0.35rem 0 0",
                          fontSize: "1rem",
                          lineHeight: 1.45,
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        {fact.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Details Section */}
      <div style={{ width: "100%", padding: "1.5rem 1.5rem 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Details */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <MapPin
                  className="w-6 h-6 flex-shrink-0 mt-1"
                  style={{ color: tk.brand }}
                />
                <h1
                  style={{
                    fontSize: "2.25rem",
                    fontWeight: 700,
                    color: tk.pageText,
                    lineHeight: 1.2,
                  }}
                >
                  {localize(destination.name)}
                </h1>
              </div>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: tk.dimText,
                  lineHeight: 1.7,
                }}
              >
                {(() => {
                  const desc = localize(destination.description);
                  const limit = 1000;
                  const needsTruncation = desc.length > limit;
                  return (
                    <>
                      {needsTruncation && !descriptionExpanded ? desc.slice(0, limit) + "..." : desc}
                    </>
                  );
                })()}
              </p>
              {localize(destination.description).length > 1000 && (
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  style={{
                    background: "none",
                    border: "none",
                    color: tk.brand,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    padding: 0,
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}
                >
                  {descriptionExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background: isBlue
                    ? "linear-gradient(135deg, #0284c7, #0369a1)"
                    : "linear-gradient(135deg, #E8192C, #c0101f)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.625rem",
                  fontWeight: 600,
                  cursor: isAddingToWishlist ? "not-allowed" : "pointer",
                  opacity: isAddingToWishlist ? 0.7 : 1,
                  fontSize: "0.9rem",
                  boxShadow: isBlue
                    ? "0 4px 16px rgba(2,132,199,0.32)"
                    : "0 4px 16px rgba(232,25,44,0.35)",
                }}
              >
                {isAddingToWishlist ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                {t("home.destinations.addToWishlist")}
              </button>
            </div>
            <button
              onClick={() => navigate("/destinations")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.85rem 1.25rem",
                background: tk.btnOutlineBg,
                color: tk.pageText,
                border: `1px solid ${tk.btnOutlineBorder}`,
                borderRadius: "0.625rem",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {t("home.destinations.seeAllDestinations")}
            </button>
          </div>
          {/* Main Image */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                position: "relative",
                height: "28rem",
                borderRadius: "1rem",
                overflow: "hidden",
                boxShadow: tk.cardShadow,
              }}
            >
              <img
                src={
                  destination.imageUrls[selectedImageIndex] ||
                  "/placeholder.svg"
                }
                alt={localize(destination.name)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "#E8192C",
                  color: "#fff",
                  padding: "0.375rem 1rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
              >
                {destination.category}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {destination.imageUrls.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {destination.imageUrls.slice(0, 4).map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      position: "relative",
                      height: "5rem",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      border:
                        selectedImageIndex === index
                          ? `3px solid ${tk.brand}`
                          : `2px solid ${tk.thumbBorder}`,
                      cursor: "pointer",
                      transform:
                        selectedImageIndex === index
                          ? "scale(1.05)"
                          : "scale(1)",
                      transition: "all 0.2s",
                      padding: 0,
                      boxShadow:
                        selectedImageIndex === index ? tk.cardShadow : "none",
                    }}
                  >
                    <img
                      src={url}
                      alt={`${localize(destination.name)} ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips For Visitors */}
      <div style={{ width: "100%", padding: "0 1.5rem 2.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.6rem",
              fontWeight: 800,
              color: tk.pageText,
            }}
          >
            Tips for Visitors
          </h2>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.98rem",
              lineHeight: 1.7,
              color: tk.dimText,
            }}
          >
            Practical notes to help plan a smoother visit before you go.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {visitorTips.map((tip) => {
            const Icon = visitorTipIcons[tip.icon] || MapPin;

            return (
              <div
                key={tip.title}
                style={{
                  background: "#ffffff",
                  borderRadius: "1.25rem",
                  border: "1px solid rgba(15,23,42,0.06)",
                  boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
                  padding: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "0.95rem",
                    background: "rgba(15,118,110,0.1)",
                    color: "#0f766e",
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {tip.title}
                  </h3>
                  <p
                    style={{
                      margin: "0.45rem 0 0",
                      fontSize: "0.92rem",
                      lineHeight: 1.65,
                      color: "#4b5563",
                    }}
                  >
                    {tip.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact */}
      {destination.contact && (
        <div style={{ width: "100%", padding: "0 1.5rem 2.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: 800,
                color: tk.pageText,
              }}
            >
              Contact & Links
            </h2>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.98rem",
                lineHeight: 1.7,
                color: tk.dimText,
              }}
            >
              Reach out or explore more about this destination online.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            {([
              { key: "instagram", icon: Camera, prefix: "" },
              { key: "facebook", icon: Users, prefix: "" },
              { key: "website", icon: Globe, prefix: null },
              { key: "phone", icon: Phone, prefix: "tel:" },
              { key: "email", icon: Mail, prefix: "mailto:" },
              { key: "whatsapp", icon: MessageCircle, prefix: "" },
              { key: "tripadvisor", icon: Star, prefix: null },
              { key: "bookingUrl", icon: ExternalLink, prefix: null },
            ] as const).map(({ key, icon: Icon, prefix }) => {
              const val = destination.contact![key];
              if (!val) return null;
              const href = prefix ? `${prefix}${val}` : val;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "9999px",
                    background: "#ffffff",
                    border: "1px solid rgba(15,23,42,0.06)",
                    color: tk.pageText,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.12)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(15,23,42,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: tk.brand }} />
                  {key === "instagram" && "Instagram"}
                  {key === "facebook" && "Facebook"}
                  {key === "website" && "Website"}
                  {key === "phone" && val}
                  {key === "email" && val}
                  {key === "whatsapp" && "WhatsApp"}
                  {key === "tripadvisor" && "TripAdvisor"}
                  {key === "bookingUrl" && "Book Now"}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* How To Reach */}
      <div style={{ width: "100%", padding: "0 1.5rem 3rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.6rem",
              fontWeight: 800,
              color: tk.pageText,
            }}
          >
            How to Reach
          </h2>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.98rem",
              lineHeight: 1.7,
              color: tk.dimText,
            }}
          >
            Quick transport options and a map preview to make arrival easier.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: "1.25rem",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "1.5rem",
              border: "1px solid rgba(15,23,42,0.06)",
              boxShadow: "0 16px 40px rgba(15,23,42,0.07)",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "1.1rem",
                  top: "0.4rem",
                  bottom: "0.4rem",
                  width: "2px",
                  background:
                    "linear-gradient(180deg, rgba(13,148,136,0.24), rgba(13,148,136,0.08))",
                }}
              />
              {transportOptions.length > 0 ? (
                transportOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <div
                      key={option.title}
                      style={{
                        position: "relative",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "2.25rem",
                          height: "2.25rem",
                          borderRadius: "9999px",
                          background: "#ccfbf1",
                          color: "#0f766e",
                          border: "6px solid #ffffff",
                          boxSizing: "content-box",
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div
                        style={{
                          flex: 1,
                          background: "rgba(248,250,252,0.9)",
                          borderRadius: "1rem",
                          border: "1px solid rgba(15,23,42,0.06)",
                          padding: "1rem 1rem 1rem 1.05rem",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {option.title}
                        </h3>
                        <p
                          style={{
                            margin: "0.45rem 0 0",
                            fontSize: "0.93rem",
                            lineHeight: 1.65,
                            color: "#4b5563",
                          }}
                        >
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    position: "relative",
                    marginLeft: "3.25rem",
                    background: "rgba(248,250,252,0.9)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(15,23,42,0.06)",
                    padding: "1rem 1.05rem",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.93rem",
                      lineHeight: 1.65,
                      color: "#4b5563",
                    }}
                  >
                    Transport details will appear here once routes are added for
                    this destination.
                  </p>
                </div>
              )}
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`,
                    "_blank",
                  )
                }
                disabled={!destination.lat || !destination.lng}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background: tk.btnOutlineBg,
                  color: tk.pageText,
                  border: `1px solid ${tk.btnOutlineBorder}`,
                  borderRadius: "0.625rem",
                  fontWeight: 600,
                  cursor:
                    !destination.lat || !destination.lng
                      ? "not-allowed"
                      : "pointer",
                  opacity: !destination.lat || !destination.lng ? 0.5 : 1,
                  fontSize: "0.9rem",
                }}
              >
                <MapPin className="w-4 h-4" />
                {t("map.openInGoogleMaps")}
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "1.5rem",
              border: "1px solid rgba(15,23,42,0.06)",
              boxShadow: "0 16px 40px rgba(15,23,42,0.07)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Map preview
                </h3>
                <p
                  style={{
                    margin: "0.35rem 0 0",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  A quick look at the destination area before you head out.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={() =>
                    setMapZoom((current) => Math.min(current + 1, 17))
                  }
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0.8rem",
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: "#ffffff",
                    color: "#0f172a",
                    cursor: "pointer",
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setMapZoom((current) => Math.max(current - 1, 8))
                  }
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0.8rem",
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: "#ffffff",
                    color: "#0f172a",
                    cursor: "pointer",
                  }}
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                borderRadius: "1.25rem",
                overflow: "hidden",
                minHeight: "22rem",
                border: `1px solid ${tk.cardBorder}`,
                background: tk.cardBg,
              }}
            >
              {destination.lat && destination.lng ? (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={mapCenter}>
                    <Popup>
                      <div style={{ textAlign: "center" }}>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>
                          {localize(destination.name)}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: tk.mutedText,
                            margin: "0.25rem 0 0",
                          }}
                        >
                          {destination.category}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: tk.mapFallbackBg,
                  }}
                >
                  <p style={{ color: tk.mutedText }}>
                    {t("home.destinations.locationNotAvailable")}
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`,
                    "_blank",
                  )
                }
                disabled={!destination.lat || !destination.lng}
                style={{
                  position: "absolute",
                  right: "1rem",
                  bottom: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.8rem 1rem",
                  background: "rgba(255,255,255,0.92)",
                  color: "#0f172a",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  cursor:
                    !destination.lat || !destination.lng
                      ? "not-allowed"
                      : "pointer",
                  opacity: !destination.lat || !destination.lng ? 0.55 : 1,
                  boxShadow: "0 12px 28px rgba(15,23,42,0.16)",
                }}
              >
                <Navigation className="w-4 h-4" />
                Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div style={{ width: "100%", padding: "0 1.5rem 3rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.6rem",
              fontWeight: 800,
              color: tk.pageText,
            }}
          >
            Photo Gallery
          </h2>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.98rem",
              lineHeight: 1.7,
              color: tk.dimText,
            }}
          >
            Explore the destination through a rich, scrollable collection of moments.
          </p>
        </div>

        <div style={{ columnWidth: "260px", columnGap: "0.9rem" }}>
          {destination.imageUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              onClick={() => setSelectedImageIndex(index)}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "0.9rem",
                padding: 0,
                border: selectedImageIndex === index ? `3px solid ${tk.brand}` : "none",
                borderRadius: "1.25rem",
                overflow: "hidden",
                background: "transparent",
                cursor: "pointer",
                breakInside: "avoid",
                boxShadow:
                  selectedImageIndex === index
                    ? tk.cardShadow
                    : "0 14px 32px rgba(15,23,42,0.08)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio:
                    index % 5 === 0
                      ? "4 / 5"
                      : index % 3 === 0
                        ? "1 / 1"
                        : index % 2 === 0
                          ? "4 / 3"
                          : "3 / 4",
                  background: tk.mapFallbackBg,
                }}
              >
                <img
                  src={url}
                  alt={`${localize(destination.name)} gallery ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(15,23,42,0) 45%, rgba(15,23,42,0.18) 100%)",
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Attractions */}
      {nearbyDestinations.length > 0 && (
        <div style={{ width: "100%", padding: "0 1.5rem 3rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: 800,
                color: tk.pageText,
              }}
            >
              Nearby Attractions
            </h2>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.98rem",
                lineHeight: 1.7,
                color: tk.dimText,
              }}
            >
              Other attractions close to {localize(destination.name)}.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 210px), 1fr))",
              gap: "1.25rem",
            }}
          >
            {nearbyDestinations.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                tk={cardTk}
                onAddToWishlist={handleNearbyAddToWishlist}
                isLoadingWishlist={nearbyWishlistLoading === d.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetails;
