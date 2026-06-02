import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Loader2,
  MapPin,
  Waves,
  Map as MapIcon,
  List,
} from "lucide-react";
import { useIsMobile } from "@albania/hooks";
import { addDestinationToCurrentUserWishlist } from "@albania/api-client";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useToast } from "@/hooks/use-toast";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { useTranslation } from "react-i18next";
import { useDestinations } from "@/hooks/useDestinations";
import { DestinationCard } from "../DestinationCard";
import DestinationMap from "../DestinationMap";

const BeachDestinationsPage = () => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(
    null,
  );
  const [showMapMobile, setShowMapMobile] = useState(false);
  const isMobile = useIsMobile();
  const { data: destinations = [], isLoading, error } = useDestinations();

  const tk = {
    pageBg: isDark
      ? "#0a0a0c"
      : isBlue
        ? "linear-gradient(180deg, hsl(205 55% 96%) 0%, hsl(204 60% 98%) 100%)"
        : "#f5f4f1",
    heroGradient:
      "linear-gradient(135deg, rgba(8,47,73,0.95) 0%, rgba(3,105,161,0.84) 46%, rgba(34,211,238,0.34) 100%)",
    heroSoft: homeTk.textSoftOnMedia,
    textMain: homeTk.textMain,
    textMuted: homeTk.textMuted,
    brand: homeTk.brand,
    panelBg: isDark
      ? "rgba(20,20,23,0.92)"
      : isBlue
        ? "rgba(255,255,255,0.88)"
        : "rgba(255,255,255,0.98)",
    panelBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.14)"
        : "rgba(15,23,42,0.08)",
    panelShadow: isDark
      ? "0 20px 50px rgba(0,0,0,0.35)"
      : "0 18px 40px rgba(15,23,42,0.08)",
    buttonGhostBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.82)",
    buttonGhostBorder: isDark
      ? "rgba(255,255,255,0.12)"
      : "rgba(15,23,42,0.08)",
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const beaches = useMemo(
    () =>
      destinations.filter(
        (destination) => destination.category === "Destinations",
      ),
    [destinations],
  );

  const heroImage =
    "https://images.unsplash.com/photo-1738675326308-f4097c3405a7?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const handleAddToWishlist = async (destinationId: string) => {
    try {
      setWishlistLoadingId(destinationId);
      await addDestinationToCurrentUserWishlist(destinationId);
      toast({
        title: t("common.success"),
        description: t("home.destinations.addedToWishlist"),
      });
    } catch (err: any) {
      console.error("Failed to add to wishlist:", err);
      toast({
        title: err?.code === "23505" ? t("common.warning") : t("common.error"),
        description:
          err?.code === "23505"
            ? t("home.destinations.alreadyInWishlist")
            : t("home.destinations.loginToAddWishlist"),
        variant: err?.code === "23505" ? "default" : "destructive",
      });
    } finally {
      setWishlistLoadingId(null);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", background: tk.pageBg, color: tk.textMain }}
    >
      <PrimarySearchAppBar />

      <section
        style={{ position: "relative", minHeight: "26rem", overflow: "hidden" }}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt="Beaches in Albania"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: tk.heroGradient,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(4,26,38,0.18) 0%, rgba(4,26,38,0.38) 45%, rgba(4,26,38,0.84) 100%), radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 28%)",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "4rem 1rem 3rem",
          }}
        >
          <button
            onClick={() => navigate("/destinations")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              cursor: "pointer",
              marginBottom: "5.5rem",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to categories
          </button>

          <div style={{ maxWidth: "52rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.76)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "0.78rem",
                fontWeight: 700,
                marginBottom: "0.9rem",
              }}
            >
              Coastal collection
            </p>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "clamp(2.5rem, 5vw, 5rem)",
                lineHeight: 0.98,
                fontWeight: 900,
                marginBottom: "0.85rem",
              }}
            >
              Landscapes of Albania
            </h1>
            <p
              style={{
                color: tk.heroSoft,
                fontSize: "1rem",
                lineHeight: 1.8,
                maxWidth: "42rem",
              }}
            >
              Discover the Riviera through bright coves, long swimming days,
              hidden bays, and shoreline escapes collected in one place.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "2rem 1rem 4rem",
        }}
      >
        {isLoading && (
          <div
            style={{
              minHeight: "40vh",
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
        )}

        {!isLoading && error && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 1rem",
              color: tk.textMuted,
              border: `1px solid ${tk.panelBorder}`,
              background: tk.panelBg,
              borderRadius: "1.5rem",
            }}
          >
            <p
              style={{
                color: tk.textMain,
                fontSize: "1.1rem",
                marginBottom: "1rem",
              }}
            >
              {t("home.destinations.loadError")}
            </p>
          </div>
        )}

        {!isLoading && !error && beaches.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 1rem",
              color: tk.textMuted,
              border: `1px solid ${tk.panelBorder}`,
              background: tk.panelBg,
              borderRadius: "1.5rem",
            }}
          >
            <div
              style={{
                color: tk.textMain,
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "0.55rem",
              }}
            >
              No beaches available yet.
            </div>
            <div>Once beach destinations are added, they will appear here.</div>
          </div>
        )}

        {!isLoading && !error && beaches.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "2rem",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "flex-start",
            }}
          >
            {isMobile && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                  marginBottom: "-1rem",
                }}
              >
                <button
                  onClick={() => setShowMapMobile(!showMapMobile)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1rem",
                    borderRadius: "0.5rem",
                    background: tk.panelBg,
                    border: `1px solid ${tk.panelBorder}`,
                    color: tk.textMain,
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: tk.panelShadow,
                    zIndex: 10,
                  }}
                >
                  {showMapMobile ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <MapIcon className="w-4 h-4" />
                  )}
                  {showMapMobile ? "Show List" : "Show Map"}
                </button>
              </div>
            )}

            {(!isMobile || !showMapMobile) && (
              <div
                style={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                  gap: "1.25rem",
                  width: "100%",
                }}
              >
                {beaches.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    tk={tk}
                    onAddToWishlist={handleAddToWishlist}
                    isLoadingWishlist={wishlistLoadingId === destination.id}
                  />
                ))}
              </div>
            )}

            {(!isMobile || showMapMobile) && (
              <div
                style={{
                  width: isMobile ? "100%" : "300px",
                  height: isMobile
                    ? "calc(100vh - 20rem)"
                    : "calc(100vh - 12rem)",
                  position: isMobile ? "relative" : "sticky",
                  top: isMobile ? "auto" : "6rem",
                }}
              >
                <DestinationMap destinations={beaches} />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default BeachDestinationsPage;
