import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hsidebar from "../../../components/dashboard/hsidebar";
import {
  Search,
  Filter,
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
  Cookie,
  ChefHat,
  Toilet,
  Bath,
  Sofa,
  BedDouble,
} from "lucide-react";
import { getAllApartments } from "@/services/api/apartmentService";
import {
  getApartmentsByProviderId,
  deleteApartment,
} from "@/services/api/apartmentService";
import { Apartment, ApartmentFilters } from "@/types/apartment.type";
import Swal from "sweetalert2";
import { Room } from "@mui/icons-material";
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

  const [currentUser, setUser] = useState<User | null>(null);

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchApartments = async (user: User) => {
    try {
      setLoading(true);
      setError(null);

      if (user.role === "admin") {
        const data = await getAllApartments();
        setApartments(data);
      } else {
        const data = await getApartmentsByProviderId(user.id);
        setApartments(data);
      }
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
  }, [currentUser]);

  /* ------------------------------- Handlers -------------------------------- */

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete(t);
    if (!confirmed) return;

    try {
      await deleteApartment(id);
      setApartments((prev) => prev.filter((a) => a.id !== id));
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

  const handleApartmentAdded = (newApartment: Apartment) => {
    setApartments((prev) => [newApartment, ...prev]);
  };

  /* ------------------------------ Filtering -------------------------------- */

  const filteredApartments = useMemo(() => {
    return apartments.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.address ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;

      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "4+" && a.rating >= 4) ||
        (ratingFilter === "4.5+" && a.rating >= 4.5);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [apartments, searchTerm, statusFilter, ratingFilter]);

  /* ------------------------------ Pagination -------------------------------- */

  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedApartments = filteredApartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ------------------------------ States UI -------------------------------- */

  if (loading) {
    return (
      <Hsidebar>
        <div className="flex justify-center items-center h-96">
          <Loader2 size={48} className="animate-spin text-blue-600" />
        </div>
      </Hsidebar>
    );
  }

  if (error) {
    return (
      <Hsidebar>
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => currentUser && fetchApartments(currentUser)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {t("apartment.retry")}
          </button>
        </div>
      </Hsidebar>
    );
  }

  /* ------------------------------- Render ---------------------------------- */

  return (
    <Hsidebar>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {t("apartment.allApartments")}
            </h1>
            <p className="text-gray-500">{t("apartment.manageApartments")}</p>
          </div>
          <AddApartmentDialog onApartmentAdded={handleApartmentAdded} />
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-10 py-2.5 border rounded-lg"
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
            className="px-4 py-2.5 border rounded-lg"
          >
            <option value="all">{t("apartment.allStatuses")}</option>
            <option value="available">{t("apartment.available")}</option>
            <option value="rented">{t("apartment.rented")}</option>
            <option value="maintenance">{t("apartment.maintenance")}</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border rounded-lg"
          >
            <option value="all">{t("apartment.allRatings")}</option>
            <option value="4.5+">{t("apartment.rating4_5")}</option>
            <option value="4+">{t("apartment.rating4")}</option>
          </select>
        </div>

        {/* Grid */}
        {filteredApartments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <p className="text-gray-500">{t("apartment.noApartmentsFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedApartments.map((a) => (
              <ApartmentCard
                key={a.id}
                apartment={a}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 border rounded-lg"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 border rounded-lg"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Hsidebar>
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
}

const ApartmentCard: React.FC<CardProps> = ({
  apartment,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border hover:shadow-xl transition">
      <div
        className="h-52 bg-cover bg-center"
        style={{ backgroundImage: `url(${apartment.imageUrls[0]})` }}
      />
      <div className="absolute top-3 right-3"></div>
      <div className="p-5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            apartment.status === "available"
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {apartment.status}
        </span>
        <h3 className="text-xl font-bold">{apartment.name}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <MapPin size={16} />
          {apartment.address ?? t("apartment.noAddress")}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Row 1: Rating & Rooms */}
          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-400" />
            <span className="text-sm">{apartment.rating}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed size={16} className="text-gray-500" />
            <span className="text-sm">
              {t("apartment.roomsCount", { count: apartment.rooms })}
            </span>
          </div>

          {/* Row 2: Beds & Kitchens */}
          <div className="flex items-center gap-2">
            <BedDouble size={16} className="text-gray-500" />
            <span className="text-sm">
              {t("apartment.bedCount", { count: apartment.beds })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-gray-500" />
            <span className="text-sm">
              {t("apartment.kitchenCount", { count: apartment.kitchens })}
            </span>
          </div>

          {/* Row 3: Bathrooms & Living Rooms */}
          <div className="flex items-center gap-2">
            <Bath size={16} className="text-gray-500" />
            <span className="text-sm">
              {t("apartment.bathroomCount", { count: apartment.bathrooms })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sofa size={16} className="text-gray-500" />
            <span className="text-sm">
              {t("apartment.livingRoomCount", {
                count: apartment.livingRooms,
              })}
            </span>
          </div>

          {/* Row 4: Price (spans full width) */}
          <div className="flex items-center gap-2 col-span-2">
            <DollarSign size={16} className="text-green-600" />
            <span className="text-lg font-bold">${apartment.price}</span>
            <span className="text-sm text-gray-500">
              {t("apartment.perDay")}
            </span>
          </div>

          {/* Row 5: Amenities (spans full width) */}
          <div className="col-span-2 flex flex-wrap gap-2">
            {apartment.amenities && apartment.amenities.length > 0 ? (
              apartment.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs"
                >
                  {amenity}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">
                {t("apartment.noAmenities")}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t">
          <button
            onClick={() => onView(apartment.id)}
            className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Eye size={16} /> {t("apartment.view")}
          </button>
          <button
            onClick={() => onEdit(apartment.id)}
            className="p-2 bg-gray-50 rounded-lg"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(apartment.id)}
            className="p-2 bg-red-50 text-red-500 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllApartments;
