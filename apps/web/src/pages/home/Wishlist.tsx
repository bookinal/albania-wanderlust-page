import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Trash2, Star, ArrowRight, Heart } from "lucide-react";
import { Wishlist } from "@/types/destination.types";
import {
  getCurrentUserWishlist,
  removeDestinationFromCurrentUserWishlist,
} from "@/services/api/destinationService";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const { isDark } = useTheme();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5',
    cardShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(15,23,42,0.08)',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    emptyBg: isDark ? 'rgba(255,255,255,0.03)' : '#f5f2ee',
    emptyBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    iconCircle: isDark ? 'rgba(255,255,255,0.06)' : '#e5e2de',
    ratingBg: isDark ? 'rgba(251,191,36,0.12)' : '#fef9ee',
    ratingText: isDark ? '#fbbf24' : '#92400e',
    divider: isDark ? 'rgba(255,255,255,0.06)' : '#e5e2de',
    trashBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    badgeBg: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.92)',
  };

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        const data = await getCurrentUserWishlist();
        setWishlist(data);
      } catch (err) {
        setError(t("wishlist.loadError"));
      } finally {
        setIsLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = async (destinationId: string) => {
    if (!wishlist) return;

    const previousWishlist = { ...wishlist };
    setWishlist({
      ...wishlist,
      destinations: wishlist.destinations.filter((d) => d.id !== destinationId),
    });

    try {
      await removeDestinationFromCurrentUserWishlist(destinationId);
    } catch (err) {
      setWishlist(previousWishlist);
      alert(t("wishlist.removeError"));
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', background: tk.pageBg }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#E8192C' }} />
        <p style={{ color: tk.mutedText }} className="animate-pulse">
          {t("wishlist.findingFavorites")}
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: tk.pageBg, color: tk.pageText }}>
      <PrimarySearchAppBar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: tk.pageText }}>
              {t("wishlist.savedForLater")}
            </h1>
            <p style={{ color: tk.mutedText, marginTop: '0.5rem' }}>
              {t("wishlist.destinationsCount", {
                count: wishlist?.destinations.length || 0,
              })}
            </p>
          </div>
        </header>

        {!wishlist || wishlist.destinations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 1rem', background: tk.emptyBg, borderRadius: '1rem', border: `2px dashed ${tk.emptyBorder}` }}>
            <div style={{ width: '5rem', height: '5rem', borderRadius: '9999px', background: tk.iconCircle, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Heart className="w-10 h-10" style={{ color: tk.mutedText }} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: tk.pageText }}>
              {t("wishlist.emptyTitle")}
            </h3>
            <p style={{ color: tk.mutedText, marginBottom: '2rem', maxWidth: '18rem', margin: '0 auto 2rem' }}>
              {t("wishlist.emptyDescription")}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '0.75rem 2rem', background: '#E8192C', color: '#fff', border: 'none', borderRadius: '9999px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
            >
              {t("wishlist.exploreDestinations")}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {wishlist.destinations.map((destination) => (
              <div
                key={destination.id}
                style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}`, borderRadius: '1rem', overflow: 'hidden', boxShadow: tk.cardShadow, transition: 'box-shadow 0.2s' }}
              >
                {/* Image Container */}
                <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                  <img
                    src={destination.imageUrls[0]}
                    alt={localize(destination.name)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  />
                  {/* Overlay Actions */}
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    <button
                      onClick={() => handleRemoveFromWishlist(destination.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: tk.trashBg, backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', color: '#E8192C' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: tk.badgeBg, color: '#111115', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
                    {t("wishlist.topRated")}
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#E8192C', fontWeight: 500, fontSize: '0.875rem' }}>
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {localize(destination.name) || t("wishlist.international")}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 700, background: tk.ratingBg, color: tk.ratingText, padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                      <Star className="w-3 h-3 mr-1" style={{ fill: 'currentColor' }} />
                      4.8
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: tk.pageText, marginBottom: '0.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                    {localize(destination.name)}
                  </h3>

                  <p style={{ color: tk.mutedText, fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {localize(destination.description)}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: `1px solid ${tk.divider}` }}>
                    <button
                      onClick={() => navigate(`/destination/${destination.id}`)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#E8192C', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      {t("wishlist.seeMore")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
