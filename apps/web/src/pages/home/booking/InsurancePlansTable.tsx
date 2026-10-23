import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, CheckCircle2, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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

/**
 * Phone layout: no sideways scrolling. The plans are cards (2 per row) and the
 * risks of the active plan are listed under them; tapping another card switches
 * the list, so comparing is just tapping from one plan to the next.
 */
const InsurancePlansCards: React.FC<InsurancePlansTableProps> = ({
  plans,
  tk,
  selectedId,
  onSelect,
}) => {
  const { t } = useTranslation();
  const selectable = Boolean(onSelect);
  // Overview pages (no selection) still let the client browse the plans
  const [viewedId, setViewedId] = useState<number | null>(plans[0]?.id ?? null);
  const activeId = selectable ? selectedId ?? null : viewedId;
  const active = plans.find((plan) => plan.id === activeId) ?? plans[0];
  const total = INSURANCE_COVERAGE_KEYS.length;

  const choose = (plan: InsurancePlan) => (selectable ? onSelect?.(plan) : setViewedId(plan.id));

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={t("insurance.chooseTitle")}
        className="grid grid-cols-2 gap-2.5"
      >
        {plans.map((plan) => {
          const isActive = plan.id === active?.id;
          const coveredCount = plan.coverage.filter((key) =>
            INSURANCE_COVERAGE_KEYS.includes(key),
          ).length;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => choose(plan)}
              className="relative flex flex-col items-start rounded-xl p-3 text-left transition"
              style={{
                background: isActive ? tk.brandSoft : tk.statBg,
                border: `1.5px solid ${isActive ? tk.brand : "transparent"}`,
              }}
            >
              {isActive && (
                <CheckCircle2
                  className="absolute right-2 top-2 h-4 w-4"
                  style={{ color: tk.brand }}
                  aria-hidden="true"
                />
              )}
              <span
                className="pr-5 text-sm font-bold leading-tight"
                style={{ color: tk.pageText }}
              >
                {getInsurancePlanLabel(plan, t)}
              </span>
              <span className="mt-1.5 text-base font-extrabold" style={{ color: tk.brand }}>
                {formatInsurancePrice(plan.pricePerDay, t)}
              </span>
              <span className="mt-0.5 text-xs" style={{ color: tk.mutedText }}>
                {t("insurance.coveredCount", { count: coveredCount, total })}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="mt-4 rounded-xl p-3"
          style={{ border: `1px solid ${tk.cardBorder}` }}
          aria-live="polite"
        >
          <p className="mb-2 text-sm font-bold" style={{ color: tk.pageText }}>
            {t("insurance.whatItCovers", { plan: getInsurancePlanLabel(active, t) })}
          </p>
          <ul className="divide-y" style={{ borderColor: tk.cardBorder }}>
            {INSURANCE_COVERAGE_KEYS.map((key) => {
              const covered = active.coverage.includes(key);
              return (
                <li
                  key={key}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                  style={{ borderColor: tk.cardBorder }}
                >
                  <span style={{ color: covered ? tk.pageText : tk.mutedText }}>
                    {t(`insurance.coverage.${key}`)}
                  </span>
                  {covered ? (
                    <Check size={18} className="shrink-0" style={{ color: YES_COLOR }} aria-label={t("insurance.covered")} />
                  ) : (
                    <X size={16} className="shrink-0" style={{ color: NO_COLOR }} aria-label={t("insurance.notCovered")} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

/** "Insurance packages overview": plans as columns, covered risks as rows. */
export const InsurancePlansTable: React.FC<InsurancePlansTableProps> = ({
  plans,
  tk,
  selectedId,
  onSelect,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const selectable = Boolean(onSelect);

  if (isMobile) {
    return <InsurancePlansCards plans={plans} tk={tk} selectedId={selectedId} onSelect={onSelect} />;
  }

  const columnStyle = (plan: InsurancePlan): React.CSSProperties => {
    const selected = selectable && plan.id === selectedId;
    return {
      background: selected ? tk.brandSoft : undefined,
      cursor: selectable ? "pointer" : undefined,
      boxShadow: selected ? `inset 1px 0 0 ${tk.brand}, inset -1px 0 0 ${tk.brand}` : undefined,
    };
  };

  const cellClass = "px-3 py-2.5 text-center align-middle";

  // The risk names stay pinned on the left while the plans scroll sideways on
  // phones; pinned cells need an opaque background: stripe + card colour (which
  // is see-through in dark/blue themes) layered over the solid page colour
  const stickyClass = "sticky left-0 z-10";
  const layer = (color: string) => `linear-gradient(${color}, ${color})`;
  const stickyBg = (striped: boolean) =>
    [...(striped ? [layer(tk.statBg)] : []), layer(tk.cardBg), tk.pageBg].join(", ");

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[560px] border-separate" style={{ borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              scope="col"
              style={{ color: tk.pageText, background: stickyBg(false) }}
              className={`${stickyClass} px-3 py-3 text-left text-sm font-bold align-bottom`}
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
            <th scope="row" style={{ color: tk.dimText, background: stickyBg(true) }} className={`${stickyClass} px-3 py-2.5 text-left text-sm font-medium rounded-l-lg`}>
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
              <th
                scope="row"
                style={{ color: tk.dimText, background: stickyBg(rowIndex % 2 === 1) }}
                className={`${stickyClass} px-3 py-2.5 text-left text-sm font-medium rounded-l-lg`}
              >
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
