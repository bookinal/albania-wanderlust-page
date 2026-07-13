import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "./homeTheme";
import { Button } from "@/components/ui/button";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/destinationManagement";
import { Link } from "react-router-dom";

const DestinationsHomePreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });

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
  };

  const subcategoryImages: Record<string, string> = {
    Beach:
      "https://images.unsplash.com/photo-1723445734447-208cc4e0d959?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Top cities & villages":
      "https://images.unsplash.com/photo-1655990419850-f9a5851603e3?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    Mountains:
      "https://plus.unsplash.com/premium_photo-1676231363849-1c17858d41b2?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Lakes & canyons":
      "https://plus.unsplash.com/premium_photo-1720886184649-ad1bb7792ece?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    Restaurants:
      "https://fr-bucket-com.s3.eu-north-1.amazonaws.com/public/blogs/20-traditional-albanian-foods-every-tourist-should-try_107.jpg",
    Bars: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/a9/c4/59/hemingway-tirana.jpg?w=500&h=500&s=1",
    Pubs: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/9c/bf/2f/caption.jpg?w=500&h=500&s=1",
    Clubs:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/bd/9e/11/magic-club-tirana.jpg?w=500&h=500&s=1",
    "Museums & galleries":
      "https://images.unsplash.com/photo-1717607420063-fb0ca82023d5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Historical & archeological sites":
      "https://images.unsplash.com/photo-1641932482354-0ab675bb242d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "UNESCO sites":
      "https://images.unsplash.com/photo-1705405999485-188af37e0462?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Breathtaking/Adventure":
      "https://images.unsplash.com/photo-1741844126191-913e5fad95dd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Sea activities":
      "https://images.unsplash.com/photo-1638619394560-1bd8d1131d63?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "On high altitude":
      "https://images.unsplash.com/photo-1576709501191-a9ccd791f174?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };


  const categoryGradients: Record<string, string> = {
    Destinations: "linear-gradient(135deg, #0f766e, #14b8a6)",
    "Eat, drink & dance": "linear-gradient(135deg, #be185d, #ec4899)",
    "History & culture": "linear-gradient(135deg, #92400e, #d97706)",
    Experiences: "linear-gradient(135deg, #065f46, #059669)",
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

          <Button
            variant="ghost"
            className="group p-0 hover:bg-transparent font-semibold gap-2"
            style={{ color: tk.brand }}
            asChild
          >
            <Link to="/destinations">
              {t("home.destinations.seeAllDestinations")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {CATEGORIES.map((cat) => {
          const subcategories = SUBCATEGORIES.filter(
            (sub) => sub.parent === cat.id,
          );
          if (subcategories.length === 0) return null;
          return (
            <CategoryRow
              key={cat.id}
              category={cat}
              subcategories={subcategories}
              tk={tk}
              gradient={
                categoryGradients[cat.id] ||
                "linear-gradient(135deg, #1e3a5f, #3b82f6)"
              }
              subcategoryImages={subcategoryImages}
              navigate={navigate}
            />
          );
        })}
      </div>
    </section>
  );
};

const CategoryRow = ({
  category,
  subcategories,
  tk,
  gradient,
  subcategoryImages,
  navigate,
}: {
  category: { id: string; label: string };
  subcategories: { id: string; label: string; parent: string }[];
  tk: Record<string, string>;
  gradient: string;
  subcategoryImages: Record<string, string>;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  return (
    <div className="mb-10 last:mb-0">
      <h3
        className="text-xl md:text-2xl font-bold mb-4"
        style={{ color: tk.textMain }}
      >
        {category.label}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {subcategories.map((sub) => (
          <div
            key={sub.id}
            onClick={() =>
              navigate(
                `/destinations/subcategory/${encodeURIComponent(sub.id)}`,
              )
            }
            style={{
              cursor: "pointer",
              borderRadius: "1rem",
              overflow: "hidden",
              background: tk.panelBg,
              border: `1px solid ${tk.panelBorder}`,
              boxShadow: tk.panelShadow,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 24px 48px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = tk.panelShadow;
            }}
          >
            <div
              style={{
                height: 140,
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {subcategoryImages[sub.id] ? (
                <img
                  src={subcategoryImages[sub.id]}
                  alt={sub.label}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    inset: 0,
                  }}
                />
              ) : (
                /* TODO: ADD IMG URL */
                <span
                  style={{
                    color: "#fff",
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    opacity: 0.25,
                    textTransform: "uppercase",
                  }}
                >
                  {sub.label.charAt(0)}
                </span>
              )}
            </div>
            <div style={{ padding: "0.85rem 1rem" }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: tk.textMain,
                }}
              >
                {sub.label}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationsHomePreview;
