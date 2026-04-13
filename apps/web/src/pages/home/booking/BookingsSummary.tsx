import { useState } from "react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import bookingService from "@/services/api/bookingService";
import paymentService from "@/services/api/paymentService";
import { Booking } from "@/types/booking.type";
import {
  Loader2,
  Calendar,
  Car,
  Building2,
  Home,
  AlertCircle,
  CreditCard,
  MapPin,
  Clock,
  FileText,
  Download,
  Star,
  Phone,
  Mail,
  ContactRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router";
import { updateBookingStatus } from "@/services/api/bookingService";
import Swal from "sweetalert2";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import StripePaymentButton from "@/components/payments/StripePaymentButton";
import { jsPDF } from "jspdf";
import logoImage from "@/assets/logo/logoBOOKinAL.png";
import { useTranslation } from "react-i18next";
import ReviewModal from "@/components/reviews/ReviewModal";
import { useTheme } from "@/context/ThemeContext";

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

const formatDate = (d: Date) => {
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

// Invoice PDF Generator
const generateInvoicePDF = async (booking: Booking) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add logo
  try {
    const img = new Image();
    img.src = logoImage;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    const logoWidth = 50;
    const logoHeight = (img.height / img.width) * logoWidth;
    doc.addImage(
      img,
      "PNG",
      (pageWidth - logoWidth) / 2,
      10,
      logoWidth,
      logoHeight,
    );
  } catch (error) {
    console.error("Failed to load logo:", error);
  }

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138); // Blue color
  doc.text("INVOICE", pageWidth / 2, 55, { align: "center" });

  // Invoice details box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 65, pageWidth - 30, 25, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Invoice Number: INV-${booking.id.slice(0, 8).toUpperCase()}`,
    20,
    75,
  );
  doc.text(`Date: ${formatDate(new Date())}`, 20, 82);
  doc.text(`Booking Reference: ${booking.id}`, pageWidth / 2 + 10, 75);
  doc.text(`Status: ${booking.status.toUpperCase()}`, pageWidth / 2 + 10, 82);

  // Customer Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Customer Information", 15, 105);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${booking.requesterName}`, 15, 115);
  doc.text(`Email: ${booking.contactMail}`, 15, 123);

  // Booking Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Booking Details", 15, 140);

  // Details table header
  doc.setFillColor(30, 58, 138);
  doc.rect(15, 145, pageWidth - 30, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Description", 20, 151);
  doc.text("Details", pageWidth - 60, 151);

  // Table content
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  let yPos = 165;

  const addTableRow = (label: string, value: string, highlight = false) => {
    if (highlight) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos - 6, pageWidth - 30, 10, "F");
    }
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, yPos);
    doc.setTextColor(30, 41, 59);
    doc.text(value, pageWidth - 60, yPos);
    yPos += 12;
  };

  addTableRow(
    "Property Type",
    booking.propertyType.charAt(0).toUpperCase() +
      booking.propertyType.slice(1),
    true,
  );
  addTableRow("Property Name", booking.propertyData?.name || "N/A");
  addTableRow("Check-in Date", formatDate(new Date(booking.startDate)), true);
  addTableRow("Check-out Date", formatDate(new Date(booking.endDate)));
  addTableRow("Pick-up Location", booking.pickUpLocation || "N/A", true);
  addTableRow("Drop-off Location", booking.dropOffLocation || "N/A");
  addTableRow("Pick-up Time", booking.pickUpTime || "N/A", true);
  addTableRow("Drop-off Time", booking.dropOffTime || "N/A");

  // Total section
  yPos += 10;
  doc.setFillColor(16, 185, 129); // Green
  doc.roundedRect(pageWidth - 85, yPos, 70, 20, 3, 3, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", pageWidth - 80, yPos + 8);
  doc.setFontSize(14);
  doc.text(`$${booking.totalPrice.toFixed(2)}`, pageWidth - 80, yPos + 16);

  // Payment status
  yPos += 35;
  const paymentColor =
    booking.payment_status === "paid" ? [16, 185, 129] : [245, 158, 11];
  doc.setFillColor(paymentColor[0], paymentColor[1], paymentColor[2]);
  doc.roundedRect(15, yPos, 60, 8, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `Payment: ${(booking.payment_status || "pending").toUpperCase()}`,
    20,
    yPos + 5.5,
  );

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for booking with BOOKinAL!", pageWidth / 2, 270, {
    align: "center",
  });
  doc.text(
    "For any questions, please contact us at support@bookinal.com",
    pageWidth / 2,
    277,
    { align: "center" },
  );

  // Download the PDF
  const fileName = `Invoice-${booking.propertyType}-${booking.id.slice(0, 8)}.pdf`;
  doc.save(fileName);
};

