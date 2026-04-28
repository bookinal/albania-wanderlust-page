export const getSearchResultsThemeTokens = ({
  isDark,
  isBlue,
}: {
  isDark: boolean;
  isBlue: boolean;
}) => ({
  brand: isBlue ? "hsl(var(--primary))" : "#E8192C",
  brandSoft: isBlue ? "rgba(2, 132, 199, 0.08)" : "rgba(232,25,44,0.08)",
  brandSoftStrong: isBlue ? "rgba(2, 132, 199, 0.12)" : "rgba(232,25,44,0.12)",
  brandBorder: isBlue ? "rgba(2, 132, 199, 0.28)" : "rgba(232,25,44,0.28)",
  pageBg: isDark
    ? "linear-gradient(160deg, #0a0a0c 0%, #111115 40%, #16080a 100%)"
    : isBlue
      ? "linear-gradient(160deg, hsl(205 55% 96%) 0%, hsl(204 60% 98%) 40%, hsl(193 70% 95%) 100%)"
      : "linear-gradient(160deg, #f8f4f1 0%, #fdf9f7 40%, #fff5f5 100%)",
  heroBg: isDark
    ? "linear-gradient(180deg, rgba(232,25,44,0.08) 0%, transparent 100%)"
    : isBlue
      ? "linear-gradient(180deg, rgba(2, 132, 199, 0.08) 0%, transparent 100%)"
      : "linear-gradient(180deg, rgba(232,25,44,0.06) 0%, transparent 100%)",
  heroBorder: isDark ? "rgba(232,25,44,0.12)" : isBlue ? "rgba(2, 132, 199, 0.16)" : "rgba(232,25,44,0.15)",
  headingColor: isDark ? "#f0ece8" : isBlue ? "hsl(212 48% 18%)" : "#1a0a0d",
  bodyText: isDark ? "rgba(240,236,232,0.72)" : isBlue ? "hsl(211 22% 42%)" : "rgba(26,10,13,0.68)",
  skeletonBg: isDark ? "#141417" : "#ffffff",
  skeletonBorder: isDark ? "rgba(232,25,44,0.1)" : isBlue ? "rgba(2, 132, 199, 0.12)" : "rgba(232,25,44,0.12)",
  skeletonPulseFrom: isDark ? "#1c1c21" : isBlue ? "#e0f2fe" : "#f0e8e8",
  skeletonPulseMid: isDark ? "#252528" : isBlue ? "#bae6fd" : "#fde8e8",
  errorText: isDark ? "#f0ece8" : isBlue ? "hsl(212 48% 18%)" : "#1a0a0d",
  emptyStateBg: isDark ? "#141417" : "#ffffff",
  emptyStateBorder: isDark ? "rgba(232,25,44,0.2)" : isBlue ? "rgba(2, 132, 199, 0.22)" : "rgba(232,25,44,0.25)",
  clearBtnColor: isDark ? "rgba(240,236,232,0.7)" : isBlue ? "rgba(15, 23, 42, 0.62)" : "rgba(26,10,13,0.6)",
  clearBtnBorder: isDark ? "rgba(240,236,232,0.2)" : isBlue ? "rgba(15, 23, 42, 0.2)" : "rgba(26,10,13,0.2)",
  textureBg: isDark
    ? "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"
    : "none",
  sidebarBg: isDark ? "#111115" : isBlue ? "rgba(255,255,255,0.76)" : "#f8f6f3",
  sidebarBorder: isDark ? "rgba(232,25,44,0.1)" : isBlue ? "rgba(2, 132, 199, 0.14)" : "rgba(232,25,44,0.12)",
  headerText: isDark ? "#f0ece8" : isBlue ? "hsl(212 48% 18%)" : "#111115",
  resetText: isDark ? "rgba(240,236,232,0.4)" : isBlue ? "rgba(15, 23, 42, 0.45)" : "rgba(17,17,21,0.4)",
  inputBg: isDark ? "rgba(240,236,232,0.04)" : isBlue ? "rgba(255,255,255,0.82)" : "rgba(17,17,21,0.04)",
  inputBorder: isDark ? "rgba(232,25,44,0.15)" : isBlue ? "rgba(2, 132, 199, 0.18)" : "rgba(232,25,44,0.18)",
  inputColor: isDark ? "#f0ece8" : isBlue ? "hsl(212 48% 18%)" : "#111115",
  selectOptionBg: isDark ? "#1c1c21" : isBlue ? "#f0f9ff" : "#f8f6f3",
  labelColor: isBlue ? "hsl(var(--primary))" : "#E8192C",
  typeActiveBg: isBlue ? "rgba(2, 132, 199, 0.12)" : "rgba(232,25,44,0.12)",
  typeActiveBorder: isBlue ? "rgba(2, 132, 199, 0.4)" : "rgba(232,25,44,0.4)",
  typeActiveText: isBlue ? "hsl(var(--primary))" : "#E8192C",
  typeInactiveBg: isDark ? "rgba(240,236,232,0.04)" : isBlue ? "rgba(15, 23, 42, 0.04)" : "rgba(17,17,21,0.04)",
  typeInactiveBorder: isDark ? "rgba(240,236,232,0.1)" : isBlue ? "rgba(15, 23, 42, 0.12)" : "rgba(17,17,21,0.12)",
  typeInactiveText: isDark ? "rgba(240,236,232,0.5)" : isBlue ? "rgba(15, 23, 42, 0.52)" : "rgba(17,17,21,0.5)",
  applyBtnBg: isBlue ? "hsl(var(--primary))" : "#E8192C",
  applyBtnText: "#ffffff",
  applyBtnDisabledBg: isDark ? "rgba(232,25,44,0.3)" : isBlue ? "rgba(2, 132, 199, 0.28)" : "rgba(232,25,44,0.25)",
  checkboxBorder: isDark ? "rgba(240,236,232,0.2)" : isBlue ? "rgba(15, 23, 42, 0.22)" : "rgba(17,17,21,0.2)",
  checkboxCheckedText: isDark ? "#f0ece8" : isBlue ? "hsl(212 48% 18%)" : "#111115",
  checkboxUncheckedText: isDark ? "rgba(240,236,232,0.5)" : isBlue ? "rgba(15, 23, 42, 0.52)" : "rgba(17,17,21,0.5)",
  infoText: isBlue ? "rgba(2, 132, 199, 0.82)" : "rgba(232,25,44,0.7)",
  mobileBtnBg: isDark ? "rgba(232,25,44,0.08)" : isBlue ? "rgba(2, 132, 199, 0.08)" : "rgba(232,25,44,0.06)",
  mobileBtnBorder: isDark ? "rgba(232,25,44,0.25)" : isBlue ? "rgba(2, 132, 199, 0.22)" : "rgba(232,25,44,0.22)",
  mobileBtnText: isDark ? "#f0ece8" : isBlue ? "hsl(212 48% 18%)" : "#111115",
  colorScheme: isDark ? "dark" : "light",
  minMaxLabel: isDark ? "rgba(240,236,232,0.4)" : isBlue ? "rgba(15, 23, 42, 0.45)" : "rgba(17,17,21,0.4)",
  priceText: isDark ? "#f0ece8" : isBlue ? "hsl(212 48% 18%)" : "#111115",
  mapCardBg: isDark ? "rgba(255,255,255,0.03)" : isBlue ? "rgba(255,255,255,0.82)" : "#ffffff",
  mapCardBorder: isDark ? "rgba(255,255,255,0.07)" : isBlue ? "rgba(2, 132, 199, 0.14)" : "#e5e2de",
  mapPreviewBg: isBlue
    ? "linear-gradient(135deg, hsl(208 73% 24%) 0%, hsl(204 78% 38%) 50%, hsl(191 74% 42%) 100%)"
    : "linear-gradient(135deg, #0a0a0c 0%, #1a0505 50%, #0a0a0c 100%)",
  mapPreviewButtonBg: isBlue ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.92)",
  mapPreviewButtonText: isBlue ? "hsl(212 48% 18%)" : "#111115",
});
