import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import slide1 from "@/assets/home/slide1.jpg";
import slide2 from "@/assets/home/slide2.jpg";
import slide3 from "@/assets/home/slide3.jpg";
import ReservationPickerValue from "./reservationPicker";
import HeroInventoryPreview from "./HeroInventoryPreview";
import { Link } from "react-router";
import { Slide } from "react-slideshow-image";
import { useTranslation } from "react-i18next";
import "react-slideshow-image/dist/styles.css";

const Hero = () => {
  const { t } = useTranslation();
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex flex-1 flex-col items-center px-4 sm:px-6 lg:px-8 text-white">
        <div className="w-full xl:grid xl:grid-cols-[minmax(280px,1fr)_minmax(0,720px)_minmax(280px,1fr)] xl:items-stretch xl:gap-6">
          <HeroInventoryPreview layout="split" side="stays" />

          <div className="animate-fade-in-up mx-auto max-w-4xl text-center xl:flex xl:min-h-[540px] xl:flex-col xl:justify-center xl:self-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
            <MapPin className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium tracking-wide">
              {t("home.hero.badge")}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block">{t("home.hero.discover")}</span>
            <span className="block bg-gradient-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent">
              {t("home.hero.albania")}
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/85 leading-relaxed">
            {t("home.hero.subheading")}
          </p>

          <div className="mb-4 w-full xl:hidden">
            <HeroInventoryPreview layout="stacked" />
          </div>

          {/* Search Widget */}
          <div className="mb-6 sm:mb-8">
            <ReservationPickerValue />
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/properties-map">
              <Button
                size="lg"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-slate-900 px-6 py-5 rounded-full transition-all duration-300 hover:scale-105 group"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t("home.hero.exploreMap")}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              className="text-white/90 hover:text-white hover:bg-white/10 px-6 py-5 rounded-full transition-all group"
              onClick={() => scrollToSection("hotels")}
            >
              {t("home.hero.browseProperties")}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          </div>

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
