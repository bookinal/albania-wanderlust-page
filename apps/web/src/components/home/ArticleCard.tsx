import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { Article } from "@albania/shared-types";
import { useLocalized } from "@/hooks/useLocalized";

interface ArticleCardProps {
  article: Article;
  tk: {
    panelBg: string;
    panelBorder: string;
    panelShadow: string;
    textMain: string;
    textMuted: string;
    brand: string;
  };
}

export const ArticleCard = ({ article, tk }: ArticleCardProps) => {
  const { localize } = useLocalized();
  const navigate = useNavigate();

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <article
      onClick={() => navigate(`/article/${article.id}`)}
      style={{
        background: tk.panelBg,
        border: `1px solid ${tk.panelBorder}`,
        boxShadow: tk.panelShadow,
        borderRadius: "1.5rem",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = tk.panelShadow;
      }}
    >
      <div
        style={{
          position: "relative",
          height: "12rem",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {article.imageUrls?.[0] ? (
          <img
            src={article.imageUrls[0]}
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
              background: tk.panelBorder,
              color: tk.textMuted,
              fontSize: "3rem",
            }}
          >
            ✦
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            padding: "0.3rem 0.75rem",
            borderRadius: "9999px",
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            backdropFilter: "blur(6px)",
          }}
        >
          {article.category}
        </div>
      </div>

      <div
        style={{
          padding: "1rem 1.1rem 1.2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          flex: 1,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 800,
            color: tk.textMain,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {localize(article.title)}
        </h3>

        {article.excerpt && (
          <p
            style={{
              margin: 0,
              fontSize: "0.88rem",
              color: tk.textMuted,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {localize(article.excerpt)}
          </p>
        )}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            fontSize: "0.78rem",
            color: tk.textMuted,
          }}
        >
          {publishedDate && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Calendar className="w-3.5 h-3.5" />
              {publishedDate}
            </span>
          )}
          {article.author && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock className="w-3.5 h-3.5" />
              {article.author}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
