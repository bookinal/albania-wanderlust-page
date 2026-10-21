import React from "react";
import { useTranslation } from "react-i18next";
import type { CarPaymentMethod, CarRentalTerms } from "@/types/car.types";
import { CAR_PAYMENT_METHODS, FUEL_POLICIES } from "@/lib/carRentalTerms";

interface CarRentalTermsFieldsProps {
  value: CarRentalTerms;
  onChange: (patch: Partial<CarRentalTerms>) => void;
  inputStyle: React.CSSProperties;
  selectStyle: React.CSSProperties;
  labelColor: string;
  mutedColor: string;
  optionBg: string;
  accentColor?: string;
  disabled?: boolean;
  showTitle?: boolean;
}

/** Provider form section for a car's rental conditions (add + edit car). */
export const CarRentalTermsFields: React.FC<CarRentalTermsFieldsProps> = ({
  value,
  onChange,
  inputStyle,
  selectStyle,
  labelColor,
  mutedColor,
  optionBg,
  accentColor = "#E8192C",
  disabled,
  showTitle = true,
}) => {
  const { t } = useTranslation();

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: labelColor,
    marginBottom: 6,
  };
  const helpStyle: React.CSSProperties = {
    fontSize: 12,
    color: mutedColor,
    marginTop: 4,
  };

  const toNumber = (raw: string) => {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const togglePaymentMethod = (method: CarPaymentMethod) => {
    const selected = value.acceptedPaymentMethods.includes(method);
    onChange({
      acceptedPaymentMethods: selected
        ? value.acceptedPaymentMethods.filter((m) => m !== method)
        : CAR_PAYMENT_METHODS.filter(
            (m) => m === method || value.acceptedPaymentMethods.includes(m),
          ),
    });
  };

  const checkboxRowStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: labelColor,
    cursor: disabled ? "default" : "pointer",
  };

  return (
    <div>
      {showTitle && (
        <p style={{ fontSize: 15, fontWeight: 600, color: labelColor, marginBottom: 12 }}>
          {t("cars.rentalTerms.title")}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {/* Deposit */}
        <div>
          <p style={labelStyle}>{t("cars.rentalTerms.depositAmount")}</p>
          <input
            name="depositAmount"
            type="number"
            min="0"
            value={value.depositAmount}
            onChange={(e) => onChange({ depositAmount: toNumber(e.target.value) })}
            disabled={disabled}
            style={inputStyle}
          />
          <p style={helpStyle}>{t("cars.rentalTerms.depositHelp")}</p>
        </div>

        {/* Daily km limit */}
        <div>
          <p style={labelStyle}>{t("cars.rentalTerms.dailyKmLimit")}</p>
          <input
            name="dailyKmLimit"
            type="number"
            min="1"
            value={value.dailyKmLimit ?? ""}
            placeholder={t("cars.rentalTerms.unlimited")}
            onChange={(e) =>
              onChange({
                dailyKmLimit:
                  e.target.value === "" ? null : Math.round(toNumber(e.target.value)),
              })
            }
            disabled={disabled}
            style={inputStyle}
          />
          <p style={helpStyle}>{t("cars.rentalTerms.dailyKmLimitHelp")}</p>
        </div>

        {/* Minimum age */}
        <div>
          <p style={labelStyle}>{t("cars.rentalTerms.minimumAge")}</p>
          <input
            name="minimumAge"
            type="number"
            min="18"
            max="99"
            value={value.minimumAge}
            onChange={(e) =>
              onChange({ minimumAge: Math.round(toNumber(e.target.value)) })
            }
            disabled={disabled}
            style={inputStyle}
          />
        </div>

        {/* Driving license since */}
        <div>
          <p style={labelStyle}>{t("cars.rentalTerms.drivingLicenseYears")}</p>
          <input
            name="drivingLicenseYears"
            type="number"
            min="0"
            max="50"
            value={value.drivingLicenseYears}
            onChange={(e) =>
              onChange({ drivingLicenseYears: Math.round(toNumber(e.target.value)) })
            }
            disabled={disabled}
            style={inputStyle}
          />
        </div>

        {/* Fuel policy */}
        <div>
          <p style={labelStyle}>{t("cars.rentalTerms.fuelPolicy")}</p>
          <select
            name="fuelPolicy"
            value={value.fuelPolicy}
            onChange={(e) =>
              onChange({ fuelPolicy: e.target.value as CarRentalTerms["fuelPolicy"] })
            }
            disabled={disabled}
            style={selectStyle}
          >
            {FUEL_POLICIES.map((policy) => (
              <option key={policy} value={policy} style={{ background: optionBg }}>
                {t(`cars.rentalTerms.fuelPolicies.${policy}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Cross border extra deposit */}
        <div>
          <p style={labelStyle}>{t("cars.rentalTerms.crossBorderDeposit")}</p>
          <input
            name="crossBorderDeposit"
            type="number"
            min="0"
            value={value.crossBorderDeposit}
            onChange={(e) =>
              onChange({ crossBorderDeposit: toNumber(e.target.value) })
            }
            disabled={disabled}
            style={inputStyle}
          />
        </div>

        {/* Cross border assistance */}
        <div>
          <p style={labelStyle}>{t("cars.rentalTerms.crossBorderAssistance")}</p>
          <label style={{ ...checkboxRowStyle, height: 40 }}>
            <input
              type="checkbox"
              checked={value.crossBorderAssistance}
              onChange={(e) => onChange({ crossBorderAssistance: e.target.checked })}
              disabled={disabled}
              style={{ width: 16, height: 16, accentColor }}
            />
            {t("cars.rentalTerms.crossBorderAssistanceOffered")}
          </label>
        </div>

        {/* Accepted payment methods */}
        <div>
          <p style={labelStyle}>
            {t("cars.rentalTerms.acceptedPaymentMethods")}{" "}
            <span style={{ color: accentColor }}>*</span>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", minHeight: 40, alignItems: "center" }}>
            {CAR_PAYMENT_METHODS.map((method) => (
              <label key={method} style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={value.acceptedPaymentMethods.includes(method)}
                  onChange={() => togglePaymentMethod(method)}
                  disabled={disabled}
                  style={{ width: 16, height: 16, accentColor }}
                />
                {t(`cars.rentalTerms.paymentMethods.${method}`)}
              </label>
            ))}
          </div>
          <p style={helpStyle}>{t("cars.rentalTerms.paymentMethodsHelp")}</p>
        </div>
      </div>
    </div>
  );
};
