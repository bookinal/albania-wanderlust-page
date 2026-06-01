import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Destination } from "@/types/destination.types";
import { addDestinationToCurrentUserWishlist } from "@/services/api/destinationService";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserWishlist } from "@/services/api/destinationService";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "./homeTheme";
import { DestinationFilterBar } from "./destinations/DestinationFilterBar";
import { DestinationListItem } from "./destinations/DestinationListItem";
import { useQuery } from "@tanstack/react-query";
import { getTopDestinationsByCategory } from "@/services/api/destinationService";

const Destinations = () => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const {
    data: topDestinationsMap = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topDestinationsByCategory"],
    queryFn: getTopDestinationsByCategory,
    staleTime: 10 * 60 * 1000,
  });

  const destinations = useMemo(() => {
    return Object.values(topDestinationsMap).flat();
  }, [topDestinationsMap]);

  const tk = {
    sectionBg: isDark ? "#0a0a0c" : isBlue ? "hsl(205 55% 96%)" : "#f8fafc",
    textMain: homeTk.textMain,
    textMuted: homeTk.textMuted,
    brand: homeTk.brand,
    brandSoft: homeTk.brandSoft,
    panelBg: isDark
      ? "rgba(20,20,23,0.92)"
      : isBlue
        ? "rgba(255,255,255,0.86)"
        : "rgba(255,255,255,0.96)",
    panelBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.16)"
        : "rgba(15,23,42,0.08)",
    panelShadow: isDark
      ? "0 20px 50px rgba(0,0,0,0.35)"
      : isBlue
        ? "0 18px 40px rgba(3,37,65,0.12)"
        : "0 18px 40px rgba(15,23,42,0.08)",
    buttonGhostBg: isDark
      ? "rgba(255,255,255,0.05)"
      : isBlue
        ? "rgba(255,255,255,0.74)"
        : "rgba(255,255,255,0.8)",
    buttonGhostBorder: isDark
      ? "rgba(255,255,255,0.12)"
      : isBlue
        ? "rgba(2,132,199,0.18)"
        : "rgba(15,23,42,0.08)",
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        await getCurrentUserWishlist();
      } catch (fetchError) {
        console.error("Error fetching wishlist:", fetchError);
      }
    };

    fetchWishlist();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        destinations.map((destination) => destination.category).filter(Boolean),
      ),
    ].sort();
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesCategory =
        !selectedCategory || destination.category === selectedCategory;
      const haystack = [
        localize(destination.name),
        localize(destination.description),
        destination.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [destinations, localize, search, selectedCategory]);

  const hasActiveFilters =
    search.trim().length > 0 || selectedCategory.length > 0;

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
        title: err?.code === 23505 ? t("common.warning") : t("common.error"),
        description:
          err?.code === 23505
            ? t("home.destinations.alreadyInWishlist")
            : t("home.destinations.loginToAddWishlist"),
        variant: err?.code === 23505 ? "default" : "destructive",
      });
    } finally {
      setWishlistLoadingId(null);
    }
  };

  return (
    <section
      id="destinations"
      className="py-24 transition-colors duration-300"
      style={{ background: tk.sectionBg }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-5 mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div
              className="text-[11px] font-bold uppercase tracking-[0.25em] mb-3"
              style={{ color: tk.brand }}
            >
              {t("common.destinations")}
            </div>
            <h2
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ color: tk.textMain }}
            >
              {t("home.destinations.title")}
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: tk.textMuted }}
            >
              {t("home.destinations.description")}
            </p>
          </div>

          <button
            onClick={() => navigate("/destinations")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
              padding: "0.85rem 1.1rem",
              borderRadius: "0.95rem",
              border: `1px solid ${tk.panelBorder}`,
              background: tk.panelBg,
              color: tk.textMain,
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: tk.panelShadow,
            }}
          >
            {t("home.destinations.seeAllDestinations")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

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
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: tk.brand }}
            />
          </div>
        )}

        {!isLoading && error && (
          <div
            className="text-center mt-6"
            style={{
              border: `1px solid ${tk.panelBorder}`,
              background: tk.panelBg,
              borderRadius: "1.25rem",
              padding: "3rem 1rem",
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
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.8rem 1.1rem",
                borderRadius: "0.8rem",
                border: `1px solid ${tk.buttonGhostBorder}`,
                background: tk.buttonGhostBg,
                color: tk.textMain,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {!isLoading && !error && filteredDestinations.length === 0 && (
          <div
            className="text-center mt-6"
            style={{
              border: `1px solid ${tk.panelBorder}`,
              background: tk.panelBg,
              borderRadius: "1.25rem",
              padding: "3rem 1rem",
              color: tk.textMuted,
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
              {hasActiveFilters
                ? t("home.destinations.noResultsTitle")
                : t("home.destinations.noDestinations")}
            </div>
            {hasActiveFilters && (
              <div>{t("home.destinations.noResultsDescription")}</div>
            )}
          </div>
        )}

        {!isLoading && !error && filteredDestinations.length > 0 && (
          <div className="grid gap-4 mt-6">
            {filteredDestinations.slice(0, 4).map((destination) => (
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

        {!isLoading && !error && filteredDestinations.length > 4 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/destinations")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.9rem 1.2rem",
                borderRadius: "0.95rem",
                border: "none",
                background: tk.brand,
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {t("home.destinations.seeAllDestinations")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <style>{`
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
    </section>
  );
};

export default Destinations;
