import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import slide1 from "@/assets/home/slide1.jpg";
import ReservationPickerValue from "./reservationPicker";
import HeroInventoryPreview from "./HeroInventoryPreview";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "./homeTheme";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navigateToSearchResults = () => {
    navigate("/searchResults", { state: { type: "apartment" } });
  };

  return (
    <section className="relative min-h-[70vh] flex items-start justify-center overflow-hidden pt-20 sm:pt-10 lg:pt-10">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide1}
          className="w-full h-full object-cover"
          alt="Albania"
        />
        <div
          className="absolute inset-0"
          style={{ background: tk.heroOverlay }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex flex-1 flex-col items-center px-4 sm:px-6 lg:px-8 text-white">
        <div className="w-full xl:grid xl:grid-cols-[minmax(0,600px)_minmax(240px,1fr)_minmax(240px,1fr)] xl:items-stretch xl:gap-4">
          <div className="animate-fade-in-up mx-auto max-w-3xl text-center xl:text-left xl:flex xl:min-h-[420px] xl:flex-col xl:justify-center xl:self-center xl:items-start">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 border backdrop-blur-md"
              style={{
                background: tk.glassCardBg,
                borderColor: tk.glassPanelBorder,
              }}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: tk.badgeText }} />
              <span className="text-xs font-medium tracking-wide">
                {t("home.hero.badge")}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="block">{t("home.hero.discover")}</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: isBlue
                    ? "linear-gradient(to right, hsl(191 74% 60%), hsl(204 78% 52%), hsl(199 72% 60%))"
                    : "linear-gradient(to right, rgb(185 28 28), rgb(239 68 68), rgb(185 28 28))",
                }}
              >
                {t("home.hero.albania")}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg mb-5 max-w-xl mx-auto xl:mx-0 text-white/85 leading-relaxed">
              {t("home.hero.subheading")}
            </p>

            <div className="mb-3 w-full xl:hidden">
              <HeroInventoryPreview layout="stacked" />
            </div>

            {/* Search Widget */}
            <div className="mb-4 sm:mb-5 w-full">
              <ReservationPickerValue />
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center xl:justify-start items-center">
              <Link to="/properties-map">
                <Button
                  size="sm"
                  className="backdrop-blur-sm px-4 py-4 rounded-full transition-all duration-300 hover:scale-105 group"
                  style={{
                    background: tk.glassCardBg,
                    border: `1px solid ${tk.glassPanelBorder}`,
                    color: tk.textStrongOnMedia,
                  }}
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  {t("home.hero.exploreMap")}
                </Button>
              </Link>
              <Link to="/destinations">
                <Button
                  size="sm"
                  className="backdrop-blur-sm px-4 py-4 rounded-full transition-all duration-300 hover:scale-105 group"
                  style={{
                    background: tk.glassCardBg,
                    border: `1px solid ${tk.glassPanelBorder}`,
                    color: tk.textStrongOnMedia,
                  }}
                >
                  {t("home.hero.exploreDestinations")}
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="px-4 py-4 rounded-full transition-all group"
                style={{ color: tk.textSoftOnMedia, background: "transparent" }}
                onClick={navigateToSearchResults}
              >
                {t("home.hero.browseProperties")}
                <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <HeroInventoryPreview layout="split" side="stays" />
          <HeroInventoryPreview layout="split" side="cars" />
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <button
        onClick={() => scrollToSection("hotels")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer group"
        aria-label="Scroll down"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-white/60 uppercase tracking-widest group-hover:text-white/80 transition-colors">
            Scroll
          </span>
          <ChevronDown className="w-6 h-6 text-white/60 group-hover:text-white/80 transition-colors" />
        </div>
      </button> */}
    </section>
  );
};

export default Hero;
