import { useState } from "react";
import {
  Loader2,
  Heart,
  MapPin,
  Compass,
  Waves,
  Landmark,
  Mountain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Destination } from "@albania/shared-types";
import { useLocalized } from "@/hooks/useLocalized";
// @ts-ignore
import ReactStars from "react-rating-stars-component";

interface DestinationCardProps {
  destination: Destination;
  tk: {
    panelBg: string;
    panelBorder: string;
    panelShadow: string;
    heroGradient: string;
    textMain: string;
    textMuted: string;
    brand: string;
    buttonGhostBg: string;
    buttonGhostBorder: string;
  };
  onAddToWishlist: (id: string) => Promise<void>;
  isLoadingWishlist?: boolean;
}

export const DestinationCard = ({
  destination,
  tk,
  onAddToWishlist,
  isLoadingWishlist = false,
}: DestinationCardProps) => {
  const { localize } = useLocalized();
  const navigate = useNavigate();

  // Helper for category defaults
  const getCategoryDefaults = (category: string) => {
    switch (category?.toLowerCase()) {
      case "beach":
        return {
          bgFallback: "rgba(2,132,199,0.12)",
          icon: <Waves className="w-10 h-10" />,
        };
      case "adventure":
        return {
          bgFallback: "rgba(15,118,110,0.12)",
          icon: <Compass className="w-10 h-10" />,
        };
      case "historic":
        return {
          bgFallback: "rgba(180,83,9,0.12)",
          icon: <Landmark className="w-10 h-10" />,
        };
      default:
        return {
          bgFallback: "rgba(100,116,139,0.12)",
          icon: <Mountain className="w-10 h-10" />,
        };
    }
  };

  const { bgFallback, icon } = getCategoryDefaults(destination.category);

  return (
    <article
      style={{
        background: tk.panelBg,
        border: `1px solid ${tk.panelBorder}`,
        boxShadow: tk.panelShadow,
        borderRadius: "1.5rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "16rem",
          background: bgFallback,
        }}
      >
        {destination.imageUrls?.[0] ? (
          <img
            src={destination.imageUrls[0]}
            alt={localize(destination.name)}
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
              background: tk.heroGradient,
              color: "#ffffff",
            }}
          >
            {icon}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(2,6,23,0) 40%, rgba(2,6,23,0.5) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "1rem",
            bottom: "1rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.45rem 0.8rem",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          {destination.subcategory || "Destination"}
        </div>
      </div>

      <div style={{ padding: "1.2rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.2rem",
            fontWeight: 800,
            color: tk.textMain,
          }}
        >
          {localize(destination.name)}
        </h2>
        <p
          style={{
            margin: "0.75rem 0 0",
            color: tk.textMuted,
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          {localize(destination.description).slice(0, 50)}
          {localize(destination.description).length > 50 ? "..." : ""}
        </p>

        { destination.location && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                marginTop: "1rem",
                color: tk.textMuted,
                fontSize: "0.86rem",
              }}
            >
              <MapPin className="w-4 h-4" />
              {destination.location}
            </div>
          )}

        {destination.rating != null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              marginTop: "0.5rem",
              color: tk.textMuted,
              fontSize: "0.86rem",
              fontWeight: 600,
            }}
          >
            <ReactStars
              count={5}
              value={Number(destination.rating)}
              size={16}
              edit={false}
              isHalf={true}
              activeColor="#ffd700"
            />
            <span style={{ marginTop: "0.15rem" }}>
              {destination.rating} / 5.0
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1.15rem",
          }}
        >
          <button
            onClick={() => navigate(`/destination/${destination.id}`)}
            style={{
              flex: 1,
              padding: "0.8rem 1rem",
              borderRadius: "0.9rem",
              border: "none",
              background: tk.brand,
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Explore
          </button>
          <button
            onClick={() => onAddToWishlist(destination.id)}
            disabled={isLoadingWishlist}
            style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "0.9rem",
              border: `1px solid ${tk.buttonGhostBorder}`,
              background: tk.buttonGhostBg,
              color: tk.textMain,
              cursor: isLoadingWishlist ? "not-allowed" : "pointer",
            }}
          >
            {isLoadingWishlist ? (
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ margin: "0 auto" }}
              />
            ) : (
              <Heart className="w-4 h-4" style={{ margin: "0 auto" }} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
