import { getHomeThemeTokens } from "@/components/home/homeTheme";

export const getBookingThemeTokens = ({
  isDark,
  isBlue,
}: {
  isDark: boolean;
  isBlue: boolean;
}) => {
  const homeTk = getHomeThemeTokens({ isDark, isBlue });

  return {
    brand: homeTk.brand,
    brandSoft: homeTk.brandSoft,
    brandSoftStrong: homeTk.brandSoftStrong,
    brandBorder: homeTk.brandBorder,
    pageBg: isDark ? "#0d0d0d" : isBlue ? "hsl(205 55% 96%)" : "#f5f4f1",
    pageText: isDark ? "#ffffff" : isBlue ? "hsl(212 48% 18%)" : "#111115",
    cardBg: isDark ? "rgba(255,255,255,0.03)" : isBlue ? "rgba(255,255,255,0.82)" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.07)" : isBlue ? "rgba(2,132,199,0.14)" : "#ede9e5",
    cardShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : isBlue ? "0 8px 32px rgba(2,132,199,0.08)" : "0 8px 32px rgba(15,23,42,0.08)",
    statBg: isDark ? "rgba(255,255,255,0.04)" : isBlue ? "#eff6ff" : "#f5f2ee",
    statBorder: isDark ? "rgba(255,255,255,0.07)" : isBlue ? "rgba(2,132,199,0.12)" : "#e5e2de",
    mutedText: isDark ? "rgba(255,255,255,0.40)" : isBlue ? "hsl(211 22% 42%)" : "#6b6663",
    dimText: isDark ? "rgba(255,255,255,0.70)" : isBlue ? "hsl(212 28% 30%)" : "#44403c",
    labelText: isDark ? "rgba(255,255,255,0.60)" : isBlue ? "hsl(211 22% 42%)" : "#475569",
    inputBg: isDark ? "rgba(255,255,255,0.05)" : isBlue ? "rgba(255,255,255,0.92)" : "#ffffff",
    inputBorder: isDark ? "rgba(255,255,255,0.12)" : isBlue ? "rgba(2,132,199,0.18)" : "#cbd5e1",
    inputText: isDark ? "#ffffff" : isBlue ? "hsl(212 48% 18%)" : "#111115",
    divider: isDark ? "rgba(255,255,255,0.07)" : isBlue ? "rgba(2,132,199,0.12)" : "#e2e8f0",
    disabledBg: isDark ? "rgba(255,255,255,0.02)" : isBlue ? "rgba(240,249,255,0.92)" : "#f0ece8",
    disabledText: isDark ? "rgba(255,255,255,0.3)" : isBlue ? "rgba(15,23,42,0.35)" : "#9e9994",
    thumbBg: isDark ? "#0a0a0a" : isBlue ? "#dbeafe" : "#f0ece8",
    amenityBg: isDark ? "rgba(255,255,255,0.04)" : isBlue ? "#eff6ff" : "#eef4ff",
    backBg: isDark ? "rgba(255,255,255,0.06)" : isBlue ? "rgba(2,132,199,0.08)" : "rgba(0,0,0,0.06)",
    featureTag: isDark ? "rgba(255,255,255,0.06)" : isBlue ? "#eff6ff" : "#f1f5f9",
    featureTagText: isDark ? "rgba(255,255,255,0.60)" : isBlue ? "#0369a1" : "#475569",
    infoBg: isDark ? "rgba(232,25,44,0.07)" : isBlue ? "rgba(2,132,199,0.08)" : "#fff5f5",
    infoBorder: isDark ? "rgba(232,25,44,0.18)" : isBlue ? "rgba(2,132,199,0.18)" : "#fecaca",
    infoText: isDark ? "rgba(255,180,180,0.9)" : isBlue ? "#0369a1" : "#991b1b",
    termsBg: isDark ? "rgba(232,25,44,0.06)" : isBlue ? "rgba(2,132,199,0.06)" : "#fff5f5",
    termsBorder: isDark ? "rgba(232,25,44,0.15)" : isBlue ? "rgba(2,132,199,0.15)" : "#fecaca",
    focusRing: isBlue ? "#0ea5e9" : "#3b82f6",
    primaryBtn: isBlue ? "linear-gradient(120deg, #0284c7, #38bdf8, #0284c7)" : "linear-gradient(120deg, #E8192C, #ff6b7a, #E8192C)",
    primaryShadow: isDark ? "0 10px 30px rgba(0,0,0,0.6)" : isBlue ? "0 10px 30px rgba(2,132,199,0.28)" : "0 10px 30px rgba(220,38,38,0.35)",
  };
};
