import React, { useState, useEffect } from "react";
import {
  User as userIcon,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Check,
  Home,
  UserIcon,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { Apartment } from "@/types/apartment.type";
import { getApartmentById } from "@/services/api/apartmentService";
import { getApartmentUnavailabilityDates } from "@/services/api/apartmentService";
import { useNavigate, useParams } from "react-router";
import PrimarySearchAppBar from "@/components/home/AppBar";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useMutation } from "@tanstack/react-query";
import { createBooking } from "@/services/api/bookingService";
import Swal from "sweetalert2";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

export default function ApartmentBilling() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? "#0d0d0d" : "#f5f4f1",
    pageText: isDark ? "#ffffff" : "#111115",
    cardBg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0",
    inputBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    inputBorder: isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1",
    inputText: isDark ? "#ffffff" : "#111115",
    labelText: isDark ? "rgba(255,255,255,0.60)" : "#475569",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : "#64748b",
    dimText: isDark ? "rgba(255,255,255,0.70)" : "#334155",
    statBg: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    featureTag: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    featureTagText: isDark ? "rgba(255,255,255,0.60)" : "#475569",
    infoBg: isDark ? "rgba(232,25,44,0.07)" : "#fff5f5",
    infoBorder: isDark ? "rgba(232,25,44,0.18)" : "#fecaca",
    infoText: isDark ? "rgba(255,180,180,0.9)" : "#991b1b",
    divider: isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0",
  };

  const [loading, setLoading] = useState(true);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [unavailabilityDates, setUnavailabilityDates] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchApartment = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getApartmentById(parseInt(id));
        if (!data) {
          setApartment(null);
        } else if (data.status === "maintenance" || data.status === "review") {
          Swal.fire({
            title: "Not Available",
            text: "This property is currently unavailable for booking.",
            icon: "error",
            confirmButtonText: "Go Back",
            confirmButtonColor: "#e41e20",
          }).then(() => navigate(`/apartmentReservation/${id}`));
          return;
        } else {
          setApartment(data);
          try {
            const dates = await getApartmentUnavailabilityDates(data.id);
            setUnavailabilityDates(dates);
          } catch (error) {
            console.error("Error fetching unavailability dates:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching apartment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApartment();
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.full_name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Booking confirmed",
        text: "Your apartment booking has been created successfully.",
      });
      navigate("/myBookings");
    },
    onError: (error: any) => {
      console.error("Error creating booking:", error);
      Swal.fire({
        icon: "error",
        title: "Booking failed",
        text:
          error?.message ||
          "We couldn't create your booking. Please try again or log in again.",
      });
    },
  });

  useEffect(() => {
    if (!apartment) return;
    if (dateRange?.from && dateRange?.to) {
      const diffTime = Math.abs(
        dateRange.to.getTime() - dateRange.from.getTime(),
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const days = diffDays || 1;
      setTotalDays(days);
      setTotalPrice(apartment.price * Math.max(1, days));
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [dateRange, apartment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment) return;
    if (user && apartment.providerId && user.id === apartment.providerId) {
      Swal.fire({
        icon: "error",
        title: t("billing.ownPropertyTitle"),
        text: t("billing.ownPropertyMessage"),
      });
      return;
    }
    if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid phone number",
        text: "Please enter a valid phone number before confirming your booking.",
      });
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      Swal.fire({
        icon: "warning",
        title: "Missing dates",
        text: "Please select check-in and check-out dates.",
      });
      return;
    }
    bookingMutation.mutate({
      propertyId: String(apartment.id),
      providerId: apartment.providerId,
      propertyType: "apartment",
      startDate: formatDateLocal(dateRange.from),
      endDate: formatDateLocal(dateRange.to),
      pickUpLocation: apartment.address || apartment.location || "",
      dropOffLocation: apartment.address || apartment.location || "",
      pickUpTime: formData.checkInTime,
      dropOffTime: formData.checkOutTime,
      totalPrice: Math.round(totalPrice),
      contactMail: formData.email,
      contactPhone: formData.phone,
      requesterName: formData.fullName,
    });
  };

  const serviceFee = totalPrice * 0.07;
  const finalTotal = totalPrice + serviceFee;

  function handlePhoneChange(value?: string): void {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    color: tk.inputText,
    outline: "none",
    fontSize: "14px",
  };

  const inputWithIconStyle: React.CSSProperties = {
    ...inputStyle,
    paddingLeft: "40px",
  };

  if (loading) {
    return (
      <div
        style={{ background: tk.pageBg, minHeight: "100vh" }}
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div
            style={{ borderColor: "#E8192C" }}
            className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 mb-4"
          ></div>
          <p style={{ color: tk.mutedText }}>Loading apartment details…</p>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div
        style={{ background: tk.pageBg, minHeight: "100vh" }}
        className="flex items-center justify-center"
      >
        <p style={{ color: tk.pageText }}>Apartment not found</p>
      </div>
    );
  }

  const isDisabled =
    bookingMutation.isPending ||
    !formData.fullName ||
    !formData.email ||
    !formData.phone ||
    !dateRange?.from ||
    !dateRange?.to;

  return (
    <div style={{ background: tk.pageBg, minHeight: "100vh" }}>
      <PrimarySearchAppBar />
      <div
        style={{
          paddingTop: "32px",
          paddingBottom: "32px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              style={{ color: tk.pageText }}
              className="text-3xl font-bold mb-2"
            >
              {t("booking.completeYourBooking")}
            </h1>
            <p style={{ color: tk.mutedText }}>
              {t("booking.justAFewMoreDetails")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div
                style={{
                  background: tk.cardBg,
                  border: `1px solid ${tk.cardBorder}`,
                }}
                className="rounded-2xl p-6"
              >
                <h2
                  style={{ color: tk.pageText }}
                  className="text-xl font-semibold mb-6 flex items-center gap-2"
                >
                  <UserIcon className="w-5 h-5" style={{ color: "#E8192C" }} />
                  {t("booking.personalInformation")}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      style={{ color: tk.labelText }}
                      className="block text-sm font-medium mb-2"
                    >
                      {t("user.fullName")} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        style={{ color: tk.labelText }}
                        className="block text-sm font-medium mb-2"
                      >
                        {t("user.email")} *
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: tk.mutedText }}
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          style={inputWithIconStyle}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{ color: tk.labelText }}
                        className="block text-sm font-medium mb-2"
                      >
                        {t("user.phone")} *
                      </label>
                      <PhoneInput
                        international
                        countryCallingCodeEditable={false}
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        error={
                          formData.phone
                            ? isValidPhoneNumber(formData.phone)
                              ? undefined
                              : "Invalid phone number"
                            : "Phone number required"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stay Period */}
              <div
                style={{
                  background: tk.cardBg,
                  border: `1px solid ${tk.cardBorder}`,
                }}
                className="rounded-2xl p-6"
              >
                <h2
                  style={{ color: tk.pageText }}
                  className="text-xl font-semibold mb-6"
                >
                  {t("booking.stayPeriod")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      style={{ color: tk.labelText }}
                      className="block text-sm font-medium mb-2"
                    >
                      Check-in & Check-out Dates *
                    </label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      placeholder="Select stay dates"
                      minDate={new Date()}
                      disabledDates={unavailabilityDates.map(
                        (date) => new Date(date),
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        style={{ color: tk.labelText }}
                        className="block text-sm font-medium mb-2"
                      >
                        Check-in Time
                      </label>
                      <div className="relative">
                        <Clock
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: tk.mutedText }}
                        />
                        <input
                          type="time"
                          name="checkInTime"
                          value={formData.checkInTime}
                          onChange={handleInputChange}
                          style={inputWithIconStyle}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{ color: tk.labelText }}
                        className="block text-sm font-medium mb-2"
                      >
                        Check-out Time
                      </label>
                      <div className="relative">
                        <Clock
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: tk.mutedText }}
                        />
                        <input
                          type="time"
                          name="checkOutTime"
                          value={formData.checkOutTime}
                          onChange={handleInputChange}
                          style={inputWithIconStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <div
                      style={{
                        background: tk.infoBg,
                        border: `1px solid ${tk.infoBorder}`,
                      }}
                      className="mt-4 p-4 rounded-lg"
                    >
                      <p style={{ color: tk.infoText }} className="text-sm">
                        <span className="font-semibold">Stay Duration:</span>{" "}
                        {totalDays} {totalDays === 1 ? "night" : "nights"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Apartment Summary */}
                <div
                  style={{
                    background: tk.cardBg,
                    border: `1px solid ${tk.cardBorder}`,
                  }}
                  className="rounded-2xl overflow-hidden"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={apartment.imageUrls?.[0]}
                      alt={apartment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      style={{ color: tk.pageText }}
                      className="text-xl font-bold mb-1"
                    >
                      {apartment.name}
                    </h3>
                    <p style={{ color: tk.mutedText }} className="text-sm mb-4">
                      {apartment.location ||
                        apartment.address ||
                        "Location not specified"}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{ color: tk.dimText }}
                      >
                        <Home className="w-4 h-4" />
                        <span>{apartment.rooms} Rooms</span>
                      </div>
                      {apartment.beds && (
                        <div
                          className="flex items-center gap-2 text-sm"
                          style={{ color: tk.dimText }}
                        >
                          <span>•</span>
                          <span>{apartment.beds} Beds</span>
                        </div>
                      )}
                      {apartment.amenities &&
                        apartment.amenities.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {apartment.amenities
                              .slice(0, 3)
                              .map((amenity, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: tk.featureTag,
                                    color: tk.featureTagText,
                                  }}
                                  className="text-xs px-2 py-1 rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div
                  style={{
                    background: tk.cardBg,
                    border: `1px solid ${tk.cardBorder}`,
                  }}
                  className="rounded-2xl p-6"
                >
                  <h3
                    style={{ color: tk.pageText }}
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                  >
                    <CreditCard
                      className="w-5 h-5"
                      style={{ color: "#E8192C" }}
                    />
                    Price Summary
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div
                      className="flex justify-between"
                      style={{ color: tk.dimText }}
                    >
                      <span>
                        ${apartment.price}/day × {totalDays || 1}{" "}
                        {totalDays === 1 ? "day" : "days"}
                      </span>
                      <span className="font-medium">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between"
                      style={{ color: tk.dimText }}
                    >
                      <span>{t("billing.serviceFee")} (7%)</span>
                      <span className="font-medium">
                        ${serviceFee.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between"
                      style={{ color: tk.dimText }}
                    ></div>
                  </div>

                  <div
                    style={{
                      borderTop: `1px solid ${tk.divider}`,
                      paddingTop: "16px",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        style={{ color: tk.pageText }}
                        className="text-lg font-semibold"
                      >
                        Total
                      </span>
                      <span
                        style={{ color: "#E8192C" }}
                        className="text-2xl font-bold"
                      >
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isDisabled}
                    style={{
                      width: "100%",
                      marginTop: "24px",
                      background: isDisabled ? tk.statBg : "#E8192C",
                      color: isDisabled ? tk.mutedText : "#fff",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: "none",
                      transition: "opacity 0.15s",
                    }}
                  >
                    <Check className="w-5 h-5" />
                    {bookingMutation.isPending
                      ? "Processing..."
                      : "Confirm Booking"}
                  </button>

                  <p
                    style={{ color: tk.mutedText }}
                    className="text-xs text-center mt-4"
                  >
                    You won't be charged yet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
