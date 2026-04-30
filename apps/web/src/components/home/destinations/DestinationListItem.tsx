import { Heart, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { Destination } from "@albania/shared-types";
import { DestinationDescription } from "./DestinationDescription";

interface DestinationListItemProps {
  destination: Destination;
  name: string;
  description: string;
  onView: () => void;
  onWishlist: () => void;
  isWishlistLoading: boolean;
  learnMoreLabel: string;
  readMoreLabel: string;
  showLessLabel: string;
  tokens: {
    background: string;
    borderColor: string;
    shadow: string;
    title: string;
    text: string;
    muted: string;
    accent: string;
    accentSoft: string;
    ghostBg: string;
    ghostBorder: string;
  };
}

export function DestinationListItem({
  destination,
  name,
  description,
  onView,
  onWishlist,
  isWishlistLoading,
  learnMoreLabel,
  readMoreLabel,
  showLessLabel,
  tokens,
}: DestinationListItemProps) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
        gap: "1.2rem",
        padding: "1rem",
        borderRadius: "1.35rem",
        border: `1px solid ${tokens.borderColor}`,
        background: tokens.background,
        boxShadow: tokens.shadow,
      }}
      className="destination-list-item"
    >
      <div style={{ minWidth: 0 }}>
        <img
          src={destination.imageUrls?.[0] || "/images/placeholder.png"}
          alt={name}
          style={{ width: "100%", height: "100%", minHeight: "15rem", maxHeight: "20rem", objectFit: "cover", borderRadius: "1rem" }}
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
      </div>

      <div style={{ display: "grid", gap: "1rem", alignContent: "start", minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", alignItems: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.45rem 0.8rem",
              borderRadius: "9999px",
              background: tokens.accentSoft,
              color: tokens.accent,
              fontSize: "0.84rem",
              fontWeight: 700,
            }}
          >
            <MapPin className="w-3.5 h-3.5" />
            {destination.category}
          </span>
        </div>

        <div style={{ display: "grid", gap: "0.7rem" }}>
          <h2 style={{ color: tokens.title, fontSize: "clamp(1.35rem, 2vw, 1.9rem)", lineHeight: 1.15, fontWeight: 800 }}>
            {name}
          </h2>
          <DestinationDescription
            text={description}
            color={tokens.muted}
            readMoreLabel={readMoreLabel}
            showLessLabel={showLessLabel}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <button
            onClick={onView}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.15rem",
              borderRadius: "0.9rem",
              border: "none",
              background: tokens.accent,
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {learnMoreLabel}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onWishlist}
            disabled={isWishlistLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.85rem 1rem",
              borderRadius: "0.9rem",
              border: `1px solid ${tokens.ghostBorder}`,
              background: tokens.ghostBg,
              color: tokens.text,
              cursor: isWishlistLoading ? "not-allowed" : "pointer",
              fontWeight: 700,
              opacity: isWishlistLoading ? 0.65 : 1,
            }}
          >
            {isWishlistLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" style={{ color: tokens.accent }} />}
          </button>
        </div>
      </div>
    </article>
  );
}
