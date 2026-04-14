import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Booking } from "@/types/booking.type";
import { useTheme } from "@/context/ThemeContext";
import {
  getBookingsByProviderId,
  updateBookingStatus,
} from "@/services/api/bookingService";
import { getCarById } from "@/services/api/carService";
import { getApartmentById } from "@/services/api/apartmentService";
import { getHotelById } from "@/services/api/hotelService";
import {
  Search,
  Calendar,
  Car,
  Building2,
  Home,
  Mail,
  Phone,
  DollarSign,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  ContactRound,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { notifyClientBookingStatus } from "@/services/api/emailService";
import Swal from "sweetalert2";

const CANCELLATION_REASONS = [
  "dateConflict",
  "propertyUnavailable",
  "pricingIssue",
  "customerRequest",
  "maintenance",
  "forceMajeure",
  "other",
] as const;

type CancellationReason = (typeof CANCELLATION_REASONS)[number];

const getPropertyIcon = (type: Booking["propertyType"]) => {
  switch (type) {
    case "car":
      return Car;
    case "apartment":
      return Building2;
    case "hotel":
    default:
      return Home;
  }
};

const BOOKING_STATUS_CFG: Record<
  string,
  { cls: string; icon: React.ReactNode }
> = {
  confirmed: {
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  pending: {
    cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: <Clock className="w-3 h-3" />,
  },
  canceled: {
    cls: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: <XCircle className="w-3 h-3" />,
  },
  completed: {
    cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

const PAYMENT_STATUS_CFG: Record<
  string,
  { cls: string; icon: React.ReactNode }
> = {
  paid: {
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  pending: {
    cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: <Clock className="w-3 h-3" />,
  },
  failed: {
    cls: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: <XCircle className="w-3 h-3" />,
  },
  refunded: {
    cls: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

// keep for legacy icon lookups
const getStatusColor = (status: Booking["status"]) =>
  BOOKING_STATUS_CFG[status]?.cls ?? "bg-white/5 text-white/40 border-white/10";
const getPaymentStatusColor = (status: Booking["payment_status"]) =>
  PAYMENT_STATUS_CFG[status]?.cls ?? "bg-white/5 text-white/40 border-white/10";

const getPaymentStatusIcon = (status: Booking["payment_status"]) => {
  switch (status) {
    case "paid":
      return CheckCircle2;
    case "pending":
      return Clock;
    case "failed":
      return XCircle;
    default:
      return AlertCircle;
  }
};

const getStatusIcon = (status: Booking["status"]) => {
  switch (status) {
    case "confirmed":
      return CheckCircle2;
    case "pending":
      return Clock;
    case "canceled":
      return XCircle;
    default:
      return AlertCircle;
  }
};

const getPropertyRoute = (booking: Booking) => {
  const id = booking.propertyId;
  switch (booking.propertyType) {
    case "apartment":
      return `/dashboard/apartments/${id}`;
    case "hotel":
      return `/dashboard/hotels/${id}`;
    case "car":
      return `/dashboard/carInfo/${id}`;
    default:
      return "";
  }
};

// Contact Client Popover Button
function ContactClientButton({ booking }: { booking: Booking }) {
  const { t } = useTranslation();
  const contactUnlocked = booking.payment_status === "paid";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#e41e20]/80 border border-[#e41e20]/20 rounded-lg px-2.5 py-1.5 hover:bg-[#e41e20]/10 transition-colors">
          <ContactRound className="w-3.5 h-3.5" />
          {t("bookingManagement.contactClient", "Contact Client")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-0 shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a1a]"
      >
        {/* Header */}
        <div className="bg-[#111] border-b border-white/5 px-4 py-3">
          <p className="text-white font-semibold text-sm">
            {t("bookingManagement.clientContact", "Client Contact")}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {booking.requesterName}
          </p>
        </div>

        {/* Contact Actions */}
        <div className="p-4 space-y-2.5">
          {contactUnlocked && booking.contactPhone ? (
            <a
              href={`tel:${booking.contactPhone}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-emerald-400 font-medium">
                  {t("booking.callPhone", "Call Phone")}
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {booking.contactPhone}
                </p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.03]">
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-white/25" />
              </div>
              <p className="text-sm text-white/30">
                {t("booking.noPhone", "No phone number available")}
              </p>
            </div>
          )}

          {contactUnlocked && booking.contactMail ? (
            <a
              href={`mailto:${booking.contactMail}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-sky-400 font-medium">
                  {t("booking.sendEmail", "Send Email")}
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {booking.contactMail}
                </p>
              </div>
            </a>
          ) : null}

          {!contactUnlocked && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
              {t(
                "bookingManagement.contactLocked",
                "Client contact details unlock only after payment is completed.",
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function BookingsManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? "#0d0d0d" : "#f5f4f1",
    pageText: isDark ? "#ffffff" : "#111115",
    headerBg: isDark ? "#111111" : "#ffffff",
    headerBorder: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    cardBg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : "#ede9e5",
    inputBg: isDark ? "rgba(255,255,255,0.04)" : "#faf8f5",
    inputBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    inputText: isDark ? "#ffffff" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : "#6b6663",
    dimText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    statBg: isDark ? "rgba(255,255,255,0.03)" : "#f5f2ee",
    statBorder: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    optionBg: isDark ? "#1a1a1a" : "#ffffff",
    divider: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    emptyBg: isDark ? "rgba(255,255,255,0.03)" : "#f0ece8",
    emptyBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    emptyIcon: isDark ? "rgba(255,255,255,0.20)" : "#b8b4b0",
    labelText: isDark ? "rgba(255,255,255,0.25)" : "#9e9994",
    modalBg: isDark ? "#1a1a1a" : "#ffffff",
    modalHeaderBg: isDark ? "#111111" : "#f5f2ee",
    modalHeaderBorder: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    checkboxRowBg: isDark ? "rgba(255,255,255,0.03)" : "#f5f2ee",
    checkboxRowBorder: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    popoverBg: isDark ? "#1a1a1a" : "#ffffff",
    popoverHeaderBg: isDark ? "#111111" : "#f5f2ee",
    popoverHeaderBorder: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    cancelBtnBg: isDark ? "rgba(255,255,255,0.04)" : "#f0ece8",
    cancelBtnBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
    iconMuted: isDark ? "rgba(255,255,255,0.30)" : "#b8b4b0",
    textareaBg: isDark ? "rgba(255,255,255,0.06)" : "#f5f2ee",
    textareaBorder: isDark ? "rgba(255,255,255,0.10)" : "#ddd9d5",
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Booking["status"]>(
    "all",
  );
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<
    "all" | Booking["propertyType"]
  >("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<CancellationReason[]>(
    [],
  );
  const [customReason, setCustomReason] = useState("");

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setUser(user);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookingsByProviderId();
      setBookings(data);
      await fetchPropertiesData(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(t("bookingManagement.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  // fetch properties data
  const fetchPropertiesData = async (bookings: Booking[]) => {
    const bookingsWithPropertyData = await Promise.all(
      bookings.map(async (booking) => {
        if (booking.propertyType === "car") {
          const car = await getCarById(parseInt(booking.propertyId));
          return {
            ...booking,
            propertyData: car || null,
          };
        }
        if (booking.propertyType === "apartment") {
          const apartment = await getApartmentById(
            parseInt(booking.propertyId),
          );
          return {
            ...booking,
            propertyData: apartment || null,
          };
        }
        if (booking.propertyType === "hotel") {
          const hotel = await getHotelById(parseInt(booking.propertyId));
          return {
            ...booking,
            propertyData: hotel || null,
          };
        }
        return { ...booking, propertyData: null };
      }),
    );
    setBookings(bookingsWithPropertyData);
  };

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.requesterName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.contactMail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.contactPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.propertyData?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      const matchesPropertyType =
        propertyTypeFilter === "all" ||
        booking.propertyType === propertyTypeFilter;

      return matchesSearch && matchesStatus && matchesPropertyType;
    });
  }, [bookings, searchTerm, statusFilter, propertyTypeFilter]);

  // Check if two date ranges overlap
  const datesOverlap = (
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean => {
    return (
      new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA)
    );
  };

  // Find conflicting bookings for a given booking (same property, overlapping dates, pending status)
  const getConflictingBookings = (booking: Booking): Booking[] => {
    return bookings.filter(
      (b) =>
        b.id !== booking.id &&
        b.propertyId === booking.propertyId &&
        b.propertyType === booking.propertyType &&
        b.status === "pending" &&
        datesOverlap(
          booking.startDate,
          booking.endDate,
          b.startDate,
          b.endDate,
        ),
    );
  };

  // Open cancellation modal
  const openCancelModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedReasons([]);
    setCustomReason("");
    setCancelModalOpen(true);
  };

  // Handle cancellation with reason
  const handleCancelWithReason = async () => {
    if (!selectedBooking) return;

    const reasonText = selectedReasons.includes("other")
      ? customReason
      : selectedReasons
          .map((r) => t(`bookingManagement.cancelBooking.reasons.${r}`))
          .join(", ");

    if (!reasonText.trim()) {
      await Swal.fire({
        icon: "warning",
        title: t("bookingManagement.cancelBooking.reasonRequired"),
      });
      return;
    }

    setCancelModalOpen(false);
    await confirmCancellation(selectedBooking.id, reasonText);
  };

  // Confirm cancellation (called after getting reason or automatically)
  const confirmCancellation = async (
    bookingId: string,
    cancellationReason?: string,
    isAutoCancel = false,
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Check for conflicts when confirming (not applicable for cancellation)
    let conflictingBookings: Booking[] = [];
    const newStatus: Booking["status"] = "canceled";

    // Build confirmation dialog for auto-cancellation due to conflicts
    if (isAutoCancel) {
      conflictingBookings = getConflictingBookings(booking);
    }

    // For auto-cancellation, skip the confirmation dialog
    try {
      setUpdatingStatus(bookingId);
      const updatedBooking = await updateBookingStatus(
        bookingId,
        "canceled",
        cancellationReason,
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b)),
      );

      try {
        await notifyClientBookingStatus({
          bookingId,
          status: "canceled",
          statusMessage: isAutoCancel
            ? t(
                "bookingManagement.email.autoCancellationMessage",
                "Your booking was canceled because the selected dates are no longer available.",
              )
            : t(
                "bookingManagement.email.cancellationMessage",
                "Your booking request was declined by the provider.",
              ),
          cancellationReason,
        });
      } catch (emailError) {
        console.error("Error sending cancellation email:", emailError);
      }

      // Auto-decline conflicting bookings when confirming
      if (conflictingBookings.length > 0) {
        const autoCancelReason = t(
          "bookingManagement.cancelBooking.reasons.dateConflict",
        );
        const declineResults = await Promise.allSettled(
          conflictingBookings.map(async (cb) => {
            const result = await updateBookingStatus(
              cb.id,
              "canceled",
              autoCancelReason,
            );

            try {
              await notifyClientBookingStatus({
                bookingId: cb.id,
                status: "canceled",
                statusMessage: t(
                  "bookingManagement.email.autoCancellationMessage",
                  "Your booking was canceled because the selected dates are no longer available.",
                ),
                cancellationReason: autoCancelReason,
              });
            } catch (emailError) {
              console.error(
                "Error sending conflict cancellation email:",
                emailError,
              );
            }

            return result;
          }),
        );

        setBookings((prev) =>
          prev.map((b) => {
            const declined = conflictingBookings.find((cb) => cb.id === b.id);
            if (declined) {
              const resultIndex = conflictingBookings.indexOf(declined);
              if (declineResults[resultIndex].status === "fulfilled") {
                return {
                  ...b,
                  status: "canceled" as const,
                  cancellation_reason: autoCancelReason,
                };
              }
            }
            return b;
          }),
        );

        await Swal.fire({
          icon: "warning",
          title: t(
            "bookingManagement.confirmations.conflictTitle",
            "Date Conflict Detected",
          ),
          text: t(
            "bookingManagement.cancelBooking.autoCancelled",
            "Booking automatically cancelled due to date conflict with another booking",
          ),
        });
      } else if (!isAutoCancel) {
        await Swal.fire({
          icon: "success",
          title: t("bookingManagement.confirmations.statusUpdated"),
          text: t("bookingManagement.confirmations.statusUpdatedSuccess"),
        });
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      await Swal.fire({
        icon: "error",
        title: t("bookingManagement.confirmations.updateFailed"),
        text: t("bookingManagement.confirmations.updateFailedText"),
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: Booking["status"],
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Check for conflicts when confirming
    let conflictingBookings: Booking[] = [];
    if (newStatus === "confirmed") {
      conflictingBookings = getConflictingBookings(booking);
    }

    // Build confirmation dialog
    if (conflictingBookings.length > 0) {
      const conflictListHtml = conflictingBookings
        .map((cb) => {
          const start = new Date(cb.startDate).toLocaleDateString();
          const end = new Date(cb.endDate).toLocaleDateString();
          return `
            <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:8px;text-align:left;">
              <div style="font-weight:600;color:#92400e;">${cb.requesterName}</div>
              <div style="font-size:13px;color:#78350f;margin-top:4px;">
                📅 ${start} → ${end}
              </div>
              <div style="font-size:13px;color:#78350f;">
                💰 $${cb.totalPrice.toFixed(2)}
              </div>
            </div>`;
        })
        .join("");

      const result = await Swal.fire({
        title: t(
          "bookingManagement.confirmations.conflictTitle",
          "Date Conflict Detected",
        ),
        html: `
          <p style="margin-bottom:12px;color:#374151;">
            ${t("bookingManagement.confirmations.conflictMessage", {
              count: conflictingBookings.length,
              defaultValue: `Confirming this booking will automatically decline <strong>${conflictingBookings.length}</strong> other pending booking(s) for the same property with overlapping dates:`,
            })}
          </p>
          ${conflictListHtml}
          <p style="margin-top:12px;color:#6b7280;font-size:13px;">
            ${t("bookingManagement.confirmations.conflictProceed", "Do you want to proceed? This action cannot be undone.")}
          </p>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#059669",
        cancelButtonColor: "#6b7280",
        confirmButtonText: t(
          "bookingManagement.confirmations.confirmAndDecline",
          "Confirm & Decline Others",
        ),
        cancelButtonText: t("account.cancel", "Cancel"),
        customClass: { popup: "swal-wide" },
      });

      if (!result.isConfirmed) return;
    } else if (newStatus !== "canceled") {
      const result = await Swal.fire({
        title: t("bookingManagement.confirmations.updateStatusTitle"),
        text: t("bookingManagement.confirmations.updateStatusText", {
          status: newStatus,
        }),
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("bookingManagement.confirmations.confirmButton"),
      });

      if (!result.isConfirmed) return;
    }

    // For cancellation, open modal to get reason
    if (newStatus === "canceled") {
      const bookingToCancel = bookings.find((b) => b.id === bookingId);
      if (bookingToCancel) {
        openCancelModal(bookingToCancel);
      }
      return;
    }

    // Proceed with confirmation (not cancellation)
    try {
      setUpdatingStatus(bookingId);
      const updatedBooking = await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b)),
      );

      // Auto-decline conflicting bookings when confirming
      if (newStatus === "confirmed" && conflictingBookings.length > 0) {
        const autoCancelReason = t(
          "bookingManagement.cancelBooking.reasons.dateConflict",
        );
        const declineResults = await Promise.allSettled(
          conflictingBookings.map(async (cb) => {
            const result = await updateBookingStatus(
              cb.id,
              "canceled",
              autoCancelReason,
            );

            try {
              await notifyClientBookingStatus({
                bookingId: cb.id,
                status: "canceled",
                statusMessage: t(
                  "bookingManagement.email.autoCancellationMessage",
                  "Your booking was canceled because the selected dates are no longer available.",
                ),
                cancellationReason: autoCancelReason,
              });
            } catch (emailError) {
              console.error(
                "Error sending conflict cancellation email:",
                emailError,
              );
            }

            return result;
          }),
        );

        setBookings((prev) =>
          prev.map((b) => {
            const declined = conflictingBookings.find((cb) => cb.id === b.id);
            if (declined) {
              const resultIndex = conflictingBookings.indexOf(declined);
              if (declineResults[resultIndex].status === "fulfilled") {
                return {
                  ...b,
                  status: "canceled" as const,
                  cancellation_reason: autoCancelReason,
                };
              }
            }
            return b;
          }),
        );
      }

      // Send confirmation email if status changed to confirmed
      if (newStatus === "confirmed") {
        const bookingData = bookings.find((b) => b.id === bookingId);
        if (bookingData) {
          try {
            await notifyClientBookingStatus({
              bookingId: bookingData.id,
              status: "confirmed",
              statusMessage: t("bookingManagement.email.confirmationMessage"),
            });
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
          }
        }
      }

      await Swal.fire({
        icon: "success",
        title: t("bookingManagement.confirmations.statusUpdated"),
        text: t("bookingManagement.confirmations.statusUpdatedSuccess"),
      });
    } catch (err) {
      console.error("Error updating booking status:", err);
      await Swal.fire({
        icon: "error",
        title: t("bookingManagement.confirmations.updateFailed"),
        text: t("bookingManagement.confirmations.updateFailedText"),
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div
        className="-m-8 flex min-h-[calc(100vh)] items-center justify-center"
        style={{ background: tk.pageBg }}
      >
        <Loader2 size={40} className="animate-spin text-[#e41e20]" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="-m-8 flex min-h-[calc(100vh)] flex-col items-center justify-center gap-4"
        style={{ background: tk.pageBg }}
      >
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-[#e41e20] text-white rounded-xl text-sm hover:bg-[#c91a1c] transition"
        >
          {t("bookingManagement.errors.retry")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="-m-8 min-h-[calc(100vh)]"
      style={{ background: tk.pageBg, color: tk.pageText }}
    >
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden px-6 py-8 md:px-10"
        style={{
          background: tk.headerBg,
          borderBottom: `1px solid ${tk.headerBorder}`,
        }}
      >
        <div className="pointer-events-none absolute -top-20 left-10 h-60 w-60 rounded-full bg-[#e41e20]/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e41e20]/15 ring-1 ring-[#e41e20]/40">
            <Calendar className="h-4 w-4 text-[#e41e20]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: tk.pageText }}
            >
              {t("bookingManagement.title")}
            </h1>
            <p className="text-sm" style={{ color: tk.mutedText }}>
              {t("bookingManagement.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 md:px-10">
        {/* ── Stats ── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: t("bookingManagement.stats.totalBookings"),
              value: bookings.length,
              color: tk.pageText,
            },
            {
              label: t("bookingManagement.stats.pending"),
              value: bookings.filter((b) => b.status === "pending").length,
              color: "#f59e0b",
            },
            {
              label: t("bookingManagement.stats.confirmed"),
              value: bookings.filter((b) => b.status === "confirmed").length,
              color: "#10b981",
            },
            {
              label: t("bookingManagement.stats.totalRevenue"),
              value: `$${bookings.reduce((s, b) => s + b.totalPrice, 0).toFixed(2)}`,
              color: "#e41e20",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-4 py-3"
              style={{
                background: tk.statBg,
                border: `1px solid ${tk.statBorder}`,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: tk.labelText }}
              >
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: tk.iconMuted }}
            />
            <input
              className="h-10 w-full rounded-xl pl-10 text-sm focus:outline-none"
              style={{
                background: tk.inputBg,
                border: `1px solid ${tk.inputBorder}`,
                color: tk.inputText,
              }}
              placeholder={t("bookingManagement.filters.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 appearance-none rounded-xl px-4 text-sm focus:outline-none"
            style={{
              background: tk.inputBg,
              border: `1px solid ${tk.inputBorder}`,
              color: tk.inputText,
            }}
          >
            <option value="all" style={{ background: tk.optionBg }}>
              {t("bookingManagement.filters.allStatuses")}
            </option>
            <option value="pending" style={{ background: tk.optionBg }}>
              {t("bookingManagement.statusOptions.pending")}
            </option>
            <option value="confirmed" style={{ background: tk.optionBg }}>
              {t("bookingManagement.statusOptions.confirmed")}
            </option>
            <option value="canceled" style={{ background: tk.optionBg }}>
              {t("bookingManagement.statusOptions.canceled")}
            </option>
          </select>
          <select
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value as any)}
            className="h-10 appearance-none rounded-xl px-4 text-sm focus:outline-none"
            style={{
              background: tk.inputBg,
              border: `1px solid ${tk.inputBorder}`,
              color: tk.inputText,
            }}
          >
            <option value="all" style={{ background: tk.optionBg }}>
              {t("bookingManagement.filters.allTypes")}
            </option>
            <option value="car" style={{ background: tk.optionBg }}>
              {t("bookingManagement.filters.cars")}
            </option>
            <option value="apartment" style={{ background: tk.optionBg }}>
              {t("bookingManagement.filters.apartments")}
            </option>
            <option value="hotel" style={{ background: tk.optionBg }}>
              {t("bookingManagement.filters.hotels")}
            </option>
          </select>
        </div>

        {/* ── Empty ── */}
        {filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: tk.emptyBg,
                border: `1px solid ${tk.emptyBorder}`,
              }}
            >
              <Calendar className="h-7 w-7" style={{ color: tk.emptyIcon }} />
            </div>
            <p className="text-sm font-medium" style={{ color: tk.mutedText }}>
              {t("bookingManagement.emptyState.noBookings")}
            </p>
            <p className="mt-1 text-xs" style={{ color: tk.labelText }}>
              {searchTerm ||
              statusFilter !== "all" ||
              propertyTypeFilter !== "all"
                ? t("bookingManagement.emptyState.adjustFilters")
                : t("bookingManagement.emptyState.noBookingsYet")}
            </p>
          </div>
        )}

        {/* ── Booking Cards (unified, responsive) ── */}
        {filteredBookings.length > 0 && (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const PropertyIconComp = getPropertyIcon(booking.propertyType);
              const statusCfg =
                BOOKING_STATUS_CFG[booking.status] ??
                BOOKING_STATUS_CFG.pending;
              const paymentCfg =
                PAYMENT_STATUS_CFG[booking.payment_status] ??
                PAYMENT_STATUS_CFG.pending;
              const startDate = new Date(booking.startDate);
              const endDate = new Date(booking.endDate);

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl p-5 transition-colors"
                  style={{
                    background: tk.cardBg,
                    border: `1px solid ${tk.cardBorder}`,
                  }}
                >
                  {/* top row */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Property */}
                    <div
                      className="flex items-start gap-4 cursor-pointer group flex-1"
                      onClick={() => navigate(getPropertyRoute(booking))}
                    >
                      <div
                        className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm"
                        style={{ background: tk.statBg }}
                      >
                        {booking.propertyData?.imageUrls?.[0] ? (
                          <img
                            src={booking.propertyData.imageUrls[0]}
                            alt={booking.propertyData.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <PropertyIconComp
                            className="w-6 h-6"
                            style={{ color: tk.mutedText }}
                          />
                        )}
                      </div>
                      <div className="pt-1">
                        <p
                          className="text-base font-bold group-hover:text-[#e41e20] transition-colors line-clamp-1"
                          style={{ color: tk.pageText }}
                        >
                          {booking.propertyData?.name ||
                            `${booking.propertyType.charAt(0).toUpperCase() + booking.propertyType.slice(1)}`}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span
                            className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
                            style={{
                              background: tk.statBg,
                              color: tk.mutedText,
                            }}
                          >
                            {booking.propertyType}
                          </span>
                          <span
                            className="text-[11px] font-mono"
                            style={{ color: tk.labelText }}
                          >
                            #{booking.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="text-[9px] uppercase tracking-widest"
                          style={{ color: tk.labelText }}
                        >
                          {t(
                            "bookingManagement.table.headers.bookingStatus",
                            "Booking",
                          )}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusCfg.cls}`}
                        >
                          {statusCfg.icon}
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="text-[9px] uppercase tracking-widest"
                          style={{ color: tk.labelText }}
                        >
                          {t(
                            "bookingManagement.table.headers.paymentStatus",
                            "Payment",
                          )}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${paymentCfg.cls}`}
                        >
                          {paymentCfg.icon}
                          {booking.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* detail row */}
                  <div
                    className="mt-4 grid gap-4 pt-4 sm:grid-cols-3"
                    style={{ borderTop: `1px solid ${tk.divider}` }}
                  >
                    {/* Customer */}
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-widest"
                        style={{ color: tk.labelText }}
                      >
                        {t("bookingManagement.table.headers.customer")}
                      </p>
                      <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: tk.pageText }}
                      >
                        {booking.status === "confirmed" &&
                        booking.payment_status === "paid"
                          ? booking.requesterName
                          : "—"}
                      </p>
                      {booking.status === "confirmed" &&
                        booking.payment_status === "paid" && (
                          <ContactClientButton booking={booking} />
                        )}
                    </div>

                    {/* Dates */}
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-widest"
                        style={{ color: tk.labelText }}
                      >
                        {t("bookingManagement.table.headers.dates")}
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <p
                          className="flex items-center gap-1.5 text-sm"
                          style={{ color: tk.dimText }}
                        >
                          <Calendar
                            className="h-3.5 w-3.5"
                            style={{ color: tk.iconMuted }}
                          />
                          {startDate.toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p
                          className="ml-5 text-xs"
                          style={{ color: tk.labelText }}
                        >
                          →{" "}
                          {endDate.toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        {booking.pickUpTime && booking.dropOffTime && (
                          <p
                            className="ml-5 text-xs"
                            style={{ color: tk.labelText }}
                          >
                            {booking.pickUpTime} – {booking.dropOffTime}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price + Actions */}
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-widest"
                        style={{ color: tk.labelText }}
                      >
                        {t("bookingManagement.table.headers.price")}
                      </p>
                      <p
                        className="mt-1 flex items-center gap-1 text-xl font-bold"
                        style={{ color: tk.pageText }}
                      >
                        <DollarSign className="h-4 w-4 text-[#e41e20]" />
                        {booking.totalPrice.toFixed(2)}
                      </p>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking.id, "confirmed")
                              }
                              disabled={updatingStatus === booking.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t(
                                "bookingManagement.actions.confirm",
                                "Confirm",
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking.id, "canceled")
                              }
                              disabled={updatingStatus === booking.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {t(
                                "bookingManagement.actions.decline",
                                "Decline",
                              )}
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" &&
                          booking.payment_status === "pending" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking.id, "canceled")
                              }
                              disabled={updatingStatus === booking.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {t(
                                "bookingManagement.actions.cancel",
                                "Cancel Booking",
                              )}
                            </button>
                          )}
                        {booking.status === "canceled" && (
                          <span
                            className="text-xs italic"
                            style={{ color: tk.labelText }}
                          >
                            {t(
                              "bookingManagement.actions.noActions",
                              "No actions available",
                            )}
                          </span>
                        )}
                        {booking.status === "confirmed" &&
                          booking.payment_status === "paid" && (
                            <span className="text-xs text-emerald-400 font-medium">
                              {t(
                                "bookingManagement.actions.fullyConfirmed",
                                "Confirmed & Paid",
                              )}
                            </span>
                          )}
                        {updatingStatus === booking.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-[#e41e20]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation reason */}
                  {booking.status === "canceled" &&
                    booking.cancellation_reason && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/15 bg-red-500/[0.07] px-4 py-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400/70">
                            {t(
                              "adminProviderBookings.table.cancellationReason",
                              "Cancellation Reason",
                            )}
                          </p>
                          <p className="mt-0.5 text-sm text-red-300/80">
                            {booking.cancellation_reason}
                          </p>
                        </div>
                      </div>
                    )}

                  <p
                    className="mt-3 text-[10px]"
                    style={{ color: tk.labelText }}
                  >
                    {t("adminProviderBookings.booked", "Booked")}{" "}
                    {new Date(booking.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Reason Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: tk.modalBg,
            border: `1px solid ${tk.headerBorder}`,
            color: tk.pageText,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: tk.pageText }}>
              {t("bookingManagement.cancelBooking.title", "Cancel Booking")}
            </DialogTitle>
            <DialogDescription style={{ color: tk.mutedText }}>
              {t(
                "bookingManagement.cancelBooking.subtitle",
                "Please select a reason for cancellation",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {CANCELLATION_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 cursor-pointer rounded-xl p-3 transition-colors hover:opacity-80"
                style={{
                  background: tk.checkboxRowBg,
                  border: `1px solid ${tk.checkboxRowBorder}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReasons([...selectedReasons, reason]);
                    } else {
                      setSelectedReasons(
                        selectedReasons.filter((r) => r !== reason),
                      );
                    }
                  }}
                  className="w-4 h-4 accent-[#e41e20] rounded"
                />
                <span className="text-sm" style={{ color: tk.dimText }}>
                  {t(
                    `bookingManagement.cancelBooking.reasons.${reason}`,
                    reason,
                  )}
                </span>
              </label>
            ))}
            {selectedReasons.includes("other") && (
              <div className="mt-3">
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: tk.mutedText }}
                >
                  {t(
                    "bookingManagement.cancelBooking.customReasonLabel",
                    "Other reason (please specify)",
                  )}
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder={t(
                    "bookingManagement.cancelBooking.customReasonPlaceholder",
                    "Enter your reason...",
                  )}
                  className="w-full rounded-xl p-3 text-sm focus:outline-none resize-none"
                  style={{
                    background: tk.textareaBg,
                    border: `1px solid ${tk.textareaBorder}`,
                    color: tk.inputText,
                  }}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm transition-colors hover:opacity-80"
              style={{
                background: tk.cancelBtnBg,
                border: `1px solid ${tk.cancelBtnBorder}`,
                color: tk.mutedText,
              }}
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              onClick={handleCancelWithReason}
              className="px-4 py-2 rounded-xl bg-[#e41e20] text-sm text-white font-medium hover:bg-[#c91a1c] transition-colors"
            >
              {t(
                "bookingManagement.cancelBooking.confirmCancel",
                "Confirm Cancellation",
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
