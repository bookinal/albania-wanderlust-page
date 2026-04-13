import { Hotel } from "@/types/hotel.types";
import { Apartment } from "@/types/apartment.type";
import { Destination } from "@/types/destination.types";
import { Link } from "react-router-dom";
import {
  X,
  MapPin,
  Star,
  BedDouble,
  Users,
  Compass,
  Tag,
  Wifi,
  ChevronRight,
} from "lucide-react";
import { useLocalized } from "@/hooks/useLocalized";
import { useTheme } from "@/context/ThemeContext";

type Selected =
  | { type: "hotel"; data: Hotel }
  | { type: "apartment"; data: Apartment }
  | { type: "destination"; data: Destination }
  | null;

interface MapPropertySidebarProps {
  selected: Selected;
  onClose: () => void;
}

/* ─── Hotel Panel ─────────────────────────────────────────── */
function HotelPanel({ hotel, isDark }: { hotel: Hotel; isDark: boolean }) {
  const cardBg = isDark ? '#1a1a1e' : '#ffffff';
  const textMain = isDark ? '#f5f5f5' : '#111115';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#6b6663';
  const statBg = isDark ? 'rgba(255,255,255,0.06)' : '#f5f2ee';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de';
  const amenityBg = isDark ? 'rgba(232,25,44,0.10)' : '#fef2f2';
  const amenityText = isDark ? '#f87171' : '#b91c1c';
  const fallbackBg = isDark ? 'rgba(232,25,44,0.08)' : '#fef2f2';

  return (
    <>
      <div style={{ position: 'relative', height: '13rem', flexShrink: 0, overflow: 'hidden' }}>
        {hotel.imageUrls?.[0] ? (
          <img src={hotel.imageUrls[0]} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: fallbackBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BedDouble className="w-12 h-12" style={{ color: '#E8192C', opacity: 0.3 }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', background: '#E8192C', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
            Hotel
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: textMain, lineHeight: 1.3, margin: 0 }}>{hotel.name}</h2>
          {hotel.location && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: textMuted, marginTop: '0.25rem' }}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {hotel.location}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {hotel.price && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#E8192C', fontWeight: 500, margin: '0 0 0.25rem' }}>Price / night</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#E8192C', margin: 0 }}>€{hotel.price}</p>
            </div>
          )}
          {hotel.rating && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 500, margin: '0 0 0.25rem' }}>Rating</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                <Star className="w-4 h-4" style={{ fill: '#f59e0b' }} />
                {hotel.rating}
              </p>
            </div>
          )}
          {hotel.rooms && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: textMuted, fontWeight: 500, margin: '0 0 0.25rem' }}>Rooms</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: textMain, display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                <BedDouble className="w-4 h-4" style={{ color: textMuted }} />
                {hotel.rooms}
              </p>
            </div>
          )}
          {hotel.occupancy && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: textMuted, fontWeight: 500, margin: '0 0 0.25rem' }}>Capacity</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: textMain, display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                <Users className="w-4 h-4" style={{ color: textMuted }} />
                {hotel.occupancy} guests
              </p>
            </div>
          )}
        </div>

        {hotel.status && (
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid', background: hotel.status === 'active' ? 'rgba(16,185,129,0.12)' : statBg, color: hotel.status === 'active' ? '#10b981' : textMuted, borderColor: hotel.status === 'active' ? 'rgba(16,185,129,0.3)' : divider }}>
              {hotel.status === 'active' ? '● Available' : hotel.status}
            </span>
          </div>
        )}

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain, marginBottom: '0.5rem' }}>Amenities</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {hotel.amenities.slice(0, 6).map((a, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', background: amenityBg, color: amenityText, fontSize: '0.75rem', fontWeight: 500 }}>
                  <Wifi className="w-3 h-3" />
                  {a}
                </span>
              ))}
              {hotel.amenities.length > 6 && (
                <span style={{ fontSize: '0.75rem', color: textMuted, alignSelf: 'center' }}>+{hotel.amenities.length - 6} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', borderTop: `1px solid ${divider}`, flexShrink: 0 }}>
        <Link to={`/hotelReservation/${hotel.id}`} style={{ display: 'block' }}>
          <button style={{ width: '100%', background: '#E8192C', color: '#fff', fontWeight: 600, padding: '0.875rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(232,25,44,0.35)' }}>
            Book Now
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </>
  );
}

