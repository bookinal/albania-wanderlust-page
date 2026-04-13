import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Users,
  Bed,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AddHotelDialog } from "./components/AddHotelDialog";
import {
  deleteHotel,
  getDashboardHotels,
  getHotelDashboardStats,
} from "@/services/api/hotelService";
import { Hotel } from "@/types/hotel.types";
import Swal from "sweetalert2";
import { User } from "@/types/user.types";
import { userService } from "@/services/api/userService";
import { useTranslation } from "react-i18next";

const confirmDelete = async (
  hotelId: number,
  hotelName: string,
  t: any,
): Promise<boolean> => {
  return Swal.fire({
    title: t("hotels.allHotels.confirmDelete.title"),
    text: t("hotels.allHotels.confirmDelete.message"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: t("hotels.allHotels.confirmDelete.confirmButton"),
    cancelButtonText: t("common.cancel"),
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: t("hotels.allHotels.confirmDelete.successTitle"),
        text: t("hotels.allHotels.confirmDelete.successMessage", {
          name: hotelName,
        }),
        icon: "success",
      });
      return true;
    }
    return false;
  });
};

const AllHotels = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [totalHotels, setTotalHotels] = useState(0);
  const [stats, setStats] = useState({ totalHotels: 0, totalRooms: 0, avgOccupancy: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { t } = useTranslation();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    headerBg: isDark ? '#111111' : '#ffffff',
    headerBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de',
    filterBg: isDark ? '#111111' : '#ffffff',
    filterBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#faf8f5',
    inputBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    inputText: isDark ? '#ffffff' : '#111115',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    labelText: isDark ? 'rgba(255,255,255,0.25)' : '#9e9994',
    divider: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    emptyBg: isDark ? 'rgba(255,255,255,0.03)' : '#f0ece8',
    emptyBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    emptyIcon: isDark ? 'rgba(255,255,255,0.20)' : '#b8b4b0',
    iconMuted: isDark ? 'rgba(255,255,255,0.30)' : '#b8b4b0',
    paginationBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f2ee',
    paginationBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    paginationText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    paginationActiveBg: '#e41e20',
    optionBg: isDark ? '#1a1a1a' : '#ffffff',
    cardMetaText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    cardIconMuted: isDark ? 'rgba(255,255,255,0.30)' : '#9e9994',
    actionViewBg: isDark ? 'rgba(228,30,32,0.10)' : '#eff6ff',
    actionViewText: isDark ? '#e41e20' : '#2563eb',
    actionViewHoverBg: isDark ? 'rgba(228,30,32,0.18)' : '#dbeafe',
    actionEditBg: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
    actionEditText: isDark ? 'rgba(255,255,255,0.60)' : '#4b5563',
    actionEditHoverBg: isDark ? 'rgba(255,255,255,0.10)' : '#f3f4f6',
    actionDeleteBg: isDark ? 'rgba(239,68,68,0.08)' : '#fff1f2',
    actionDeleteText: isDark ? '#f87171' : '#ef4444',
    actionDeleteHoverBg: isDark ? 'rgba(239,68,68,0.15)' : '#ffe4e6',
  };

  const itemsPerPage = 6;

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        if (!currentUser) {
          setUser(null);
          return;
        }
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const fetchHotels = async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        searchTerm: debouncedSearch,
        status: statusFilter,
        rating: ratingFilter,
        providerId: user.role === "admin" ? undefined : user.id,
      };
      
      const [hotelsResponse, statsResponse] = await Promise.all([
        getDashboardHotels(currentPage, itemsPerPage, filters),
        getHotelDashboardStats(user.role === "admin" ? undefined : user.id)
      ]);
      
      setHotels(hotelsResponse.data);
      setTotalHotels(hotelsResponse.total);
      setStats(statsResponse);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Failed to load hotels. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchHotels(currentUser);
  }, [currentUser, currentPage, debouncedSearch, statusFilter, ratingFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRatingFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirmDelete(id, name, t);
    if (confirmed) {
      try {
        await deleteHotel(id);
        setHotels((prev) => prev.filter((h) => h.id !== id));
      } catch (err: any) {
        console.error("Error deleting hotel:", err);
        Swal.fire({
          title: t("common.error", "Error"),
          text:
            err.message ||
            t("hotels.allHotels.delete.errorMessage", "Failed to delete hotel. Please try again."),
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleHotelAdded = (newHotel: Hotel) => {
    // If on the first page, just re-fetch to ensure correct sorting and count
    if (currentPage === 1 && currentUser) {
      fetchHotels(currentUser);
    } else {
      setCurrentPage(1); // Navigating to page 1 will trigger a refetch
    }
  };

  const handleViewHotel = (id: number) => {
    navigate(`/dashboard/hotels/${id}`);
  };

  const handleEditHotel = (id: number) => {
    navigate(`/dashboard/hotels/${id}?edit=true`);
  };

  const totalPages = Math.ceil(totalHotels / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const selectStyle: React.CSSProperties = {
    background: tk.inputBg,
    border: `1px solid ${tk.inputBorder}`,
    color: tk.inputText,
    borderRadius: '8px',
    padding: '0 12px',
    fontSize: '14px',
    outline: 'none',
    appearance: 'none' as any,
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <div className="-m-8 min-h-[calc(100vh)] flex items-center justify-center" style={{ background: tk.pageBg }}>
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-[#e41e20] mx-auto mb-4" />
            <p className="text-lg" style={{ color: tk.mutedText }}>
              {t("hotels.allHotels.loading")}
            </p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="-m-8 min-h-[calc(100vh)] flex items-center justify-center" style={{ background: tk.pageBg }}>
          <div className="text-center">
            <div className="text-[#e41e20] mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: tk.pageText }}>
              {t("hotels.allHotels.error.title")}
            </h3>
            <p className="mb-4" style={{ color: tk.mutedText }}>{error}</p>
            <button
              onClick={() => currentUser && fetchHotels(currentUser)}
              className="px-4 py-2 rounded-lg text-white transition-colors"
              style={{ background: '#e41e20' }}
            >
              Try Again
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="-m-8 min-h-[calc(100vh)]" style={{ background: tk.pageBg, color: tk.pageText }}>
        {/* Header */}
        <div
          className="relative overflow-hidden px-6 py-8 md:px-10"
          style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBorder}` }}
        >
          <div className="pointer-events-none absolute -top-20 right-10 h-60 w-60 rounded-full bg-[#e41e20]/8 blur-3xl" />
          <div className="relative flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: tk.pageText }}>
                {t("hotels.allHotels.title")}
              </h1>
              <p className="text-lg" style={{ color: tk.mutedText }}>
                {t("hotels.allHotels.subtitle")}
              </p>
            </div>
            <AddHotelDialog onHotelAdded={handleHotelAdded} />
          </div>
        </div>

        <div className="px-6 py-6 md:px-10">
          {/* Stats Cards — colorful gradients work on both themes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              label={t("hotels.allHotels.stats.totalHotels")}
              value={stats.totalHotels}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              label={t("hotels.allHotels.stats.totalRooms")}
              value={stats.totalRooms}
              gradient="from-fuchsia-400 to-pink-500"
            />
            <StatCard
              label={t("hotels.allHotels.stats.avgOccupancy")}
              value={`${stats.avgOccupancy.toFixed(0)}%`}
              gradient="from-sky-400 to-cyan-500"
            />
            <StatCard
              label={t("hotels.allHotels.stats.avgRating")}
              value={stats.avgRating.toFixed(1)}
              gradient="from-emerald-400 to-teal-400"
            />
          </div>

          {/* Filters */}
          <div
            className="p-6 rounded-xl mb-8"
            style={{ background: tk.filterBg, border: `1px solid ${tk.filterBorder}` }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: tk.iconMuted }}
                />
                <input
                  type="text"
                  placeholder={t("hotels.allHotels.search.placeholder")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '16px',
                    background: tk.inputBg,
                    border: `1px solid ${tk.inputBorder}`,
                    color: tk.inputText,
                  }}
                />
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                {/* Status Filter */}
                <div className="relative flex-1 md:flex-none">
                  <Filter
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: tk.iconMuted }}
                  />
                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    style={{ ...selectStyle, paddingLeft: '38px', paddingRight: '32px', height: '42px', width: '192px' }}
                  >
                    <option value="all" style={{ background: tk.optionBg }}>
                      {t("hotels.allHotels.filters.status.all")}
                    </option>
                    <option value="active" style={{ background: tk.optionBg }}>
                      {t("hotels.allHotels.filters.status.active")}
                    </option>
                    <option value="maintenance" style={{ background: tk.optionBg }}>
                      {t("hotels.allHotels.filters.status.maintenance")}
                    </option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="flex-1 md:flex-none">
                  <select
                    value={ratingFilter}
                    onChange={handleRatingChange}
                    style={{ ...selectStyle, height: '42px', width: '160px', padding: '0 12px' }}
                  >
                    <option value="all" style={{ background: tk.optionBg }}>
                      {t("hotels.allHotels.filters.rating.all")}
                    </option>
                    <option value="4.5+" style={{ background: tk.optionBg }}>
                      {t("hotels.allHotels.filters.rating.fourFivePlus")}
                    </option>
                    <option value="4+" style={{ background: tk.optionBg }}>
                      {t("hotels.allHotels.filters.rating.fourPlus")}
                    </option>
                  </select>
                </div>
              </div>

              <div className="text-sm hidden lg:block" style={{ color: tk.mutedText, whiteSpace: 'nowrap' }}>
                {t("hotels.allHotels.results", { count: totalHotels })}
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          {hotels.length === 0 ? (
            <div
              className="text-center py-20 rounded-xl"
              style={{ background: tk.emptyBg, border: `1px solid ${tk.emptyBorder}` }}
            >
              <div className="mb-4" style={{ color: tk.emptyIcon }}>
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium" style={{ color: tk.pageText }}>
                {t("hotels.allHotels.empty.title")}
              </h3>
              <p style={{ color: tk.mutedText }}>
                {t("hotels.allHotels.empty.message")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onDelete={handleDelete}
                  onView={handleViewHotel}
                  onEdit={handleEditHotel}
                  tk={tk}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: currentPage === 1 ? tk.paginationBg : tk.paginationBg,
                  border: `1px solid ${tk.paginationBorder}`,
                  color: currentPage === 1 ? tk.labelText : tk.paginationText,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={16} />
                {t("hotels.allHotels.pagination.previous")}
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: currentPage === page ? '#e41e20' : tk.paginationBg,
                      border: `1px solid ${currentPage === page ? '#e41e20' : tk.paginationBorder}`,
                      color: currentPage === page ? '#ffffff' : tk.paginationText,
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: tk.paginationBg,
                  border: `1px solid ${tk.paginationBorder}`,
                  color: currentPage === totalPages ? tk.labelText : tk.paginationText,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                {t("hotels.allHotels.pagination.next")}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

// ── StatCard — colorful gradient, works on both themes ──────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, gradient }) => (
  <div className={`p-6 rounded-2xl text-white bg-gradient-to-br ${gradient} shadow-lg`}>
    <div className="text-sm font-medium opacity-90 mb-2">{label}</div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

// ── HotelCard ────────────────────────────────────────────────────────────────
interface HotelCardProps {
  hotel: Hotel;
  onDelete: (id: number, name: string) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  tk: Record<string, string>;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onDelete, onView, onEdit, tk }) => {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 group"
      style={{
        background: tk.cardBg,
        border: `1px solid ${tk.cardBorder}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image */}
      <div
        className="h-52 bg-cover bg-center relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${hotel.imageUrls?.[0]})`,
        }}
      >
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              hotel.status === "active"
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {hotel.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2" style={{ color: tk.pageText }}>
          {hotel.name}
        </h3>

        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: tk.cardMetaText }}>
          <MapPin size={16} className="text-[#e41e20]" />
          <span>{hotel.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5">
          <div className="flex items-center gap-2 text-sm" style={{ color: tk.dimText }}>
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="font-medium">{hotel.rating}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: tk.dimText }}>
            <Bed size={16} style={{ color: tk.cardIconMuted }} />
            <span>{t("hotels.allHotels.card.rooms", { count: hotel.rooms })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: tk.dimText }}>
            <Users size={16} style={{ color: tk.cardIconMuted }} />
            <span>{t("hotels.allHotels.card.occupancy", { percentage: hotel.occupancy })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: tk.dimText }}>
            <DollarSign size={16} className="text-emerald-500" />
            <span className="font-bold" style={{ color: tk.pageText }}>${hotel.price}</span>
            <span className="text-xs" style={{ color: tk.cardMetaText }}>
              {t("hotels.allHotels.card.perNight")}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-4" style={{ borderTop: `1px solid ${tk.divider}` }}>
          <button
            onClick={() => onView(hotel.id)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{ background: tk.actionViewBg, color: tk.actionViewText }}
          >
            <Eye size={16} /> {t("hotels.allHotels.card.view")}
          </button>
          <button
            onClick={() => onEdit(hotel.id)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: tk.actionEditBg, color: tk.actionEditText }}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(hotel.id, hotel.name)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: tk.actionDeleteBg, color: tk.actionDeleteText }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllHotels;
