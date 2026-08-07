import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Landmark,
  Loader2,
  Waves,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { useTranslation } from "react-i18next";
import { useDestinations } from "@/hooks/useDestinations";
import { DestinationCard } from "./DestinationCard";
import { addDestinationToCurrentUserWishlist } from "@/services/api/destinationService";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/destinationManagement";
import { DestinationBreadcrumb } from "@/components/home/destinations/DestinationBreadcrumb";

const selectDiverseDestinations = (destinationsList: any[], limit = 7) => {
  if (destinationsList.length <= limit) return destinationsList;

  const bySubcategory: Record<string, any[]> = {};
  destinationsList.forEach((d) => {
    const sub = d.subcategory || "Other";
    if (!bySubcategory[sub]) {
      bySubcategory[sub] = [];
    }
    bySubcategory[sub].push(d);
  });

  const selected: any[] = [];
  const subcategoryKeys = Object.keys(bySubcategory);
  
  let index = 0;
  while (selected.length < limit) {
    let addedAny = false;
    for (const key of subcategoryKeys) {
      if (selected.length >= limit) break;
      const list = bySubcategory[key];
      if (index < list.length) {
        selected.push(list[index]);
        addedAny = true;
      }
    }
    if (!addedAny) break;
    index++;
  }

  return selected;
};

interface DestinationRowProps {
  destinations: any[];
  tk: any;
  onAddToWishlist: (id: string) => Promise<void>;
  wishlistLoadingId: string | null;
}

const DestinationRow = ({
  destinations,
  tk,
  onAddToWishlist,
  wishlistLoadingId,
}: DestinationRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
      const timer = setTimeout(checkScroll, 100);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timer);
      };
    }
  }, [destinations]);

  const handleScroll = (direction: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {showLeftArrow && (
        <button
          onClick={() => handleScroll("left")}
          style={{
            position: "absolute",
            left: "-1.25rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "50%",
            background: tk.panelBg,
            border: `1px solid ${tk.panelBorder}`,
            color: tk.brand,
            boxShadow: tk.panelShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => handleScroll("right")}
          style={{
            position: "absolute",
            right: "-1.25rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "50%",
            background: tk.panelBg,
            border: `1px solid ${tk.panelBorder}`,
            color: tk.brand,
            boxShadow: tk.panelShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div
        ref={rowRef}
        onScroll={checkScroll}
        style={{
          display: "flex",
          gap: "1.5rem",
          overflowX: "auto",
          padding: "0.5rem 0.25rem 1.5rem",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
        className="hide-scrollbar"
      >
        {destinations.map((destination) => (
          <div
            key={destination.id}
            style={{
              flex: "0 0 280px",
              minWidth: "280px",
            }}
          >
            <DestinationCard
              destination={destination}
              tk={tk}
              onAddToWishlist={onAddToWishlist}
              isLoadingWishlist={wishlistLoadingId === destination.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const DestinationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const { data: destinations = [], isLoading, error } = useDestinations();

  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(
    null,
  );

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
    buttonGhostBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    buttonGhostBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  };

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
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundImage: `url(https://images.unsplash.com/photo-1529592767881-c6bb394eb83d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "4rem 1rem 3rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
              color: "#ffffff",
              cursor: "pointer",
              marginBottom: "1.25rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.6)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.4)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("home.destinations.backToHome")}
          </button>

          <div
            className="destinations-hero-grid"
            style={{ display: "grid", gap: "1rem", alignItems: "end" }}
          >
            <div style={{ maxWidth: "760px" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.9)",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginBottom: "0.9rem",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {t("common.destinations")}
              </p>
              <h1
                style={{
                  color: "#ffffff",
                  fontSize: "clamp(2.35rem, 5vw, 4.7rem)",
                  lineHeight: 0.98,
                  fontWeight: 900,
                  marginBottom: "1rem",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {t("home.destinations.exploreHeroTitle", "Explore the best of Albania")}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  maxWidth: "56rem",
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                {t(
                  "home.destinations.exploreHeroDescription",
                  "From crystal clear beaches to majestic mountains, discover the most beautiful places in Albania.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb Section under Hero */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem 0" }}>
        <DestinationBreadcrumb variant="page" items={[{ label: t("common.destinations") }]} />
      </div>

      {/* Categories Content */}
      <section
        style={{ padding: "2.5rem 1rem 4rem", maxWidth: "1280px", margin: "0 auto" }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: tk.brand }}
            />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p style={{ color: "rgba(239,68,68,0.9)", fontSize: "1.1rem" }}>
              {t("common.errorLoading")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {CATEGORIES.map((cat) => {
              const catDestinations = destinations.filter(
                (d) => d.category === cat.id,
              );

              if (catDestinations.length === 0) return null;

              const diverseDestinations = selectDiverseDestinations(catDestinations, 7);
              const catSubcats = SUBCATEGORIES.filter((sub) => sub.parent === cat.id);

              return (
                <div key={cat.id}>
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center justify-between">
                      <h2
                        style={{
                          fontSize: "2rem",
                          fontWeight: 800,
                          color: tk.textMain,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {cat.label}
                      </h2>
                      <button
                        onClick={() =>
                          navigate(
                            `/destinations/${cat.id
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")}`,
                          )
                        }
                        className="inline-flex items-center gap-2 text-sm font-bold transition-all"
                        style={{ color: tk.brand }}
                      >
                        {t("home.destinations.seeMore", "See more")}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {catSubcats.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {catSubcats.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() =>
                              navigate(`/destinations/subcategory/${encodeURIComponent(sub.id)}`)
                            }
                            style={{
                              padding: "0.4rem 0.9rem",
                              borderRadius: "9999px",
                              border: `1px solid ${tk.panelBorder}`,
                              background: tk.panelBg,
                              color: tk.textMuted,
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = tk.brand;
                              e.currentTarget.style.borderColor = tk.brand;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = tk.textMuted;
                              e.currentTarget.style.borderColor = tk.panelBorder;
                            }}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <DestinationRow
                    destinations={diverseDestinations}
                    tk={tk}
                    onAddToWishlist={handleAddToWishlist}
                    wishlistLoadingId={wishlistLoadingId}
                  />
                </div>
              );
            })}

            {destinations.length === 0 && (
              <div className="text-center py-20">
                <p style={{ color: tk.textMuted, fontSize: "1.1rem" }}>
                  {t("home.destinations.noDestinationsFound", "No destinations found.")}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default DestinationsPage;
