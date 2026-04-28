import React, { useState, useEffect, useMemo } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Check,
  TrendingUp,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { Car } from "@/types/car.types";
import { Month, MONTHS, MONTH_NAMES } from "@/types/price.type";
import { getCarById } from "@/services/api/carService";
import { getCarUnavailabilityDates } from "@/services/api/carService";
import { useNavigate, useParams } from "react-router";
import PrimarySearchAppBar from "@/components/home/AppBar";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { createBooking } from "@/services/api/bookingService";
import Swal from "sweetalert2";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { useTheme } from "@/context/ThemeContext";
import { getBookingThemeTokens } from "./bookingTheme";

export default function CarBilling() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const tkBase = getBookingThemeTokens({ isDark, isBlue });
  const tk = {
    ...tkBase,
    headerText: isDark ? "rgba(255,255,255,0.85)" : isBlue ? "hsl(212 48% 18%)" : "#1e293b",
  };

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getCarById(parseInt(id));
        if (!data) {
          setCar(null);
        } else if (data.status === "maintenance" || data.status === "review") {
          Swal.fire({
            title: "Not Available",
            text: "This vehicle is currently unavailable for booking.",
            icon: "error",
            confirmButtonText: "Go Back",
            confirmButtonColor: tkBase.brand,
          }).then(() => navigate(`/carReservation/${id}`));
          return;
        } else {
          setCar(data);
          setImages(data.imageUrls || []);
          const unavailable = await getCarUnavailabilityDates(data.id);
          setUnavailableDates(unavailable);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        if (!data) {
          setUser(null);
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
    fetchCar();
  }, [id]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pickUpTime: "10:00",
    dropOffTime: "10:00",
    pickUpLocation: "",
    dropOffLocation: "",
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

  useEffect(() => {
    if (car) {
      setFormData((prev) => ({
        ...prev,
        pickUpLocation: prev.pickUpLocation || car.pickUpLocation || "",
        dropOffLocation: prev.pickUpLocation || car.pickUpLocation || "",
      }));
    }
  }, [car]);

  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState<
    { month: Month; days: number; pricePerDay: number; subtotal: number }[]
  >([]);

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("billing.bookingConfirmed"),
        text: t("billing.carBookingSuccess"),
      });
      navigate("/myBookings");
    },
    onError: (error: any) => {
      console.error("Error creating booking:", error);
      Swal.fire({
        icon: "error",
        title: t("billing.bookingFailed"),
        text: error?.message || t("billing.bookingFailedMessage"),
      });
    },
  });

  useEffect(() => {
    if (!car) return;
    if (dateRange?.from && dateRange?.to) {
      const breakdown: Map<Month, { days: number; pricePerDay: number }> =
        new Map();
      let total = 0;
      let days = 0;
      const currentDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      while (currentDate <= endDate) {
        const monthIndex = currentDate.getMonth();
        const month = MONTHS[monthIndex];
        const monthlyPrice = car.monthlyPrices?.find((p) => p.month === month);
        const pricePerDay = monthlyPrice?.pricePerDay ?? car.pricePerDay;
        const existing = breakdown.get(month);
        if (existing) {
          existing.days += 1;
        } else {
          breakdown.set(month, { days: 1, pricePerDay });
        }
        total += pricePerDay;
        days += 1;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      const breakdownArray = Array.from(breakdown.entries()).map(
        ([month, data]) => ({
          month,
          days: data.days,
          pricePerDay: data.pricePerDay,
          subtotal: data.days * data.pricePerDay,
        }),
      );
      setTotalDays(days);
      setTotalPrice(total);
      setPriceBreakdown(breakdownArray);
    } else {
      setTotalDays(0);
      setTotalPrice(0);
      setPriceBreakdown([]);
    }
  }, [dateRange, car]);

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
    if (!car) return;
    if (user && car.providerId && user.id === car.providerId) {
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
        title: t("billing.invalidPhoneNumber"),
        text: t("billing.enterValidPhoneNumber"),
      });
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      Swal.fire({
        icon: "warning",
        title: t("billing.missingDates"),
        text: t("billing.selectPickUpDropOffDates"),
      });
      return;
    }
    bookingMutation.mutate({
      propertyId: String(car.id),
      providerId: car.providerId,
      propertyType: "car",
      startDate: formatDateLocal(dateRange.from),
      endDate: formatDateLocal(dateRange.to),
      pickUpLocation: formData.pickUpLocation || car.pickUpLocation,
      dropOffLocation: formData.dropOffLocation || formData.pickUpLocation,
      pickUpTime: formData.pickUpTime,
      dropOffTime: formData.dropOffTime,
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
            style={{ borderColor: tk.brand }}
            className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 mb-4"
          ></div>
          <p style={{ color: tk.mutedText }}>
            {t("billing.loadingCarDetails")}
          </p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div
        style={{ background: tk.pageBg, minHeight: "100vh" }}
        className="flex items-center justify-center"
      >
        <p style={{ color: tk.pageText }}>{t("billing.carNotFound")}</p>
      </div>
    );
  }

  return (
    <div style={{ background: tk.pageBg, minHeight: "100vh" }}>
      <PrimarySearchAppBar />
      <div
        style={{
          minHeight: "100vh",
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
            {/* Main Form Section */}
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
                  <UserIcon className="w-5 h-5" style={{ color: tk.brand }} />
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
                      placeholder={t("billing.fullNamePlaceholder")}
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
                          placeholder={t("billing.emailPlaceholder")}
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
                        placeholder={t("billing.phonePlaceholder")}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        error={
                          formData.phone
                            ? isValidPhoneNumber(formData.phone)
                              ? undefined
                              : t("billing.invalidPhone")
                            : t("billing.phoneRequired")
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
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
                  {t("billing.rentalPeriod")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      style={{ color: tk.labelText }}
                      className="block text-sm font-medium mb-2"
                    >
                      {t("billing.pickUpDropOffDates")} *
                    </label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      placeholder={t("billing.selectRentalDates")}
                      minDate={new Date()}
                      disabledDates={unavailableDates.map(
                        (date) => new Date(date),
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          style={{ color: tk.labelText }}
                          className="block text-sm font-medium mb-2"
                        >
                          {t("billing.pickUpTime")}
                        </label>
                        <div className="relative">
                          <Clock
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: tk.mutedText }}
                          />
                          <input
                            type="time"
                            name="pickUpTime"
                            value={formData.pickUpTime}
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
                          {t("billing.pickUpLocation")}
                        </label>
                        <div className="relative">
                          <MapPin
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: tk.mutedText }}
                          />
                          <input
                            type="text"
                            name="pickUpLocation"
                            value={formData.pickUpLocation}
                            onChange={handleInputChange}
                            style={inputWithIconStyle}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          style={{ color: tk.labelText }}
                          className="block text-sm font-medium mb-2"
                        >
                          {t("billing.dropOffTime")}
                        </label>
                        <div className="relative">
                          <Clock
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: tk.mutedText }}
                          />
                          <input
                            type="time"
                            name="dropOffTime"
                            value={formData.dropOffTime}
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
                          {t("billing.dropOffLocation")}
                        </label>
                        <div className="relative">
                          <MapPin
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: tk.mutedText }}
                          />
                          <input
                            type="text"
                            name="dropOffLocation"
                            value={formData.dropOffLocation}
                            onChange={handleInputChange}
                            style={inputWithIconStyle}
                          />
                        </div>
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
                        <span className="font-semibold">
                          {t("billing.rentalDuration")}:
                        </span>{" "}
                        {totalDays}{" "}
                        {totalDays === 1
                          ? t("common.day", "day")
                          : t("common.days", "days")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Car Summary */}
                <div
                  style={{
                    background: tk.cardBg,
                    border: `1px solid ${tk.cardBorder}`,
                  }}
                  className="rounded-2xl overflow-hidden"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={car.imageUrls?.[0]}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      style={{ color: tk.pageText }}
                      className="text-xl font-bold mb-1"
                    >
                      {car.brand} {car.name}
                    </h3>
                    <p style={{ color: tk.mutedText }} className="text-sm mb-4">
                      {car.year} • {car.color}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{ color: tk.dimText }}
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{car.pickUpLocation}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {car.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: tk.featureTag,
                              color: tk.featureTagText,
                            }}
                            className="text-xs px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
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
                      style={{ color: tk.brand }}
                    />
                    {t("billing.priceSummary")}
                  </h3>

                  <div className="space-y-4 mb-4 text-sm">
                    {priceBreakdown.length > 0 ? (
                      <div className="space-y-2">
                        {priceBreakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between"
                            style={{ color: tk.dimText }}
                          >
                            <span className="flex items-center gap-1">
                              {item.pricePerDay !== car.pricePerDay && (
                                <TrendingUp className="w-3 h-3 text-amber-500" />
                              )}
                              {MONTH_NAMES[item.month]}: ${item.pricePerDay} ×{" "}
                              {item.days} {item.days === 1 ? "day" : "days"}
                            </span>
                            <span className="font-medium">
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div
                          style={{
                            borderTop: `1px solid ${tk.divider}`,
                            paddingTop: "8px",
                          }}
                        >
                          <div
                            className="flex justify-between font-medium"
                            style={{ color: tk.dimText }}
                          >
                            <span>
                              {t("billing.subtotal")} ({totalDays}{" "}
                              {totalDays === 1
                                ? t("common.day")
                                : t("common.days")}
                              )
                            </span>
                            <span>${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <p style={{ color: tk.mutedText }} className="text-xs">
                          {t("billing.pricesVaryByMonth")}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="flex justify-between"
                          style={{ color: tk.dimText }}
                        >
                          <span>
                            ${car.pricePerDay} × {totalDays || 0} days
                          </span>
                          <span className="font-medium">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <p
                          style={{ color: tk.mutedText }}
                          className="text-xs mt-1"
                        >
                          {t("billing.selectDatesForBreakdown")}
                        </p>
                      </div>
                    )}

                    <div>
                      <div
                        className="flex justify-between"
                        style={{ color: tk.dimText }}
                      >
                        <span>{t("billing.serviceFee")} (7%)</span>
                        <span className="font-medium">
                          ${serviceFee.toFixed(2)}
                        </span>
                      </div>
                      <p
                        style={{ color: tk.mutedText }}
                        className="text-xs mt-1"
                      >
                        {t("billing.serviceFeeDescription")}
                      </p>
                    </div>


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
                        {t("billing.total")}
                      </span>
                      <span
                        style={{ color: tk.brand }}
                        className="text-2xl font-bold"
                      >
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={
                      bookingMutation.isPending ||
                      !formData.fullName ||
                      !formData.email ||
                      !formData.phone ||
                      !dateRange?.from ||
                      !dateRange?.to
                    }
                    style={{
                      width: "100%",
                      marginTop: "24px",
                      background:
                        bookingMutation.isPending ||
                        !formData.fullName ||
                        !formData.email ||
                        !formData.phone ||
                        !dateRange?.from ||
                        !dateRange?.to
                          ? tk.statBg
                          : tk.brand,
                      color:
                        bookingMutation.isPending ||
                        !formData.fullName ||
                        !formData.email ||
                        !formData.phone ||
                        !dateRange?.from ||
                        !dateRange?.to
                          ? tk.mutedText
                          : "#fff",
                      cursor:
                        bookingMutation.isPending ||
                        !formData.fullName ||
                        !formData.email ||
                        !formData.phone ||
                        !dateRange?.from ||
                        !dateRange?.to
                          ? "not-allowed"
                          : "pointer",
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
                      ? t("billing.processing")
                      : t("billing.confirmBooking")}
                  </button>

                  <p
                    style={{ color: tk.mutedText }}
                    className="text-xs text-center mt-4"
                  >
                    {t("billing.paymentNote")}
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
