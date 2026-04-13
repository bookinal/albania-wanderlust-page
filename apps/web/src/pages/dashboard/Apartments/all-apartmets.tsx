import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import {
  Search,
  MapPin,
  Star,
  Bed,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChefHat,
  Bath,
  Sofa,
  BedDouble,
  Building2,
} from "lucide-react";
import {
  getDashboardApartments,
  deleteApartment,
} from "@/services/api/apartmentService";
import { Apartment, ApartmentFilters } from "@/types/apartment.type";
import Swal from "sweetalert2";
import { User } from "@/types/user.types";
import { userService } from "@/services/api/userService";
import { AddApartmentDialog } from "./AddApartmentDialog";
import { useTranslation } from "react-i18next";

/* -------------------------------------------------------------------------- */
/*                                   Utils                                    */
/* -------------------------------------------------------------------------- */

const confirmDelete = async (t: any): Promise<boolean> => {
  const result = await Swal.fire({
    title: t("apartment.confirmDelete"),
    text: t("apartment.deleteWarning"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: t("apartment.confirmDeleteButton"),
  });

  if (result.isConfirmed) {
    await Swal.fire({
      title: t("apartment.deleteSuccess"),
      text: t("apartment.deleteSuccessMessage"),
      icon: "success",
    });
    return true;
  }

  return false;
};

/* -------------------------------------------------------------------------- */
/*                               Main Component                                */
/* -------------------------------------------------------------------------- */

const AllApartments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    headerBg: isDark ? '#111111' : '#ffffff',
    headerBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5',
    cardHoverBg: isDark ? 'rgba(255,255,255,0.04)' : '#faf8f5',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#faf8f5',
    inputBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    inputText: isDark ? '#ffffff' : '#111115',
    inputPlaceholder: isDark ? 'rgba(255,255,255,0.25)' : '#9e9994',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    statBg: isDark ? 'rgba(255,255,255,0.04)' : '#f0ece8',
    statBorder: isDark ? 'rgba(255,255,255,0.04)' : '#e5e2de',
    optionBg: isDark ? '#1a1a1a' : '#ffffff',
    actionBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f2ee',
    actionBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    divider: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    emptyBg: isDark ? 'rgba(255,255,255,0.03)' : '#f0ece8',
    emptyBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    emptyIcon: isDark ? 'rgba(255,255,255,0.20)' : '#b8b4b0',
    paginationBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f2ee',
    paginationBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    paginationText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    amenityBg: isDark ? 'rgba(255,255,255,0.06)' : '#f0ece8',
    amenityBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    amenityText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    priceText: isDark ? '#ffffff' : '#111115',
    priceSubText: isDark ? 'rgba(255,255,255,0.35)' : '#9e9994',
    iconMuted: isDark ? 'rgba(255,255,255,0.30)' : '#b8b4b0',
  };

  const [currentUser, setUser] = useState<User | null>(null);

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ApartmentFilters["status"]>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | "4+" | "4.5+">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 6;

  /* ------------------------------- Fetching -------------------------------- */

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (!user) {
          console.log("user not found");
          setUser(null);
          return;
        }
        setUser(user);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchApartments = async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      const providerId = user.role === "admin" ? undefined : user.id;

      const { data, total } = await getDashboardApartments({
        providerId,
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        status: statusFilter,
        rating: ratingFilter,
      });
      
      setApartments(data);
      setTotalItems(total);
    } catch (err) {
      console.error(err);
      setError(t("apartment.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchApartments(currentUser);
  }, [currentUser, currentPage, debouncedSearch, statusFilter, ratingFilter]);

  /* ------------------------------- Handlers -------------------------------- */

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete(t);
    if (!confirmed) return;

    try {
      await deleteApartment(id);
      if (currentUser) {
        fetchApartments(currentUser); // Refetch to maintain correct pagination and total count
      }
    } catch (err: any) {
      console.error("Error deleting apartment:", err);
      Swal.fire({
        title: t("common.error", "Error"),
        text:
          err.message ||
          t(
            "apartment.deleteError",
            "Failed to delete apartment. Please try again.",
          ),
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleView = (id: number) => {
    navigate(`/dashboard/apartments/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/dashboard/apartments/${id}?edit=true`);
  };

  const handleApartmentAdded = () => {
    if (currentUser) {
      setCurrentPage(1); // Go back to page 1 to see the new addition at the top
      fetchApartments(currentUser);
    }
  };

  /* ------------------------------ Pagination -------------------------------- */

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* ------------------------------ States UI -------------------------------- */

  if (loading && apartments.length === 0) {
    return (
      <div className="-m-8 flex min-h-[calc(100vh)] items-center justify-center" style={{ background: tk.pageBg }}>
          <Loader2 size={40} className="animate-spin text-[#e41e20]" />
        </div>
    );
  }

  if (error) {
    return (
      <div className="-m-8 flex min-h-[calc(100vh)] flex-col items-center justify-center gap-4" style={{ background: tk.pageBg }}>
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => currentUser && fetchApartments(currentUser)}
            className="px-4 py-2 bg-[#e41e20] text-white rounded-xl text-sm hover:bg-[#c91a1c] transition"
          >
            {t("apartment.retry")}
          </button>
        </div>
    );
  }

  /* ------------------------------- Render ---------------------------------- */

  return (
    <div className="-m-8 min-h-[calc(100vh)]" style={{ background: tk.pageBg, color: tk.pageText }}>
        {/* ── Header ── */}
        <div className="relative overflow-hidden px-6 py-8 md:px-10" style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBorder}` }}>
          <div className="pointer-events-none absolute -top-20 left-10 h-60 w-60 rounded-full bg-[#e41e20]/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e41e20]/15 ring-1 ring-[#e41e20]/40">
                <Building2 className="h-4 w-4 text-[#e41e20]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: tk.pageText }}>
                  {t("apartment.allApartments")}
                </h1>
                <p className="text-sm" style={{ color: tk.mutedText }}>
                  {t("apartment.manageApartments")} ({totalItems})
                </p>
              </div>
            </div>
            <AddApartmentDialog onApartmentAdded={handleApartmentAdded} />
          </div>
        </div>

        <div className="px-6 py-6 md:px-10">
          {/* ── Filters ── */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: tk.iconMuted }} />
              <input
                className="h-10 w-full rounded-xl pl-10 text-sm focus:outline-none"
                style={{ background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.inputText }}
                placeholder={t("apartment.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="h-10 appearance-none rounded-xl px-4 text-sm focus:outline-none"
              style={{ background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.inputText }}
            >
              <option value="all" style={{ background: tk.optionBg }}>
                {t("apartment.allStatuses")}
              </option>
              <option value="available" style={{ background: tk.optionBg }}>
                {t("apartment.available")}
              </option>
              <option value="rented" style={{ background: tk.optionBg }}>
                {t("apartment.rented")}
              </option>
              <option value="maintenance" style={{ background: tk.optionBg }}>
                {t("apartment.maintenance")}
              </option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="h-10 appearance-none rounded-xl px-4 text-sm focus:outline-none"
              style={{ background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.inputText }}
            >
              <option value="all" style={{ background: tk.optionBg }}>
                {t("apartment.allRatings")}
              </option>
              <option value="4.5+" style={{ background: tk.optionBg }}>
                {t("apartment.rating4_5")}
              </option>
              <option value="4+" style={{ background: tk.optionBg }}>
                {t("apartment.rating4")}
              </option>
            </select>
          </div>

          {/* ── Grid ── */}
          {loading && apartments.length > 0 && (
            <div className="flex justify-center mb-4">
              <Loader2 className="animate-spin text-[#e41e20]" size={24} />
            </div>
          )}
          
          {apartments.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: tk.emptyBg, border: `1px solid ${tk.emptyBorder}` }}>
                <Building2 className="h-7 w-7" style={{ color: tk.emptyIcon }} />
              </div>
              <p className="text-sm font-medium" style={{ color: tk.mutedText }}>
                {t("apartment.noApartmentsFound")}
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              {apartments.map((a) => (
                <ApartmentCard
                  key={a.id}
                  apartment={a}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  tk={tk}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition disabled:opacity-30"
                style={{ background: tk.paginationBg, border: `1px solid ${tk.paginationBorder}`, color: tk.paginationText }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className="h-9 w-9 rounded-xl text-sm font-medium transition"
                  style={currentPage === i + 1
                    ? { background: '#e41e20', color: '#fff' }
                    : { background: tk.paginationBg, border: `1px solid ${tk.paginationBorder}`, color: tk.paginationText }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition disabled:opacity-30"
                style={{ background: tk.paginationBg, border: `1px solid ${tk.paginationBorder}`, color: tk.paginationText }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Card Component                                 */
/* -------------------------------------------------------------------------- */

interface CardProps {
  apartment: Apartment;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  tk: Record<string, string>;
}

const ApartmentCard: React.FC<CardProps> = ({
  apartment,
  onView,
  onEdit,
  onDelete,
  tk,
}) => {
  const { t } = useTranslation();

  const statusCls =
    apartment.status === "available"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : apartment.status === "rented"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <div className="rounded-2xl overflow-hidden transition-colors" style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }}>
      {/* Image */}
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${apartment.imageUrls?.[0] || ''})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusCls}`}
          >
            {apartment.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-base font-bold truncate" style={{ color: tk.pageText }}>
          {apartment.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: tk.mutedText }}>
          <MapPin className="h-3.5 w-3.5" />
          {apartment.address ?? t("apartment.noAddress")}
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { icon: <Star className="h-3.5 w-3.5 text-amber-400" />, label: String(apartment.rating) },
            { icon: <Bed className="h-3.5 w-3.5" style={{ color: tk.iconMuted }} />, label: t("apartment.roomsCount", { count: apartment.rooms }) },
            { icon: <BedDouble className="h-3.5 w-3.5" style={{ color: tk.iconMuted }} />, label: t("apartment.bedCount", { count: apartment.beds }) },
            { icon: <ChefHat className="h-3.5 w-3.5" style={{ color: tk.iconMuted }} />, label: t("apartment.kitchenCount", { count: apartment.kitchens }) },
            { icon: <Bath className="h-3.5 w-3.5" style={{ color: tk.iconMuted }} />, label: t("apartment.bathroomCount", { count: apartment.bathrooms }) },
            { icon: <Sofa className="h-3.5 w-3.5" style={{ color: tk.iconMuted }} />, label: t("apartment.livingRoomCount", { count: apartment.livingRooms }) },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: tk.statBg }}>
              {s.icon}
              <span className="text-xs" style={{ color: tk.dimText }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-[#e41e20]" />
          <span className="text-xl font-bold" style={{ color: tk.priceText }}>
            {apartment.price}
          </span>
          <span className="text-xs" style={{ color: tk.priceSubText }}>{t("apartment.perDay")}</span>
        </div>

        {/* Amenities */}
        {apartment.amenities && apartment.amenities.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {apartment.amenities.map((amenity, i) => (
              <span
                key={i}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{ background: tk.amenityBg, border: `1px solid ${tk.amenityBorder}`, color: tk.amenityText }}
              >
                {amenity}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs" style={{ color: tk.priceSubText }}>
            {t("apartment.noAmenities")}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2 pt-4" style={{ borderTop: `1px solid ${tk.divider}` }}>
          <button
            onClick={() => onView(apartment.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition hover:opacity-80"
            style={{ background: tk.actionBg, border: `1px solid ${tk.actionBorder}`, color: tk.dimText }}
          >
            <Eye size={14} /> {t("apartment.view")}
          </button>
          <button
            onClick={() => onEdit(apartment.id)}
            className="flex items-center justify-center rounded-xl p-2 transition hover:opacity-80"
            style={{ background: tk.actionBg, border: `1px solid ${tk.actionBorder}`, color: tk.mutedText }}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(apartment.id)}
            className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllApartments;
