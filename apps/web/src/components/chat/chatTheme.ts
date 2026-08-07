import { getHomeThemeTokens } from "@/components/home/homeTheme";

export const getChatThemeTokens = ({
  isDark,
  isBlue,
}: {
  isDark: boolean;
  isBlue: boolean;
}) => {
  const homeTk = getHomeThemeTokens({ isDark, isBlue });

  return {
    brand: homeTk.brand,
    fabBg: homeTk.brand,
    fabIcon: "#ffffff",
    fabShadow: isDark
      ? "0 12px 32px rgba(0,0,0,0.5)"
      : isBlue
        ? "0 12px 32px rgba(2,132,199,0.28)"
        : "0 12px 32px rgba(220,38,38,0.3)",
    unreadBadgeBg: isBlue ? "#0284c7" : "#dc2626",
    unreadBadgeText: "#ffffff",
    panelBg: isDark ? "#141417" : isBlue ? "#ffffff" : "#ffffff",
    panelBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.14)"
        : "#ede9e5",
    panelShadow: isDark
      ? "0 24px 60px rgba(0,0,0,0.55)"
      : isBlue
        ? "0 24px 60px rgba(3,37,65,0.18)"
        : "0 24px 60px rgba(15,23,42,0.16)",
    headerBg: isDark
      ? "rgba(255,255,255,0.03)"
      : isBlue
        ? "rgba(2,132,199,0.06)"
        : "#faf8f5",
    headerBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.14)"
        : "#ede9e5",
    headerText: isDark ? "#ffffff" : isBlue ? "hsl(212 48% 18%)" : "#111115",
    headerIconBtnHover: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.1)"
        : "rgba(0,0,0,0.05)",
    headerIconText: isDark
      ? "rgba(255,255,255,0.7)"
      : isBlue
        ? "hsl(211 22% 42%)"
        : "#6b6663",
    bodyBg: isDark ? "#0f0f11" : isBlue ? "#f8fbff" : "#ffffff",
    ownBubbleBg: homeTk.brand,
    ownBubbleText: "#ffffff",
    otherBubbleBg: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "#eff6ff"
        : "#f0ece8",
    otherBubbleText: isDark
      ? "#ffffff"
      : isBlue
        ? "hsl(212 48% 18%)"
        : "#111115",
    timeText: isDark
      ? "rgba(255,255,255,0.35)"
      : isBlue
        ? "hsl(211 22% 55%)"
        : "#9e9994",
    adminAvatarBg: homeTk.brand,
    userAvatarBg: isDark
      ? "rgba(255,255,255,0.12)"
      : isBlue
        ? "rgba(2,132,199,0.14)"
        : "#d1cdc9",
    avatarText: "#ffffff",
    emptyText: isDark
      ? "rgba(255,255,255,0.45)"
      : isBlue
        ? "hsl(211 22% 42%)"
        : "#6b6663",
    loaderColor: homeTk.brand,
    inputAreaBg: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
    inputAreaBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.14)"
        : "#ede9e5",
    textareaBg: isDark
      ? "rgba(255,255,255,0.05)"
      : isBlue
        ? "#f8fbff"
        : "#faf8f5",
    textareaBorder: isDark
      ? "rgba(255,255,255,0.12)"
      : isBlue
        ? "rgba(2,132,199,0.18)"
        : "#ddd9d5",
    textareaText: isDark ? "#ffffff" : isBlue ? "hsl(212 48% 18%)" : "#111115",
    sendBtnBg: homeTk.brand,
    sendBtnText: "#ffffff",
    sendBtnDisabledBg: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.12)"
        : "#e5e2de",
    sendBtnDisabledText: isDark
      ? "rgba(255,255,255,0.3)"
      : isBlue
        ? "rgba(2,132,199,0.4)"
        : "#9e9994",
  };
};
