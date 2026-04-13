import { useTheme } from "@/context/ThemeContext";
import { useMemo, useState, useEffect, CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllCars } from "@/services/api/carService";
import { getMonthlyPrices } from "@/services/api/monthlyPriceService";
import { Month, MONTHS } from "@/types/price.type";
import { ClipLoader } from "react-spinners";
import { useNavigate, Link } from "react-router-dom";
import { CarCard } from "./CarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car } from "lucide-react";
import { useTranslation } from "react-i18next";

// Helper to get current month as Month type
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
  const { isDark } = useTheme();
  const [carMonthlyPrices, setCarMonthlyPrices] = useState<
    Record<number, number | null>
  >({});

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: getAllCars,
    // Cache cars data for 10 minutes before refetching
    staleTime: 10 * 60 * 1000,
    // Keep data in cache for 15 minutes even when unused
    gcTime: 15 * 60 * 1000,
    // Refetch when window regains focus for fresh car availability
    refetchOnWindowFocus: true,
  });

  const availableTopCars = useMemo(() => {
    return cars.filter((car) => car.status === "available").slice(0, 4);
  }, [cars]);

  // Fetch monthly prices for displayed cars
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
          } catch (err) {
            console.error(
              `Error fetching monthly prices for car ${car.id}:`,
              err,
            );
            pricesMap[car.id] = null;
          }
        }),
      );
      setCarMonthlyPrices(pricesMap);
    };

    fetchMonthlyPrices();
  }, [availableTopCars, currentMonth]);

  const handleCarClick = (carId: number) => {
    navigate(`/carReservation/${carId}`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Section Header */}
      <div className="text-center mb-8 md:mb-10 animate-fade-in">
        <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 font-semibold tracking-wider uppercase text-xs rounded-full mb-3">
          {t("home.carsPreview.chip")}
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
          {t("home.carsPreview.title")}
        </h2>
        <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'hsl(var(--muted-foreground))' }}>
          {t("home.carsPreview.description")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <ClipLoader
            color="#dc2626"
            loading={isLoading}
            cssOverride={override}
            size={50}
          />
        </div>
      ) : availableTopCars.length === 0 ? (
<div className="flex flex-col items-center justify-center p-10 rounded-2xl border border-dashed" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
          <Car className="w-10 h-10 mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }} />
          <p className="text-base" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'hsl(var(--muted-foreground))' }}>
            {t("home.carsPreview.noCars")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {availableTopCars.map((car, index) => (
              <div
                key={car.id}
                className="animate-fade-in-up"
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
                  seats={car.seats}
                  mileage={car.mileage}
                  pricePerDay={car.pricePerDay}
                  currentMonthPrice={carMonthlyPrices[car.id] ?? undefined}
                  status={car.status}
                  color={car.color}
                  plateNumber={car.plateNumber}
                  features={car.features}
                  imageUrls={car.imageUrls}
                  pickUpLocation={car.pickUpLocation}
                  onClick={handleCarClick}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/searchCarResults">
              <Button
                size="lg"
                className="px-6 py-3 bg-foreground text-background rounded-full font-semibold hover:bg-foreground/90 transition inline-block text-center"
              >
                {t("home.carsPreview.viewAll")}
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CarsPreview;
