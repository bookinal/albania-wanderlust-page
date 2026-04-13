import { Hotel } from "@/types/hotel.types";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

interface HotelPopupProps {
  hotel: Hotel;
}

export function HotelPopup({ hotel }: HotelPopupProps) {
  const { isDark } = useTheme();

  const popupBg = isDark ? '#1a1a1e' : '#ffffff';
  const popupText = isDark ? '#f5f5f5' : '#111115';
  const mutedText = isDark ? 'rgba(255,255,255,0.5)' : '#6b6663';
  const statBg = isDark ? 'rgba(255,255,255,0.06)' : '#f5f2ee';
  const amenityBg = isDark ? 'rgba(232,25,44,0.10)' : '#fef2f2';
  const amenityText = isDark ? '#f87171' : '#b91c1c';

  return (
    <div style={{ width: '16rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: popupBg, color: popupText }}>
      <div>
        <h3 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{hotel.name}</h3>
        <img
          src={hotel.imageUrls[0]}
          alt={hotel.name}
          style={{ width: '100%', height: '8rem', objectFit: 'cover', borderRadius: '0.375rem', margin: '0.5rem 0' }}
        />
        <p style={{ fontSize: '0.875rem', color: mutedText, margin: 0 }}>{hotel.location}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', background: statBg, borderRadius: '0.375rem' }}>
          <span style={{ fontWeight: 500 }}>Price:</span>
          <span style={{ color: '#E8192C', fontWeight: 700 }}>€{hotel.price} / night</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500 }}>Rooms:</span>
          <span>{hotel.rooms}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500 }}>Occupancy:</span>
          <span>{hotel.occupancy} guests</span>
        </div>
        {hotel.rating && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 500 }}>Rating:</span>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {hotel.rating}</span>
          </div>
        )}
        {hotel.status && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>Status:</span>
            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', background: hotel.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)', color: hotel.status === 'active' ? '#10b981' : mutedText }}>
              {hotel.status}
            </span>
          </div>
        )}
      </div>

      {hotel.amenities && hotel.amenities.length > 0 && (
        <div>
          <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Amenities:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                style={{ fontSize: '0.75rem', background: amenityBg, color: amenityText, padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span style={{ fontSize: '0.75rem', color: mutedText }}>
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <Link to={`/hotelReservation/${hotel.id}`}>
        <button style={{ width: '100%', background: '#E8192C', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
          Book Now
        </button>
      </Link>
    </div>
  );
}
