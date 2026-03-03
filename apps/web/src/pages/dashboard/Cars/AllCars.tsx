import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Hsidebar from "../../../components/dashboard/hsidebar";
import {
  getAllCars,
  deleteCar,
  getCarsByOwnerId,
} from "@/services/api/carService";
import { Car } from "@/types/car.types";
import { useNavigate } from "react-router-dom";
import { AddCarDialog } from "./AddCarDialog";
import {
  Search,
  Filter,
  Fuel,
  Settings,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gauge,
  Cog,
  MapPin,
} from "lucide-react";
import Swal from "sweetalert2";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";

const AllCars = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carsData, setCarsData] = useState<Car[]>([]);
  const [currentUser, setUser] = useState<User | null>(null);
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

  const fetchCars = async (user: User) => {
    try {
      setLoading(true);
      setError(null);

      if (user.role === "admin") {
        const data = await getAllCars();
        setCarsData(data || []);
      } else {
        const data = await getCarsByOwnerId(user.id);
        setCarsData(data || []);
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError(t("cars.allCars.error"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars on component mount
  useEffect(() => {
    if (!currentUser) return;
    fetchCars(currentUser);
  }, [currentUser]);

  // Filter and search cars
  const filteredCars = useMemo(() => {
    return carsData.filter((car) => {
      // 1. Search Term Check
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        car.name.toLowerCase().includes(lowerSearchTerm) ||
        car.brand.toLowerCase().includes(lowerSearchTerm) ||
        car.plateNumber.toLowerCase().includes(lowerSearchTerm);

      // 2. Status Filter Check
      const matchesStatus =
        statusFilter === "all" || car.status === statusFilter;

      // 3. Type Filter Check
      const matchesType = typeFilter === "all" || car.type === typeFilter;

      // 4. Transmission Filter Check
      const matchesTransmission =
        transmissionFilter === "all" || car.transmission === transmissionFilter;

      return (
        matchesSearch && matchesStatus && matchesType && matchesTransmission
      );
    });
  }, [carsData, searchTerm, statusFilter, typeFilter, transmissionFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, transmissionFilter]);

  // Calculate stats based on ALL cars, not just filtered ones
  const availableCars = carsData.filter(
    (car) => car.status === "available",
  ).length;
  const rentedCars = carsData.filter((car) => car.status === "rented").length;
  const maintenanceCars = carsData.filter(
    (car) => car.status === "maintenance",
  ).length;
  const avgPrice =
    carsData.length > 0
      ? carsData.reduce((sum, car) => sum + car.pricePerDay, 0) /
        carsData.length
      : 0;

  // Pagination is based on the filtered results
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCars = filteredCars.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handler functions - moved outside of map
  const handleViewCar = (id: number) => {
    navigate(`/dashboard/carInfo/${id}`);
  };

  const handleEditCar = (id: number) => {
    navigate(`/dashboard/carInfo/${id}?edit=true`);
  };

  const handleDeleteCar = async (id: number, name: string) => {
    Swal.fire({
      title: t("cars.allCars.delete.confirmTitle"),
      text: t("cars.allCars.delete.confirmMessage"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("cars.allCars.delete.confirmButton"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCar(id);
          setCarsData((prev) => prev.filter((car) => car.id !== id));
          Swal.fire({
            title: t("cars.allCars.delete.successTitle"),
            text: t("cars.allCars.delete.successMessage"),
            icon: "success",
          });
        } catch (err: any) {
          Swal.fire({
            title: t("common.error", "Error"),
            text:
              err.message ||
              t(
                "cars.allCars.delete.errorMessage",
                "Failed to delete car. Please try again.",
              ),
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return { bg: "#10b981", text: "white" };
      case "rented":
        return { bg: "#3b82f6", text: "white" };
      case "maintenance":
        return { bg: "#f59e0b", text: "white" };
      default:
        return { bg: "#6b7280", text: "white" };
    }
  };

  // Simplified handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleTransmissionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setTransmissionFilter(e.target.value);
  };

  // Show loading state
  if (loading) {
    return (
      <Hsidebar>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-700">
              {t("cars.allCars.loading")}
            </div>
          </div>
        </div>
      </Hsidebar>
    );
  }

  // Show error state
  if (error) {
    return (
      <Hsidebar>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-xl font-semibold text-red-600">{error}</div>
            <button
              onClick={() => currentUser && fetchCars(currentUser)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {t("cars.allCars.retry")}
            </button>
          </div>
        </div>
      </Hsidebar>
    );
  }

  function handleCarAdded(car: any): void {
    setCarsData((prev) => [...prev, car]);
  }

  return (
    <Hsidebar>
      <div className="p-4 sm:p-6 lg:p-8 font-['Inter'] min-h-screen bg-gray-50">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t("cars.allCars.title")}
            </h1>
            <p className="text-gray-500 text-base sm:text-lg">
              {t("cars.allCars.subtitle")}
            </p>
          </div>
          <AddCarDialog onCarAdded={handleCarAdded} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
          {/* Stat 1: Available */}
          <div
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              padding: "20px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 6px rgba(16, 185, 129, 0.4)",
            }}
          >
            <div
              style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}
            >
              {t("cars.allCars.stats.available")}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>
              {availableCars}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              {t("cars.allCars.stats.availableDesc")}
            </div>
          </div>
          {/* Stat 2: Rented */}
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              padding: "20px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 6px rgba(59, 130, 246, 0.4)",
            }}
          >
            <div
              style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}
            >
              {t("cars.allCars.stats.rented")}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>
              {rentedCars}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              {t("cars.allCars.stats.rentedDesc")}
            </div>
          </div>
          {/* Stat 3: Maintenance */}
          <div
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              padding: "20px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 6px rgba(245, 158, 11, 0.4)",
            }}
          >
            <div
              style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}
            >
              {t("cars.allCars.stats.maintenance")}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>
              {maintenanceCars}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              {t("cars.allCars.stats.maintenanceDesc")}
            </div>
          </div>
          {/* Stat 4: Avg Daily Rate */}
          <div
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              padding: "20px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 6px rgba(139, 92, 246, 0.4)",
            }}
          >
            <div
              style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}
            >
              {t("cars.allCars.stats.avgRate")}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>
              ${avgPrice.toFixed(0)}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              {t("cars.allCars.stats.avgRateDesc")}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search - Full width on mobile */}
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={t("cars.allCars.filters.search")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full py-2.5 pl-10 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="all">
                  {t("cars.allCars.filters.allStatus")}
                </option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={handleTypeChange}
                className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="all">
                  {t("cars.allCars.filters.allTypes")}
                </option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Sports">Sports</option>
              </select>

              {/* Transmission Filter */}
              <select
                value={transmissionFilter}
                onChange={handleTransmissionChange}
                className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="all">
                  {t("cars.allCars.filters.allTransmission")}
                </option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600 text-center sm:text-left">
              <span className="font-semibold text-gray-800">
                {filteredCars.length}
              </span>{" "}
              {t("cars.allCars.results", { count: filteredCars.length })}
            </div>
          </div>
        </div>

        {/* Cars Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {paginatedCars.map((car) => {
            const statusColor = getStatusColor(car.status);

            return (
              <div
                key={car.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div
                  className="h-48 sm:h-52 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${car.imageUrls[0]})`,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
                  >
                    {car.status}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1.5 rounded-md text-xs font-semibold">
                    {car.plateNumber}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        {car.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {car.brand} • {car.year}
                      </div>
                    </div>
                    <div className="ml-2 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {car.type}
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Settings
                        size={16}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        {car.transmission}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel size={16} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        {car.fuelType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users
                        size={16}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">
                        {t("cars.allCars.card.seats", { count: car.seats })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge
                        size={16}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        {car.mileage}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin
                        size={16}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        {car.pickUpLocation}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {car.features && car.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {car.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                      {car.features.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                          +{car.features.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">
                        {t("cars.allCars.card.basePrice")}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${car.pricePerDay}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCar(car.id);
                        }}
                        className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">
                          {t("cars.allCars.card.view")}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCar(car.id);
                        }}
                        className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCar(car.id, car.name);
                        }}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Message if no cars found */}
          {filteredCars.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg sm:text-xl font-semibold mb-2">
                {t("cars.allCars.empty.title")}
              </p>
              <p className="text-sm">{t("cars.allCars.empty.message")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">
                {t("cars.allCars.pagination.previous")}
              </span>
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
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
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <span className="hidden sm:inline">
                {t("cars.allCars.pagination.next")}
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </Hsidebar>
  );
};

export default AllCars;
