import Hero from "@/components/home/Hero";
import Destinations from "@/components/home/DestinationsHomePreview";
import Culture from "@/components/home/Culture";
import PrimarySearchAppBar from "@/components/home/AppBar";
import HotelsPreview from "@/components/home/HotelsPreview";
import ApartmentsPreview from "@/components/home/ApartmentsPreview";
import CarsPreview from "@/components/home/CarsPreview";
//import LoadingScreen from "@/components/home/LoadingScreen";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";

const Index = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });

  return (
    <div style={{ minHeight: "100vh", background: tk.sectionMain }}>
      {/* <LoadingScreen /> */}
      <PrimarySearchAppBar />
      <Hero />

      {/* Destinations Section */}
      <Destinations />

      {/* Cars Section */}
      {/* <section
        style={{
          padding: "3rem 0",
          background: tk.sectionAlt,
          overflow: "hidden",
        }}
      >
        <div className="container mx-auto px-4">
          <CarsPreview />
        </div>
      </section> */}

      {/* Accommodations Section */}
      <section
        style={{
          padding: "3rem 0",
          background: tk.sectionMain,
          overflow: "hidden",
        }}
      >
        <div className="container mx-auto px-4">
          <div
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
            className="animate-fade-in"
          >
            <span
              style={{
                display: "inline-block",
                padding: "0.375rem 1rem",
                background: tk.badgeBg,
                color: tk.badgeText,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                borderRadius: "9999px",
                marginBottom: "0.75rem",
              }}
            >
              {t("home.accommodations.badge")}
            </span>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontWeight: 700,
                color: tk.textMain,
                marginBottom: "0.75rem",
              }}
            >
              {t("home.accommodations.title")}
            </h2>
            {/* <p
              style={{
                fontSize: "1.05rem",
                color: tk.textMuted,
                maxWidth: "40rem",
                margin: "0 auto",
              }}
            >
              {t("home.accommodations.description")}
            </p> */}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
              gap: "2rem 3rem",
            }}
          >
            <div id="hotels">
              {/* <HotelsPreview /> */}
              <CarsPreview />
            </div>
            <div
              id="apartments"
              style={{
                borderLeft: `1px solid ${tk.dividerColor}`,
                paddingLeft: "1.5rem",
              }}
            >
              <ApartmentsPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      {/* <Culture /> */}
    </div>
  );
};

export default Index;
