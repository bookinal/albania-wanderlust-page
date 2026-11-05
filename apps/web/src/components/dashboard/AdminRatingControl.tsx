import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, Loader2, Lock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {
  ADMIN_RATING_MAX,
  ADMIN_RATING_MIN,
  setAdminRating,
  type AdminRatedPropertyType,
} from "@/services/api/adminRatingService";

interface AdminRatingControlProps {
  propertyType: AdminRatedPropertyType;
  propertyId: number;
  /** Saved rating, undefined when the property isn't rated */
  value?: number;
}

/**
 * Admin only: private rating of a property, saved when leaving the field or
 * pressing Enter. Empty field = no rating.
 */
export const AdminRatingControl: React.FC<AdminRatingControlProps> = ({
  propertyType,
  propertyId,
  value,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value?.toString() ?? "");
  }, [value]);

  const save = async () => {
    const trimmed = draft.trim();
    const rating = trimmed === "" ? null : Number(trimmed);

    if (rating !== null && !(rating >= ADMIN_RATING_MIN && rating <= ADMIN_RATING_MAX)) {
      setError(
        t("adminRating.invalid", { min: ADMIN_RATING_MIN, max: ADMIN_RATING_MAX }),
      );
      return;
    }
    setError(null);

    // The database keeps one decimal
    const rounded = rating === null ? null : Math.round(rating * 10) / 10;
    if ((rounded ?? undefined) === value) {
      setDraft(value?.toString() ?? "");
      return;
    }

    try {
      setStatus("saving");
      await setAdminRating(propertyType, propertyId, rounded);
      setDraft(rounded?.toString() ?? "");
      await queryClient.invalidateQueries({
        queryKey: ["admin-ratings", propertyType],
      });
      setStatus("saved");
    } catch {
      setStatus("idle");
      setError(t("adminRating.saveFailed"));
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mb-4 rounded-lg px-3 py-2"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
        border: `1px dashed ${isDark ? "rgba(255,255,255,0.14)" : "#d6d1cb"}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={`admin-rating-${propertyType}-${propertyId}`}
          className="flex min-w-0 items-center gap-1.5 text-xs font-semibold"
          style={{ color: isDark ? "rgba(255,255,255,0.75)" : "#44403c" }}
          title={t("adminRating.hint")}
        >
          <Lock size={13} className="flex-shrink-0" />
          {t("adminRating.label")}
        </label>
        <div className="flex items-center gap-2">
          {status === "saving" && (
            <Loader2 size={14} className="animate-spin" style={{ color: "#E8192C" }} />
          )}
          {status === "saved" && (
            <Check size={14} aria-label={t("adminRating.saved")} style={{ color: "#16a34a" }} />
          )}
          <input
            id={`admin-rating-${propertyType}-${propertyId}`}
            type="number"
            inputMode="decimal"
            min={ADMIN_RATING_MIN}
            max={ADMIN_RATING_MAX}
            step={0.1}
            value={draft}
            placeholder="—"
            disabled={status === "saving"}
            onChange={(e) => {
              setDraft(e.target.value);
              setStatus("idle");
              setError(null);
            }}
            onBlur={(e) => {
              // Unparsable text reads as "" here: don't take it for "remove the rating"
              if (e.currentTarget.validity.badInput) {
                setError(
                  t("adminRating.invalid", { min: ADMIN_RATING_MIN, max: ADMIN_RATING_MAX }),
                );
                return;
              }
              save();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-16 rounded-md px-2 py-1 text-right text-sm outline-none"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
              border: `1px solid ${error ? "#ef4444" : isDark ? "rgba(255,255,255,0.12)" : "#ddd9d5"}`,
              color: isDark ? "#ffffff" : "#111115",
            }}
          />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
};
