import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Destination } from "@albania/shared-types";
import {
  addDestinationToCurrentUserWishlist,
} from "@albania/api-client";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useToast } from "@/hooks/use-toast";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { useTranslation } from "react-i18next";
import { DestinationFilterBar } from "@/components/home/destinations/DestinationFilterBar";
import { DestinationListItem } from "@/components/home/destinations/DestinationListItem";
import { useDestinations } from "@/hooks/useDestinations";

const DestinationsPage = () => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });

  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const {
    data: destinations = [],
    isLoading,
    error,
  } = useDestinations();

  const tk = {
    pageBg: isDark
      ? "#0a0a0c"
      : isBlue
        ? "linear-gradient(180deg, hsl(205 55% 96%) 0%, hsl(204 60% 98%) 100%)"
        : "#f5f4f1",
    heroGradient: isBlue
      ? "linear-gradient(135deg, #082f49 0%, #0f4c81 36%, #38bdf8 100%)"
      : isDark
        ? "linear-gradient(135deg, #111115 0%, #26262b 50%, #0a0a0c 100%)"
        : "linear-gradient(135deg, #7f1d1d 0%, #E8192C 45%, #111115 100%)",
    heroSoft: homeTk.textSoftOnMedia,
    textMain: homeTk.textMain,
    textMuted: homeTk.textMuted,
    brand: homeTk.brand,
    brandSoft: homeTk.brandSoft,
    panelBg: isDark ? "rgba(20,20,23,0.92)" : isBlue ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.96)",
    panelBorder: isDark ? "rgba(255,255,255,0.08)" : isBlue ? "rgba(2,132,199,0.16)" : "rgba(15,23,42,0.08)",
    panelShadow: isDark
      ? "0 20px 50px rgba(0,0,0,0.35)"
      : isBlue
        ? "0 18px 40px rgba(3,37,65,0.12)"
        : "0 18px 40px rgba(15,23,42,0.08)",
    buttonGhostBg: isDark ? "rgba(255,255,255,0.05)" : isBlue ? "rgba(255,255,255,0.74)" : "rgba(255,255,255,0.8)",
    buttonGhostBorder: isDark ? "rgba(255,255,255,0.12)" : isBlue ? "rgba(2,132,199,0.18)" : "rgba(15,23,42,0.08)",
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(() => {
    return [...new Set(destinations.map((destination) => destination.category).filter(Boolean))].sort();
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesCategory = !selectedCategory || destination.category === selectedCategory;
      const haystack = [localize(destination.name), localize(destination.description), destination.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [destinations, localize, search, selectedCategory]);

  const hasActiveFilters = search.trim().length > 0 || selectedCategory.length > 0;

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
    <div style={{ minHeight: "100vh", background: tk.pageBg, color: tk.textMain }}>
      <PrimarySearchAppBar />

      <section style={{ background: tk.heroGradient, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 32%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 28%)",
          }}
        />
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 1rem 3rem", position: "relative" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              cursor: "pointer",
              marginBottom: "1.25rem",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("home.destinations.backToHome")}
          </button>

          <div className="destinations-hero-grid" style={{ display: "grid", gap: "1rem", alignItems: "end" }}>
            <div style={{ maxWidth: "760px" }}>
              <p style={{ color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.9rem" }}>
                {t("common.destinations")}
              </p>
              <h1 style={{ color: "#ffffff", fontSize: "clamp(2.35rem, 5vw, 4.7rem)", lineHeight: 1, fontWeight: 900, marginBottom: "1rem" }}>
                {t("home.destinations.browseTitle")}
              </h1>
              <p style={{ color: tk.heroSoft, fontSize: "1.05rem", lineHeight: 1.8, maxWidth: "56rem" }}>
                {t("home.destinations.browseDescription")}
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: "1.25rem",
                padding: "1rem 1.25rem",
                color: "#ffffff",
                minWidth: "190px",
                justifySelf: "start",
              }}
            >
              <div style={{ fontSize: "0.8rem", opacity: 0.76, marginBottom: "0.25rem" }}>
                {t("home.destinations.availableNow")}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.1 }}>{destinations.length}</div>
              <div style={{ fontSize: "0.92rem", opacity: 0.86 }}>{t("home.destinations.countLabel")}</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1rem 4rem" }}>
        <DestinationFilterBar
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          allCategoriesLabel={t("home.destinations.allCategories")}
          searchPlaceholder={t("home.destinations.searchPlaceholder")}
          clearFiltersLabel={t("home.destinations.clearFilters")}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setSearch("");
            setSelectedCategory("");
          }}
          resultsLabel={t("home.destinations.resultsCount", {
            count: filteredDestinations.length,
            total: destinations.length,
          })}
          background={tk.panelBg}
          borderColor={tk.panelBorder}
          textColor={tk.textMain}
          mutedColor={tk.textMuted}
          accentColor={tk.brand}
          accentSoft={tk.brandSoft}
        />

        {isLoading && (
          <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: tk.brand }} />
          </div>
        )}

        {!isLoading && error && (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <p style={{ color: tk.textMain, fontSize: "1.1rem", marginBottom: "1rem" }}>{t("home.destinations.loadError")}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.1rem",
                borderRadius: "0.8rem",
                border: `1px solid ${tk.buttonGhostBorder}`,
                background: tk.buttonGhostBg,
                color: tk.textMain,
                cursor: "pointer",
                fontWeight: 600,
                marginTop: "1.5rem",
              }}
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {!isLoading && !error && filteredDestinations.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 1rem",
              color: tk.textMuted,
              border: `1px solid ${tk.panelBorder}`,
              background: tk.panelBg,
              borderRadius: "1.25rem",
              marginTop: "1.5rem",
            }}
          >
            <div style={{ color: tk.textMain, fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.55rem" }}>
              {hasActiveFilters ? t("home.destinations.noResultsTitle") : t("home.destinations.noDestinations")}
            </div>
            {hasActiveFilters && <div>{t("home.destinations.noResultsDescription")}</div>}
          </div>
        )}

        {!isLoading && !error && filteredDestinations.length > 0 && (
          <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
            {filteredDestinations.map((destination) => (
              <DestinationListItem
                key={destination.id}
                destination={destination}
                name={localize(destination.name)}
                description={localize(destination.description)}
                onView={() => navigate(`/destination/${destination.id}`)}
                onWishlist={() => handleAddToWishlist(destination.id)}
                isWishlistLoading={wishlistLoadingId === destination.id}
                learnMoreLabel={t("common.learnMore")}
                readMoreLabel={t("home.destinations.readMore")}
                showLessLabel={t("home.destinations.showLess")}
                tokens={{
                  background: tk.panelBg,
                  borderColor: tk.panelBorder,
                  shadow: tk.panelShadow,
                  title: tk.textMain,
                  text: tk.textMain,
                  muted: tk.textMuted,
                  accent: tk.brand,
                  accentSoft: tk.brandSoft,
                  ghostBg: tk.buttonGhostBg,
                  ghostBorder: tk.buttonGhostBorder,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <style>{`
        @media (min-width: 960px) {
          .destinations-hero-grid {
            grid-template-columns: minmax(0, 1fr) auto;
          }
        }

        @media (max-width: 900px) {
          .destination-list-item {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .destination-list-item img {
            min-height: 13rem !important;
            max-height: 13rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DestinationsPage;
