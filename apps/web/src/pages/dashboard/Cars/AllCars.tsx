import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import {
  deleteCar,
  getDashboardCars,
  getCarDashboardStats,
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
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const tk = {
    pageBg:        isDark ? '#0a0a0c'        : '#f5f4f1',
    cardBg:        isDark ? '#111115'        : '#ffffff',
    cardBorder:    isDark ? '#2a2a30'        : '#e5e2de',
    headerText:    isDark ? '#f0ece8'        : '#111115',
    subText:       isDark ? '#9a9490'        : '#6b6560',
    bodyText:      isDark ? '#c8c4c0'        : '#3a3530',
    mutedText:     isDark ? '#6a6460'        : '#9a9490',
    inputBg:       isDark ? '#1a1a1f'        : '#ffffff',
    inputBorder:   isDark ? '#2a2a30'        : '#d5d2ce',
    inputFocusBorder: '#E8192C',
    filterBg:      isDark ? '#111115'        : '#ffffff',
    filterBorder:  isDark ? '#2a2a30'        : '#e5e2de',
    typeBadgeBg:   isDark ? '#2a2a30'        : '#f0ece8',
    typeBadgeText: isDark ? '#c8c4c0'        : '#3a3530',
    featureBg:     isDark ? 'rgba(232,25,44,0.12)' : 'rgba(232,25,44,0.08)',
    featureText:   '#E8192C',
    featureMoreBg: isDark ? '#2a2a30'        : '#f0ece8',
    featureMoreText: isDark ? '#9a9490'      : '#6b6560',
    priceBorder:   isDark ? '#2a2a30'        : '#e5e2de',
    priceLabel:    isDark ? '#6a6460'        : '#9a9490',
    priceText:     isDark ? '#f0ece8'        : '#111115',
    viewBtnBg:     isDark ? 'rgba(232,25,44,0.12)' : 'rgba(232,25,44,0.08)',
    viewBtnText:   '#E8192C',
    viewBtnHover:  isDark ? 'rgba(232,25,44,0.22)' : 'rgba(232,25,44,0.15)',
    editBtnBg:     isDark ? '#1e1e24'        : '#f5f4f1',
    editBtnText:   isDark ? '#c8c4c0'        : '#3a3530',
    deleteBtnBg:   isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)',
    deleteBtnText: '#ef4444',
    pagDisabledBg: isDark ? '#1e1e24'        : '#f0ece8',
    pagDisabledText: isDark ? '#4a4a50'      : '#b0ada8',
    pagActiveBg:   '#E8192C',
    pagActiveText: '#ffffff',
    pagInactiveBg: isDark ? '#1a1a1f'        : '#ffffff',
    pagInactiveText: isDark ? '#c8c4c0'      : '#3a3530',
    pagInactiveBorder: isDark ? '#2a2a30'    : '#e5e2de',
    shadow:        isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.08)',
    shadowHover:   isDark ? '0 8px 32px rgba(0,0,0,0.7)' : '0 8px 24px rgba(0,0,0,0.14)',
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carsData, setCarsData] = useState<Car[]>([]);
  const [totalCars, setTotalCars] = useState(0);
  const [stats, setStats] = useState({ available: 0, rented: 0, maintenance: 0, avgPrice: 0 });
  const [currentUser, setUser] = useState<User | null>(null);
  
  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
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

      const filters = {
        searchTerm: debouncedSearch,
        status: statusFilter,
        type: typeFilter,
        transmission: transmissionFilter,
        providerId: user.role === "admin" ? undefined : user.id,
      };

      const [carsResponse, statsResponse] = await Promise.all([
        getDashboardCars(currentPage, itemsPerPage, filters),
        // Only need to fetch stats when filters change? No, stats don't need filters except providerId
        // Wait, stats usually shouldn't depend on the search filters, they should be global.
        getCarDashboardStats(user.role === "admin" ? undefined : user.id)
      ]);

      setCarsData(carsResponse.data);
      setTotalCars(carsResponse.total);
      setStats(statsResponse);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError(t("cars.allCars.error"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars on component mount or when filters change
  useEffect(() => {
    if (!currentUser) return;
    fetchCars(currentUser);
  }, [currentUser, currentPage, debouncedSearch, statusFilter, typeFilter, transmissionFilter]);

  // Pagination is based on the server total
  const totalPages = Math.max(1, Math.ceil(totalCars / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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
      <div style={{ background: tk.pageBg, minHeight: '100vh' }} className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: tk.subText }}>
              {t("cars.allCars.loading")}
            </div>
          </div>
        </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ background: tk.pageBg, minHeight: '100vh' }} className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ef4444' }}>{error}</div>
            <button
              onClick={() => currentUser && fetchCars(currentUser)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.25rem',
                background: '#E8192C',
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {t("cars.allCars.retry")}
            </button>
          </div>
        </div>
    );
  }

  function handleCarAdded(car: any): void {
    setCarsData((prev) => [...prev, car]);
  }

  return (
    <div style={{ background: tk.pageBg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h1 style={{ color: tk.headerText, fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {t("cars.allCars.title")}
            </h1>
            <p style={{ color: tk.subText, fontSize: '1rem' }}>
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
              {stats.available}
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
              {stats.rented}
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
              {stats.maintenance}
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
              ${stats.avgPrice.toFixed(0)}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              {t("cars.allCars.stats.avgRateDesc")}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          background: tk.filterBg,
          border: `1px solid ${tk.filterBorder}`,
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search - Full width on mobile */}
            <div className="relative w-full">
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: tk.mutedText }}
              />
              <input
                type="text"
                placeholder={t("cars.allCars.filters.search")}
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem 0.625rem 2.5rem',
                  background: tk.inputBg,
                  border: `1px solid ${tk.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: tk.bodyText,
                  outline: 'none',
                }}
                onFocus={e => e.currentTarget.style.borderColor = tk.inputFocusBorder}
                onBlur={e => e.currentTarget.style.borderColor = tk.inputBorder}
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  background: tk.inputBg,
                  border: `1px solid ${tk.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: tk.bodyText,
                  outline: 'none',
                }}
              >
                <option value="all">{t("cars.allCars.filters.allStatus")}</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={handleTypeChange}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  background: tk.inputBg,
                  border: `1px solid ${tk.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: tk.bodyText,
                  outline: 'none',
                }}
              >
                <option value="all">{t("cars.allCars.filters.allTypes")}</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Sports">Sports</option>
              </select>

              {/* Transmission Filter */}
              <select
                value={transmissionFilter}
                onChange={handleTransmissionChange}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  background: tk.inputBg,
                  border: `1px solid ${tk.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: tk.bodyText,
                  outline: 'none',
                }}
              >
                <option value="all">{t("cars.allCars.filters.allTransmission")}</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Results count */}
            <div style={{ fontSize: '0.875rem', color: tk.subText, textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: tk.headerText }}>{totalCars}</span>{" "}
              {t("cars.allCars.results", { count: totalCars })}
            </div>
          </div>
        </div>

        {/* Cars Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {carsData.map((car) => {
            const statusColor = getStatusColor(car.status);

            return (
              <div
                key={car.id}
                style={{
                  background: tk.cardBg,
                  border: `1px solid ${tk.cardBorder}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: tk.shadow,
                  transition: 'box-shadow 0.3s, transform 0.3s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = tk.shadowHover;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = tk.shadow;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
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
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {car.status}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {car.plateNumber}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: "'Crimson Pro', serif",
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: tk.headerText,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {car.name}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: tk.subText }}>
                        {car.brand} • {car.year}
                      </div>
                    </div>
                    <div style={{
                      marginLeft: '8px',
                      background: tk.typeBadgeBg,
                      color: tk.typeBadgeText,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}>
                      {car.type}
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Settings size={16} style={{ color: tk.mutedText, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: tk.bodyText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {car.transmission}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Fuel size={16} style={{ color: tk.mutedText, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: tk.bodyText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {car.fuelType}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} style={{ color: tk.mutedText, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: tk.bodyText }}>
                        {t("cars.allCars.card.seats", { count: car.seats })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gauge size={16} style={{ color: tk.mutedText, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: tk.bodyText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {car.mileage}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2' }}>
                      <MapPin size={16} style={{ color: tk.mutedText, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: tk.bodyText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {car.pickUpLocation}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {car.features && car.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                      {car.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '0.7rem',
                            background: tk.featureBg,
                            color: tk.featureText,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 500,
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                      {car.features.length > 3 && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: tk.featureMoreBg,
                          color: tk.featureMoreText,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}>
                          +{car.features.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: `1px solid ${tk.priceBorder}`,
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: tk.priceLabel }}>
                        {t("cars.allCars.card.basePrice")}
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: tk.priceText }}>
                        ${car.pricePerDay}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewCar(car.id); }}
                        style={{
                          padding: '8px 12px',
                          background: tk.viewBtnBg,
                          color: tk.viewBtnText,
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = tk.viewBtnHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = tk.viewBtnBg)}
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">{t("cars.allCars.card.view")}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditCar(car.id); }}
                        style={{
                          padding: '8px',
                          background: tk.editBtnBg,
                          color: tk.editBtnText,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCar(car.id, car.name); }}
                        style={{
                          padding: '8px',
                          background: tk.deleteBtnBg,
                          color: tk.deleteBtnText,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
          {carsData.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: tk.subText, marginBottom: '0.5rem' }}>
                {t("cars.allCars.empty.title")}
              </p>
              <p style={{ fontSize: '0.875rem', color: tk.mutedText }}>{t("cars.allCars.empty.message")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '2rem' }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                background: currentPage === 1 ? tk.pagDisabledBg : tk.pagActiveBg,
                color: currentPage === 1 ? tk.pagDisabledText : tk.pagActiveText,
                transition: 'opacity 0.2s',
              }}
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">{t("cars.allCars.pagination.previous")}</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    border: currentPage === page ? 'none' : `1px solid ${tk.pagInactiveBorder}`,
                    cursor: 'pointer',
                    background: currentPage === page ? tk.pagActiveBg : tk.pagInactiveBg,
                    color: currentPage === page ? tk.pagActiveText : tk.pagInactiveText,
                    transition: 'background 0.2s',
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                background: currentPage === totalPages ? tk.pagDisabledBg : tk.pagActiveBg,
                color: currentPage === totalPages ? tk.pagDisabledText : tk.pagActiveText,
                transition: 'opacity 0.2s',
              }}
            >
              <span className="hidden sm:inline">{t("cars.allCars.pagination.next")}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
  );
};

export default AllCars;
