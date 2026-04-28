import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import slide1 from "@/assets/home/slide1.jpg";
import slide2 from "@/assets/home/slide2.jpg";
import slide3 from "@/assets/home/slide3.jpg";
import ReservationPickerValue from "./reservationPicker";
import HeroInventoryPreview from "./HeroInventoryPreview";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "./homeTheme";
import { Link } from "react-router";
import { Slide } from "react-slideshow-image";
import { useTranslation } from "react-i18next";
import "react-slideshow-image/dist/styles.css";

const Hero = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const slideImages = [
    {
      image: slide1,
    },
    {
      image: slide2,
    },
    {
      image: slide3,
    },
  ];

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-24 sm:pt-12 lg:pt-12">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Slide
          duration={4000}
          transitionDuration={1000}
          arrows={false}
          pauseOnHover={false}
        >
          {slideImages.map((slideImage, index) => (
            <div key={index} className="w-full h-screen">
              <img
                src={slideImage.image}
                className="w-full h-full object-cover"
                alt={`Albania slide ${index + 1}`}
              />
            </div>
          ))}
        </Slide>
        <div className="absolute inset-0" style={{ background: tk.heroOverlay }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex flex-1 flex-col items-center px-4 sm:px-6 lg:px-8 text-white">
        <div className="w-full xl:grid xl:grid-cols-[minmax(0,720px)_minmax(280px,1fr)_minmax(280px,1fr)] xl:items-stretch xl:gap-6">
          
          <div className="animate-fade-in-up mx-auto max-w-4xl text-center xl:text-left xl:flex xl:min-h-[540px] xl:flex-col xl:justify-center xl:self-center xl:items-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border backdrop-blur-md" style={{ background: tk.glassCardBg, borderColor: tk.glassPanelBorder }}>
            <MapPin className="w-4 h-4" style={{ color: tk.badgeText }} />
            <span className="text-sm font-medium tracking-wide">
              {t("home.hero.badge")}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block">{t("home.hero.discover")}</span>
            <span className="block bg-clip-text text-transparent" style={{ backgroundImage: isBlue ? "linear-gradient(to right, hsl(191 74% 60%), hsl(204 78% 52%), hsl(199 72% 60%))" : "linear-gradient(to right, rgb(185 28 28), rgb(239 68 68), rgb(185 28 28))" }}>
              {t("home.hero.albania")}
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto xl:mx-0 text-white/85 leading-relaxed">
            {t("home.hero.subheading")}
          </p>

          <div className="mb-4 w-full xl:hidden">
            <HeroInventoryPreview layout="stacked" />
          </div>

          {/* Search Widget */}
          <div className="mb-6 sm:mb-8 w-full">
            <ReservationPickerValue />
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center xl:justify-start items-center">
            <Link to="/properties-map">
              <Button
                size="lg"
                className="backdrop-blur-sm px-6 py-5 rounded-full transition-all duration-300 hover:scale-105 group"
                style={{ background: tk.glassCardBg, border: `1px solid ${tk.glassPanelBorder}`, color: tk.textStrongOnMedia }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t("home.hero.exploreMap")}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              className="px-6 py-5 rounded-full transition-all group"
              style={{ color: tk.textSoftOnMedia, background: "transparent" }}
              onClick={() => scrollToSection("hotels")}
            >
              {t("home.hero.browseProperties")}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
