import { useTheme } from "@/context/ThemeContext";
import { useMemo, useState, useEffect, CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllCars } from "@/services/api/carService";
import { getMonthlyPrices } from "@/services/api/monthlyPriceService";
import { Month, MONTHS } from "@/types/price.type";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ClipLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import { CarCard } from "./CarCard";
import { Button } from "@/components/ui/button";
import { Car, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getHomeThemeTokens } from "./homeTheme";

const animation = { duration: 50000, easing: (t: number) => t };

const getCurrentMonth = (): Month => {
  const monthIndex = new Date().getMonth();
  return MONTHS[monthIndex];
};

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
};

const CarsPreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentMonth = getCurrentMonth();
  const { isDark, isBlue } = useTheme();
  const tk = getHomeThemeTokens({ isDark, isBlue });
  const [carMonthlyPrices, setCarMonthlyPrices] = useState<
    Record<number, number | null>
  >({});

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: getAllCars,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const availableTopCars = useMemo(() => {
    return cars.filter((car) => car.status === "available").slice(0, 8);
  }, [cars]);

  useEffect(() => {
    const fetchMonthlyPrices = async () => {
      if (availableTopCars.length === 0) return;
      const pricesMap: Record<number, number | null> = {};
      await Promise.all(
        availableTopCars.map(async (car) => {
          try {
            const prices = await getMonthlyPrices(car.id, "car");
            const currentMonthPrice = prices.find(
              (p) => p.month === currentMonth,
            );
            pricesMap[car.id] = currentMonthPrice?.pricePerDay ?? null;
          } catch {
            pricesMap[car.id] = null;
          }
        }),
      );
      setCarMonthlyPrices(pricesMap);
    };
    fetchMonthlyPrices();
  }, [availableTopCars, currentMonth]);

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

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tk.badgeIconBg }}>
            <Car className="w-5 h-5" style={{ color: tk.badgeIconText }} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold" style={{ color: tk.textMain }}>
            {t("home.carsPreview.title")}
          </h3>
        </div>
        <p className="leading-relaxed text-sm" style={{ color: tk.textMuted }}>
          {t("home.carsPreview.description")}
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
      ) : availableTopCars.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-10 rounded-2xl border border-dashed" style={{ background: tk.emptyBg, borderColor: tk.emptyBorder }}>
          <Car className="w-10 h-10 mb-3" style={{ color: tk.emptyIcon }} />
          <p style={{ color: tk.emptyText }}>
            {t("home.carsPreview.noCars")}
          </p>
        </div>
      ) : (
        <>
          <div
            ref={sliderRef}
            className="keen-slider flex-grow rounded-2xl overflow-hidden"
          >
            {availableTopCars.map((car, index) => (
              <div
                key={car.id}
                className="keen-slider__slide"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CarCard
                  id={car.id}
                  name={car.name}
                  brand={car.brand}
                  type={car.type}
                  year={car.year}
                  transmission={car.transmission}
                  fuelType={car.fuelType}
                  pricePerDay={car.pricePerDay}
                  currentMonthPrice={carMonthlyPrices[car.id] ?? undefined}
                  status={car.status}
                  plateNumber={car.plateNumber}
                  features={car.features}
                  imageUrls={car.imageUrls}
                  pickUpLocation={car.pickUpLocation}
                  onClick={() => navigate(`/carReservation/${car.id}`)}
                />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Link to="/searchCarResults">
              <Button
                variant="ghost"
                className="group p-0 hover:bg-transparent font-semibold gap-2"
                style={{ color: tk.actionText }}
              >
                {t("home.carsPreview.viewAll")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CarsPreview;