/* ─── Apartment Panel ─────────────────────────────────────── */
function ApartmentPanel({ apartment, isDark }: { apartment: Apartment; isDark: boolean }) {
  const textMain = isDark ? '#f5f5f5' : '#111115';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#6b6663';
  const statBg = isDark ? 'rgba(255,255,255,0.06)' : '#f5f2ee';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de';
  const fallbackBg = isDark ? 'rgba(232,25,44,0.08)' : '#fef2f2';
  const amenityBg = isDark ? 'rgba(232,25,44,0.10)' : '#fef2f2';
  const amenityText = isDark ? '#f87171' : '#b91c1c';

  return (
    <>
      <div style={{ position: 'relative', height: '13rem', flexShrink: 0, overflow: 'hidden' }}>
        {apartment.imageUrls?.[0] ? (
          <img src={apartment.imageUrls[0]} alt={apartment.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: fallbackBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BedDouble className="w-12 h-12" style={{ color: '#E8192C', opacity: 0.3 }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', background: '#E8192C', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
            Apartment
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: textMain, lineHeight: 1.3, margin: 0 }}>{apartment.name}</h2>
          {apartment.location && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: textMuted, marginTop: '0.25rem' }}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {apartment.location}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {apartment.price && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#E8192C', fontWeight: 500, margin: '0 0 0.25rem' }}>Price / night</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#E8192C', margin: 0 }}>€{apartment.price}</p>
            </div>
          )}
          {apartment.rating && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 500, margin: '0 0 0.25rem' }}>Rating</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                <Star className="w-4 h-4" style={{ fill: '#f59e0b' }} />
                {apartment.rating}
              </p>
            </div>
          )}
          {apartment.rooms && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: textMuted, fontWeight: 500, margin: '0 0 0.25rem' }}>Rooms</p>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: textMain, display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                <BedDouble className="w-4 h-4" style={{ color: textMuted }} />
                {apartment.rooms}
              </p>
            </div>
          )}
          {apartment.status && (
            <div style={{ background: statBg, borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: textMuted, fontWeight: 500, margin: '0 0 0.25rem' }}>Status</p>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: apartment.status === 'available' ? '#10b981' : textMuted }}>
                {apartment.status === 'available' ? '● Available' : apartment.status}
              </span>
            </div>
          )}
        </div>

        {apartment.amenities && apartment.amenities.length > 0 && (
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain, marginBottom: '0.5rem' }}>Amenities</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {apartment.amenities.slice(0, 6).map((a, i) => (
                <span key={i} style={{ padding: '0.25rem 0.625rem', borderRadius: '0.5rem', background: amenityBg, color: amenityText, fontSize: '0.75rem', fontWeight: 500 }}>
                  {a}
                </span>
              ))}
              {apartment.amenities.length > 6 && (
                <span style={{ fontSize: '0.75rem', color: textMuted, alignSelf: 'center' }}>+{apartment.amenities.length - 6} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', borderTop: `1px solid ${divider}`, flexShrink: 0 }}>
        <Link to={`/apartmentReservation/${apartment.id}`} style={{ display: 'block' }}>
          <button style={{ width: '100%', background: '#E8192C', color: '#fff', fontWeight: 600, padding: '0.875rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(232,25,44,0.35)' }}>
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </>
  );
}

/* ─── Destination Panel ───────────────────────────────────── */
function DestinationPanel({ destination, isDark }: { destination: Destination; isDark: boolean }) {
  const { localize } = useLocalized();
  const textMain = isDark ? '#f5f5f5' : '#111115';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#6b6663';
  const statBg = isDark ? 'rgba(255,255,255,0.06)' : '#f5f2ee';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de';
  const infoBg = isDark ? 'rgba(232,25,44,0.08)' : '#fef2f2';
  const infoText = isDark ? '#f87171' : '#b91c1c';
  const fallbackBg = isDark ? 'rgba(255,255,255,0.04)' : '#faf8f5';
  const catBg = isDark ? 'rgba(232,25,44,0.12)' : '#fef2f2';
  const catText = isDark ? '#f87171' : '#b91c1c';

  return (
    <>
      <div style={{ position: 'relative', height: '13rem', flexShrink: 0, overflow: 'hidden' }}>
        {destination.imageUrls?.[0] ? (
          <img src={destination.imageUrls[0]} alt={localize(destination.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: fallbackBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass className="w-12 h-12" style={{ color: '#E8192C', opacity: 0.3 }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: catBg, color: catText, border: `1px solid ${isDark ? 'rgba(232,25,44,0.25)' : '#fecaca'}` }}>
            <Tag className="w-3 h-3" />
            {destination.category}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: textMain, lineHeight: 1.3, margin: 0 }}>{localize(destination.name)}</h2>
          {destination.lat && destination.lng && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: textMuted, marginTop: '0.25rem' }}>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
            </p>
          )}
        </div>

        {localize(destination.description) && (
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain, marginBottom: '0.25rem' }}>About</p>
            <p style={{ fontSize: '0.875rem', color: textMuted, lineHeight: 1.6, margin: 0 }}>
              {localize(destination.description)}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: infoBg, borderRadius: '0.75rem', border: `1px solid ${isDark ? 'rgba(232,25,44,0.18)' : '#fecaca'}` }}>
          <Compass className="w-6 h-6 flex-shrink-0" style={{ color: '#E8192C' }} />
          <p style={{ fontSize: '0.875rem', color: infoText, fontWeight: 500, margin: 0 }}>
            Explore this {destination.category.toLowerCase()} destination in Albania
          </p>
        </div>
      </div>
    </>
  );
}

/* ─── Main Sidebar ────────────────────────────────────────── */
export default function MapPropertySidebar({
  selected,
  onClose,
}: MapPropertySidebarProps) {
  const { isDark } = useTheme();
  const isOpen = !!selected;

  const sidebarBg = isDark ? '#111115' : '#ffffff';
  const closeBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.92)';
  const closeColor = isDark ? 'rgba(255,255,255,0.7)' : '#374151';
  const shadowColor = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.25)';

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1099] lg:hidden"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: '100%',
          maxWidth: '24rem',
          background: sidebarBg,
          boxShadow: `-8px 0 40px ${shadowColor}`,
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-in-out',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        className="fixed lg:absolute"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10, width: '2rem', height: '2rem', borderRadius: '9999px', background: closeBg, backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: closeColor, border: 'none', cursor: 'pointer' }}
        >
          <X className="w-4 h-4" />
        </button>

        {selected?.type === "hotel" && (
          <HotelPanel hotel={selected.data as Hotel} isDark={isDark} />
        )}
        {selected?.type === "apartment" && (
          <ApartmentPanel apartment={selected.data as Apartment} isDark={isDark} />
        )}
        {selected?.type === "destination" && (
          <DestinationPanel destination={selected.data as Destination} isDark={isDark} />
        )}
      </div>
    </>
  );
}
