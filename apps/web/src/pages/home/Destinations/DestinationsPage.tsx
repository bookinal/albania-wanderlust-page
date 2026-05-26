import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Landmark,
  Loader2,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { useTranslation } from "react-i18next";
import { useDestinations } from "@/hooks/useDestinations";

const DestinationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
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
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categoryCards = useMemo<
    Array<{
      id: string;
      title: string;
      eyebrow: string;
      description: string;
      slug: string;
      icon: LucideIcon;
      image?: string;
      accent: string;
      count: number;
    }>
  >(() => {
    const buildCard = (
      id: string,
      title: string,
      eyebrow: string,
      description: string,
      slug: string,
      icon: LucideIcon,
      accent: string,
    ) => {
      const matches = destinations.filter((destination) => destination.category === id);

      return {
        id,
        title,
        eyebrow,
        description,
        slug,
        icon,
        image: matches[0]?.imageUrls?.[0],
        accent,
        count: matches.length,
      };
    };

    return [
      buildCard(
        "Adventure",
        "Adventure",
        "Cliffs, trails, canyons",
        "For places that move faster: hikes, hidden routes, rugged viewpoints, and the wild side of Albania.",
        "adventure",
        Compass,
        "linear-gradient(135deg, rgba(17,94,89,0.94), rgba(13,148,136,0.82), rgba(110,231,183,0.4))",
      ),
      buildCard(
        "Historic",
        "Historic",
        "Castles, ruins, old towns",
        "Step into stone alleys, layered histories, and destinations shaped by memory, empire, and legend.",
        "historic",
        Landmark,
        "linear-gradient(135deg, rgba(120,53,15,0.94), rgba(180,83,9,0.8), rgba(251,191,36,0.34))",
      ),
      buildCard(
        "Beach",
        "Beaches",
        "Coves, coastlines, clear water",
        "Browse Albania's shoreline through sunlit bays, dramatic Riviera stops, and easy summer escapes.",
        "beach",
        Waves,
        "linear-gradient(135deg, rgba(12,74,110,0.94), rgba(2,132,199,0.82), rgba(103,232,249,0.4))",
      ),
    ];
  }, [destinations]);

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
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "4rem 1rem 3rem",
            position: "relative",
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
              <h1 style={{ color: "#ffffff", fontSize: "clamp(2.35rem, 5vw, 4.7rem)", lineHeight: 0.98, fontWeight: 900, marginBottom: "1rem" }}>
                Discover Albania by mood, not by list.
              </h1>
              <p style={{ color: tk.heroSoft, fontSize: "1.05rem", lineHeight: 1.8, maxWidth: "56rem" }}>
                Choose a direction first: wild adventure, layered history, or beach days along the coast. Each path opens its own destination world.
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
        {isLoading && (
          <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: tk.brand }} />
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
            <p style={{ color: tk.textMain, fontSize: "1.1rem", marginBottom: "1rem" }}>{t("home.destinations.loadError")}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.1rem",
                borderRadius: "0.8rem",
                border: `1px solid ${tk.panelBorder}`,
                background: tk.panelBg,
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

        {!isLoading && !error && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "1.25rem",
            }}
          >
            {categoryCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.id}
                  onClick={() => navigate(`/destinations/${card.slug}`)}
                  style={{
                    position: "relative",
                    minHeight: "26rem",
                    borderRadius: "1.75rem",
                    overflow: "hidden",
                    border: `1px solid ${tk.panelBorder}`,
                    padding: 0,
                    cursor: "pointer",
                    background: tk.panelBg,
                    boxShadow: tk.panelShadow,
                    textAlign: "left",
                  }}
                >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: card.accent }} />
                  )}

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `${card.accent}, linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0.76) 100%)`,
                      mixBlendMode: card.image ? "multiply" : "normal",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "1.5rem",
                      color: "#ffffff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "1rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255,255,255,0.14)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.5rem 0.8rem",
                          borderRadius: "9999px",
                          background: "rgba(255,255,255,0.12)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                        }}
                      >
                        {card.count}
                      </div>
                    </div>

                    <div>
                      <p style={{ margin: 0, opacity: 0.74, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.75rem", fontWeight: 700 }}>
                        {card.eyebrow}
                      </p>
                      <h2 style={{ margin: "0.8rem 0 0", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 0.98, fontWeight: 900 }}>
                        {card.title}
                      </h2>
                      <p style={{ margin: "0.9rem 0 0", maxWidth: "28rem", fontSize: "1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.86)" }}>
                        {card.description}
                      </p>
                      <div style={{ marginTop: "1.2rem", display: "inline-flex", alignItems: "center", gap: "0.55rem", fontWeight: 700 }}>
                        Explore collection
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        @media (min-width: 960px) {
          .destinations-hero-grid {
            grid-template-columns: minmax(0, 1fr) auto;
          }
        }
      `}</style>
    </div>
  );
};

export default DestinationsPage;
