import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getReviewsByProperty } from "@/services/api/reviewService";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
              : "text-slate-200 fill-slate-200"
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
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="text-blue-600" size={24} />
        {t("review.guestReviews", "Guest Reviews")}
        {reviews && reviews.length > 0 && (
          <span className="ml-2 text-base font-normal text-slate-400">
            ({reviews.length})
          </span>
        )}
      </h2>

      {/* Average Rating */}
      {reviews && reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-900">{avgRating}</p>
            <p className="text-xs text-slate-400 mt-1">
              {t("review.outOf5", "out of 5")}
            </p>
          </div>
          <div>
            <StarDisplay rating={Math.round(avgRating)} />
            <p className="text-sm text-slate-500 mt-1">
              {t("review.basedOn", "Based on")} {reviews.length}{" "}
              {reviews.length === 1
                ? t("review.review", "review")
                : t("review.reviews", "reviews")}
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {!isLoading && (!reviews || reviews.length === 0) && (
        <div className="text-center py-10 text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {t("review.noReviews", "No reviews yet")}
          </p>
          <p className="text-sm mt-1">
            {t("review.beFirst", "Be the first to share your experience!")}
          </p>
        </div>
      )}

      {!isLoading && reviews && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 border border-slate-100 rounded-xl bg-slate-50 hover:border-blue-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {review.reviewer_name ||
                      t("review.anonymousUser", "Anonymous")}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.rating} />
                  <span className="text-sm font-bold text-slate-700">
                    {review.rating}/5
                  </span>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
