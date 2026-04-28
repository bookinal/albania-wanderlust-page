import { useTheme } from "@/context/ThemeContext";
import { useMemo, CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllHotels } from "@/services/api/hotelService";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ClipLoader } from "react-spinners";
import { useNavigate, Link } from "react-router-dom";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getHomeThemeTokens } from "./homeTheme";

const animation = { duration: 50000, easing: (t: number) => t };

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
};

const HotelsPreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });

  const [sliderRef] = useKeenSlider({
    loop: true,
    renderMode: "performance",
    drag: true,
    slides: {
      perView: 1.1,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 1.3, spacing: 20 },
      },
    },
    created(s) {
      s.moveToIdx(5, true, animation);
    },
    updated(s) {
      if (s.track.details) {
        s.moveToIdx(s.track.details.abs + 5, true, animation);
      }
    },
    animationEnded(s) {
      s.moveToIdx(s.track.details.abs + 5, true, animation);
    },
  });

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["hotels"],
    queryFn: getAllHotels,
  });

  const availableTopHotels = useMemo(() => {
    return hotels
      .filter((hotel) => hotel.rating > 0 && hotel.status === "active")
      .sort((a, b) => b.rating - a.rating);
  }, [hotels]);

  const handlePropertyClick = (hotelId: string | number) => {
    navigate(`/hotelReservation/${hotelId}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tk.badgeIconBg }}>
            <Building2 className="w-5 h-5" style={{ color: tk.badgeIconText }} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold" style={{ color: tk.textMain }}>
            {t("home.hotelsPreview.title")}
          </h3>
        </div>
        <p className="leading-relaxed text-sm" style={{ color: tk.textMuted }}>
          {t("home.hotelsPreview.description")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center py-12">
          <ClipLoader
            color={tk.loader}
            loading={isLoading}
            cssOverride={override}
            size={45}
          />
        </div>
      ) : availableTopHotels.length === 0 ? (
<div className="flex-grow flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed" style={{ background: tk.emptyBg, borderColor: tk.emptyBorder }}>
          <Building2 className="w-10 h-10 mb-3" style={{ color: tk.emptyIcon }} />
          <p style={{ color: tk.emptyText }}>{t("home.hotelsPreview.noHotels")}</p>
        </div>
      ) : (
        <>
          <div
            ref={sliderRef}
            className="keen-slider flex-grow rounded-2xl overflow-hidden"
          >
            {availableTopHotels.map((hotel, index) => (
              <div
                key={hotel.id}
                className="keen-slider__slide"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyCard
                  id={hotel.id}
                  name={hotel.name}
                  image={hotel.imageUrls?.[0]}
                  rating={hotel.rating}
                  price={hotel.price}
                  location={hotel.location}
                  address={hotel.address}
                  rooms={hotel.rooms || 0}
                  amenities={hotel.amenities || []}
                  status={hotel.status}
                  propertyType="hotel"
                  onClick={handlePropertyClick}
                />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Link to="/searchResults">
              <Button
                variant="ghost"
                className="group p-0 hover:bg-transparent font-semibold gap-2"
                style={{ color: tk.actionText }}
              >
                {t("home.hotelsPreview.viewAll")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default HotelsPreview;
