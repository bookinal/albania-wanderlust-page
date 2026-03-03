import { useMemo, CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllApartments } from "@/services/api/apartmentService";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ClipLoader } from "react-spinners";
import { useNavigate, Link } from "react-router-dom";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const animation = { duration: 50000, easing: (t: number) => t };

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
};

const ApartmentsPreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ["apartments"],
    queryFn: getAllApartments,
  });

  const availableTopApartments = useMemo(() => {
    return apartments
      .filter(
        (apartment) => apartment.rating > 0 && apartment.status === "available",
      )
      .sort((a, b) => b.rating - a.rating);
  }, [apartments]);

  const handlePropertyClick = (apartmentId: string | number) => {
    navigate(`/apartmentReservation/${apartmentId}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Home className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
            {t("home.apartmentsPreview.title")}
          </h3>
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {t("home.apartmentsPreview.description")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center py-12">
          <ClipLoader
            color="#dc2626"
            loading={isLoading}
            cssOverride={override}
            size={45}
          />
        </div>
      ) : availableTopApartments.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Home className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-muted-foreground">
            {t("home.apartmentsPreview.noApartments")}
          </p>
        </div>
      ) : (
        <>
          <div
            ref={sliderRef}
            className="keen-slider flex-grow rounded-2xl overflow-hidden"
          >
            {availableTopApartments.map((apartment, index) => (
              <div
                key={apartment.id}
                className="keen-slider__slide"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyCard
                  id={apartment.id}
                  name={apartment.name}
                  image={apartment.imageUrls[0]}
                  rating={apartment.rating}
                  price={apartment.price}
                  location={apartment.location}
                  address={apartment.address}
                  rooms={apartment.rooms || 0}
                  amenities={apartment.amenities || []}
                  status={apartment.status}
                  propertyType="apartment"
                  onClick={handlePropertyClick}
                />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Link to="/searchResults">
              <Button
                variant="ghost"
                className="group p-0 hover:bg-transparent text-red-600 font-semibold gap-2"
              >
                {t("home.apartmentsPreview.viewAll")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ApartmentsPreview;
