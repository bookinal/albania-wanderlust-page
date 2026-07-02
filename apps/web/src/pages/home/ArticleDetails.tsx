import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { useArticle, useArticles } from "@/hooks/useArticles";
import { useLocalized } from "@/hooks/useLocalized";
import { ArticleCard } from "@/components/home/ArticleCard";
import { useState } from "react";

const ArticleDetails = () => {
  const { localize } = useLocalized();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: article, isLoading, error } = useArticle(id);
  const { data: allArticles = [] } = useArticles();

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
    heroOverlay: isBlue
      ? "linear-gradient(to bottom, rgba(6,24,38,0.5), rgba(9,52,85,0.3), rgba(8,37,61,0.6))"
      : "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
  };

  const cardTk = {
    panelBg: tk.panelBg,
    panelBorder: tk.panelBorder,
    panelShadow: tk.panelShadow,
    textMain: tk.textMain,
    textMuted: tk.textMuted,
    brand: tk.brand,
  };

  const relatedArticles = allArticles.filter(
    (a) => a.category === article?.category && a.id !== article?.id,
  );

  const readingTime = article?.content?.en
    ? Math.max(1, Math.ceil(article.content.en.split(/\s+/).length / 200))
    : null;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: tk.pageBg }}>
        <PrimarySearchAppBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: tk.brand }} />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ minHeight: "100vh", background: tk.pageBg }}>
        <PrimarySearchAppBar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg" style={{ color: tk.textMuted }}>
            {error ? "Failed to load article." : "Article not found."}
          </p>
          <button
            onClick={() => navigate("/LetUsInspireYou")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: tk.brand, color: "#ffffff" }}
          >
            <ArrowLeft size={16} />
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div style={{ minHeight: "100vh", background: tk.pageBg }}>
      <PrimarySearchAppBar />

      {/* Hero */}
      <div
        style={{
          position: "relative",
          height: "50vh",
          minHeight: 320,
          overflow: "hidden",
        }}
      >
        {article.imageUrls?.[0] ? (
          <img
            src={article.imageUrls[selectedImageIndex] || article.imageUrls[0]}
            alt={localize(article.title)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isDark ? "#1a1a1a" : "#e5e2de",
              color: tk.textMuted,
              fontSize: "4rem",
            }}
          >
            ✦
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: tk.heroOverlay,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            right: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.35)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "3rem 2rem 2rem",
            background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          }}
        >
          <div className="container mx-auto">
            <span
              style={{
                display: "inline-block",
                padding: "0.3rem 0.8rem",
                borderRadius: "9999px",
                background: "rgba(232,25,44,0.85)",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              {article.category}
            </span>
            <h1
              className="text-3xl md:text-5xl font-black leading-tight max-w-3xl"
              style={{ color: "#ffffff" }}
            >
              {localize(article.title)}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          {(publishedDate || article.author || readingTime) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                alignItems: "center",
                paddingBottom: "1.5rem",
                marginBottom: "2rem",
                borderBottom: `1px solid ${tk.panelBorder}`,
                fontSize: "0.88rem",
                color: tk.textMuted,
              }}
            >
              {publishedDate && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Calendar size={15} />
                  {publishedDate}
                </span>
              )}
              {article.author && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <User size={15} />
                  {article.author}
                </span>
              )}
              {readingTime && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Clock size={15} />
                  {readingTime} min read
                </span>
              )}
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <p
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.7,
                color: tk.textMuted,
                marginBottom: "2rem",
                fontStyle: "italic",
              }}
            >
              {localize(article.excerpt)}
            </p>
          )}

          {/* Content */}
          <div
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: tk.textMain,
              whiteSpace: "pre-wrap",
            }}
          >
            {localize(article.content)}
          </div>

          {/* Image Gallery */}
          {article.imageUrls && article.imageUrls.length > 1 && (
            <div style={{ marginTop: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: tk.textMain,
                  marginBottom: "1rem",
                }}
              >
                Gallery
              </h2>

              {article.imageUrls.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <button
                    onClick={() =>
                      setSelectedImageIndex((i) =>
                        i > 0 ? i - 1 : article.imageUrls.length - 1,
                      )
                    }
                    style={{
                      padding: "0.5rem 0.8rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${tk.panelBorder}`,
                      background: tk.panelBg,
                      color: tk.textMain,
                      cursor: "pointer",
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.85rem",
                      color: tk.textMuted,
                    }}
                  >
                    {selectedImageIndex + 1} / {article.imageUrls.length}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((i) =>
                        i < article.imageUrls.length - 1 ? i + 1 : 0,
                      )
                    }
                    style={{
                      padding: "0.5rem 0.8rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${tk.panelBorder}`,
                      background: tk.panelBg,
                      color: tk.textMain,
                      cursor: "pointer",
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              <div
                style={{
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  maxHeight: 500,
                }}
              >
                <img
                  src={article.imageUrls[selectedImageIndex]}
                  alt={`${localize(article.title)} - Image ${selectedImageIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                  overflowX: "auto",
                  paddingBottom: "0.5rem",
                }}
              >
                {article.imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: 72,
                      height: 56,
                      borderRadius: "0.6rem",
                      overflow: "hidden",
                      flexShrink: 0,
                      border:
                        idx === selectedImageIndex
                          ? "2px solid #E8192C"
                          : `2px solid transparent`,
                      opacity: idx === selectedImageIndex ? 1 : 0.5,
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                      transition: "opacity 0.2s",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div style={{ marginTop: "5rem" }}>
            <div
              style={{
                borderTop: `1px solid ${tk.panelBorder}`,
                paddingTop: "3rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 800,
                  color: tk.textMain,
                  marginBottom: "0.5rem",
                }}
              >
                Related Articles
              </h2>
              <p style={{ color: tk.textMuted, marginBottom: "2rem" }}>
                More from {article.category}
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "1.5rem",
              }}
            >
              {relatedArticles.slice(0, 3).map((a) => (
                <ArticleCard key={a.id} article={a} tk={cardTk} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetails;
