import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import slide1 from "@/assets/home/s1.jpeg";
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
    <section className="relative flex items-start justify-center overflow-hidden pt-3 sm:pt-2 lg:pt-2 pb-4 sm:pb-6">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide1}
          className="w-full h-full object-cover"
          alt={t("common.albania", "Albania")}
        />
        <div
          className="absolute inset-0"
          style={{ background: tk.heroOverlay }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex flex-1 flex-col items-center px-3 sm:px-5 lg:px-6 text-white">
        <div className="w-full xl:grid xl:grid-cols-[minmax(0,520px)_minmax(200px,1fr)_minmax(200px,1fr)] xl:items-stretch xl:gap-3">
          <div className="animate-fade-in-up mx-auto max-w-2xl text-center xl:text-left xl:flex xl:min-h-[340px] xl:flex-col xl:justify-center xl:self-center xl:items-start">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full mb-2.5 border backdrop-blur-md"
              style={{
                background: tk.glassCardBg,
                borderColor: tk.glassPanelBorder,
              }}
            >
              <MapPin className="w-3 h-3" style={{ color: tk.badgeText }} />
              <span className="text-[10px] sm:text-xs font-medium tracking-wide">
                {t("home.hero.badge")}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
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
            <p className="text-xs sm:text-sm md:text-base mb-3.5 max-w-lg mx-auto xl:mx-0 text-white/85 leading-relaxed">
              {t("home.hero.subheading")}
            </p>

            <div className="mb-2.5 w-full xl:hidden scale-90 origin-top">
              <HeroInventoryPreview layout="stacked" />
            </div>

            {/* Search Widget */}
            <div className="mb-3 w-full scale-90 sm:scale-85 origin-center xl:origin-left -my-1 sm:-my-2">
              <ReservationPickerValue />
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-1.5 justify-center xl:justify-start items-center">
              <Link to="/properties-map">
                <Button
                  size="sm"
                  className="backdrop-blur-sm px-3 py-2 text-xs rounded-full transition-all duration-300 hover:scale-105 group h-auto"
                  style={{
                    background: tk.glassCardBg,
                    border: `1px solid ${tk.glassPanelBorder}`,
                    color: tk.textStrongOnMedia,
                  }}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {t("home.hero.exploreMap")}
                </Button>
              </Link>
              <Link to="/destinations">
                <Button
                  size="sm"
                  className="backdrop-blur-sm px-3 py-2 text-xs rounded-full transition-all duration-300 hover:scale-105 group h-auto"
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
                className="px-3 py-2 text-xs rounded-full transition-all group h-auto"
                style={{ color: tk.textSoftOnMedia, background: "transparent" }}
                onClick={navigateToSearchResults}
              >
                {t("home.hero.browseProperties")}
                <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="hidden h-full xl:flex scale-85 origin-top-left">
            <HeroInventoryPreview layout="split" side="stays" />
          </div>
          <div className="hidden h-full xl:flex scale-85 origin-top-left">
            <HeroInventoryPreview layout="split" side="cars" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <button
        onClick={() => scrollToSection("hotels")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer group"
        aria-label={t("common.scrollDown", "Scroll down")}
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
