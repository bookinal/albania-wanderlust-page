import { Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const MapPreviewCard = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const handleOpenMap = () => {
    window.open("/properties-map", "_blank", "noopener,noreferrer");
  };

  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de';

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '1rem', overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: '12rem', width: '100%', background: 'linear-gradient(135deg, #0a0a0c 0%, #1a0505 50%, #0a0a0c 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.25rem', gap: '0.75rem', color: '#ffffff' }}>
          <Compass className="w-10 h-10" style={{ color: '#E8192C' }} aria-hidden="true" />
          <div>
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              {t("searchResults.mapPreview.title")}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
              {t("searchResults.mapPreview.description")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenMap}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', background: 'rgba(255,255,255,0.92)', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#111115', border: 'none', cursor: 'pointer' }}
            aria-label={t("searchResults.mapPreview.ariaOpen")}
          >
            {t("searchResults.mapPreview.button")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPreviewCard;
