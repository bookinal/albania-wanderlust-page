import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ArrowLeft, MapPin, Heart, Share2, Loader2 } from "lucide-react";
import { Destination } from "@albania/shared-types";
import {
  getDestinationById,
  addDestinationToCurrentUserWishlist,
} from "@albania/api-client";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DestinationDetails = () => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDark } = useTheme();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    headerBg: isDark ? '#111111' : '#ffffff',
    headerBorder: isDark ? 'rgba(255,255,255,0.06)' : '#e5e2de',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5',
    cardShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(15,23,42,0.08)',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    backBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    mapFallbackBg: isDark ? 'rgba(255,255,255,0.04)' : '#f0ece8',
    btnOutlineBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    btnOutlineBorder: isDark ? 'rgba(255,255,255,0.14)' : '#d0ccc8',
    thumbBorder: isDark ? 'rgba(255,255,255,0.10)' : '#e5e2de',
  };

  useEffect(() => {
    const fetchDestination = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getDestinationById(id);
        setDestination(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching destination:", err);
        setError("Failed to load destination details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  const handleAddToWishlist = async () => {
    if (!destination) return;

    try {
      setIsAddingToWishlist(true);
      await addDestinationToCurrentUserWishlist(destination.id);
      toast({
        title: "Success",
        description: "Destination added to your wishlist.",
      });
    } catch (err: any) {
      console.error("Failed to add to wishlist:", err);
      if (err.code === "23505") {
        toast({
          title: "Already in Wishlist",
          description: "This destination is already in your wishlist.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Please login to add to wishlist.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShare = async () => {
    if (!destination) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: localize(destination.name),
          text: localize(destination.description),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Destination link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tk.pageBg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E8192C' }} />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: tk.pageBg, padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: tk.pageText, marginBottom: '1rem' }}>
          {error || "Destination not found"}
        </h2>
        <button
          onClick={() => navigate("/")}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#E8192C', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  const mapCenter: [number, number] = [
    destination.lat || 41.3275,
    destination.lng || 19.8187,
  ];

  return (
    <div style={{ minHeight: '100vh', background: tk.pageBg, color: tk.pageText }}>
      {/* Header */}
      <div style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBorder}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => navigate("/")}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: tk.backBg, border: `1px solid ${tk.btnOutlineBorder}`, borderRadius: '0.5rem', color: tk.pageText, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleShare}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', background: tk.btnOutlineBg, border: `1px solid ${tk.btnOutlineBorder}`, borderRadius: '0.5rem', color: tk.dimText, cursor: 'pointer' }}
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', background: tk.btnOutlineBg, border: `1px solid ${tk.btnOutlineBorder}`, borderRadius: '0.5rem', color: '#E8192C', cursor: isAddingToWishlist ? 'not-allowed' : 'pointer', opacity: isAddingToWishlist ? 0.6 : 1 }}
              >
                {isAddingToWishlist ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Main Image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', height: '28rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: tk.cardShadow }}>
              <img
                src={destination.imageUrls[selectedImageIndex] || "/placeholder.svg"}
                alt={localize(destination.name)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
              />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#E8192C', color: '#fff', padding: '0.375rem 1rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                {destination.category}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {destination.imageUrls.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {destination.imageUrls.slice(0, 4).map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{ position: 'relative', height: '5rem', borderRadius: '0.5rem', overflow: 'hidden', border: selectedImageIndex === index ? '3px solid #E8192C' : `2px solid ${tk.thumbBorder}`, cursor: 'pointer', transform: selectedImageIndex === index ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s', padding: 0 }}
                  >
                    <img
                      src={url}
                      alt={`${localize(destination.name)} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                <MapPin className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#E8192C' }} />
                <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: tk.pageText, lineHeight: 1.2 }}>
                  {localize(destination.name)}
                </h1>
              </div>
              <p style={{ fontSize: '1.05rem', color: tk.dimText, lineHeight: 1.7 }}>
                {localize(destination.description)}
              </p>
            </div>

            {/* Location Map */}
            <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow }}>
              <div style={{ height: '18rem' }}>
                {destination.lat && destination.lng ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={mapCenter}>
                      <Popup>
                        <div style={{ textAlign: 'center' }}>
                          <h3 style={{ fontWeight: 700, margin: 0 }}>{localize(destination.name)}</h3>
                          <p style={{ fontSize: '0.875rem', color: '#6b6663', margin: '0.25rem 0 0' }}>{destination.category}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tk.mapFallbackBg }}>
                    <p style={{ color: tk.mutedText }}>Location not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #E8192C, #c0101f)', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: 600, cursor: isAddingToWishlist ? 'not-allowed' : 'pointer', opacity: isAddingToWishlist ? 0.7 : 1, fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(232,25,44,0.35)' }}
              >
                {isAddingToWishlist ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                Add to Wishlist
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`,
                    "_blank",
                  )
                }
                disabled={!destination.lat || !destination.lng}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: tk.btnOutlineBg, color: tk.pageText, border: `1px solid ${tk.btnOutlineBorder}`, borderRadius: '0.625rem', fontWeight: 600, cursor: (!destination.lat || !destination.lng) ? 'not-allowed' : 'pointer', opacity: (!destination.lat || !destination.lng) ? 0.5 : 1, fontSize: '0.9rem' }}
              >
                <MapPin className="w-4 h-4" />
                {t("map.openInGoogleMaps")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
