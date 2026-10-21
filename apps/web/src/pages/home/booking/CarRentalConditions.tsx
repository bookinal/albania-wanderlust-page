import React from "react";
import { useTranslation } from "react-i18next";
import {
  Banknote,
  CreditCard,
  Fuel,
  Gauge,
  Globe,
  IdCard,
  LifeBuoy,
  ShieldCheck,
  UserCheck,
  Wallet,
} from "lucide-react";
import type { Car, CarPaymentMethod } from "@/types/car.types";
import { getCarRentalTerms } from "@/lib/carRentalTerms";
import { getBookingThemeTokens } from "./bookingTheme";

const PAYMENT_ICONS: Record<CarPaymentMethod, React.ElementType> = {
  cash: Banknote,
  debit_card: Wallet,
  credit_card: CreditCard,
};

interface CarRentalConditionsProps {
  car: Car;
  tk: ReturnType<typeof getBookingThemeTokens>;
  /** Smaller variant for the booking form */
  compact?: boolean;
}

/** Read-only view of the provider's rental conditions for a car. */
export const CarRentalConditions: React.FC<CarRentalConditionsProps> = ({
  car,
  tk,
  compact = false,
}) => {
  const { t } = useTranslation();
  const terms = getCarRentalTerms(car);

  const items = [
    {
      icon: ShieldCheck,
      label: t("cars.rentalTerms.depositLabel"),
      value:
        terms.depositAmount > 0
          ? `€${terms.depositAmount}`
          : t("cars.rentalTerms.noDeposit"),
    },
    {
      icon: Gauge,
      label: t("cars.rentalTerms.dailyKmLimit"),
      value:
        terms.dailyKmLimit !== null
          ? t("cars.rentalTerms.kmPerDay", { count: terms.dailyKmLimit })
          : t("cars.rentalTerms.unlimited"),
    },
    {
      icon: UserCheck,
      label: t("cars.rentalTerms.minimumAge"),
      value: t("cars.rentalTerms.years", { count: terms.minimumAge }),
    },
    {
      icon: IdCard,
      label: t("cars.rentalTerms.drivingLicenseLabel"),
      value: t("cars.rentalTerms.years", { count: terms.drivingLicenseYears }),
    },
    {
      icon: Fuel,
      label: t("cars.rentalTerms.fuelPolicy"),
      value: t(`cars.rentalTerms.fuelPolicies.${terms.fuelPolicy}`),
    },
    {
      icon: Globe,
      label: t("cars.rentalTerms.crossBorderDepositLabel"),
      value:
        terms.crossBorderDeposit > 0
          ? `€${terms.crossBorderDeposit}`
          : t("cars.rentalTerms.noDeposit"),
    },
    {
      icon: LifeBuoy,
      label: t("cars.rentalTerms.crossBorderAssistance"),
      value: terms.crossBorderAssistance
        ? t("cars.rentalTerms.included")
        : t("cars.rentalTerms.notIncluded"),
    },
  ];

  return (
    <div>
      <div
        className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }}
            className={`flex items-center gap-3 rounded-xl ${compact ? "p-3" : "p-4"}`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: tk.brandSoftStrong }}
            >
              <Icon size={18} style={{ color: tk.brand }} />
            </div>
            <div className="min-w-0">
              <p style={{ color: tk.mutedText }} className="text-xs font-medium">
                {label}
              </p>
              <p style={{ color: tk.pageText }} className="font-semibold">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className={compact ? "mt-4" : "mt-5"}>
        <p style={{ color: tk.mutedText }} className="text-sm font-medium mb-2">
          {t("cars.rentalTerms.acceptedPaymentMethods")}
        </p>
        <div className="flex flex-wrap gap-2">
          {terms.acceptedPaymentMethods.map((method) => {
            const Icon = PAYMENT_ICONS[method];
            return (
              <span
                key={method}
                style={{
                  background: tk.brandSoft,
                  border: `1px solid ${tk.brandBorder}`,
                  color: tk.pageText,
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <Icon size={16} style={{ color: tk.brand }} />
                {t(`cars.rentalTerms.paymentMethods.${method}`)}
              </span>
            );
          })}
        </div>
        <p style={{ color: tk.mutedText }} className="text-xs mt-2">
          {t("cars.rentalTerms.paidAtPickUp")}
        </p>
      </div>
    </div>
  );
};
