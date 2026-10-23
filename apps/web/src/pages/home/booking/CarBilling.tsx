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
  Baby,
  UserPlus,
  Globe,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { Car } from "@/types/car.types";
import { Month, MONTHS, MONTH_NAMES } from "@/types/price.type";
import { getCarById } from "@/services/api/carService";
import { getCarUnavailabilityDates } from "@/services/api/carService";
import { useLocation, useNavigate, useParams } from "react-router";
import { parseCarSearchQuery } from "@/lib/carSearchParams";
import { TIRANA_AIRPORT } from "@/lib/albanianCities";
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
import { CarRentalConditions } from "./CarRentalConditions";
import { getCarRentalTerms } from "@/lib/carRentalTerms";
import { InsurancePlansTable } from "./InsurancePlansTable";
import { formatInsurancePrice, getInsurancePlanLabel } from "@/lib/insurancePlans";
import { formatBookingRef } from "@/lib/whatsapp";
import BookingRequestTicket, { TicketRow, TicketStep } from "./BookingRequestTicket";

interface DeliveryLocation {
  name: string;
  price: number;
}

const DELIVERY_LOCATIONS: DeliveryLocation[] = [
  { name: "Tirana (airport)", price: 0 },
  { name: "Tirana", price: 10 },
  { name: "Durres", price: 19 },
  { name: "Vlore", price: 49 },
  { name: "Saranda", price: 99 },
  { name: "Shkoder", price: 49 },
  { name: "Kukes (airport)", price: 89 },
  { name: "Podgorica (airport)", price: 120 },
  { name: "Lezhe", price: 39 },
  { name: "Golem", price: 25 },
  { name: "Ksamil", price: 120 },
  { name: "Korçë", price: 99 },
  { name: "Pristina (airport)", price: 120 },
  { name: "Skopje (airport)", price: 200 },
];

const getDeliveryPrice = (locationName: string): number =>
  DELIVERY_LOCATIONS.find((loc) => loc.name === locationName)?.price ?? 0;

/** Search picker location (albanianCities) -> delivery location of this form. */
const SEARCH_TO_DELIVERY_LOCATION: Record<string, string> = {
  [TIRANA_AIRPORT]: "Tirana (airport)",
  Tirana: "Tirana",
  Durrës: "Durres",
  Vlorë: "Vlore",
  Sarandë: "Saranda",
  Shkodër: "Shkoder",
  Kukës: "Kukes (airport)",
  Lezhë: "Lezhe",
  Ksamil: "Ksamil",
  Korçë: "Korçë",
};

