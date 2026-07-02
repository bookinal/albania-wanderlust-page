import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { useArticles } from "@/hooks/useArticles";
import { ArticleCard } from "@/components/home/ArticleCard";
import PrimarySearchAppBar from "@/components/home/AppBar";

const LetUsInspireYou = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const navigate = useNavigate();
  const { data: articles = [], isLoading } = useArticles();

  const tk = {
    pageBg: isDark
      ? "#0a0a0c"
      : isBlue
        ? "linear-gradient(180deg, hsl(205 55% 96%) 0%, hsl(204 60% 98%) 100%)"
        : "#f5f4f1",
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

  const cardTk = {
    panelBg: tk.panelBg,
    panelBorder: tk.panelBorder,
    panelShadow: tk.panelShadow,
    textMain: tk.textMain,
    textMuted: tk.textMuted,
    brand: tk.brand,
  };

  return (
    <div style={{ minHeight: "100vh", background: tk.pageBg }}>
      <PrimarySearchAppBar />

      <div className="container mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1rem",
            borderRadius: "0.75rem",
            border: `1px solid ${tk.panelBorder}`,
            background: tk.panelBg,
            color: tk.textMain,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            marginBottom: "2rem",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ color: tk.textMain }}
          >
            {t("letUsInspireYou.title") || "Let Us Inspire You"}
          </h1>
          <p
            className="text-lg max-w-2xl leading-relaxed"
            style={{ color: tk.textMuted }}
          >
            {t("letUsInspireYou.description") || "Discover stories, guides, and insights about Albania — from hidden places and local flavors to traditions and unforgettable events."}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: tk.brand }}
            />
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div
            className="text-center py-20 rounded-2xl"
            style={{
              border: `1px dashed ${tk.panelBorder}`,
              color: tk.textMuted,
            }}
          >
            <p className="text-lg">No articles yet.</p>
            <p className="text-sm mt-2">Check back soon for new stories.</p>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "1.5rem",
            }}
          >
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} tk={cardTk} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LetUsInspireYou;