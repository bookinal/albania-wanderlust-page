import React, { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Booking } from "@/types/booking.type";
import paymentService from "@/services/api/paymentService";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

interface StripeCheckoutFormProps {
  booking: Booking;
  clientSecret: string;
  paymentIntentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// The actual checkout form component that uses Stripe Elements
function StripeCheckoutForm({
  booking,
  clientSecret,
  paymentIntentId,
  onSuccess,
  onCancel,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Trigger form validation
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(
          submitError.message || "Please check your card details",
        );
        setIsProcessing(false);
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/myBookings`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("[Stripe] Payment error:", error);
        setErrorMessage(error.message || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("[Stripe] Payment succeeded:", paymentIntent.id);

        // Confirm payment on the backend (in case webhook is delayed)
        try {
          await paymentService.confirmStripePayment({
            paymentIntentId: paymentIntent.id,
            bookingId: booking.id,
          });
        } catch (confirmError) {
          console.error("[Stripe] Confirm error (non-critical):", confirmError);
          // This is non-critical, webhook will handle it
        }

        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });

        // Invalidate bookings query to refresh the list
        await queryClient.invalidateQueries({
          queryKey: ["bookings", "currentUser"],
        });

        onSuccess();
      } else if (paymentIntent && paymentIntent.status === "processing") {
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. Please wait.",
        });

        // Invalidate bookings query
        await queryClient.invalidateQueries({
          queryKey: ["bookings", "currentUser"],
        });

        onSuccess();
      }
    } catch (error: any) {
      console.error("[Stripe] Error:", error);
      setErrorMessage(error?.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${ (booking.totalPrice * 0.07).toFixed(2) }
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

interface StripePaymentButtonProps {
  booking: Booking;
}

// Main component that handles the payment flow
export default function StripePaymentButton({
  booking,
}: StripePaymentButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const handleOpenPayment = async () => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      console.log("[Stripe] Creating PaymentIntent for booking:", booking.id);

      const response = await paymentService.createStripePaymentIntent({
        bookingId: booking.id,
      });

      console.log("[Stripe] PaymentIntent created:", response);

      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
    } catch (error: any) {
      console.error("[Stripe] Error creating PaymentIntent:", error);
      toast({
        title: "Payment Error",
        description:
          error?.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setClientSecret(null);
    setPaymentIntentId(null);
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setClientSecret(null);
    setPaymentIntentId(null);
  };

  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#1e293b",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <>
      <Button
        onClick={handleOpenPayment}
        variant="default"
        size="sm"
        className="bg-[#635bff] hover:bg-[#4f46e5] text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with Card
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#635bff]" />
              Complete Your Payment
            </DialogTitle>
            <DialogDescription>
              Enter your card details below to complete the payment of $
              {(booking.totalPrice * 0.07).toFixed(2)} for your booking.
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#635bff]" />
            </div>
          )}

          {!isLoading && clientSecret && paymentIntentId && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <StripeCheckoutForm
                booking={booking}
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </Elements>
          )}

          {!isLoading && !clientSecret && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <p>Failed to load payment form. Please try again.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