export default function CarBilling() {
  const { t, i18n } = useTranslation();
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

  // Pre-fill from the search the user came from (see buildCarSearchQuery)
  const { search } = useLocation();
  const searchSelection = useMemo(() => parseCarSearchQuery(search), [search]);
  const initialPickUpLocation =
    (searchSelection.location &&
      SEARCH_TO_DELIVERY_LOCATION[searchSelection.location]) ||
    "";

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    searchSelection.from && searchSelection.to
      ? { from: searchSelection.from, to: searchSelection.to }
      : undefined,
  );
  const [addChildSeat, setAddChildSeat] = useState(false);
  const [addAdditionalDriver, setAddAdditionalDriver] = useState(false);
  const [addCrossBorder, setAddCrossBorder] = useState(false);
  const [selectedInsurancePlanId, setSelectedInsurancePlanId] = useState<number | null>(null);

  // Insurance plans offered with the car; the first (cheapest tier) is pre-selected
  const insurancePlans = car?.insurancePlans ?? [];
  const selectedInsurancePlan =
    insurancePlans.find((p) => p.id === selectedInsurancePlanId) ?? null;
  useEffect(() => {
    if (insurancePlans.length > 0 && !selectedInsurancePlan) {
      setSelectedInsurancePlanId(insurancePlans[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pickUpTime: "10:00",
    dropOffTime: "10:00",
    pickUpLocation: initialPickUpLocation,
    dropOffLocation: initialPickUpLocation,
  });

  // Drop pre-filled dates that overlap an existing booking of this car
  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to || unavailableDates.length === 0) {
      return;
    }
    const unavailable = new Set(unavailableDates);
    const day = new Date(dateRange.from);
    while (day <= dateRange.to) {
      if (unavailable.has(formatDateLocal(day))) {
        setDateRange(undefined);
        return;
      }
      day.setDate(day.getDate() + 1);
    }
    // Only re-check when the booked dates arrive, not on every user pick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unavailableDates]);

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
    if (formData.pickUpLocation && !formData.dropOffLocation) {
      setFormData((prev) => ({
        ...prev,
        dropOffLocation: prev.pickUpLocation,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pickUpLocation]);

  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState<
    { month: Month; days: number; pricePerDay: number; subtotal: number }[]
  >([]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
    if (insurancePlans.length > 0 && !selectedInsurancePlan) {
      Swal.fire({
        icon: "warning",
        title: t("insurance.chooseTitle"),
        text: t("insurance.validation.chooseOne"),
      });
      return;
    }
    if (!formData.pickUpLocation || !formData.dropOffLocation) {
      Swal.fire({
        icon: "warning",
        title: t("billing.missingLocations", "Missing locations"),
        text: t(
          "billing.selectPickUpDropOffLocations",
          "Please select a pick-up and drop-off location.",
        ),
      });
      return;
    }
    setTicketError(null);
    setTicket({ mode: "review", ...buildTicket() });
  };

  // Sends the request once the client confirms it on the ticket
  const handleConfirmRequest = () => {
    if (!car || !dateRange?.from || !dateRange?.to) return;
    setTicketError(null);
    bookingMutation.mutate({
      propertyId: String(car.id),
      providerId: car.providerId,
      propertyType: "car",
      startDate: formatDateLocal(dateRange.from),
      endDate: formatDateLocal(dateRange.to),
      pickUpLocation: formData.pickUpLocation,
      dropOffLocation: formData.dropOffLocation,
      pickUpTime: formData.pickUpTime,
      dropOffTime: formData.dropOffTime,
      totalPrice: Math.round(finalTotal),
      contactMail: formData.email,
      contactPhone: formData.phone,
      requesterName: formData.fullName,
      childSeatPrice: childSeatFee > 0 ? childSeatFee : undefined, // amount charged (per day x days)
      additionalDriverPrice: addAdditionalDriver ? car?.additionalDriverPrice : undefined,
      deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
      crossBorderDeposit: crossBorderFee > 0 ? crossBorderFee : undefined,
      insurancePlanId: selectedInsurancePlan?.id ?? null,
      insurancePlanName: selectedInsurancePlan?.name ?? null,
      insurancePricePerDay: selectedInsurancePlan ? selectedInsurancePlan.pricePerDay : null,
      insuranceTotal: insuranceFee,
      fee: Math.round(serviceFee * 100) / 100,
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

  // Summary of the request for the yellow ticket shown after "Confirm Booking"
  const buildTicket = () => {
    const from = dateRange?.from as Date;
    const to = dateRange?.to as Date;
    const extras = [
      childSeatFee > 0 && t("bookingTicket.childSeat"),
      additionalDriverFee > 0 && t("bookingTicket.additionalDriver"),
      crossBorderFee > 0 && t("bookingTicket.crossBorder"),
    ].filter(Boolean) as string[];

    const details: TicketRow[] = [
      { label: t("bookingTicket.guest"), value: formData.fullName },
      { label: t("bookingTicket.phone"), value: formData.phone },
      {
        label: t("bookingTicket.pickUp"),
        value: (
          <>
            {formatTicketDate(from)} · {formData.pickUpTime}
            <br />
            <span className="font-normal">{formData.pickUpLocation}</span>
          </>
        ),
      },
      {
        label: t("bookingTicket.dropOff"),
        value: (
          <>
            {formatTicketDate(to)} · {formData.dropOffTime}
            <br />
            <span className="font-normal">{formData.dropOffLocation}</span>
          </>
        ),
      },
      { label: t("bookingTicket.duration"), value: t("bookingTicket.days", { count: totalDays }) },
      {
        label: t("billing.insurance"),
        value: selectedInsurancePlan
          ? getInsurancePlanLabel(selectedInsurancePlan, t)
          : t("insurance.includedFree"),
      },
      ...(extras.length > 0
        ? [{ label: t("bookingTicket.extras"), value: extras.join(", ") }]
        : []),
    ];

    const priceRows: TicketRow[] = [
      { label: t("bookingTicket.rental", { count: totalDays }), value: money(totalPrice) },
      ...(insuranceFee > 0 ? [{ label: t("billing.insurance"), value: money(insuranceFee) }] : []),
      ...(childSeatFee > 0 ? [{ label: t("bookingTicket.childSeat"), value: money(childSeatFee) }] : []),
      ...(additionalDriverFee > 0
        ? [{ label: t("bookingTicket.additionalDriver"), value: money(additionalDriverFee) }]
        : []),
      ...(deliveryFee > 0 ? [{ label: t("billing.deliveryFee", "Delivery fee"), value: money(deliveryFee) }] : []),
      ...(crossBorderFee > 0
        ? [{ label: t("billing.crossBorderDeposit"), value: money(crossBorderFee) }]
        : []),
      { label: t("bookingTicket.serviceFee"), value: money(serviceFee) },
    ];

    return {
      details,
      priceRows,
      total: money(finalTotal),
      totalNote:
        securityDeposit > 0
          ? t("bookingTicket.depositNote", { amount: money(securityDeposit) })
          : undefined,
      steps: [
        {
          title: t("bookingTicket.steps.review.title"),
          description: t("bookingTicket.steps.review.description"),
        },
        {
          title: t("bookingTicket.steps.pay.title"),
          description: t("bookingTicket.steps.pay.description", { fee: money(serviceFee) }),
        },
        {
          title: t("bookingTicket.steps.contact.title"),
          description: t("bookingTicket.steps.contact.description", {
            rest: money(Math.max(0, finalTotal - serviceFee)),
          }),
        },
      ],
      email: formData.email,
    };
  };

  // Child seat is priced per rental day
  const childSeatFee = addChildSeat ? Math.round((car?.childSeatPrice ?? 0) * totalDays * 100) / 100 : 0;
  const additionalDriverFee = addAdditionalDriver ? (car?.additionalDriverPrice ?? 0) : 0;
  const deliveryFee = getDeliveryPrice(formData.pickUpLocation);
  // Cross border extra deposit: optional, set by the provider; no service fee on it
  const crossBorderDepositPrice = getCarRentalTerms(car).crossBorderDeposit;
  const crossBorderFee = addCrossBorder ? crossBorderDepositPrice : 0;
  // Security deposit: shown next to the total, not included in it (held at pick-up)
  const securityDeposit = getCarRentalTerms(car).depositAmount;
  const feeBase = totalPrice + childSeatFee + additionalDriverFee;
  const rawFee = feeBase * 0.05;
  const serviceFee = rawFee < 2 && feeBase > 0 ? 2 : rawFee;
  // Insurance = chosen plan price per day x rental days (no fixed insurance fee)
  const insuranceFee = selectedInsurancePlan
    ? Math.round(selectedInsurancePlan.pricePerDay * totalDays * 100) / 100
    : 0;
  const finalTotal = totalPrice + serviceFee + insuranceFee + childSeatFee + additionalDriverFee + deliveryFee + crossBorderFee;

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
    dates: !dateRange?.from || !dateRange?.to ? t("billing.selectPickUpDropOffDates") : "",
    pickUpLocation: !formData.pickUpLocation ? t("billing.errors.pickUpLocationRequired") : "",
    dropOffLocation: !formData.dropOffLocation ? t("billing.errors.dropOffLocationRequired") : "",
  };

  // Fields still needed before the booking can be sent (listed under the button)
  const missingFields = [
    fieldErrors.fullName && t("user.fullName"),
    fieldErrors.email && t("user.email"),
    fieldErrors.phone && t("user.phone"),
    fieldErrors.dates && t("billing.pickUpDropOffDates"),
    fieldErrors.pickUpLocation && t("billing.pickUpLocation"),
    fieldErrors.dropOffLocation && t("billing.dropOffLocation"),
    insurancePlans.length > 0 && !selectedInsurancePlan && t("insurance.chooseTitle"),
  ].filter(Boolean) as string[];

  const isSubmitDisabled =
    bookingMutation.isPending ||
    !formData.fullName ||
    !formData.email ||
    !formData.phone ||
    !formData.pickUpLocation ||
    !formData.dropOffLocation ||
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
      {ticket && car && (
        <BookingRequestTicket
          {...ticket}
          image={car.imageUrls?.[0]}
          propertyName={`${car.brand} ${car.name}`}
          propertySubtitle={`${car.year} • ${car.type}`}
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
            <div className="min-w-0 lg:col-span-2 space-y-6">
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
                    {renderFieldError(fieldErrors.dates)}
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
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                            style={{ color: tk.mutedText }}
                          />
                          <select
                            name="pickUpLocation"
                            value={formData.pickUpLocation}
                            onChange={handleInputChange}
                            style={{ ...inputWithIconStyle, ...(fieldErrors.pickUpLocation ? errorBorder : {}) }}
                          >
                            <option value="" disabled>
                              {t("billing.selectLocation", "Select a location")}
                            </option>
                            {DELIVERY_LOCATIONS.map((loc) => (
                              <option key={loc.name} value={loc.name}>
                                {loc.name} — {loc.price > 0 ? `€${loc.price}` : t("billing.free", "Free")}
                              </option>
                            ))}
                          </select>
                        </div>
                        {renderFieldError(fieldErrors.pickUpLocation)}
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
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                            style={{ color: tk.mutedText }}
                          />
                          <select
                            name="dropOffLocation"
                            value={formData.dropOffLocation}
                            onChange={handleInputChange}
                            style={{ ...inputWithIconStyle, ...(fieldErrors.dropOffLocation ? errorBorder : {}) }}
                          >
                            <option value="" disabled>
                              {t("billing.selectLocation", "Select a location")}
                            </option>
                            {DELIVERY_LOCATIONS.map((loc) => (
                              <option key={loc.name} value={loc.name}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {renderFieldError(fieldErrors.dropOffLocation)}
                        <p style={{ color: tk.mutedText }} className="text-xs mt-1">
                          {t("billing.dropOffAlwaysFree", "Drop-off is always free.")}
                        </p>
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

              {/* Insurance */}
              {insurancePlans.length > 0 && (
                <div
                  style={{
                    background: tk.cardBg,
                    border: `1px solid ${tk.cardBorder}`,
                  }}
                  className="rounded-2xl p-6"
                >
                  <h2
                    style={{ color: tk.pageText }}
                    className="text-xl font-semibold mb-1"
                  >
                    {t("insurance.chooseTitle")}
                  </h2>
                  <p style={{ color: tk.mutedText }} className="text-sm mb-5">
                    {t("insurance.chooseHelp")}
                  </p>
                  <InsurancePlansTable
                    plans={insurancePlans}
                    tk={tk}
                    selectedId={selectedInsurancePlanId}
                    onSelect={(plan) => setSelectedInsurancePlanId(plan.id)}
                  />
                </div>
              )}

              {/* Rental Conditions */}
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
                  {t("cars.rentalTerms.title")}
                </h2>
                <CarRentalConditions car={car} tk={tk} compact />
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="min-w-0 lg:col-span-1">
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
                      {car.year} • {car.type}
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
                              {MONTH_NAMES[item.month]}: €{item.pricePerDay} ×{" "}
                              {item.days} {item.days === 1 ? "day" : "days"}
                            </span>
                            <span className="font-medium">
                              €{item.subtotal.toFixed(2)}
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
                            <span>€{totalPrice.toFixed(2)}</span>
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
                            €{car.pricePerDay} × {totalDays || 0} days
                          </span>
                          <span className="font-medium">
                            €{totalPrice.toFixed(2)}
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
                        <span>{t("billing.serviceFee")} (5%)</span>
                        <span className="font-medium">
                          €{serviceFee.toFixed(2)}
                        </span>
                      </div>
                      <p
                        style={{ color: tk.mutedText }}
                        className="text-xs mt-1"
                      >
                        {t("billing.serviceFeeDescription")}
                      </p>
                    </div>

                    {selectedInsurancePlan ? (
                      <div>
                        <div
                          className="flex justify-between gap-2"
                          style={{ color: tk.dimText }}
                        >
                          <span>
                            {t("billing.insurance")} – {getInsurancePlanLabel(selectedInsurancePlan, t)}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            {selectedInsurancePlan.pricePerDay > 0
                              ? `€${insuranceFee.toFixed(2)}`
                              : t("insurance.free")}
                          </span>
                        </div>
                        <p
                          style={{ color: tk.mutedText }}
                          className="text-xs mt-1"
                        >
                          {selectedInsurancePlan.pricePerDay > 0
                            ? totalDays > 0
                              ? t("insurance.summaryPerDay", {
                                  price: formatInsurancePrice(selectedInsurancePlan.pricePerDay, t),
                                  count: totalDays,
                                })
                              : `${formatInsurancePrice(selectedInsurancePlan.pricePerDay, t)} · ${t("insurance.selectDates")}`
                            : t("insurance.includedFree")}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="flex justify-between"
                          style={{ color: tk.dimText }}
                        >
                          <span>{t("billing.insurance")}</span>
                          <span className="font-medium">—</span>
                        </div>
                        <p
                          style={{ color: tk.mutedText }}
                          className="text-xs mt-1"
                        >
                          {t("insurance.noPlansForClient")}
                        </p>
                      </div>
                    )}

                    {formData.pickUpLocation && (
                      <div>
                        <div
                          className="flex justify-between"
                          style={{ color: tk.dimText }}
                        >
                          <span>{t("billing.deliveryFee", "Delivery fee")}</span>
                          <span className="font-medium">
                            {deliveryFee > 0 ? `€${deliveryFee.toFixed(2)}` : t("billing.free", "Free")}
                          </span>
                        </div>
                        <p
                          style={{ color: tk.mutedText }}
                          className="text-xs mt-1"
                        >
                          {t(
                            "billing.deliveryFeeDescription",
                            "Based on your selected pick-up location. Drop-off is always free.",
                          )}
                        </p>
                      </div>
                    )}

                    {((car.childSeatPrice ?? 0) > 0 || (car.additionalDriverPrice ?? 0) > 0 || crossBorderDepositPrice > 0) && (
                      <div
                        style={{
                          borderTop: `1px solid ${tk.divider}`,
                          paddingTop: "12px",
                        }}
                        className="space-y-3"
                      >
                        {(car.childSeatPrice ?? 0) > 0 && (
                          <div>
                            <label
                              className="flex items-start justify-between gap-2 cursor-pointer"
                              style={{ color: tk.dimText }}
                            >
                              <span className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={addChildSeat}
                                  onChange={(e) => setAddChildSeat(e.target.checked)}
                                  className="mt-0.5"
                                />
                                <span className="flex items-center gap-1.5">
                                  <Baby className="w-4 h-4" style={{ color: tk.brand }} />
                                  {t("billing.addChildSeat", "Add child seat")}
                                </span>
                              </span>
                              <span className="font-medium whitespace-nowrap">
                                +{t("common.pricePerDay", { price: (car.childSeatPrice ?? 0).toFixed(2) })}
                              </span>
                            </label>
                            {addChildSeat && totalDays > 0 && (
                              <p
                                style={{ color: tk.mutedText }}
                                className="text-xs mt-1 ml-6"
                              >
                                {t("billing.perDayTimesDays", {
                                  price: t("common.pricePerDay", { price: (car.childSeatPrice ?? 0).toFixed(2) }),
                                  count: totalDays,
                                  total: `€${childSeatFee.toFixed(2)}`,
                                })}
                              </p>
                            )}
                          </div>
                        )}
                        {(car.additionalDriverPrice ?? 0) > 0 && (
                          <label
                            className="flex items-start justify-between gap-2 cursor-pointer"
                            style={{ color: tk.dimText }}
                          >
                            <span className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={addAdditionalDriver}
                                onChange={(e) => setAddAdditionalDriver(e.target.checked)}
                                className="mt-0.5"
                              />
                              <span className="flex items-center gap-1.5">
                                <UserPlus className="w-4 h-4" style={{ color: tk.brand }} />
                                {t("billing.addAdditionalDriver", "Add additional driver")}
                              </span>
                            </span>
                            <span className="font-medium">
                              +€{(car.additionalDriverPrice ?? 0).toFixed(2)}
                            </span>
                          </label>
                        )}
                        {crossBorderDepositPrice > 0 && (
                          <div>
                            <label
                              className="flex items-start justify-between gap-2 cursor-pointer"
                              style={{ color: tk.dimText }}
                            >
                              <span className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={addCrossBorder}
                                  onChange={(e) => setAddCrossBorder(e.target.checked)}
                                  className="mt-0.5"
                                />
                                <span className="flex items-center gap-1.5">
                                  <Globe className="w-4 h-4" style={{ color: tk.brand }} />
                                  {t("billing.addCrossBorder", "Cross border travel")}
                                </span>
                              </span>
                              <span className="font-medium">
                                +€{crossBorderDepositPrice.toFixed(2)}
                              </span>
                            </label>
                            <p
                              style={{ color: tk.mutedText }}
                              className="text-xs mt-1 ml-6"
                            >
                              {t(
                                "billing.crossBorderDescription",
                                "Extra deposit to drive outside Albania.",
                              )}{" "}
                              {getCarRentalTerms(car).crossBorderAssistance
                                ? t("billing.crossBorderAssistanceIncluded", "Assistance abroad included.")
                                : t("billing.crossBorderAssistanceNotIncluded", "No assistance abroad.")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

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
                      <span className="text-right">
                        <span
                          style={{ color: tk.brand }}
                          className="text-2xl font-bold"
                        >
                          €{finalTotal.toFixed(2)}
                        </span>
                        {securityDeposit > 0 && (
                          <span
                            style={{ color: tk.dimText }}
                            className="ml-1.5 text-sm font-semibold whitespace-nowrap"
                          >
                            {t("billing.plusDeposit", { amount: `€${securityDeposit.toFixed(2).replace(/\.00$/, "")}` })}
                          </span>
                        )}
                      </span>
                    </div>
                    {securityDeposit > 0 && (
                      <p
                        style={{ color: tk.mutedText }}
                        className="text-xs mt-1 text-right"
                      >
                        {t("billing.depositNote")}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    style={{
                      width: "100%",
                      marginTop: "24px",
                      background: isSubmitDisabled ? tk.statBg : tk.brand,
                      color: isSubmitDisabled ? tk.mutedText : "#fff",
                      cursor: isSubmitDisabled ? "not-allowed" : "pointer",
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
                      {t("billing.paymentNote")}
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
