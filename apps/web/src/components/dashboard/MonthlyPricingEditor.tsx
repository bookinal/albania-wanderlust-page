import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  Calendar,
  Copy,
  Check,
  TrendingUp,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
} from "lucide-react";
import {
  Month,
  MONTHS,
  MONTH_NAMES,
  MonthlyPriceInput,
} from "@/types/price.type";
import { useTheme } from "@/context/ThemeContext";

interface MonthlyPricingEditorProps {
  prices: MonthlyPriceInput[];
  onChange: (prices: MonthlyPriceInput[]) => void;
  basePrice?: number;
  disabled?: boolean;
}

// Season icons and colors — these are functional color indicators, kept as-is
const getSeasonInfo = (
  month: Month,
  t: (key: string) => string,
): { icon: React.ReactNode; color: string; season: string } => {
  const winterMonths: Month[] = ["DEC", "JAN", "FEB"];
  const springMonths: Month[] = ["MAR", "APR", "MAY"];
  const summerMonths: Month[] = ["JUN", "JUL", "AUG"];
  const fallMonths: Month[] = ["SEP", "OCT", "NOV"];

  if (winterMonths.includes(month)) {
    return {
      icon: <Snowflake size={14} />,
      color: "text-blue-500 bg-blue-50 border-blue-200",
      season: t("monthlyPricingEditor.seasons.winter"),
    };
  }
  if (springMonths.includes(month)) {
    return {
      icon: <Flower2 size={14} />,
      color: "text-pink-500 bg-pink-50 border-pink-200",
      season: t("monthlyPricingEditor.seasons.spring"),
    };
  }
  if (summerMonths.includes(month)) {
    return {
      icon: <Sun size={14} />,
      color: "text-amber-500 bg-amber-50 border-amber-200",
      season: t("monthlyPricingEditor.seasons.summer"),
    };
  }
  return {
    icon: <Leaf size={14} />,
    color: "text-orange-500 bg-orange-50 border-orange-200",
    season: t("monthlyPricingEditor.seasons.fall"),
  };
};

