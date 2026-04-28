export const getHomeThemeTokens = ({
  isDark,
  isBlue,
}: {
  isDark: boolean;
  isBlue: boolean;
}) => ({
  brand: isBlue ? "hsl(var(--primary))" : "#E8192C",
  brandSoft: isBlue ? "rgba(2, 132, 199, 0.12)" : "rgba(232,25,44,0.12)",
  brandSoftStrong: isBlue ? "rgba(2, 132, 199, 0.18)" : "rgba(232,25,44,0.18)",
  brandBorder: isBlue ? "rgba(2, 132, 199, 0.28)" : "rgba(232,25,44,0.28)",
  sectionAlt: isDark ? "#0a0a0c" : isBlue ? "hsl(205 55% 96%)" : "#f5f4f1",
  sectionMain: isDark ? "#111115" : isBlue ? "linear-gradient(180deg, hsl(205 55% 96%) 0%, hsl(204 60% 98%) 100%)" : "#ffffff",
  textMain: isDark ? "#ffffff" : isBlue ? "hsl(212 48% 18%)" : "#111115",
  textStrongOnMedia: "#ffffff",
  textSoftOnMedia: isBlue ? "rgba(255,255,255,0.9)" : isDark ? "rgba(240,236,232,0.78)" : "rgba(255,255,255,0.88)",
  textMutedOnMedia: isBlue ? "rgba(255,255,255,0.76)" : isDark ? "rgba(240,236,232,0.58)" : "rgba(255,255,255,0.7)",
  textMuted: isDark ? "rgba(255,255,255,0.5)" : isBlue ? "hsl(211 22% 42%)" : "#6b6663",
  badgeBg: isDark ? "rgba(232,25,44,0.12)" : isBlue ? "rgba(2, 132, 199, 0.12)" : "#fef2f2",
  badgeText: isDark ? "#f87171" : isBlue ? "#0369a1" : "#b91c1c",
  badgeIconBg: isDark ? "rgba(232,25,44,0.14)" : isBlue ? "rgba(2, 132, 199, 0.12)" : "#fee2e2",
  badgeIconText: isDark ? "#f87171" : isBlue ? "#0284c7" : "#dc2626",
  dividerColor: isDark ? "rgba(255,255,255,0.07)" : isBlue ? "rgba(14, 116, 144, 0.14)" : "rgba(100,92,84,0.15)",
  emptyBg: isDark ? "rgba(255,255,255,0.03)" : isBlue ? "rgba(255,255,255,0.72)" : "#f8fafc",
  emptyBorder: isDark ? "rgba(255,255,255,0.1)" : isBlue ? "hsl(205 32% 84%)" : "#e2e8f0",
  emptyIcon: isDark ? "rgba(255,255,255,0.2)" : isBlue ? "hsl(199 72% 52%)" : "#cbd5e1",
  emptyText: isDark ? "rgba(255,255,255,0.5)" : isBlue ? "hsl(211 22% 42%)" : "hsl(var(--muted-foreground))",
  loader: isBlue ? "#0284c7" : "#dc2626",
  actionText: isDark ? "#fca5a5" : isBlue ? "#0369a1" : "#dc2626",
  actionHoverBg: isDark ? "rgba(232,25,44,0.08)" : isBlue ? "rgba(2, 132, 199, 0.08)" : "rgba(220, 38, 38, 0.06)",
  ctaBg: isDark ? "hsl(var(--foreground))" : isBlue ? "hsl(var(--secondary))" : "hsl(var(--foreground))",
  ctaText: isDark ? "hsl(var(--background))" : isBlue ? "hsl(var(--secondary-foreground))" : "hsl(var(--background))",
  glassPanelBg: isDark ? "rgba(10, 10, 12, 0.48)" : isBlue ? "rgba(10, 74, 118, 0.22)" : "rgba(255, 255, 255, 0.16)",
  glassPanelBorder: isDark ? "rgba(255,255,255,0.12)" : isBlue ? "rgba(125, 211, 252, 0.24)" : "rgba(255,255,255,0.24)",
  glassPanelShadow: isDark
    ? "0 22px 70px rgba(0,0,0,0.34)"
    : isBlue
      ? "0 22px 70px rgba(3, 37, 65, 0.18)"
      : "0 22px 70px rgba(15,23,42,0.14)",
  glassCardBg: isDark ? "rgba(255,255,255,0.05)" : isBlue ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.12)",
  glassCardBorder: isDark ? "rgba(255,255,255,0.1)" : isBlue ? "rgba(125, 211, 252, 0.18)" : "rgba(255,255,255,0.18)",
  thumbBg: isDark ? "rgba(255,255,255,0.04)" : isBlue ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.12)",
  heroOverlay: isBlue
    ? "linear-gradient(to bottom, rgba(6,24,38,0.38), rgba(9,52,85,0.22), rgba(8,37,61,0.58))"
    : "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
  trustGradient: isBlue
    ? "linear-gradient(to right, hsl(208 73% 32%), hsl(204 78% 44%), hsl(199 72% 52%))"
    : "linear-gradient(to right, #7f1d1d, #991b1b, #000000)",
});
