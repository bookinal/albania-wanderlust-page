import { Building2, Star, Users, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";

const TrustIndicators = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });

  return (
    <section
      style={{
        padding: "2rem 0",
        background: tk.trustGradient,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              Icon: Building2,
              value: "500+",
              labelKey: "home.trustIndicators.propertiesListed",
              iconColor: "white",
            },
            {
              Icon: Users,
              value: "10K+",
              labelKey: "home.trustIndicators.happyGuests",
              iconColor: "white",
            },
            {
              Icon: Star,
              value: "4.8",
              labelKey: "home.trustIndicators.averageRating",
              iconColor: "#fbbf24",
            },
            {
              Icon: Shield,
              value: "100%",
              labelKey: "home.trustIndicators.secureBooking",
              iconColor: "white",
            },
          ].map(({ Icon, value, labelKey, iconColor }) => (
            <div
              key={labelKey}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <Icon className="w-6 h-6" style={{ color: iconColor }} />
              </div>
              <span
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.7)",
                  marginTop: "0.25rem",
                }}
              >
                {t(labelKey)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
