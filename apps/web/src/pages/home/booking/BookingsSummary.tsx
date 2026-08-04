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
import { getBookingThemeTokens } from "./bookingTheme";

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

  // Fetch provider info if available
  let providerName = "";
  let providerEmail = "";
  let providerPhone = "";
  if (booking.providerId) {
    try {
      const provider = await userService.getUserById(booking.providerId);
      if (provider) {
        providerName = provider.full_name || "";
        providerEmail = provider.email || "";
        providerPhone = provider.phone || "";
      }
    } catch {
      // Silently continue if provider info fetch fails
    }
  }

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

  // Customer & Provider Information (2-Column Layout)
  const infoY = 103;
  const col2X = pageWidth / 2 + 10;

  // Customer Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Customer Information", 15, infoY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${booking.requesterName}`, 15, infoY + 8);
  doc.text(`Email: ${booking.contactMail}`, 15, infoY + 15);
  if (booking.contactPhone) {
    doc.text(`Phone: ${booking.contactPhone}`, 15, infoY + 22);
  }

  // Provider Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Provider / Host Information", col2X, infoY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${providerName || "N/A"}`, col2X, infoY + 8);
  if (providerEmail) {
    doc.text(`Email: ${providerEmail}`, col2X, infoY + 15);
  }
  if (providerPhone) {
    doc.text(`Phone: ${providerPhone}`, col2X, infoY + 22);
  }

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
  doc.text("Details", pageWidth - 25, 151, { align: "right" });

  // Table content — compact rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  let yPos = 162;

  const addTableRow = (label: string, value: string, highlight = false) => {
    if (highlight) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, yPos);
    doc.setTextColor(30, 41, 59);
    doc.text(value, pageWidth - 25, yPos, { align: "right" });
    yPos += 9;
  };

  addTableRow(
    "Property Type",
    booking.propertyType.charAt(0).toUpperCase() +
      booking.propertyType.slice(1),
    true,
  );
  addTableRow("Property Name", booking.propertyData?.name || "N/A");
  if (providerName) addTableRow("Provider / Host", providerName, true);
  addTableRow("Check-in Date", formatDate(new Date(booking.startDate)), true);
  addTableRow("Check-out Date", formatDate(new Date(booking.endDate)));
  if (booking.pickUpLocation) addTableRow("Pick-up Location", booking.pickUpLocation, true);
  if (booking.dropOffLocation) addTableRow("Drop-off Location", booking.dropOffLocation);
  if (booking.pickUpTime) addTableRow("Pick-up Time", booking.pickUpTime, true);
  if (booking.dropOffTime) addTableRow("Drop-off Time", booking.dropOffTime);

  // ── Invoice Breakdown ──
  yPos += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Invoice Details", 15, yPos);
  yPos += 6;

  // Price table header
  doc.setFillColor(30, 58, 138);
  doc.rect(15, yPos, pageWidth - 30, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Item", 20, yPos + 7);
  doc.text("Amount", pageWidth - 25, yPos + 7, { align: "right" });
  yPos += 16;

  const rawFeeCalc = booking.totalPrice * 0.05;
  const fallbackFee = rawFeeCalc < 2 && booking.totalPrice > 0 ? 2 : Math.round(rawFeeCalc * 100) / 100;
  const fee = booking.fee ?? fallbackFee;
  const childSeat = booking.childSeatPrice ?? 0;
  const additionalDriver = booking.additionalDriverPrice ?? 0;
  const insurance = booking.propertyType === "car" ? ((booking.propertyData as any)?.insurance ?? 0) : 0;
  const rentalSubtotal = booking.totalPrice - fee - childSeat - additionalDriver - insurance;

  let priceRowIdx = 0;
  const addPriceLine = (label: string, amount: number) => {
    if (priceRowIdx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, yPos);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(`$${amount.toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });
    yPos += 10;
    priceRowIdx++;
  };

  addPriceLine("Rental", rentalSubtotal > 0 ? rentalSubtotal : 0);
  if (childSeat > 0) addPriceLine("Child Seat", childSeat);
  if (additionalDriver > 0) addPriceLine("Additional Driver", additionalDriver);
  if (insurance > 0) addPriceLine("Insurance", insurance);
  if (fee > 0) addPriceLine("Service Fee (5%)", fee);

  // Divider line
  yPos += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;

  // Total section
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - 90, yPos - 2, 75, 22, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", pageWidth - 85, yPos + 8);
  doc.setFontSize(14);
  doc.text(`$${booking.totalPrice.toFixed(2)}`, pageWidth - 20, yPos + 8, { align: "right" });

  // Payment status
  yPos += 30;
  const paymentColor =
    booking.payment_status === "paid" ? [16, 185, 129] : [245, 158, 11];
  doc.setFillColor(paymentColor[0], paymentColor[1], paymentColor[2]);
  doc.roundedRect(15, yPos, 65, 8, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `Payment: ${(booking.payment_status || "pending").toUpperCase()}`,
    20,
    yPos + 5.5,
  );

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for booking with BOOKinAL!", pageWidth / 2, pageHeight - 20, {
    align: "center",
  });
  doc.text(
    "For any questions, please contact us at support@bookinal.com",
    pageWidth / 2,
    pageHeight - 13,
    { align: "center" },
  );

  // Download the PDF
  const fileName = `Invoice-${booking.propertyType}-${booking.id.slice(0, 8)}.pdf`;
  doc.save(fileName);
};

// Provider Contact Button
function ProviderContactButton({ providerId }: { providerId: string }) {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
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

  const bookingTk = getBookingThemeTokens({ isDark, isBlue });
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
            (e.currentTarget as HTMLButtonElement).style.borderColor = bookingTk.brand;
            (e.currentTarget as HTMLButtonElement).style.color = bookingTk.brand;
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
                border: `2px solid ${bookingTk.brand}`, borderTopColor: 'transparent',
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
                    <p style={{ fontSize: 11, color: bookingTk.brand, fontWeight: 500 }}>
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
  const { isDark, isBlue } = useTheme();
  const bookingTk = getBookingThemeTokens({ isDark, isBlue });
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
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: bookingTk.brand }} />
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
  const { isDark, isBlue } = useTheme();
  const bookingTk = getBookingThemeTokens({ isDark, isBlue });
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const tk = {
    pageBg: bookingTk.pageBg,
    pageText: bookingTk.pageText,
    cardBg: bookingTk.cardBg,
    cardBorder: bookingTk.cardBorder,
    mutedText: bookingTk.mutedText,
    dimText: bookingTk.dimText,
    imagePlaceholder: isDark ? '#1a1a1e' : isBlue ? '#dbeafe' : '#e5e2de',
    refBg: isDark ? 'rgba(255,255,255,0.06)' : isBlue ? '#eff6ff' : '#f0ece8',
    refText: bookingTk.mutedText,
    paginationBg: bookingTk.statBg,
    paginationBorder: bookingTk.statBorder,
    paginationText: isDark ? 'rgba(255,255,255,0.50)' : isBlue ? 'hsl(211 22% 42%)' : '#6b6663',
    emptyBg: bookingTk.cardBg,
    emptyIconBg: bookingTk.brandSoftStrong,
    errorBg: bookingTk.brandSoft,
    errorText: bookingTk.infoText,
    errorBorder: bookingTk.brandBorder,
    heroBg: isBlue
      ? 'linear-gradient(to right, #082f49, #0369a1, #164e63)'
      : 'linear-gradient(to right, #b91c1c, #7f1d1d, #000000)',
    heroEyebrow: isBlue ? '#7dd3fc' : '#fca5a5',
    heroMuted: isBlue ? 'rgba(186,230,253,0.7)' : 'rgba(254,202,202,0.6)',
    warningText: isDark ? '#fcd34d' : isBlue ? '#9a6700' : '#92400e',
    dangerText: isDark ? '#fca5a5' : isBlue ? '#b91c1c' : '#991b1b',
    successText: isDark ? '#6ee7b7' : isBlue ? '#0369a1' : '#065f46',
    successBg: isDark ? 'rgba(16,185,129,0.15)' : isBlue ? 'rgba(14,165,233,0.12)' : '#ecfdf5',
    successBorder: isDark ? 'rgba(16,185,129,0.30)' : isBlue ? 'rgba(14,165,233,0.22)' : '#a7f3d0',
    warningBg: isDark ? 'rgba(245,158,11,0.15)' : isBlue ? 'rgba(245,158,11,0.12)' : '#fffbeb',
    warningBorder: isDark ? 'rgba(245,158,11,0.30)' : isBlue ? 'rgba(245,158,11,0.24)' : '#fde68a',
    dangerBg: isDark ? 'rgba(239,68,68,0.15)' : isBlue ? 'rgba(239,68,68,0.1)' : '#fef2f2',
    dangerBorder: isDark ? 'rgba(239,68,68,0.30)' : isBlue ? 'rgba(239,68,68,0.24)' : '#fecaca',
  };

  // Status badge styles
  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === 'confirmed') return {
      background: tk.successBg,
      color: tk.successText,
      border: `1px solid ${tk.successBorder}`,
    };
    if (status === 'pending') return {
      background: tk.warningBg,
      color: tk.warningText,
      border: `1px solid ${tk.warningBorder}`,
    };
    if (status === 'canceled') return {
      background: tk.dangerBg,
      color: tk.dangerText,
      border: `1px solid ${tk.dangerBorder}`,
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
      background: tk.successBg,
      color: tk.successText,
      border: `1px solid ${tk.successBorder}`,
    };
    if (isWarning) return {
      background: tk.warningBg,
      color: tk.warningText,
      border: `1px solid ${tk.warningBorder}`,
    };
    if (isDanger) return {
      background: tk.dangerBg,
      color: tk.dangerText,
      border: `1px solid ${tk.dangerBorder}`,
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
      <div className="px-4 pt-12 pb-16" style={{ background: tk.heroBg }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tk.heroEyebrow }}>
            My Account
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {t("booking.myBookings")}
          </h1>
          <p className="mt-2 text-sm max-w-lg" style={{ color: tk.heroMuted }}>
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
              border: `2px solid ${bookingTk.brand}`, borderTopColor: 'transparent',
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
            borderLeft: `4px solid ${bookingTk.brand}`,
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
              <Calendar style={{ width: 28, height: 28, color: bookingTk.brand }} />
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
                background: tk.heroBg,
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
                          style={{ width: 14, height: 14, color: bookingTk.brand }}
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
                              color: bookingTk.brand,
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
                                color: bookingTk.brand,
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
                                  color: bookingTk.brand,
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
                                  color: bookingTk.brand,
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

                        {/* Invoice download button */}
                        {booking.payment_status === "paid" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateInvoicePDF(booking);
                            }}
                            style={{
                              marginTop: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              fontSize: 14,
                              color: "#ffffff",
                              fontWeight: 700,
                              background: bookingTk.brand,
                              border: "none",
                              borderRadius: 999,
                              padding: "10px 20px",
                              cursor: "pointer",
                              transition: "opacity 0.2s",
                              width: "100%",
                            }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLButtonElement
                              ).style.opacity = "0.85")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLButtonElement
                              ).style.opacity = "1")
                            }
                          >
                            <FileText style={{ width: 16, height: 16 }} />
                            {t("booking.downloadInvoice")}
                            <Download style={{ width: 16, height: 16 }} />
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
                        {/* Invoice Breakdown */}
                        <div style={{ textAlign: "right" }}>
                          <p
                            style={{
                              fontSize: 10,
                              color: tk.mutedText,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              marginBottom: 8,
                            }}
                          >
                            {t("booking.invoiceDetails", "Invoice Details")}
                          </p>

                          {/* Rental subtotal line */}
                          {(() => {
                            const rawFeeCalc = booking.totalPrice * 0.05;
                            const fallbackFee = rawFeeCalc < 2 && booking.totalPrice > 0 ? 2 : Math.round(rawFeeCalc * 100) / 100;
                            const fee = booking.fee ?? fallbackFee;
                            const childSeat = booking.childSeatPrice ?? 0;
                            const additionalDriver = booking.additionalDriverPrice ?? 0;
                            const insurance = booking.propertyType === "car" ? ((booking.propertyData as any)?.insurance ?? 0) : 0;
                            const rentalSubtotal = booking.totalPrice - fee - childSeat - additionalDriver - insurance;
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                                {/* Rental Price */}
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, width: "100%", fontSize: 13 }}>
                                  <span style={{ color: tk.dimText }}>{t("billing.rentalPrice", "Rental")}</span>
                                  <span style={{ fontWeight: 600, color: tk.pageText }}>${rentalSubtotal > 0 ? rentalSubtotal.toFixed(2) : "0.00"}</span>
                                </div>

                                {/* Child Seat */}
                                {childSeat > 0 && (
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, width: "100%", fontSize: 13 }}>
                                    <span style={{ color: tk.dimText }}>{t("billing.childSeat", "Child Seat")}</span>
                                    <span style={{ fontWeight: 600, color: tk.pageText }}>${childSeat.toFixed(2)}</span>
                                  </div>
                                )}

                                {/* Additional Driver */}
                                {additionalDriver > 0 && (
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, width: "100%", fontSize: 13 }}>
                                    <span style={{ color: tk.dimText }}>{t("billing.additionalDriver", "Additional Driver")}</span>
                                    <span style={{ fontWeight: 600, color: tk.pageText }}>${additionalDriver.toFixed(2)}</span>
                                  </div>
                                )}

                                {/* Insurance */}
                                {insurance > 0 && (
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, width: "100%", fontSize: 13 }}>
                                    <span style={{ color: tk.dimText }}>{t("billing.insurance", "Insurance")}</span>
                                    <span style={{ fontWeight: 600, color: tk.pageText }}>${insurance.toFixed(2)}</span>
                                  </div>
                                )}

                                {/* Fee */}
                                {fee > 0 && (
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, width: "100%", fontSize: 13 }}>
                                    <span style={{ color: tk.dimText }}>{t("billing.serviceFee", "Service Fee")} (5%)</span>
                                    <span style={{ fontWeight: 600, color: tk.pageText }}>${fee.toFixed(2)}</span>
                                  </div>
                                )}

                                {/* Divider */}
                                <div style={{ width: "100%", height: 1, background: tk.cardBorder, margin: "4px 0" }} />

                                {/* Total */}
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, width: "100%" }}>
                                  <span style={{ fontSize: 10, color: tk.mutedText, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    {t("billing.total", "Total")}
                                  </span>
                                  <span style={{ fontSize: 22, fontWeight: 900, color: tk.pageText, lineHeight: 1 }}>
                                    ${booking.totalPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
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
                                    color: tk.warningText,
                                  }}
                                >
                                  <CreditCard
                                    style={{ width: 12, height: 12 }}
                                  />
                                  <span>{t("booking.paymentRequired")}</span>
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
                                    ).style.color = bookingTk.brand)
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
                                    color: tk.warningText,
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
                                    ).style.color = bookingTk.brand)
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
                                  gap: 8,
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    generateInvoicePDF(booking);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 13,
                                    padding: "8px 16px",
                                    borderRadius: 999,
                                    background: bookingTk.brand,
                                    color: "#ffffff",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    transition: "opacity 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.opacity = "0.85")
                                  }
                                  onMouseLeave={(e) =>
                                    ((
                                      e.currentTarget as HTMLButtonElement
                                    ).style.opacity = "1")
                                  }
                                >
                                  <FileText style={{ width: 15, height: 15 }} />
                                  {t("booking.downloadInvoice", "Download Invoice")}
                                  <Download style={{ width: 14, height: 14 }} />
                                </button>
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
                                      border: `1px solid ${tk.warningBorder}`,
                                      color: tk.warningText,
                                      background: "transparent",
                                      cursor: "pointer",
                                      fontWeight: 700,
                                      transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                      ((
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background = isDark
                                        ? tk.warningBg
                                        : tk.warningBg)
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
                                  color: bookingTk.brand,
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
                                    color: tk.dangerText,
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
                                    ).style.color = bookingTk.brand)
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
                onMouseEnter={e => { if (!(page === 1 || isFetching)) { (e.currentTarget as HTMLButtonElement).style.borderColor = bookingTk.brand; (e.currentTarget as HTMLButtonElement).style.color = bookingTk.brand; } }}
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
                          ? bookingTk.primaryBtn
                          : 'transparent',
                        color: p === page ? '#ffffff' : tk.paginationText,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, color 0.2s',
                      }}
                       onMouseEnter={e => { if (p !== page) { (e.currentTarget as HTMLButtonElement).style.borderColor = bookingTk.brand; (e.currentTarget as HTMLButtonElement).style.color = bookingTk.brand; } }}
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
                onMouseEnter={e => { if (!(page === totalPages || isFetching)) { (e.currentTarget as HTMLButtonElement).style.borderColor = bookingTk.brand; (e.currentTarget as HTMLButtonElement).style.color = bookingTk.brand; } }}
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
