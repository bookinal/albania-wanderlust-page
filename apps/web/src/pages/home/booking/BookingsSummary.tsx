import React, { useState } from "react";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
        >
          <ContactRound className="w-3.5 h-3.5 mr-1.5" />
          {t("booking.contactProvider", "Contact Provider")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-0 shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3">
          <p className="text-white font-semibold text-sm">
            {t("booking.providerContact", "Provider Contact")}
          </p>
          {!loading && provider?.full_name && (
            <p className="text-indigo-100 text-xs mt-0.5">
              {provider.full_name}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : provider ? (
            <>
              {provider.phone ? (
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-emerald-600 font-medium">
                      {t("booking.callPhone", "Call Phone")}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {provider.phone}
                    </p>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    {t("booking.noPhone", "No phone number available")}
                  </p>
                </div>
              )}

              <a
                href={`mailto:${provider.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-blue-600 font-medium">
                    {t("booking.sendEmail", "Send Email")}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {provider.email}
                  </p>
                </div>
              </a>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-3">
              {t(
                "booking.providerInfoUnavailable",
                "Provider info unavailable",
              )}
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

      // Invalidate and refetch bookings
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
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const {
    data: bookings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookings", "currentUser"],
    queryFn: bookingService.getCurrentUserBookings,
  });

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
    <div>
      <PrimarySearchAppBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-600" />
              {t("booking.myBookings")}
            </h1>
            <p className="mt-2 text-slate-600">
              {t("booking.bookingSummaryDescription")}
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>
                {(error as any)?.message ||
                  "We couldn't load your bookings right now. Please try again later."}
              </span>
            </div>
          )}

          {!isLoading && !isError && (!bookings || bookings.length === 0) && (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
              <p className="text-slate-700 font-medium mb-2">
                {t("booking.noBookings")}
              </p>
              <p className="text-slate-500 text-sm">
                {t("booking.startExploring")}
              </p>
            </div>
          )}

          {!isLoading && !isError && bookings && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const Icon = getPropertyIcon(booking.propertyType);
                const start = new Date(booking.startDate);
                const end = new Date(booking.endDate);

                return (
                  <div
                    key={booking.id}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div
                      className="flex items-start gap-4 hover:bg-red-50 transition-colors cursor-pointer"
                      onClick={() => navigate(getPropertyRoute(booking))}
                    >
                      <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <img
                          src={
                            booking.propertyData?.imageUrls?.[0] ||
                            "/images/placeholder.png"
                          }
                          alt={booking.propertyData?.name || "Property Image"}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      </div>
                      <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>

                      <div>
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
                            {booking.propertyType}
                            {booking.propertyData?.name &&
                              `, ${booking.propertyData.name}`}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            Ref: {booking.id}
                          </span>
                        </div>

                        {/* Booking Info */}
                        <div className="space-y-1">
                          <p className="text-sm text-slate-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            {formatDate(start)} – {formatDate(end)}
                          </p>

                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Pick up: {booking.pickUpLocation} • Drop off:{" "}
                            {booking.dropOffLocation}
                          </p>

                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Pick up: {booking.pickUpTime} • Drop off:{" "}
                            {booking.dropOffTime}
                          </p>
                        </div>

                        {/* Contact */}
                        <p className="text-xs text-slate-500 mt-2">
                          Contact: {booking.requesterName} •{" "}
                          {booking.contactMail}
                        </p>

                        {/* Invoice Download Button - Only shown when payment is completed */}
                        {booking.payment_status === "paid" && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateInvoicePDF(booking);
                            }}
                            variant="outline"
                            size="sm"
                            className="mt-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {t("booking.downloadInvoice")}
                            <Download className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-slate-900">
                        Total: ${booking.totalPrice.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
                            booking.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : booking.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : booking.status === "canceled"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-slate-50 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {t("booking.bookingStatus")}: {booking.status}
                        </span>
                        {booking.payment_status && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
                              booking.payment_status === "paid"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : booking.payment_status === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {t("booking.paymentStatus")}:{" "}
                            {booking.payment_status}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {/* CASE 1: Booking Confirmed + Payment Pending - Show Payment Button */}
                        {booking.status === "confirmed" &&
                          booking.payment_status === "pending" && (
                            <>
                              <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
                                <CreditCard className="w-3 h-3" />
                                <span>{t("booking.paymentRequired")}</span>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <StripePaymentButton booking={booking} />
                                {/* <div className="text-xs text-slate-400 my-1">
                                  {t("common.or")}
                                </div>
                                <PayPalPaymentButton booking={booking} /> */}
                              </div>
                              <Button
                                onClick={() =>
                                  handlePendingBookingCancel(booking)
                                }
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
                                {t("booking.cancelBooking")}
                              </Button>
                            </>
                          )}

                        {/* CASE 2: Booking Pending - Only Cancel Button (Awaiting Confirmation) */}
                        {booking.status === "pending" &&
                          booking.payment_status === "pending" && (
                            <>
                              <div className="text-xs text-slate-500 mb-1">
                                {t("booking.awaitingConfirmation")}
                              </div>
                              <Button
                                onClick={() =>
                                  handlePendingBookingCancel(booking)
                                }
                                size="sm"
                                variant="outline"
                              >
                                {t("booking.cancelBooking")}
                              </Button>
                            </>
                          )}

                        {/* CASE 3: Payment Completed - Show Success Message */}
                        {booking.payment_status === "paid" &&
                          booking.status !== "canceled" && (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <CreditCard className="w-3 h-3" />
                                <span className="font-semibold">
                                  {t("booking.paymentCompleted")} ✓
                                </span>
                              </div>
                              {booking.status === "confirmed" && (
                                <div className="text-xs text-slate-500">
                                  {t("booking.confirmed")}
                                </div>
                              )}
                              {/* Add Review button – only for car/apartment */}
                              {(booking.propertyType === "car" ||
                                booking.propertyType === "apartment") && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReviewBooking(booking);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400"
                                >
                                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                                  {t("review.addReview", "Add Review")}
                                </Button>
                              )}
                              {/* Contact Provider button */}
                              <ProviderContactButton
                                providerId={booking.providerId}
                              />
                            </div>
                          )}

                        {/* CASE 4: Booking Canceled - Show Info */}
                        {booking.status === "canceled" && (
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-red-600 font-semibold">
                              {t("booking.cancelled")}
                            </div>
                            {booking.payment_status === "paid" && (
                              <div className="text-xs text-slate-500">
                                {t("booking.refundWillBeProcessed")}
                              </div>
                            )}
                          </div>
                        )}

                        {/* CASE 5: Payment Failed - Show Retry Option */}
                        {booking.payment_status === "failed" &&
                          booking.status === "confirmed" && (
                            <>
                              <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>{t("booking.paymentFailed")}</span>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <StripePaymentButton booking={booking} />
                                <div className="text-xs text-slate-400 my-1">
                                  {t("common.or")}
                                </div>
                                <PayPalPaymentButton booking={booking} />
                              </div>
                              <Button
                                onClick={() =>
                                  handlePendingBookingCancel(booking)
                                }
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
                                {t("booking.cancelBooking")}
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
