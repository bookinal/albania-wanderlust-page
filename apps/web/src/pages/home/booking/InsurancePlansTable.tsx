import React from "react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import type { InsurancePlan } from "@/types/insurance.types";
import {
  INSURANCE_COVERAGE_KEYS,
  formatInsurancePrice,
  getInsurancePlanLabel,
} from "@/lib/insurancePlans";
import { getBookingThemeTokens } from "./bookingTheme";

interface InsurancePlansTableProps {
  plans: InsurancePlan[];
  tk: ReturnType<typeof getBookingThemeTokens>;
  /** When set, columns are selectable (booking page) */
  selectedId?: number | null;
  onSelect?: (plan: InsurancePlan) => void;
}

const YES_COLOR = "#16a34a";
const NO_COLOR = "#dc2626";

/** "Insurance packages overview": plans as columns, covered risks as rows. */
export const InsurancePlansTable: React.FC<InsurancePlansTableProps> = ({
  plans,
  tk,
  selectedId,
  onSelect,
}) => {
  const { t } = useTranslation();
  const selectable = Boolean(onSelect);

  const columnStyle = (plan: InsurancePlan): React.CSSProperties => {
    const selected = selectable && plan.id === selectedId;
    return {
      background: selected ? tk.brandSoft : undefined,
      cursor: selectable ? "pointer" : undefined,
      boxShadow: selected ? `inset 1px 0 0 ${tk.brand}, inset -1px 0 0 ${tk.brand}` : undefined,
    };
  };

  const cellClass = "px-3 py-2.5 text-center align-middle";

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[560px] border-separate" style={{ borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              scope="col"
              style={{ color: tk.pageText }}
              className="px-3 py-3 text-left text-sm font-bold align-bottom"
            >
              {t("insurance.risksCovered")}
            </th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                scope="col"
                onClick={() => onSelect?.(plan)}
                style={{
                  ...columnStyle(plan),
                  color: tk.pageText,
                  boxShadow:
                    selectable && plan.id === selectedId
                      ? `inset 1px 1px 0 ${tk.brand}, inset -1px 0 0 ${tk.brand}`
                      : undefined,
                }}
                className="px-3 py-3 text-center text-sm font-bold align-bottom rounded-t-xl"
              >
                {selectable && (
                  <span className="flex justify-center mb-1.5">
                    <input
                      type="radio"
                      name="insurancePlan"
                      checked={plan.id === selectedId}
                      onChange={() => onSelect?.(plan)}
                      aria-label={getInsurancePlanLabel(plan, t)}
                      style={{ accentColor: tk.brand, width: 16, height: 16 }}
                    />
                  </span>
                )}
                {getInsurancePlanLabel(plan, t)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: tk.statBg }}>
            <th scope="row" style={{ color: tk.dimText }} className="px-3 py-2.5 text-left text-sm font-medium rounded-l-lg">
              {t("insurance.price")}
            </th>
            {plans.map((plan) => (
              <td
                key={plan.id}
                onClick={() => onSelect?.(plan)}
                style={{ ...columnStyle(plan), color: tk.pageText }}
                className={`${cellClass} text-sm font-semibold`}
              >
                {formatInsurancePrice(plan.pricePerDay, t)}
              </td>
            ))}
          </tr>
          {INSURANCE_COVERAGE_KEYS.map((key, rowIndex) => (
            <tr key={key} style={{ background: rowIndex % 2 === 1 ? tk.statBg : undefined }}>
              <th scope="row" style={{ color: tk.dimText }} className="px-3 py-2.5 text-left text-sm font-medium rounded-l-lg">
                {t(`insurance.coverage.${key}`)}
              </th>
              {plans.map((plan) => {
                const covered = plan.coverage.includes(key);
                return (
                  <td
                    key={plan.id}
                    onClick={() => onSelect?.(plan)}
                    style={columnStyle(plan)}
                    className={cellClass}
                  >
                    {covered ? (
                      <Check size={18} className="inline" style={{ color: YES_COLOR }} aria-label={t("insurance.covered")} />
                    ) : (
                      <X size={16} className="inline" style={{ color: NO_COLOR }} aria-label={t("insurance.notCovered")} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
