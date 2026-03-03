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

export default function ApartmentBilling() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        } else {
          setApartment(data);
          try {
            const dates = await getApartmentUnavailabilityDates(data.id);
            setUnavailabilityDates(dates);
            console.log(unavailabilityDates);
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
      // Calculate price: daily rate * number of days (minimum 1 day)
      setTotalPrice(apartment.price * Math.max(1, days));
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [dateRange, apartment]);

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

    if (!apartment) return;

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
      totalPrice: Math.round(finalTotal),
      contactMail: formData.email,
      contactPhone: formData.phone,
      requesterName: formData.fullName,
    });
  };

  const serviceFee = totalPrice * 0.05;
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + serviceFee + tax;

  function handlePhoneChange(value?: string): void {
    setFormData((prev) => ({
      ...prev,
      phone: value || "",
    }));
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-slate-600">Loading apartment details…</p>
      </div>
    );
  }

  if (!apartment) {
    return <div className="p-8 text-center">Apartment not found</div>;
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
                      placeholder="John Doe"
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
                          placeholder="john@example.com"
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
              </div>

              {/* Stay Period */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  {t("booking.stayPeriod")}
                </h2>

                <div className="space-y-6">
                  {/* Date Range Picker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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

                  {/* Time Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Check-in Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="time"
                          name="checkInTime"
                          value={formData.checkInTime}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Check-out Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="time"
                          name="checkOutTime"
                          value={formData.checkOutTime}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
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
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={apartment.imageUrls?.[0]}
                      alt={apartment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      {apartment.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {apartment.location ||
                        apartment.address ||
                        "Location not specified"}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Home className="w-4 h-4" />
                        <span>{apartment.rooms} Rooms</span>
                      </div>
                      {apartment.beds && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
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
                                  className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
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
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Price Summary
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-slate-600">
                      <span>
                        ${apartment.price}/day × {totalDays || 1}{" "}
                        {totalDays === 1 ? "day" : "days"}
                      </span>
                      <span className="font-medium">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Service fee</span>
                      <span className="font-medium">
                        ${serviceFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (10%)</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-800">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
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
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    <Check className="w-5 h-5" />
                    {bookingMutation.isPending
                      ? "Processing..."
                      : "Confirm Booking"}
                  </button>

                  <p className="text-xs text-slate-500 text-center mt-4">
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