// Provider Contact Button
function ProviderContactButton({ providerId }: { providerId: string }) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [provider, setProvider] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !provider) {
      try {
        setLoading(true);
        const data = await userService.getUserById(providerId);
        setProvider(data);
      } catch {
        // silently fail — provider info unavailable
      } finally {
        setLoading(false);
      }
    }
  };

  const popBg = isDark ? '#1a1a1e' : '#ffffff';
  const popBorder = isDark ? 'rgba(255,255,255,0.08)' : '#ede9e5';
  const rowBg = isDark ? 'rgba(255,255,255,0.04)' : '#f5f2ee';
  const rowBorderC = isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5';
  const rowText = isDark ? '#ffffff' : '#1a1a1a';
  const mutedText = isDark ? 'rgba(255,255,255,0.40)' : '#6b6663';
  const triggerBorder = isDark ? 'rgba(255,255,255,0.12)' : '#ddd9d5';
  const triggerText = isDark ? 'rgba(255,255,255,0.60)' : '#44403c';

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '999px',
            border: `1px solid ${triggerBorder}`,
            color: triggerText,
            background: 'transparent',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8192C';
            (e.currentTarget as HTMLButtonElement).style.color = '#E8192C';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = triggerBorder;
            (e.currentTarget as HTMLButtonElement).style.color = triggerText;
          }}
        >
          <ContactRound style={{ width: 14, height: 14 }} />
          {t("booking.contactProvider", "Contact Provider")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        style={{
          width: 288,
          padding: 0,
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${popBorder}`,
          background: popBg,
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #b91c1c, #7f1d1d, #000000)',
          padding: '14px 16px',
        }}>
          <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>
            {t("booking.providerContact", "Provider Contact")}
          </p>
          {!loading && provider?.full_name && (
            <p style={{ color: 'rgba(252,165,165,0.8)', fontSize: 12, marginTop: 2 }}>{provider.full_name}</p>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '2px solid #E8192C', borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : provider ? (
            <>
              {provider.phone ? (
                <a
                  href={`tel:${provider.phone}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 12,
                    background: rowBg, border: `1px solid ${rowBorderC}`,
                    textDecoration: 'none', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Phone style={{ width: 16, height: 16, color: '#ffffff' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: '#E8192C', fontWeight: 500 }}>
                      {t("booking.callPhone", "Call Phone")}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: rowText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {provider.phone}
                    </p>
                  </div>
                </a>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, borderRadius: 12,
                  background: rowBg, border: `1px solid ${rowBorderC}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e2de',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Phone style={{ width: 16, height: 16, color: mutedText }} />
                  </div>
                  <p style={{ fontSize: 14, color: mutedText }}>
                    {t("booking.noPhone", "No phone number available")}
                  </p>
                </div>
              )}

              <a
                href={`mailto:${provider.email}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, borderRadius: 12,
                  background: rowBg, border: `1px solid ${rowBorderC}`,
                  textDecoration: 'none', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isDark ? '#222' : '#111115',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Mail style={{ width: 16, height: 16, color: '#ffffff' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: mutedText, fontWeight: 500 }}>
                    {t("booking.sendEmail", "Send Email")}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: rowText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {provider.email}
                  </p>
                </div>
              </a>
            </>
          ) : (
            <p style={{ fontSize: 14, color: mutedText, textAlign: 'center', padding: '12px 0' }}>
              {t("booking.providerInfoUnavailable", "Provider info unavailable")}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// PayPal Button Component for individual booking
function PayPalPaymentButton({ booking }: { booking: Booking }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [{ isPending }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = async (): Promise<string> => {
    try {
      console.log("[PayPal] Creating order for booking:", booking.id);
      const response = await paymentService.createPayPalOrder({
        bookingId: booking.id,
      });
      console.log("[PayPal] Order created successfully:", response);

      if (!response.orderId) {
        throw new Error("No orderId returned from server");
      }

      return response.orderId;
    } catch (error: any) {
      console.error("[PayPal] Error creating order:", error);
      console.error("[PayPal] Error details:", JSON.stringify(error, null, 2));
      console.error("[PayPal] Error response:", error?.response);
      toast({
        title: "Payment Error",
        description:
          error?.message || "Failed to create payment order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      setIsProcessing(true);
      console.log("[PayPal] Approving order with ID:", data.orderID);
      console.log("[PayPal] Booking ID:", booking.id);

      const response = await paymentService.capturePayPalOrder({
        orderId: data.orderID,
        bookingId: booking.id,
      });

      console.log("[PayPal] Capture response:", response);

      if (!response.success) {
        throw new Error(response.message || "Payment capture failed");
      }

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });

      await queryClient.invalidateQueries({
        queryKey: ["bookings", "currentUser"],
      });
    } catch (error: any) {
      console.error("[PayPal] Error capturing payment:", error);
      console.error("[PayPal] Error details:", JSON.stringify(error, null, 2));
      console.error("[PayPal] Error response:", error?.response);
      toast({
        title: "Payment Error",
        description:
          error?.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err: Record<string, unknown>) => {
    console.error("[PayPal] Payment error:", err);
    console.error(
      "[PayPal] Payment error details:",
      JSON.stringify(err, null, 2),
    );
    toast({
      title: "Payment Error",
      description: "An error occurred during payment. Please try again.",
      variant: "destructive",
    });
    setIsProcessing(false);
  };

  const onCancel = () => {
    console.log("[PayPal] User cancelled payment");
    setIsProcessing(false);
    toast({
      title: "Payment Cancelled",
      description: "You cancelled the payment process.",
    });
  };

  if (isPending || isProcessing) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[200px]">
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
      />
    </div>
  );
}

export default function BookingsSummary() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#ede9e5',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    imagePlaceholder: isDark ? '#1a1a1e' : '#e5e2de',
    refBg: isDark ? 'rgba(255,255,255,0.06)' : '#f0ece8',
    refText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    paginationBg: isDark ? 'rgba(255,255,255,0.04)' : '#f5f2ee',
    paginationBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    paginationText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    emptyBg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    emptyIconBg: isDark ? 'rgba(232,25,44,0.12)' : '#fef2f2',
    errorBg: isDark ? 'rgba(232,25,44,0.08)' : '#fef2f2',
    errorText: isDark ? '#fca5a5' : '#b91c1c',
    errorBorder: isDark ? 'rgba(232,25,44,0.30)' : '#fecaca',
  };

  // Status badge styles
  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === 'confirmed') return {
      background: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5',
      color: isDark ? '#6ee7b7' : '#065f46',
      border: `1px solid ${isDark ? 'rgba(16,185,129,0.30)' : '#a7f3d0'}`,
    };
    if (status === 'pending') return {
      background: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb',
      color: isDark ? '#fcd34d' : '#92400e',
      border: `1px solid ${isDark ? 'rgba(245,158,11,0.30)' : '#fde68a'}`,
    };
    if (status === 'canceled') return {
      background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
      color: isDark ? '#fca5a5' : '#991b1b',
      border: `1px solid ${isDark ? 'rgba(239,68,68,0.30)' : '#fecaca'}`,
    };
    return {
      background: isDark ? 'rgba(255,255,255,0.06)' : '#f5f4f1',
      color: tk.dimText,
      border: `1px solid ${tk.paginationBorder}`,
    };
  };

  // Combined status description box style
  const getCombinedStatusStyle = (isSuccess: boolean, isWarning: boolean, isDanger: boolean): React.CSSProperties => {
    if (isSuccess) return {
      background: isDark ? 'rgba(16,185,129,0.10)' : '#ecfdf5',
      color: isDark ? '#6ee7b7' : '#065f46',
      border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0'}`,
    };
    if (isWarning) return {
      background: isDark ? 'rgba(245,158,11,0.10)' : '#fffbeb',
      color: isDark ? '#fcd34d' : '#92400e',
      border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : '#fde68a'}`,
    };
    if (isDanger) return {
      background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2',
      color: isDark ? '#fca5a5' : '#991b1b',
      border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fecaca'}`,
    };
    return {
      background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f4f1',
      color: tk.dimText,
      border: `1px solid ${tk.paginationBorder}`,
    };
  };

  // Border-left accent per booking status
  const getStatusBorderColor = (status: string) => {
    if (status === 'confirmed') return '#10b981';
    if (status === 'pending') return '#f59e0b';
    if (status === 'canceled') return '#ef4444';
    return isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db';
  };

  const {
    data: bookingPage,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["bookings", "currentUser", page],
    queryFn: () => bookingService.getCurrentUserBookingsPaginated(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  const bookings = bookingPage?.data;
  const totalPages = bookingPage?.totalPages ?? 1;
  const total = bookingPage?.total ?? 0;

  const getPropertyRoute = (booking: Booking) => {
    const id = booking.propertyId;
    switch (booking.propertyType) {
      case "apartment":
        return `/apartmentReservation/${id}`;
      case "hotel":
        return `/hotelReservation/${id}`;
      case "car":
        return `/carReservation/${id}`;
      default:
        return "";
    }
  };

  const handlePendingBookingCancel = async (booking: Booking) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
      }).then((result) => {
        if (result.isConfirmed) {
          updateBookingStatus(booking.id, "canceled");
          toast({
            title: "Booking Cancelled",
            description: "Your booking has been cancelled.",
          });
        }
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: tk.pageBg, color: tk.pageText }}>
      <PrimarySearchAppBar />

      {/* ── Page Hero Header ── */}
      <div className="bg-gradient-to-r from-red-700 via-red-900 to-black px-4 pt-12 pb-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-300 text-xs font-bold uppercase tracking-widest mb-2">
            My Account
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {t("booking.myBookings")}
          </h1>
          <p className="mt-2 text-red-200/60 text-sm max-w-lg">
            {t("booking.bookingSummaryDescription")}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 pb-16">

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2px solid #E8192C', borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 14, color: tk.mutedText }}>Loading your bookings…</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 20,
            background: tk.errorBg,
            borderLeft: `4px solid #E8192C`,
            borderRadius: '0 12px 12px 0',
            color: tk.errorText,
          }}>
            <AlertCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
            <span style={{ fontSize: 14 }}>
              {(error as any)?.message ||
                "We couldn't load your bookings right now. Please try again later."}
            </span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && (!bookings || bookings.length === 0) && (
          <div style={{
            background: tk.emptyBg,
            borderRadius: 16,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
            border: `1px solid ${tk.cardBorder}`,
            padding: 48,
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: tk.emptyIconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Calendar style={{ width: 28, height: 28, color: '#E8192C' }} />
            </div>
            <h3 style={{ fontWeight: 900, fontSize: 18, color: tk.pageText, marginBottom: 4 }}>
              {t("booking.noBookings")}
            </h3>
            <p style={{ fontSize: 14, color: tk.mutedText, marginBottom: 24 }}>
              {t("booking.startExploring")}
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(to right, #b91c1c, #000000)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                opacity: 1,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
            >
              Explore Albania
            </button>
          </div>
        )}

        {/* ── Booking Cards ── */}
        {!isLoading && !isError && bookings && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking) => {
              const Icon = getPropertyIcon(booking.propertyType);
              const start = new Date(booking.startDate);
              const end = new Date(booking.endDate);
              const statusBorderColor = getStatusBorderColor(booking.status);

              return (
                <div
                  key={booking.id}
                  style={{
                    background: tk.cardBg,
                    borderRadius: 16,
                    borderLeft: `4px solid ${statusBorderColor}`,
                    overflow: "hidden",
                    boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
                    border: `1px solid ${tk.cardBorder}`,
                    borderLeftColor: statusBorderColor,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="sm:flex-row"
                  >
                    {/* ── Property Image Strip ── */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 144,
                        flexShrink: 0,
                        cursor: "pointer",
                        overflow: "hidden",
                        background: tk.imagePlaceholder,
                      }}
                      className="sm:w-40 sm:h-auto"
                      onClick={() => navigate(getPropertyRoute(booking))}
                    >
                      <img
                        src={
                          booking.propertyData?.imageUrls?.[0] ||
                          "/images/placeholder.png"
                        }
                        alt={booking.propertyData?.name || "Property"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s",
                        }}
                        onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLImageElement
                          ).style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLImageElement
                          ).style.transform = "scale(1)")
                        }
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                        }}
                      />
                      {/* Property type icon */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.95)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        <Icon
                          style={{ width: 14, height: 14, color: "#E8192C" }}
                        />
                      </div>
                    </div>

                    {/* ── Card Body ── */}
                    <div
                      style={{ display: "flex", flex: 1, padding: 20, gap: 20 }}
                      className="flex-col sm:flex-row"
                    >
                      {/* Left: Booking Info */}
                      <div
                        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                        onClick={() => navigate(getPropertyRoute(booking))}
                      >
                        {/* Type + Reference */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "#E8192C",
                              fontWeight: 700,
                            }}
                          >
                            {booking.propertyType}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              color: tk.refText,
                              fontFamily: "monospace",
                              background: tk.refBg,
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            #{booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        {/* Property Name */}
                        <h3
                          style={{
                            fontWeight: 900,
                            fontSize: 18,
                            color: tk.pageText,
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {booking.propertyData?.name || "Property"}
                        </h3>

                        {/* Details */}
                        <div
                          style={{
                            marginTop: 12,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 14,
                            }}
                          >
                            <Calendar
                              style={{
                                width: 16,
                                height: 16,
                                color: "#E8192C",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{ fontWeight: 600, color: tk.pageText }}
                            >
                              {formatDate(start)}
                            </span>
                            <span style={{ color: tk.mutedText, fontSize: 12 }}>
                              →
                            </span>
                            <span
                              style={{ fontWeight: 600, color: tk.pageText }}
                            >
                              {formatDate(end)}
                            </span>
                          </div>

                          {(booking.pickUpLocation ||
                            booking.dropOffLocation) && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 14,
                                color: tk.dimText,
                              }}
                            >
                              <MapPin
                                style={{
                                  width: 16,
                                  height: 16,
                                  color: "#E8192C",
                                  opacity: 0.7,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {booking.pickUpLocation} →{" "}
                                {booking.dropOffLocation}
                              </span>
                            </div>
                          )}

                          {(booking.pickUpTime || booking.dropOffTime) && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 14,
                                color: tk.dimText,
                              }}
                            >
                              <Clock
                                style={{
                                  width: 16,
                                  height: 16,
                                  color: "#E8192C",
                                  opacity: 0.7,
                                  flexShrink: 0,
                                }}
                              />
                              <span>
                                {booking.pickUpTime} → {booking.dropOffTime}
                              </span>
                            </div>
                          )}

                          <p
                            style={{
                              fontSize: 12,
                              color: tk.mutedText,
                              paddingTop: 2,
                            }}
                          >
                            {booking.requesterName} · {booking.contactMail}
                          </p>
                        </div>

                        {/* Combined status description */}
                        {(() => {
                          const key =
                            booking.status === "pending" &&
                            booking.payment_status === "pending"
                              ? "pendingPending"
                              : booking.status === "confirmed" &&
                                  booking.payment_status === "pending"
                                ? "confirmedPending"
                                : booking.status === "confirmed" &&
                                    booking.payment_status === "paid"
                                  ? "confirmedPaid"
                                  : booking.status === "canceled" &&
                                      booking.payment_status === "paid"
                                    ? "canceledPaid"
                                    : booking.status === "canceled" &&
                                        booking.payment_status === "pending"
                                      ? "canceledPending"
                                      : booking.status === "confirmed" &&
                                          booking.payment_status === "failed"
                                        ? "confirmedFailed"
                                        : null;
                          if (!key) return null;
                          const isWarning =
                            key === "confirmedPending" ||
                            key === "pendingPending" ||
                            key === "confirmedFailed";
                          const isSuccess = key === "confirmedPaid";
                          const isDanger =
                            key === "canceledPaid" || key === "canceledPending";
                          return (
                            <div
                              style={{
                                marginTop: 12,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                                padding: "8px 12px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 500,
                                ...getCombinedStatusStyle(
                                  isSuccess,
                                  isWarning,
                                  isDanger,
                                ),
                              }}
                            >
                              <span
                                style={{
                                  marginTop: 2,
                                  flexShrink: 0,
                                  fontSize: 14,
                                  lineHeight: 1,
                                }}
                              >
                                {isSuccess ? "✓" : isWarning ? "⏳" : "✕"}
                              </span>
                              <span>{t(`booking.combinedStatus.${key}`)}</span>
                            </div>
                          );
                        })()}

                        {/* Invoice download link */}
                        {booking.payment_status === "paid" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateInvoicePDF(booking);
                            }}
                            style={{
                              marginTop: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 12,
                              color: "#E8192C",
                              fontWeight: 600,
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLButtonElement
                              ).style.opacity = "0.7")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLButtonElement
                              ).style.opacity = "1")
                            }
                          >
                            <FileText style={{ width: 14, height: 14 }} />
                            {t("booking.downloadInvoice")}
                            <Download style={{ width: 12, height: 12 }} />
                          </button>
                        )}
                      </div>

                      {/* Right: Price + Status + Actions */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          gap: 12,
                          minWidth: 168,
                        }}
                      >
                        {/* Price */}
                        <div style={{ textAlign: "right" }}>
                          <p
                            style={{
                              fontSize: 10,
                              color: tk.mutedText,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Total
                          </p>
                          <p
                            style={{
                              fontSize: 24,
                              fontWeight: 900,
                              color: tk.pageText,
                              lineHeight: 1,
                            }}
                          >
                            ${booking.totalPrice.toFixed(2)}
                          </p>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 900,
                              color: tk.pageText,
                              lineHeight: 1,
                            }}
                          >
                            + ${(booking.totalPrice * 0.07).toFixed(2)} Fee
                          </p>
                        </div>

                        {/* Status Badges */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 8,
                          }}
                        >
                          {/* Booking status row */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: tk.mutedText,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontWeight: 500,
                              }}
                            >
                              {t("booking.statusLabel")}
                            </span>
                            <span
                              title={t(
                                `booking.statusHint.${booking.status}`,
                                "",
                              )}
                              style={{
                                cursor: "help",
                                fontSize: 11,
                                padding: "4px 10px",
                                borderRadius: 999,
                                fontWeight: 700,
                                textTransform: "capitalize",
                                ...getStatusBadgeStyle(booking.status),
                              }}
                            >
                              {booking.status}
                            </span>
                          </div>

                          {/* Payment status row */}
                          {booking.payment_status && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  color: tk.mutedText,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  fontWeight: 500,
                                }}
                              >
                                {t("booking.paymentLabel")}
                              </span>
                              <span
                                title={t(
                                  `booking.paymentHint.${booking.payment_status}`,
                                  "",
                                )}
                                style={{
                                  cursor: "help",
                                  fontSize: 11,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                  ...getStatusBadgeStyle(
                                    booking.payment_status === "paid"
                                      ? "confirmed"
                                      : booking.payment_status === "pending"
                                        ? "pending"
                                        : "canceled",
                                  ),
                                }}
                              >
                                {booking.payment_status === "paid"
                                  ? "✓ Paid"
                                  : booking.payment_status}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ── Action Zone ── */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 8,
                            width: "100%",
                          }}
                        >
                          {/* CASE 1: Confirmed + Payment Pending */}
                          {booking.status === "confirmed" &&
                            booking.payment_status === "pending" && (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 12,
                                    color: isDark ? "#fcd34d" : "#92400e",
                                  }}
                                >
                                  <CreditCard
                                    style={{ width: 12, height: 12 }}
                                  />
                                  <span>{t("booking.paymentRequired")}</span>
                                </div>
                                <StripePaymentButton booking={booking} />
                                <button
                                  onClick={() =>
                                    handlePendingBookingCancel(booking)
                                  }
                                  style={{
                                    fontSize: 12,
                                    color: tk.mutedText,
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    textUnderlineOffset: 2,
                                    transition: "color 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.color = "#E8192C")
                                  }
                                  onMouseLeave={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.color = tk.mutedText)
                                  }
                                >
                                  {t("booking.cancelBooking")}
                                </button>
                              </>
                            )}

                          {/* CASE 2: Pending (awaiting confirmation) */}
                          {booking.status === "pending" &&
                            booking.payment_status === "pending" && (
                              <>
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: isDark ? "#fcd34d" : "#92400e",
                                    textAlign: "right",
                                  }}
                                >
                                  {t("booking.awaitingConfirmation")}
                                </p>
                                <button
                                  onClick={() =>
                                    handlePendingBookingCancel(booking)
                                  }
                                  style={{
                                    fontSize: 12,
                                    color: tk.mutedText,
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    textUnderlineOffset: 2,
                                    transition: "color 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.color = "#E8192C")
                                  }
                                  onMouseLeave={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.color = tk.mutedText)
                                  }
                                >
                                  {t("booking.cancelBooking")}
                                </button>
                              </>
                            )}

                          {/* CASE 3: Paid */}
                          {booking.payment_status === "paid" &&
                            booking.status !== "canceled" && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: 6,
                                }}
                              >
                                {(booking.propertyType === "car" ||
                                  booking.propertyType === "apartment") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReviewBooking(booking);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      fontSize: 12,
                                      padding: "6px 12px",
                                      borderRadius: 999,
                                      border: `1px solid ${isDark ? "rgba(245,158,11,0.40)" : "#fcd34d"}`,
                                      color: isDark ? "#fcd34d" : "#92400e",
                                      background: "transparent",
                                      cursor: "pointer",
                                      fontWeight: 700,
                                      transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                      ((
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background = isDark
                                        ? "rgba(245,158,11,0.10)"
                                        : "#fffbeb")
                                    }
                                    onMouseLeave={(e) =>
                                      ((
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background = "transparent")
                                    }
                                  >
                                    <Star
                                      style={{
                                        width: 12,
                                        height: 12,
                                        fill: "#f59e0b",
                                        color: "#f59e0b",
                                      }}
                                    />
                                    {t("review.addReview", "Add Review")}
                                  </button>
                                )}
                                <ProviderContactButton
                                  providerId={booking.providerId}
                                />
                              </div>
                            )}

                          {/* CASE 4: Canceled */}
                          {booking.status === "canceled" && (
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#E8192C",
                                }}
                              >
                                {t("booking.cancelled")}
                              </p>
                              {booking.payment_status === "paid" && (
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: tk.mutedText,
                                    marginTop: 2,
                                  }}
                                >
                                  {t("booking.refundWillBeProcessed")}
                                </p>
                              )}
                            </div>
                          )}

                          {/* CASE 5: Payment Failed */}
                          {booking.payment_status === "failed" &&
                            booking.status === "confirmed" && (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 12,
                                    color: isDark ? "#fca5a5" : "#991b1b",
                                  }}
                                >
                                  <AlertCircle
                                    style={{ width: 12, height: 12 }}
                                  />
                                  <span>{t("booking.paymentFailed")}</span>
                                </div>
                                <StripePaymentButton booking={booking} />
                                <PayPalPaymentButton booking={booking} />
                                <button
                                  onClick={() =>
                                    handlePendingBookingCancel(booking)
                                  }
                                  style={{
                                    fontSize: 12,
                                    color: tk.mutedText,
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    textUnderlineOffset: 2,
                                    transition: "color 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.color = "#E8192C")
                                  }
                                  onMouseLeave={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.color = tk.mutedText)
                                  }
                                >
                                  {t("booking.cancelBooking")}
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && !isError && total > 0 && totalPages > 1 && (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

            {/* Range label */}
            <p style={{ fontSize: 12, color: tk.mutedText }}>
              Showing{" "}
              <span style={{ fontWeight: 600, color: tk.dimText }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of{" "}
              <span style={{ fontWeight: 600, color: tk.dimText }}>{total}</span>{" "}
              bookings
            </p>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  border: `1px solid ${tk.paginationBorder}`,
                  color: tk.paginationText,
                  background: 'transparent', cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                  opacity: (page === 1 || isFetching) ? 0.3 : 1,
                }}
                onMouseEnter={e => { if (!(page === 1 || isFetching)) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8192C'; (e.currentTarget as HTMLButtonElement).style.color = '#E8192C'; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = tk.paginationBorder; (e.currentTarget as HTMLButtonElement).style.color = tk.paginationText; }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) =>
                  p === 1 || p === totalPages || Math.abs(p - page) <= 1
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                    acc.push("…");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} style={{
                      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, color: tk.mutedText,
                    }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      disabled={isFetching}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        fontSize: 14, fontWeight: 700,
                        border: p === page ? 'none' : `1px solid ${tk.paginationBorder}`,
                        background: p === page
                          ? 'linear-gradient(135deg, #dc2626, #7f1d1d)'
                          : 'transparent',
                        color: p === page ? '#ffffff' : tk.paginationText,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, color 0.2s',
                      }}
                      onMouseEnter={e => { if (p !== page) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8192C'; (e.currentTarget as HTMLButtonElement).style.color = '#E8192C'; } }}
                      onMouseLeave={e => { if (p !== page) { (e.currentTarget as HTMLButtonElement).style.borderColor = tk.paginationBorder; (e.currentTarget as HTMLButtonElement).style.color = tk.paginationText; } }}
                    >
                      {p}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  border: `1px solid ${tk.paginationBorder}`,
                  color: tk.paginationText,
                  background: 'transparent', cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                  opacity: (page === totalPages || isFetching) ? 0.3 : 1,
                }}
                onMouseEnter={e => { if (!(page === totalPages || isFetching)) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8192C'; (e.currentTarget as HTMLButtonElement).style.color = '#E8192C'; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = tk.paginationBorder; (e.currentTarget as HTMLButtonElement).style.color = tk.paginationText; }}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Fetching indicator */}
            {isFetching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tk.mutedText }}>
                <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
                Loading…
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          open={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
        />
      )}
    </div>
  );
}