export const MonthlyPricingEditor: React.FC<MonthlyPricingEditorProps> = ({
  prices,
  onChange,
  basePrice = 0,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [localPrices, setLocalPrices] = useState<Record<Month, number>>(
    {} as Record<Month, number>,
  );
  const [copiedMonth, setCopiedMonth] = useState<Month | null>(null);

  const tk = {
    labelText: isDark ? "rgba(255,255,255,0.80)" : "#111115",
    calIcon: "#E8192C",
    btnBg: isDark ? "rgba(255,255,255,0.06)" : "#f5f2ee",
    btnBorder: isDark ? "rgba(255,255,255,0.12)" : "#ddd9d5",
    btnText: isDark ? "rgba(255,255,255,0.80)" : "#44403c",
    btnDisabledOpacity: 0.4,
    statsBg: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
    statsText: isDark ? "rgba(255,255,255,0.55)" : "#6b6663",
    statsValue: isDark ? "#ffffff" : "#111115",
    statsMin: "#10b981",
    statsMax: "#E8192C",
    inputBg: isDark ? "rgba(0,0,0,0.25)" : "#ffffff",
    inputBorder: isDark ? "rgba(255,255,255,0.15)" : "#d1cdc9",
    inputText: isDark ? "#ffffff" : "#111115",
    monthText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    tipText: isDark ? "rgba(255,255,255,0.35)" : "#9e9994",
  };

  useEffect(() => {
    const priceMap: Record<Month, number> = {} as Record<Month, number>;
    MONTHS.forEach((month) => {
      const existing = prices.find((p) => p.month === month);
      priceMap[month] = existing?.pricePerDay ?? basePrice;
    });
    setLocalPrices(priceMap);
  }, [prices, basePrice]);

  const handlePriceChange = (month: Month, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPrices = { ...localPrices, [month]: numValue };
    setLocalPrices(newPrices);
    const pricesArray: MonthlyPriceInput[] = MONTHS.map((m) => ({
      month: m,
      pricePerDay: newPrices[m] ?? basePrice,
    }));
    onChange(pricesArray);
  };

  const applyToAll = () => {
    const newPrices: Record<Month, number> = {} as Record<Month, number>;
    MONTHS.forEach((month) => { newPrices[month] = basePrice; });
    setLocalPrices(newPrices);
    const pricesArray: MonthlyPriceInput[] = MONTHS.map((m) => ({
      month: m,
      pricePerDay: basePrice,
    }));
    onChange(pricesArray);
  };

  const copyPrice = (month: Month) => {
    setCopiedMonth(month);
    setTimeout(() => setCopiedMonth(null), 2000);
  };

  const applySummerPremium = () => {
    const premium = 1.2;
    const newPrices = { ...localPrices };
    (["JUN", "JUL", "AUG"] as Month[]).forEach((month) => {
      newPrices[month] = Math.round(basePrice * premium);
    });
    setLocalPrices(newPrices);
    const pricesArray: MonthlyPriceInput[] = MONTHS.map((m) => ({
      month: m,
      pricePerDay: newPrices[m] ?? basePrice,
    }));
    onChange(pricesArray);
  };

  const allPrices = Object.values(localPrices).filter((p) => p > 0);
  const avgPrice = allPrices.length > 0
    ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
    : 0;
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  const btnStyle = (isDisabled: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 600,
    background: tk.btnBg,
    border: `1px solid ${tk.btnBorder}`,
    borderRadius: "7px",
    color: tk.btnText,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? tk.btnDisabledOpacity : 1,
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: tk.labelText, display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={16} style={{ color: tk.calIcon }} />
          {t("monthlyPricingEditor.title")}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={applyToAll}
            disabled={disabled || basePrice <= 0}
            style={btnStyle(disabled || basePrice <= 0)}
          >
            <Copy size={12} />
            {t("monthlyPricingEditor.buttons.applyBase", { basePrice })}
          </button>
          <button
            type="button"
            onClick={applySummerPremium}
            disabled={disabled || basePrice <= 0}
            style={btnStyle(disabled || basePrice <= 0)}
          >
            <Sun size={12} />
            {t("monthlyPricingEditor.buttons.summerPremium")}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: "16px", padding: "12px", background: tk.statsBg, borderRadius: "8px", fontSize: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TrendingUp size={14} style={{ color: tk.statsText }} />
          <span style={{ color: tk.statsText }}>{t("monthlyPricingEditor.stats.avg")}</span>
          <span style={{ fontWeight: 700, color: tk.statsValue }}>${avgPrice}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: tk.statsText }}>{t("monthlyPricingEditor.stats.min")}</span>
          <span style={{ fontWeight: 700, color: tk.statsMin }}>${minPrice}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: tk.statsText }}>{t("monthlyPricingEditor.stats.max")}</span>
          <span style={{ fontWeight: 700, color: tk.statsMax }}>${maxPrice}</span>
        </div>
      </div>

      {/* Monthly Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
        {MONTHS.map((month) => {
          const seasonInfo = getSeasonInfo(month, t);
          const price = localPrices[month] ?? basePrice;
          const isPriceDifferent = price !== basePrice && basePrice > 0;

          return (
            <div
              key={month}
              className={`relative p-3 rounded-lg border transition-all ${disabled ? "opacity-60" : "hover:shadow-md"} ${seasonInfo.color}`}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {seasonInfo.icon}
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{month}</span>
                </div>
                {copiedMonth === month && (
                  <Check size={12} style={{ color: "#10b981" }} />
                )}
              </div>
              <div style={{ fontSize: "10px", color: tk.monthText, marginBottom: "6px" }}>
                {MONTH_NAMES[month]}
              </div>
              <div style={{ position: "relative" }}>
                <DollarSign
                  size={14}
                  style={{ position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%)", color: tk.statsText }}
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={price || ""}
                  onChange={(e) => handlePriceChange(month, e.target.value)}
                  disabled={disabled}
                  placeholder="0"
                  style={{
                    width: "100%",
                    paddingLeft: "22px",
                    height: "32px",
                    fontSize: "13px",
                    fontWeight: 700,
                    background: tk.inputBg,
                    border: `1px solid ${isPriceDifferent ? "#E8192C" : tk.inputBorder}`,
                    borderRadius: "6px",
                    color: tk.inputText,
                    outline: "none",
                    boxSizing: "border-box",
                    boxShadow: isPriceDifferent ? "0 0 0 2px rgba(232,25,44,0.20)" : "none",
                  }}
                />
              </div>
              {isPriceDifferent && (
                <div style={{ position: "absolute", top: "-4px", right: "-4px" }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: price > basePrice ? "#ef4444" : "#10b981",
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: "12px", color: tk.tipText, marginTop: "8px" }}>
        {t("monthlyPricingEditor.tip")}
      </p>
    </div>
  );
};

export default MonthlyPricingEditor;
