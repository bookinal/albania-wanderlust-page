import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { createReview } from "@/services/api/reviewService";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Booking } from "@/types/booking.type";
import { useTranslation } from "react-i18next";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
}

export default function ReviewModal({
  open,
  onClose,
  booking,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: t("review.selectRating", "Please select a rating"),
        variant: "destructive",
      });
      return;
    }
    if (!comment.trim()) {
      toast({
        title: t("review.writeComment", "Please write a comment"),
        variant: "destructive",
      });
      return;
    }

    if (
      booking.propertyType !== "car" &&
      booking.propertyType !== "apartment"
    ) {
      toast({
        title: "Reviews are only available for cars and apartments.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        booking_id: booking.id,
        property_id: parseInt(booking.propertyId),
        property_type: booking.propertyType as "car" | "apartment",
        rating,
        comment: comment.trim(),
        reviewer_name: booking.requesterName,
      });

      toast({
        title: t("review.submitted", "Review submitted!"),
        description: t("review.thankyou", "Thank you for your feedback."),
      });

      // Invalidate reviews query so they refresh on the property pages
      await queryClient.invalidateQueries({
        queryKey: ["reviews", booking.propertyId, booking.propertyType],
      });

      setRating(0);
      setComment("");
      onClose();
    } catch (error: any) {
      const isDuplicate =
        error?.code === "23505" ||
        error?.message?.includes("duplicate") ||
        error?.message?.includes("unique");

      toast({
        title: isDuplicate
          ? t("review.alreadyReviewed", "You already reviewed this booking")
          : t("review.submitError", "Failed to submit review"),
        description: isDuplicate
          ? undefined
          : error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setComment("");
      onClose();
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            {t("review.writeReview", "Write a Review")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Property Name */}
          {booking.propertyData?.name && (
            <p className="text-sm text-slate-500">
              {t("review.for", "Review for")}:{" "}
              <span className="font-semibold text-slate-700">
                {booking.propertyData.name}
              </span>
            </p>
          )}

          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              {t("review.rating", "Rating")} *
            </Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitting}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-600">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label
              htmlFor="review-comment"
              className="text-sm font-medium text-slate-700"
            >
              {t("review.comment", "Your Review")} *
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t(
                "review.commentPlaceholder",
                "Share your experience with this property...",
              )}
              disabled={submitting}
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-slate-400 text-right">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0 || !comment.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("review.submitting", "Submitting...")}
              </>
            ) : (
              t("review.submit", "Submit Review")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
