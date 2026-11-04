import {
  Fuel,
  MapPin,
  Settings,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "./homeTheme";

interface CarCardProps {
  id: number;
  name: string;
  brand: string;
  type: "Sedan" | "SUV" | "Sports";
  year: number;
  transmission: "Manual" | "Automatic";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  pricePerDay: number;
  currentMonthPrice?: number;
  status: "available" | "rented" | "maintenance" | "review";
  plateNumber: string;
  features?: string[];
  imageUrls?: string[];
  pickUpLocation: string;
  onClick: (id: number) => void;
  /** Compact row: image on the left, text on the right (phone result lists) */
  horizontal?: boolean;
}

/**
 * Reusable car card component for car rentals — Albanian dark luxury theme
 */
export const CarCard = ({
  id,
  name,
  brand,
  type,
  year,
  transmission,
  fuelType,
  pricePerDay,
  currentMonthPrice,
  status,
  features = [],
  imageUrls,
  pickUpLocation,
  onClick,
  horizontal = false,
}: CarCardProps) => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });

  const displayPrice = currentMonthPrice ?? pricePerDay;
  const hasSeasonalPrice =
    currentMonthPrice !== undefined && currentMonthPrice !== pricePerDay;
  const isPriceHigher = hasSeasonalPrice && currentMonthPrice! > pricePerDay;
  const isPriceLower = hasSeasonalPrice && currentMonthPrice! < pricePerDay;
  const isAvailable = status.toLowerCase() === "available";

  const displayFeatures = features && features.length > 0 ? features.slice(0, 3) : [];

  const statusColor = isAvailable
    ? { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' }
    : { bg: homeTk.brandSoft, border: homeTk.brandBorder, text: homeTk.brand };

  const statusLabel = (() => {
    switch (status.toLowerCase()) {
      case "available": return "Available";
      case "rented": return "Rented";
      case "maintenance": return "Maintenance";
      default: return status;
    }
  })();

  // Theme tokens
  const tk = {
    cardBg: isDark ? '#141417' : '#ffffff',
    cardBorder: isDark ? homeTk.brandSoft : isBlue ? 'rgba(2, 132, 199, 0.16)' : 'rgba(232,25,44,0.14)',
    imageFallbackBg: isDark
      ? 'linear-gradient(135deg, #0f0f12, #1a1a1f)'
      : 'linear-gradient(135deg, #f4f1ee, #e8e4e0)',
    imageFallbackText: isDark ? homeTk.brandSoftStrong : isBlue ? 'rgba(2, 132, 199, 0.24)' : 'rgba(232,25,44,0.2)',
    nameText: isDark ? '#f0ece8' : '#111115',
    locationText: isDark ? 'rgba(240,236,232,0.45)' : 'rgba(17,17,21,0.45)',
    specText: isDark ? 'rgba(240,236,232,0.55)' : 'rgba(17,17,21,0.55)',
    featureText: isDark ? 'rgba(240,236,232,0.45)' : 'rgba(17,17,21,0.5)',
    featureBg: isDark ? 'rgba(240,236,232,0.05)' : 'rgba(17,17,21,0.04)',
    featureBorder: isDark ? 'rgba(240,236,232,0.1)' : 'rgba(17,17,21,0.1)',
    priceDivider: isDark ? homeTk.brandSoft : isBlue ? 'rgba(2, 132, 199, 0.14)' : 'rgba(232,25,44,0.12)',
    priceLabel: isDark ? 'rgba(240,236,232,0.35)' : 'rgba(17,17,21,0.4)',
    strikeText: isDark ? 'rgba(240,236,232,0.25)' : 'rgba(17,17,21,0.3)',
  };

  return (
    <div
      onClick={() => onClick(id)}
      style={{
        background: tk.cardBg,
        border: `1px solid ${tk.cardBorder}`,
        borderRadius: 6,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        height: '100%',
        transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s, background 0.3s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = homeTk.brandBorder;
        el.style.boxShadow = isDark
          ? `0 12px 40px ${homeTk.brandSoft}, 0 2px 8px rgba(0,0,0,0.5)`
          : `0 12px 40px ${homeTk.brandSoft}, 0 2px 8px rgba(0,0,0,0.08)`;
        el.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = tk.cardBorder;
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: isDark ? '#0f0f12' : '#e8e4e0',
          ...(horizontal ? { width: '38%', flexShrink: 0, minHeight: 132 } : { height: 192 }),
        }}
      >
        {imageUrls && imageUrls[0] ? (
          <img
            src={imageUrls[0]}
            alt={`${brand} ${name}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              display: 'block',
              // Fills the row height, whatever the height of the text next to it
              ...(horizontal ? { position: 'absolute' as const, inset: 0 } : {}),
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: tk.imageFallbackBg,
              ...(horizontal ? { position: 'absolute' as const, inset: 0 } : {}),
            }}
          >
            <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: horizontal ? '1.5rem' : '3rem', color: tk.imageFallbackText, letterSpacing: '0.1em' }}>{brand}</span>
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: isDark
            ? 'linear-gradient(transparent, rgba(10,10,12,0.85))'
            : 'transparent',
        }} />

        {/* Status badge */}
        <div style={{
          position: 'absolute',
          ...(horizontal ? { bottom: 6, left: 6 } : { top: 12, right: 12 }),
          // Small badge over the photo: needs a solid background to stay readable
          background: horizontal ? 'rgba(10,10,12,0.75)' : statusColor.bg,
          border: `1px solid ${statusColor.border}`,
          color: statusColor.text,
          fontFamily: 'Crimson Pro, Georgia, serif',
          fontSize: horizontal ? '0.62rem' : '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: horizontal ? '1px 6px' : '3px 10px',
          borderRadius: 2,
        }}>
          {statusLabel}
        </div>

        {/* Type badge */}
        <div style={{
          position: 'absolute',
          ...(horizontal ? { top: 6, left: 6 } : { top: 12, left: 12 }),
          background: isDark ? 'rgba(10,10,12,0.7)' : 'rgba(240,236,232,0.85)',
          border: isDark ? '1px solid rgba(240,236,232,0.15)' : '1px solid rgba(17,17,21,0.15)',
          color: isDark ? 'rgba(240,236,232,0.75)' : 'rgba(17,17,21,0.7)',
          fontFamily: 'Crimson Pro, Georgia, serif',
          fontSize: horizontal ? '0.62rem' : '0.75rem',
          letterSpacing: '0.08em',
          padding: horizontal ? '1px 6px' : '3px 10px',
          borderRadius: 2,
        }}>
          {type}
        </div>

        {/* Year bottom left (next to the brand in the horizontal layout) */}
        {!horizontal && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '1rem',
            color: isDark ? 'rgba(240,236,232,0.6)' : 'rgba(17,17,21,0.5)',
            letterSpacing: '0.05em',
          }}>
            {year}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          padding: horizontal ? '10px 12px' : '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        {/* Brand + Name */}
        <div style={{ marginBottom: horizontal ? 4 : 10 }}>
          <p style={{
            fontFamily: 'Crimson Pro, Georgia, serif',
            fontSize: horizontal ? '0.65rem' : '0.7rem',
            letterSpacing: horizontal ? '0.12em' : '0.2em',
            textTransform: 'uppercase',
             color: homeTk.brand,
            marginBottom: horizontal ? 1 : 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {brand}{horizontal && ` · ${year}`}
          </p>
          <h3 style={{
            fontFamily: 'Crimson Pro, Georgia, serif',
            fontSize: horizontal ? '1.05rem' : '1.15rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: tk.nameText,
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {name}
          </h3>
        </div>

        {/* Location */}
        {pickUpLocation && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: horizontal ? 5 : 14 }}>
            <MapPin style={{ width: 13, height: 13, color: homeTk.brand, opacity: 0.6, flexShrink: 0, marginTop: 2 }} />
            <span style={{
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: '0.88rem',
              color: tk.locationText,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {pickUpLocation}
            </span>
          </div>
        )}

        {/* Specs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: horizontal ? '4px 8px' : '8px 12px', marginBottom: horizontal ? 8 : 14 }}>
          {[
            { icon: <Settings style={{ width: 13, height: 13 }} />, label: transmission },
            { icon: <Fuel style={{ width: 13, height: 13 }} />, label: fuelType },
          ].map((spec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               <span style={{ color: homeTk.brand, opacity: 0.55 }}>{spec.icon}</span>
              <span style={{
                fontFamily: 'Crimson Pro, Georgia, serif',
                fontSize: '0.88rem',
                color: tk.specText,
              }}>
                {spec.label}
              </span>
            </div>
          ))}
        </div>

        {/* Features */}
        {displayFeatures.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {displayFeatures.map((feature, idx) => (
              <span key={idx} style={{
                fontFamily: 'Crimson Pro, Georgia, serif',
                fontSize: '0.72rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: tk.featureText,
                background: tk.featureBg,
                border: `1px solid ${tk.featureBorder}`,
                padding: '2px 8px',
                borderRadius: 2,
              }}>
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span style={{
                fontFamily: 'Crimson Pro, Georgia, serif',
                fontSize: '0.72rem',
                letterSpacing: '0.07em',
                 color: homeTk.brand,
                 background: homeTk.brandSoft,
                 border: `1px solid ${homeTk.brandBorder}`,
                padding: '2px 8px',
                borderRadius: 2,
              }}>
                +{features.length - 3} {t("common.more")}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div style={{
          marginTop: 'auto',
          paddingTop: horizontal ? 7 : 14,
          borderTop: `1px solid ${tk.priceDivider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: horizontal ? '0.62rem' : '0.8rem',
              letterSpacing: horizontal ? '0.04em' : '0.08em',
              lineHeight: horizontal ? 1.2 : undefined,
              textTransform: 'uppercase',
              color: tk.priceLabel,
            }}>
              {t("billing.pricePerDay")}
            </span>
            {isPriceHigher && <span title="Peak season"><TrendingUp style={{ width: 13, height: 13, color: '#f59e0b' }} /></span>}
            {isPriceLower && <span title="Off-season"><TrendingDown style={{ width: 13, height: 13, color: '#4ade80' }} /></span>}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
            <span style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: horizontal ? '1.35rem' : '1.55rem',
              letterSpacing: '0.02em',
               color: isPriceLower ? '#4ade80' : homeTk.brand,
              lineHeight: 1,
            }}>
              €{displayPrice}
            </span>
            {hasSeasonalPrice && (
              <span style={{
                fontFamily: 'Crimson Pro, Georgia, serif',
                fontSize: '0.78rem',
                color: tk.strikeText,
                textDecoration: 'line-through',
                marginLeft: 6,
              }}>
                €{pricePerDay}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
