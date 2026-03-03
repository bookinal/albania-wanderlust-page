import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

interface MonthlyPricingEditorProps {
  prices: MonthlyPriceInput[];
  onChange: (prices: MonthlyPriceInput[]) => void;
  basePrice?: number;
  disabled?: boolean;
}

// Season icons and colors
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
  const [localPrices, setLocalPrices] = useState<Record<Month, number>>(
    {} as Record<Month, number>,
  );
  const [copiedMonth, setCopiedMonth] = useState<Month | null>(null);

  // Initialize local prices from props
  useEffect(() => {
    const priceMap: Record<Month, number> = {} as Record<Month, number>;
    MONTHS.forEach((month) => {
      const existing = prices.find((p) => p.month === month);
      priceMap[month] = existing?.pricePerDay ?? basePrice;
    });
    setLocalPrices(priceMap);
  }, [prices, basePrice]);

  // Handle price change for a specific month
  const handlePriceChange = (month: Month, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPrices = { ...localPrices, [month]: numValue };
    setLocalPrices(newPrices);

    // Convert to array format and notify parent
    const pricesArray: MonthlyPriceInput[] = MONTHS.map((m) => ({
      month: m,
      pricePerDay: newPrices[m] ?? basePrice,
    }));
    onChange(pricesArray);
  };

  // Apply base price to all months
  const applyToAll = () => {
    const newPrices: Record<Month, number> = {} as Record<Month, number>;
    MONTHS.forEach((month) => {
      newPrices[month] = basePrice;
    });
    setLocalPrices(newPrices);

    const pricesArray: MonthlyPriceInput[] = MONTHS.map((m) => ({
      month: m,
      pricePerDay: basePrice,
    }));
    onChange(pricesArray);
  };

  // Copy price from one month to clipboard/state for pasting
  const copyPrice = (month: Month) => {
    setCopiedMonth(month);
    setTimeout(() => setCopiedMonth(null), 2000);
  };

  // Apply summer premium (e.g., +20% for Jun, Jul, Aug)
  const applySummerPremium = () => {
    const premium = 1.2; // 20% increase
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

  // Calculate stats
  const allPrices = Object.values(localPrices).filter((p) => p > 0);
  const avgPrice =
    allPrices.length > 0
      ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
      : 0;
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          {t("monthlyPricingEditor.title")}
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyToAll}
            disabled={disabled || basePrice <= 0}
            className="text-xs"
          >
            <Copy size={12} className="mr-1" />
            {t("monthlyPricingEditor.buttons.applyBase", { basePrice })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applySummerPremium}
            disabled={disabled || basePrice <= 0}
            className="text-xs"
          >
            <Sun size={12} className="mr-1" />
            {t("monthlyPricingEditor.buttons.summerPremium")}
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 p-3 bg-gray-50 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-gray-500" />
          <span className="text-gray-600">
            {t("monthlyPricingEditor.stats.avg")}
          </span>
          <span className="font-semibold">${avgPrice}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            {t("monthlyPricingEditor.stats.min")}
          </span>
          <span className="font-semibold text-green-600">${minPrice}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            {t("monthlyPricingEditor.stats.max")}
          </span>
          <span className="font-semibold text-red-600">${maxPrice}</span>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {MONTHS.map((month) => {
          const seasonInfo = getSeasonInfo(month, t);
          const price = localPrices[month] ?? basePrice;
          const isPriceDifferent = price !== basePrice && basePrice > 0;

          return (
            <div
              key={month}
              className={`relative p-3 rounded-lg border transition-all ${
                disabled ? "opacity-60" : "hover:shadow-md"
              } ${seasonInfo.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {seasonInfo.icon}
                  <span className="text-xs font-medium">{month}</span>
                </div>
                {copiedMonth === month && (
                  <Check size={12} className="text-green-500" />
                )}
              </div>
              <div className="text-[10px] text-gray-500 mb-1.5">
                {MONTH_NAMES[month]}
              </div>
              <div className="relative">
                <DollarSign
                  size={14}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={price || ""}
                  onChange={(e) => handlePriceChange(month, e.target.value)}
                  disabled={disabled}
                  className={`pl-7 h-8 text-sm font-semibold ${
                    isPriceDifferent ? "ring-2 ring-blue-300" : ""
                  }`}
                  placeholder="0"
                />
              </div>
              {isPriceDifferent && (
                <div className="absolute -top-1 -right-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      price > basePrice ? "bg-red-500" : "bg-green-500"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {t("monthlyPricingEditor.tip")}
      </p>
    </div>
  );
};

export default MonthlyPricingEditor;
