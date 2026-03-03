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

export default function CarBilling() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        } else {
          setCar(data);
          // If car has a single image string, convert to array
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
          console.log("user:", data);
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

  // Sync formData with user data when it arrives
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

  // Sync formData with car data when it arrives
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
      // Calculate total price using monthly pricing
      const breakdown: Map<Month, { days: number; pricePerDay: number }> =
        new Map();
      let total = 0;
      let days = 0;

      const currentDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);

      while (currentDate <= endDate) {
        const monthIndex = currentDate.getMonth();
        const month = MONTHS[monthIndex];

        // Get monthly price or fall back to base price
        const monthlyPrice = car.monthlyPrices?.find((p) => p.month === month);
        const pricePerDay = monthlyPrice?.pricePerDay ?? car.pricePerDay;

        // Accumulate breakdown
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

      // Convert map to array for display
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper function to format date in local timezone (YYYY-MM-DD)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!car) return;

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
      totalPrice: Math.round(finalTotal),
      contactMail: formData.email,
      contactPhone: formData.phone,
      requesterName: formData.fullName,
    });
  };

  const serviceFee = totalPrice * 0.05;
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + serviceFee + tax;
  if (loading) {
    return (
      <div className="p-8 text-center">{t("billing.loadingCarDetails")}</div>
    );
  }

  if (!car) {
    return <div className="p-8 text-center">{t("billing.carNotFound")}</div>;
  }

  function handlePhoneChange(value?: string): void {
    setFormData((prev) => ({
      ...prev,
      phone: value || "",
    }));
  }

  return (
    <div>
      <PrimarySearchAppBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {t("booking.completeYourBooking")}
            </h1>
            <p className="text-slate-600">{t("booking.justAFewMoreDetails")}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  {t("booking.personalInformation")}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t("user.fullName")} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t("billing.fullNamePlaceholder")}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("user.email")} *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t("billing.emailPlaceholder")}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("user.phone")} *
                      </label>
                      <div className="relative">
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
              </div>

              {/* Rental Period */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  {t("billing.rentalPeriod")}
                </h2>

                <div className="space-y-6">
                  {/* Date Range Picker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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

                  {/* Time and Location Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t("billing.pickUpTime")}
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="time"
                            name="pickUpTime"
                            value={formData.pickUpTime}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t("billing.pickUpLocation")}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="pickUpLocation"
                            value={formData.pickUpLocation}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t("billing.dropOffTime")}
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="time"
                            name="dropOffTime"
                            value={formData.dropOffTime}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t("billing.dropOffLocation")}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="dropOffLocation"
                            value={formData.dropOffLocation}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
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
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={car.imageUrls?.[0]}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      {car.brand} {car.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {car.year} • {car.color}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{car.pickUpLocation}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {car.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    {t("billing.priceSummary")}
                  </h3>

                  <div className="space-y-4 mb-4 text-sm">
                    {/* Monthly Price Breakdown */}
                    {priceBreakdown.length > 0 ? (
                      <div className="space-y-2">
                        {priceBreakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-slate-700"
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
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex justify-between text-slate-700 font-medium">
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
                        <p className="text-xs text-slate-500">
                          {t("billing.pricesVaryByMonth")}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-slate-700">
                          <span>
                            ${car.pricePerDay} × {totalDays || 0} days
                          </span>
                          <span className="font-medium">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {t("billing.selectDatesForBreakdown")}
                        </p>
                      </div>
                    )}

                    {/* Service Fee */}
                    <div>
                      <div className="flex justify-between text-slate-700">
                        <span>{t("billing.serviceFee")}</span>
                        <span className="font-medium">
                          ${serviceFee.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {t("billing.serviceFeeDescription")}
                      </p>
                    </div>

                    {/* Tax */}
                    <div>
                      <div className="flex justify-between text-slate-700">
                        <span>{t("billing.tax")}</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {t("billing.taxDescription")}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-800">
                        {t("billing.total")}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t("billing.totalDescription")}
                    </p>
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
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    <Check className="w-5 h-5" />
                    {bookingMutation.isPending
                      ? t("billing.processing")
                      : t("billing.confirmBooking")}
                  </button>

                  <p className="text-xs text-slate-500 text-center mt-4">
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
