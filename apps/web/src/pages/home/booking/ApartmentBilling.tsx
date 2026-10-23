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
  AlertCircle,
  ShieldCheck,
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
import { getBookingThemeTokens } from "./bookingTheme";
import { formatBookingRef } from "@/lib/whatsapp";
import BookingRequestTicket, { TicketRow, TicketStep } from "./BookingRequestTicket";

export default function ApartmentBilling() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const tk = getBookingThemeTokens({ isDark, isBlue });

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
            title: t("billing.notAvailable", "Not Available"),
            text: t(
              "billing.propertyUnavailableMessage",
              "This property is currently unavailable for booking.",
            ),
            icon: "error",
            confirmButtonText: t("billing.goBack", "Go Back"),
            confirmButtonColor: tk.brand,
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

  // Yellow ticket: the client reviews and confirms the request there, then it
  // shows the sent request (reference + next steps)
  const [ticket, setTicket] = useState<{
    mode: "review" | "sent";
    reference?: string;
    details: TicketRow[];
    priceRows: TicketRow[];
    total: string;
    totalNote?: string;
    steps: TicketStep[];
    email: string;
  } | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onError: (error: any) => {
      console.error("Error creating booking:", error);
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
        title: t("billing.invalidPhoneNumber"),
        text: t("billing.enterValidPhoneNumber"),
      });
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      Swal.fire({
        icon: "warning",
        title: t("billing.missingDates"),
        text: t(
          "billing.selectCheckInCheckOutDates",
          "Please select check-in and check-out dates.",
        ),
      });
      return;
    }
    setTicketError(null);
    setTicket({ mode: "review", ...buildTicket() });
  };

  // Sends the request once the client confirms it on the ticket
  const handleConfirmRequest = () => {
    if (!apartment || !dateRange?.from || !dateRange?.to) return;
    setTicketError(null);
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
      fee: 0, // apartment bookings are free: no service fee, no online payment
    }, {
      onSuccess: (booking) =>
        setTicket((prev) =>
          prev ? { ...prev, mode: "sent", reference: formatBookingRef(booking.id) } : prev,
        ),
      // friendly message on the ticket; the raw error is logged by the mutation
      onError: (error: any) =>
        setTicketError(
          /auth|session|not authenticated/i.test(error?.message ?? "")
            ? t("auth.loginToBook")
            : t("billing.bookingFailedMessage"),
        ),
    });
  };

  const money = (value: number) => `€${value.toFixed(2)}`;
  const formatTicketDate = (date: Date) =>
    date.toLocaleDateString(i18n.language, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Summary of the request for the yellow ticket (free booking: no service fee)
  const buildTicket = () => {
    const from = dateRange?.from as Date;
    const to = dateRange?.to as Date;
    const address = apartment?.address || apartment?.location || "";

    const details: TicketRow[] = [
      { label: t("bookingTicket.guest"), value: formData.fullName },
      { label: t("bookingTicket.phone"), value: formData.phone },
      {
        label: t("bookingTicket.apartment.checkIn"),
        value: `${formatTicketDate(from)} · ${formData.checkInTime}`,
      },
      {
        label: t("bookingTicket.apartment.checkOut"),
        value: `${formatTicketDate(to)} · ${formData.checkOutTime}`,
      },
      {
        label: t("bookingTicket.duration"),
        value: t("bookingTicket.apartment.nights", { count: totalDays }),
      },
      ...(address ? [{ label: t("bookingTicket.apartment.address"), value: address }] : []),
    ];

    const priceRows: TicketRow[] = [
      {
        label: t("bookingTicket.apartment.stay", { count: totalDays }),
        value: money(totalPrice),
      },
      {
        label: t("billing.bookinalFee", "Bookinal fee"),
        value: <span className="text-emerald-700">{t("billing.free", "Free")}</span>,
      },
    ];

    return {
      details,
      priceRows,
      total: money(totalPrice),
      totalNote: t("billing.paidToHost", "Paid directly to the host"),
      steps: [
        {
          title: t("bookingTicket.apartment.steps.review.title"),
          description: t("bookingTicket.apartment.steps.review.description"),
        },
        {
          title: t("bookingTicket.apartment.steps.contact.title"),
          description: t("bookingTicket.apartment.steps.contact.description"),
        },
        {
          title: t("bookingTicket.apartment.steps.pay.title"),
          description: t("bookingTicket.apartment.steps.pay.description", {
            total: money(totalPrice),
          }),
        },
      ],
      email: formData.email,
    };
  };

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
            {t("billing.loadingApartmentDetails", "Loading apartment details…")}
          </p>
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
        <p style={{ color: tk.pageText }}>
          {t("billing.apartmentNotFound", "Apartment not found")}
        </p>
      </div>
    );
  }

  // Error shown next to each field ("" when the field is fine)
  const fieldErrors = {
    fullName: !formData.fullName.trim() ? t("billing.errors.fullNameRequired") : "",
    email: !formData.email.trim()
      ? t("billing.errors.emailRequired")
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ? t("billing.errors.emailInvalid")
        : "",
    phone: !formData.phone
      ? t("billing.phoneRequired")
      : !isValidPhoneNumber(formData.phone)
        ? t("billing.invalidPhone")
        : "",
    dates:
      !dateRange?.from || !dateRange?.to
        ? t("billing.selectCheckInCheckOutDates", "Please select check-in and check-out dates.")
        : "",
  };

  // Fields still needed before the request can be sent (listed under the button)
  const missingFields = [
    fieldErrors.fullName && t("user.fullName"),
    fieldErrors.email && t("user.email"),
    fieldErrors.phone && t("user.phone"),
    fieldErrors.dates && t("billing.checkInCheckOutDates", "Check-in & Check-out Dates"),
  ].filter(Boolean) as string[];

  const isDisabled =
    bookingMutation.isPending ||
    !formData.fullName ||
    !formData.email ||
    !formData.phone ||
    !dateRange?.from ||
    !dateRange?.to ||
    !!fieldErrors.email;

  // full shorthand: the inputs already use `border`, mixing it with borderColor warns
  const errorBorder: React.CSSProperties = { border: "1px solid #ef4444" };

  const renderFieldError = (message: string) =>
    message ? (
      <p
        className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${isDark ? "text-red-400" : "text-red-600"}`}
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {message}
      </p>
    ) : null;

  return (
    <div style={{ background: tk.pageBg, minHeight: "100vh" }}>
      <PrimarySearchAppBar />
      {ticket && (
        <BookingRequestTicket
          {...ticket}
          image={apartment.imageUrls?.[0]}
          propertyName={apartment.name}
          propertySubtitle={apartment.location || apartment.address || undefined}
          error={ticketError}
          {...(ticket.mode === "review"
            ? {
                primaryLabel: bookingMutation.isPending
                  ? t("bookingTicket.review.sending")
                  : t("bookingTicket.review.confirm"),
                primaryLoading: bookingMutation.isPending,
                onPrimary: handleConfirmRequest,
                secondaryLabel: t("bookingTicket.review.edit"),
                onSecondary: () => setTicket(null),
              }
            : {
                primaryLabel: t("bookingTicket.viewBookings"),
                onPrimary: () => navigate("/myBookings"),
                secondaryLabel: t("bookingTicket.backHome"),
                onSecondary: () => navigate("/"),
              })}
        />
      )}
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
                      style={{ ...inputStyle, ...(fieldErrors.fullName ? errorBorder : {}) }}
                      required
                    />
                    {renderFieldError(fieldErrors.fullName)}
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
                          style={{ ...inputWithIconStyle, ...(fieldErrors.email ? errorBorder : {}) }}
                          required
                        />
                      </div>
                      {renderFieldError(fieldErrors.email)}
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
                      />
                      {renderFieldError(fieldErrors.phone)}
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
                      {t("billing.checkInCheckOutDates", "Check-in & Check-out Dates")} *
                    </label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      placeholder={t("billing.selectStayDates", "Select stay dates")}
                      minDate={new Date()}
                      disabledDates={unavailabilityDates.map(
                        (date) => new Date(date),
                      )}
                    />
                    {renderFieldError(fieldErrors.dates)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        style={{ color: tk.labelText }}
                        className="block text-sm font-medium mb-2"
                      >
                        {t("billing.checkInTime", "Check-in Time")}
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
                        {t("billing.checkOutTime", "Check-out Time")}
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
                        <span className="font-semibold">
                          {t("billing.stayDuration", "Stay Duration")}:
                        </span>{" "}
                        {totalDays}{" "}
                        {totalDays === 1
                          ? t("common.night", "night")
                          : t("common.nights", "nights")}
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
                        t("billing.locationNotSpecified", "Location not specified")}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{ color: tk.dimText }}
                      >
                        <Home className="w-4 h-4" />
                        <span>
                          {apartment.rooms} {t("billing.rooms", "Rooms")}
                        </span>
                      </div>
                      {apartment.beds && (
                        <div
                          className="flex items-center gap-2 text-sm"
                          style={{ color: tk.dimText }}
                        >
                          <span>•</span>
                          <span>
                            {apartment.beds} {t("billing.beds", "Beds")}
                          </span>
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
                      style={{ color: tk.brand }}
                    />
                    {t("billing.priceSummary")}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div
                      className="flex justify-between"
                      style={{ color: tk.dimText }}
                    >
                      <span>
                        €{apartment.price}/day × {totalDays || 1}{" "}
                        {totalDays === 1
                          ? t("common.day")
                          : t("common.days")}
                      </span>
                      <span className="font-medium">
                        €{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between"
                      style={{ color: tk.dimText }}
                    >
                      <span>{t("billing.bookinalFee", "Bookinal fee")}</span>
                      <span className="font-semibold text-emerald-500">
                        {t("billing.free", "Free")}
                      </span>
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
                        €{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p style={{ color: tk.mutedText }} className="text-xs mt-1">
                      {t("billing.paidToHost", "Paid directly to the host")}
                    </p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isDisabled}
                    style={{
                      width: "100%",
                      marginTop: "24px",
                      background: isDisabled ? tk.statBg : tk.brand,
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
                    {t("bookingTicket.review.openButton")}
                  </button>

                  {missingFields.length > 0 && !bookingMutation.isPending && (
                    <div
                      role="alert"
                      className={`mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm ${isDark ? "text-red-400" : "text-red-600"}`}
                    >
                      <p className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {t("billing.missingFieldsTitle", "Please complete the following:")}
                      </p>
                      <ul className="mt-1.5 list-disc space-y-0.5 pl-9">
                        {missingFields.map((field) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <p className={`text-sm font-semibold leading-snug ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                      {t(
                        "billing.freeBookingNote",
                        "Free booking: nothing to pay on Bookinal. Once the host confirms your request, you get their contact details and settle the stay directly with them.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
