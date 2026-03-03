import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hsidebar from "../../../components/dashboard/hsidebar";
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
  getAllHotels,
  deleteHotel,
  getAllHotelsByProviderId,
} from "@/services/api/hotelService";
import { Hotel } from "@/types/hotel.types";
import Swal from "sweetalert2";
import { User } from "@/types/user.types";
import { userService } from "@/services/api/userService";
import { useTranslation } from "react-i18next";

// NOTE: In a real app, you would import Swal from 'sweetalert2'
// For this demo, we use window.confirm
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();

  const itemsPerPage = 6;

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        if (!currentUser) {
          console.log("user not found");
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
      if (user.role === "admin") {
        const data = await getAllHotels();
        setHotels(data);
      } else {
        const data = await getAllHotelsByProviderId(user.id);
        setHotels(data);
      }
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
  }, [currentUser]);

  // When filters change, reset to page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
            t(
              "hotels.allHotels.delete.errorMessage",
              "Failed to delete hotel. Please try again.",
            ),
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleHotelAdded = (newHotel: Hotel) => {
    setHotels((prev) => [newHotel, ...prev]);
  };

  const handleViewHotel = (id: number) => {
    navigate(`/dashboard/hotels/${id}`);
  };

  const handleEditHotel = (id: number) => {
    navigate(`/dashboard/hotels/${id}?edit=true`);
  };

  // Filtered hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch =
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || hotel.status === statusFilter;
      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "4+" && hotel.rating >= 4) ||
        (ratingFilter === "4.5+" && hotel.rating >= 4.5);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [searchTerm, statusFilter, ratingFilter, hotels]);

  // Pagination
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHotels = filteredHotels.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Loading state
  if (loading) {
    return (
      <Hsidebar>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2
                size={48}
                className="animate-spin text-blue-600 mx-auto mb-4"
              />
              <p className="text-gray-500 text-lg">
                {t("hotels.allHotels.loading")}
              </p>
            </div>
          </div>
        </div>
      </Hsidebar>
    );
  }

  // Error state
  if (error) {
    return (
      <Hsidebar>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("hotels.allHotels.error.title")}
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => currentUser && fetchHotels(currentUser)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Hsidebar>
    );
  }

  return (
    <Hsidebar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("hotels.allHotels.title")}
            </h1>
            <p className="text-gray-500 text-lg">
              {t("hotels.allHotels.subtitle")}
            </p>
          </div>
          <AddHotelDialog onHotelAdded={handleHotelAdded} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label={t("hotels.allHotels.stats.totalHotels")}
            value={hotels.length}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            label={t("hotels.allHotels.stats.totalRooms")}
            value={hotels.reduce((sum, hotel) => sum + hotel.rooms, 0)}
            gradient="from-fuchsia-400 to-pink-500"
          />
          <StatCard
            label={t("hotels.allHotels.stats.avgOccupancy")}
            value={`${(hotels.reduce((sum, hotel) => sum + hotel.occupancy, 0) / (hotels.length || 1)).toFixed(0)}%`}
            gradient="from-sky-400 to-cyan-500"
          />
          <StatCard
            label={t("hotels.allHotels.stats.avgRating")}
            value={(
              hotels.reduce((sum, hotel) => sum + hotel.rating, 0) /
              (hotels.length || 1)
            ).toFixed(1)}
            gradient="from-emerald-400 to-teal-400"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={t("hotels.allHotels.search.placeholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              {/* Status Filter */}
              <div className="relative flex-1 md:flex-none">
                <Filter
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="w-full md:w-48 pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                >
                  <option value="all">
                    {t("hotels.allHotels.filters.status.all")}
                  </option>
                  <option value="active">
                    {t("hotels.allHotels.filters.status.active")}
                  </option>
                  <option value="maintenance">
                    {t("hotels.allHotels.filters.status.maintenance")}
                  </option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex-1 md:flex-none">
                <select
                  value={ratingFilter}
                  onChange={handleRatingChange}
                  className="w-full md:w-40 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="all">
                    {t("hotels.allHotels.filters.rating.all")}
                  </option>
                  <option value="4.5+">
                    {t("hotels.allHotels.filters.rating.fourFivePlus")}
                  </option>
                  <option value="4+">
                    {t("hotels.allHotels.filters.rating.fourPlus")}
                  </option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500 whitespace-nowrap hidden lg:block">
              {t("hotels.allHotels.results", { count: filteredHotels.length })}
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        {filteredHotels.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="text-gray-300 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {t("hotels.allHotels.empty.title")}
            </h3>
            <p className="text-gray-500">
              {t("hotels.allHotels.empty.message")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {paginatedHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onDelete={handleDelete}
                onView={handleViewHotel}
                onEdit={handleEditHotel}
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              <ChevronLeft size={16} />
              {t("hotels.allHotels.pagination.previous")}
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              {t("hotels.allHotels.pagination.next")}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Hsidebar>
  );
};

// Subcomponents
interface StatCardProps {
  label: string;
  value: string | number;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, gradient }) => (
  <div
    className={`p-6 rounded-2xl text-white bg-gradient-to-br ${gradient} shadow-lg`}
  >
    <div className="text-sm font-medium opacity-90 mb-2">{label}</div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

interface HotelCardProps {
  hotel: Hotel;
  onDelete: (id: number, name: string) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onDelete,
  onView,
  onEdit,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      {/* Image */}
      <div
        className="h-52 bg-cover bg-center relative group-hover:scale-105 transition-transform duration-500"
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
      <div className="p-5 relative bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <MapPin size={16} className="text-blue-500" />
          <span>{hotel.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="font-medium">{hotel.rating}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bed size={16} className="text-gray-400" />
            <span>
              {t("hotels.allHotels.card.rooms", { count: hotel.rooms })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} className="text-gray-400" />
            <span>
              {t("hotels.allHotels.card.occupancy", {
                percentage: hotel.occupancy,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={16} className="text-emerald-500" />
            <span className="font-bold text-gray-900">${hotel.price}</span>
            <span className="text-xs">
              {t("hotels.allHotels.card.perNight")}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onView(hotel.id)}
            className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Eye size={16} /> {t("hotels.allHotels.card.view")}
          </button>
          <button
            onClick={() => onEdit(hotel.id)}
            className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(hotel.id, hotel.name)}
            className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllHotels;
