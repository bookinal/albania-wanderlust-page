import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getReviewsByProperty } from "@/services/api/reviewService";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

interface ReviewsSectionProps {
  propertyId: number;
  propertyType: "car" | "apartment";
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-slate-300 fill-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  propertyId,
  propertyType,
}: ReviewsSectionProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    cardBg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#e5e2de",
    cardShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(15,23,42,0.08)",
    headingText: isDark ? "#ffffff" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.35)" : "#9e9994",
    avgBg: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
    avgBorder: isDark ? "rgba(255,255,255,0.06)" : "#e5e2de",
    avgBig: isDark ? "#ffffff" : "#0f172a",
    avgSub: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
    avgMeta: isDark ? "rgba(255,255,255,0.50)" : "#64748b",
    loaderColor: "#E8192C",
    emptyIcon: isDark ? "rgba(255,255,255,0.15)" : "#94a3b8",
    emptyText: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
    reviewBg: isDark ? "rgba(255,255,255,0.03)" : "#f8f6f3",
    reviewBorder: isDark ? "rgba(255,255,255,0.06)" : "#e5e2de",
    reviewHoverBorder: isDark ? "rgba(232,25,44,0.25)" : "#fca5a5",
    reviewerName: isDark ? "#ffffff" : "#1e293b",
    reviewDate: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
    reviewRating: isDark ? "rgba(255,255,255,0.70)" : "#475569",
    reviewText: isDark ? "rgba(255,255,255,0.65)" : "#475569",
    iconAccent: "#E8192C",
  };

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", String(propertyId), propertyType],
    queryFn: () => getReviewsByProperty(propertyId, propertyType),
  });

  const avgRating =
    reviews && reviews.length > 0
      ? parseFloat(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1),
        )
      : 0;

  return (
    <div
      style={{
        background: tk.cardBg,
        borderRadius: "16px",
        padding: "32px",
        boxShadow: tk.cardShadow,
        border: `1px solid ${tk.cardBorder}`,
      }}
    >
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: tk.headingText,
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <MessageSquare style={{ color: tk.iconAccent }} size={24} />
        {t("review.guestReviews", "Guest Reviews")}
        {reviews && reviews.length > 0 && (
          <span style={{ fontSize: "15px", fontWeight: 400, color: tk.mutedText, marginLeft: "4px" }}>
            ({reviews.length})
          </span>
        )}
      </h2>

      {/* Average Rating */}
      {reviews && reviews.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            padding: "16px",
            background: tk.avgBg,
            border: `1px solid ${tk.avgBorder}`,
            borderRadius: "12px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "36px", fontWeight: 700, color: tk.avgBig, lineHeight: 1 }}>{avgRating}</p>
            <p style={{ fontSize: "11px", color: tk.avgSub, marginTop: "4px" }}>
              {t("review.outOf5", "out of 5")}
            </p>
          </div>
          <div>
            <StarDisplay rating={Math.round(avgRating)} />
            <p style={{ fontSize: "13px", color: tk.avgMeta, marginTop: "4px" }}>
              {t("review.basedOn", "Based on")} {reviews.length}{" "}
              {reviews.length === 1
                ? t("review.review", "review")
                : t("review.reviews", "reviews")}
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
          <Loader2 style={{ width: "24px", height: "24px", color: tk.loaderColor, animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {!isLoading && (!reviews || reviews.length === 0) && (
        <div style={{ textAlign: "center", padding: "40px 0", color: tk.emptyText }}>
          <MessageSquare style={{ width: "40px", height: "40px", margin: "0 auto 12px", opacity: 0.3, color: tk.emptyIcon }} />
          <p style={{ fontWeight: 600 }}>
            {t("review.noReviews", "No reviews yet")}
          </p>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>
            {t("review.beFirst", "Be the first to share your experience!")}
          </p>
        </div>
      )}

      {!isLoading && reviews && reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: "20px",
                border: `1px solid ${tk.reviewBorder}`,
                borderRadius: "12px",
                background: tk.reviewBg,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.reviewHoverBorder)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.reviewBorder)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <p style={{ fontWeight: 600, color: tk.reviewerName, fontSize: "14px" }}>
                    {review.reviewer_name || t("review.anonymousUser", "Anonymous")}
                  </p>
                  <p style={{ fontSize: "12px", color: tk.reviewDate, marginTop: "2px" }}>
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StarDisplay rating={review.rating} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: tk.reviewRating }}>
                    {review.rating}/5
                  </span>
                </div>
              </div>
              <p style={{ color: tk.reviewText, fontSize: "14px", lineHeight: 1.6 }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
