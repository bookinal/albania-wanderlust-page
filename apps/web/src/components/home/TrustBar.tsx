import React from "react";
import { ShieldCheck, Award, Headphones, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

export interface TrustItem {
  icon: React.ElementType;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
}

const trustItems: TrustItem[] = [
  {
    icon: ShieldCheck,
    titleKey: "home.trustBar.verifiedTitle",
    defaultTitle: "Verified Destinations",
    descKey: "home.trustBar.verifiedDesc",
    defaultDesc: "Handpicked spots & authentic local experiences",
  },
  {
    icon: Award,
    titleKey: "home.trustBar.priceTitle",
    defaultTitle: "Best Price Guarantee",
    descKey: "home.trustBar.priceDesc",
    defaultDesc: "Transparent local pricing with zero hidden fees",
  },
  {
    icon: Headphones,
    titleKey: "home.trustBar.supportTitle",
    defaultTitle: "24/7 Local Support",
    descKey: "home.trustBar.supportDesc",
    defaultDesc: "Dedicated assistance throughout your journey",
  },
  {
    icon: CreditCard,
    titleKey: "home.trustBar.securePaymentTitle",
    defaultTitle: "Secure Payment",
    descKey: "home.trustBar.securePaymentDesc",
    defaultDesc: "Safe & encrypted transactions guaranteed",
  },
];

export const TrustBar: React.FC = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();

  // Dynamic solid banner background matching theme
  const bannerBg = isBlue
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"), linear-gradient(105deg, #082f49 0%, #0f4c81 12%, #0369a1 28%, #0284c7 42%, #38bdf8 50%, #0284c7 58%, #0369a1 72%, #0f4c81 88%, #082f49 100%)`
    : isDark
    ? "linear-gradient(135deg, #181820 0%, #111116 100%)"
    : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"), linear-gradient(105deg, #000000 0%, #1a0204 12%, #cc1525 28%, #E8192C 42%, #ff6b7a 50%, #E8192C 58%, #cc1525 72%, #1a0204 88%, #000000 100%)`;

  const bannerBorder = isBlue
    ? "rgba(125, 211, 252, 0.2)"
    : isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(232, 25, 44, 0.3)";

  return (
    <section
      style={{
        width: "100%",
        background: bannerBg,
        borderTop: `1px solid ${bannerBorder}`,
        borderBottom: `1px solid ${bannerBorder}`,
        color: "#ffffff",
        padding: "1.35rem 1.5rem",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "1.25rem",
            alignItems: "center",
          }}
        >
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            const title = t(item.titleKey, { defaultValue: item.defaultTitle });
            const desc = t(item.descKey, { defaultValue: item.defaultDesc });

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.35rem 0.5rem",
                  borderRadius: "0.75rem",
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.85rem",
                    height: "2.85rem",
                    borderRadius: "0.75rem",
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <h4
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      margin: 0,
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.83rem",
                      color: "rgba(255, 255, 255, 0.78)",
                      margin: 0,
                      lineHeight: 1.35,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
