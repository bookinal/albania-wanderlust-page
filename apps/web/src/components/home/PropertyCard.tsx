import { Star, MapPin, Zap, Building2, Home } from "lucide-react";
import { PropertyCardProps } from "@/types/search.types";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "./homeTheme";

/**
 * Reusable property card component for hotels and apartments — Albanian dark luxury theme
 */
export const PropertyCard = ({
  id,
  name,
  image,
  rating,
  price,
  location,
  address,
  rooms,
  amenities = [],
  status,
  propertyType,
  onClick,
}: PropertyCardProps) => {
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });

  const isAvailable =
    propertyType === "hotel"
      ? status?.toLowerCase() === "active"
      : status?.toLowerCase() === "available";

  const priceLabel = propertyType === "hotel" ? "per night" : "per day";
  const displayAmenities = amenities && amenities.length > 0 ? amenities.slice(0, 3) : [];

  const statusColor = isAvailable
    ? { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' }
    : { bg: homeTk.brandSoft, border: homeTk.brandBorder, text: homeTk.brand };

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
    typeBadgeBg: isDark ? 'rgba(10,10,12,0.7)' : 'rgba(240,236,232,0.88)',
    typeBadgeBorder: isDark ? 'rgba(240,236,232,0.15)' : 'rgba(17,17,21,0.15)',
    typeBadgeText: isDark ? 'rgba(240,236,232,0.75)' : 'rgba(17,17,21,0.7)',
    overlayGrad: isDark
      ? 'linear-gradient(transparent, rgba(10,10,12,0.85))'
      : 'transparent',
    imageBg: isDark ? '#0f0f12' : '#e8e4e0',
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
        flexDirection: 'column',
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
      <div style={{ position: 'relative', overflow: 'hidden', height: 192, background: tk.imageBg }}>
        {image ? (
          <img
            src={image}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tk.imageFallbackBg }}>
            <span style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '2.5rem', color: tk.imageFallbackText, letterSpacing: '0.1em' }}>
              {propertyType === 'hotel' ? 'HOTEL' : 'APT'}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: tk.overlayGrad }} />

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: statusColor.bg,
          border: `1px solid ${statusColor.border}`,
          color: statusColor.text,
          fontFamily: 'Crimson Pro, Georgia, serif',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '3px 10px',
          borderRadius: 2,
        }}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </div>

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: tk.typeBadgeBg,
          border: `1px solid ${tk.typeBadgeBorder}`,
          color: tk.typeBadgeText,
          fontFamily: 'Crimson Pro, Georgia, serif',
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          padding: '3px 10px',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          {propertyType === 'hotel'
            ? <Building2 style={{ width: 11, height: 11 }} />
            : <Home style={{ width: 11, height: 11 }} />}
          {propertyType === 'hotel' ? 'Hotel' : 'Apartment'}
        </div>

        {/* Rating bottom left */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Star style={{ width: 13, height: 13, fill: '#f59e0b', color: '#f59e0b' }} />
          <span style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '1rem',
            color: isDark ? 'rgba(240,236,232,0.8)' : 'rgba(17,17,21,0.6)',
            letterSpacing: '0.05em',
          }}>
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Name */}
        <div style={{ marginBottom: 10 }}>
          <p style={{
            fontFamily: 'Crimson Pro, Georgia, serif',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
             color: homeTk.brand,
            marginBottom: 3,
          }}>
            {propertyType === 'hotel' ? 'Hotel' : 'Apartment'}
          </p>
          <h3 style={{
            fontFamily: 'Crimson Pro, Georgia, serif',
            fontSize: '1.15rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: tk.nameText,
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.3s',
          }}>
            {name}
          </h3>
        </div>

        {/* Location */}
        {(location || address) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 14 }}>
            <MapPin style={{ width: 13, height: 13, color: homeTk.brand, opacity: 0.6, flexShrink: 0, marginTop: 2 }} />
            <span style={{
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: '0.88rem',
              color: tk.locationText,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s',
            }}>
              {location || address}
            </span>
          </div>
        )}

        {/* Rooms */}
        {rooms !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Zap style={{ width: 13, height: 13, color: homeTk.brand, opacity: 0.55 }} />
            <span style={{
              fontFamily: 'Crimson Pro, Georgia, serif',
              fontSize: '0.88rem',
              color: tk.specText,
              transition: 'color 0.3s',
            }}>
              {rooms} room{rooms !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Amenities */}
        {displayAmenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {displayAmenities.map((amenity, idx) => (
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
                transition: 'color 0.3s, background 0.3s',
              }}>
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
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
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 14,
          borderTop: `1px solid ${tk.priceDivider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'border-color 0.3s',
        }}>
          <span style={{
            fontFamily: 'Crimson Pro, Georgia, serif',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: tk.priceLabel,
            transition: 'color 0.3s',
          }}>
            {priceLabel}
          </span>
          <span style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: '1.55rem',
            letterSpacing: '0.02em',
             color: homeTk.brand,
            lineHeight: 1,
          }}>
            €{price}
          </span>
        </div>
      </div>
    </div>
  );
};
