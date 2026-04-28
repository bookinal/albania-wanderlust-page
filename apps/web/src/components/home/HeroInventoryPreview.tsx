import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CarFront, Home, MapPin, Star } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { getAllHotels } from "@/services/api/hotelService";
import { getAllApartments } from "@/services/api/apartmentService";
import { getAllCars } from "@/services/api/carService";
import { getHomeThemeTokens } from "./homeTheme";

type StayPreview = {
  id: number;
  name: string;
  image?: string;
  location?: string;
  price: number;
  rating?: number;
  type: "hotel" | "apartment";
};

type CarPreview = {
  id: number;
  name: string;
  brand: string;
  image?: string;
  type: string;
  seats: number;
  pricePerDay: number;
  pickUpLocation: string;
};

type MixedPreview =
  | (StayPreview & { kind: "stay" })
  | (CarPreview & { kind: "car" });

const panelBase = {
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

interface HeroInventoryPreviewProps {
  layout?: "stacked" | "split";
  side?: "stays" | "cars" | "both";
}

const HeroInventoryPreview = ({
  layout = "stacked",
  side = "both",
}: HeroInventoryPreviewProps) => {
  const { isDark, isBlue } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: hotels = [] } = useQuery({
    queryKey: ["hero-hotels"],
    queryFn: getAllHotels,
    staleTime: 10 * 60 * 1000,
  });

  const { data: apartments = [] } = useQuery({
    queryKey: ["hero-apartments"],
    queryFn: getAllApartments,
    staleTime: 10 * 60 * 1000,
  });

  const { data: cars = [] } = useQuery({
    queryKey: ["hero-cars"],
    queryFn: getAllCars,
    staleTime: 10 * 60 * 1000,
  });

  const stays = useMemo<StayPreview[]>(() => {
    const topHotels = hotels
      .filter((hotel) => hotel.status === "active")
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2)
      .map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        image: hotel.imageUrls?.[0],
        location: hotel.location || hotel.address,
        price: hotel.price,
        rating: hotel.rating,
        type: "hotel" as const,
      }));

    const topApartments = apartments
      .filter((apartment) => apartment.status === "available")
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2)
      .map((apartment) => ({
        id: apartment.id,
        name: apartment.name,
        image: apartment.imageUrls?.[0],
        location: apartment.location || apartment.address,
        price: apartment.price,
        rating: apartment.rating,
        type: "apartment" as const,
      }));

    return [...topHotels, ...topApartments]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [apartments, hotels]);

  const topCars = useMemo<CarPreview[]>(() => {
    return cars
      .filter((car) => car.status === "available")
      .slice(0, 4)
      .map((car) => ({
        id: car.id,
        name: car.name,
        brand: car.brand,
        image: car.imageUrls?.[0],
        type: car.type,
        seats: car.seats,
        pricePerDay: car.pricePerDay,
        pickUpLocation: car.pickUpLocation,
      }));
  }, [cars]);

  const mixedPreview = useMemo<MixedPreview[]>(() => {
    const mixedStays = stays.map((stay) => ({ ...stay, kind: "stay" as const }));
    const mixedCars = topCars.map((car) => ({ ...car, kind: "car" as const }));

    const interleaved: MixedPreview[] = [];
    const maxItems = Math.max(mixedStays.length, mixedCars.length);

    for (let index = 0; index < maxItems; index++) {
      if (mixedStays[index]) {
        interleaved.push(mixedStays[index]);
      }

      if (mixedCars[index]) {
        interleaved.push(mixedCars[index]);
      }
    }

    return interleaved.slice(0, 4);
  }, [stays, topCars]);

  const tk = getHomeThemeTokens({ isDark, isBlue });

  const isStacked = layout === "stacked";

  const staysPanel = (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-[28px] border ${isStacked ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}
      style={{
        ...panelBase,
        background: tk.glassPanelBg,
        borderColor: tk.glassPanelBorder,
        boxShadow: tk.glassPanelShadow,
      }}
    >
          <div className={`flex items-center justify-between gap-4 ${isStacked ? "mb-3" : "mb-4"}`}>
            <div>
              <p
                className={`uppercase tracking-[0.24em] ${isStacked ? "text-[10px]" : "text-[11px]"}`}
                 style={{ color: tk.badgeText }}
              >
                {t("home.hero.staysEyebrow", "Stay Preview")}
              </p>
              <h3
                className={`mt-1 font-semibold ${isStacked ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}
               style={{ color: tk.textStrongOnMedia }}
              >
                {t("home.hero.staysTitle", "Stays for every trip")}
              </h3>
            </div>
            <Link
              to="/searchResults"
              className={`inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-80 ${isStacked ? "text-xs sm:text-sm" : "text-sm"}`}
               style={{ color: tk.textSoftOnMedia }}
            >
              {t("home.hero.viewStays", "View stays")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {stays.map((stay, index) => (
              <button
                key={`${stay.type}-${stay.id}`}
                onClick={() =>
                  navigate(
                    stay.type === "hotel"
                      ? `/hotelReservation/${stay.id}`
                      : `/apartmentReservation/${stay.id}`,
                  )
                }
                className={`group w-full items-center gap-3 overflow-hidden rounded-[20px] border text-left transition-all hover:-translate-y-0.5 ${isStacked && index > 0 ? "hidden sm:flex" : "flex"} ${isStacked ? "p-2.5 sm:p-3" : "p-3"}`}
                style={{
                  background: tk.glassCardBg,
                  borderColor: tk.glassCardBorder,
                }}
              >
                <div
                  className={`${isStacked ? "h-14 w-14 sm:h-16 sm:w-16" : "h-16 w-16"} shrink-0 overflow-hidden rounded-2xl`}
                  style={{ background: tk.thumbBg }}
                >
                  {stay.image ? (
                    <img
                      src={stay.image}
                      alt={stay.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {stay.type === "hotel" ? (
                        <Building2 className="h-7 w-7" style={{ color: tk.textMutedOnMedia }} />
                      ) : (
                        <Home className="h-7 w-7" style={{ color: tk.textMutedOnMedia }} />
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 overflow-hidden">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border uppercase tracking-[0.18em] ${isStacked ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
                      style={{
                        background: tk.brandSoftStrong,
                        borderColor: tk.brandBorder,
                        color: tk.badgeText,
                      }}
                    >
                      {stay.type === "hotel" ? "Hotel" : "Apartment"}
                    </span>
                    {typeof stay.rating === "number" && stay.rating > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: tk.textSoftOnMedia }}>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {stay.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <p className={`truncate font-semibold ${isStacked ? "text-sm" : "text-sm sm:text-base"}`} style={{ color: tk.textStrongOnMedia }}>
                    {stay.name}
                  </p>
                  <p className={`mt-1 flex items-center gap-1 truncate ${isStacked ? "text-[11px] sm:text-sm" : "text-xs sm:text-sm"}`} style={{ color: tk.textMutedOnMedia }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {stay.location || t("home.hero.flexibleStay", "Across Albania")}
                  </p>
                </div>

                <div className="shrink-0 pl-2 text-right">
                  <p className={`font-semibold ${isStacked ? "text-sm sm:text-base" : "text-base sm:text-lg"}`} style={{ color: tk.textStrongOnMedia }}>
                    ${stay.price}
                  </p>
                  <p className="text-xs" style={{ color: tk.textMutedOnMedia }}>
                    {t("home.hero.perNight", "per night")}
                  </p>
                </div>
              </button>
            ))}
          </div>
    </div>
  );

  const carsPanel = (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-[28px] border ${isStacked ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}
      style={{
        ...panelBase,
        background: tk.glassPanelBg,
        borderColor: tk.glassPanelBorder,
        boxShadow: tk.glassPanelShadow,
      }}
    >
          <div className={`flex items-center justify-between gap-4 ${isStacked ? "mb-3" : "mb-4"}`}>
            <div>
              <p
                className={`uppercase tracking-[0.24em] ${isStacked ? "text-[10px]" : "text-[11px]"}`}
                style={{ color: tk.badgeText }}
              >
                {t("home.hero.carsEyebrow", "Drive Preview")}
              </p>
              <h3
                className={`mt-1 font-semibold ${isStacked ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}
               style={{ color: tk.textStrongOnMedia }}
              >
                {t("home.hero.carsTitle", "Cars ready when you land")}
              </h3>
            </div>
            <Link
              to="/searchCarResults"
              className={`inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-80 ${isStacked ? "text-xs sm:text-sm" : "text-sm"}`}
               style={{ color: tk.textSoftOnMedia }}
            >
              {t("home.hero.viewCars", "View cars")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {topCars.map((car, index) => (
              <button
                key={car.id}
                onClick={() => navigate(`/carReservation/${car.id}`)}
                className={`group w-full items-center gap-3 overflow-hidden rounded-[20px] border text-left transition-all hover:-translate-y-0.5 ${isStacked && index > 0 ? "hidden sm:flex" : "flex"} ${isStacked ? "p-2.5 sm:p-3" : "p-3"}`}
                style={{
                  background: tk.glassCardBg,
                  borderColor: tk.glassCardBorder,
                }}
              >
                <div
                  className={`${isStacked ? "h-14 w-14 sm:h-16 sm:w-16" : "h-16 w-16"} shrink-0 overflow-hidden rounded-2xl`}
                  style={{ background: tk.thumbBg }}
                >
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.name}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CarFront className="h-7 w-7" style={{ color: tk.textMutedOnMedia }} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border uppercase tracking-[0.18em] ${isStacked ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
                      style={{
                         background: tk.brandSoftStrong,
                         borderColor: tk.brandBorder,
                         color: tk.badgeText,
                      }}
                    >
                      {car.type}
                    </span>
                  </div>

                  <p className={`truncate font-semibold ${isStacked ? "text-sm" : "text-sm sm:text-base"}`} style={{ color: tk.textStrongOnMedia }}>
                    {car.brand} {car.name}
                  </p>
                  <p className={`mt-1 truncate ${isStacked ? "text-[11px] sm:text-sm" : "text-xs sm:text-sm"}`} style={{ color: tk.textMutedOnMedia }}>
                    {car.seats} {t("home.hero.seats", "seats")} - {car.pickUpLocation}
                  </p>
                </div>

                <div className="shrink-0 pl-2 text-right">
                  <p className={`font-semibold ${isStacked ? "text-sm sm:text-base" : "text-base sm:text-lg"}`} style={{ color: tk.textStrongOnMedia }}>
                    ${car.pricePerDay}
                  </p>
                  <p className="text-xs" style={{ color: tk.textMutedOnMedia }}>
                    {t("home.hero.perDay", "per day")}
                  </p>
                </div>
              </button>
            ))}
          </div>
    </div>
  );

  if (layout === "split") {
    if (side === "stays") {
      return <div className="hidden h-full xl:flex">{staysPanel}</div>;
    }

    if (side === "cars") {
      return <div className="hidden h-full xl:flex">{carsPanel}</div>;
    }

    return (
      <>
        <div className="hidden h-full xl:flex">{staysPanel}</div>
        <div className="hidden h-full xl:flex">{carsPanel}</div>
        <div className="mt-4 sm:mt-8 w-full xl:hidden">
          <div className="grid gap-4 lg:grid-cols-2">
            {staysPanel}
            {carsPanel}
          </div>
        </div>
      </>
    );
  }

  if (layout === "stacked") {
    return (
      <div className="mt-4 w-full max-w-6xl mx-auto xl:hidden">
        <div className="mb-2 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: tk.badgeText }}>
              {t("home.hero.inventoryEyebrow", "Stays and Cars")}
            </p>
            <h3 className="mt-1 text-base font-semibold" style={{ color: tk.textStrongOnMedia }}>
              {t("home.hero.inventoryTitle", "Browse what you can book")}
            </h3>
          </div>
          <div className="text-[11px] font-medium" style={{ color: tk.textSoftOnMedia }}>
            {t("home.hero.swipeHint", "Swipe")}
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 snap-x snap-mandatory">
            {mixedPreview.map((item) => {
              const isStay = item.kind === "stay";
              const href = isStay
                ? item.type === "hotel"
                  ? `/hotelReservation/${item.id}`
                  : `/apartmentReservation/${item.id}`
                : `/carReservation/${item.id}`;

              return (
                <button
                  key={`${item.kind}-${item.id}`}
                  onClick={() => navigate(href)}
                  className="group snap-start flex min-h-[106px] w-[252px] shrink-0 items-center gap-3 overflow-hidden rounded-[22px] border p-2.5 text-left transition-all"
                  style={{
                    ...panelBase,
                    background: tk.glassPanelBg,
                    borderColor: tk.glassPanelBorder,
                    boxShadow: tk.glassPanelShadow,
                  }}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl" style={{ background: tk.thumbBg }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={isStay ? item.name : `${item.brand} ${item.name}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {isStay ? (
                          item.type === "hotel" ? (
                            <Building2 className="h-6 w-6" style={{ color: tk.textMutedOnMedia }} />
                          ) : (
                            <Home className="h-6 w-6" style={{ color: tk.textMutedOnMedia }} />
                          )
                        ) : (
                          <CarFront className="h-6 w-6" style={{ color: tk.textMutedOnMedia }} />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2 overflow-hidden">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                        style={{
                          background: tk.brandSoftStrong,
                          borderColor: tk.brandBorder,
                          color: tk.badgeText,
                        }}
                      >
                        {isStay ? (item.type === "hotel" ? "Hotel" : "Apartment") : item.type}
                      </span>
                      {isStay && typeof item.rating === "number" && item.rating > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: tk.textSoftOnMedia }}>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <p className="truncate text-sm font-semibold" style={{ color: tk.textStrongOnMedia }}>
                      {isStay ? item.name : `${item.brand} ${item.name}`}
                    </p>
                    <p className="mt-1 truncate text-[11px]" style={{ color: tk.textMutedOnMedia }}>
                      {isStay
                        ? item.location || t("home.hero.flexibleStay", "Across Albania")
                        : `${item.seats} ${t("home.hero.seats", "seats")} - ${item.pickUpLocation}`}
                    </p>
                  </div>

                  <div className="shrink-0 pl-2 text-right">
                    <p className="text-sm font-semibold" style={{ color: tk.textStrongOnMedia }}>
                      ${isStay ? item.price : item.pricePerDay}
                    </p>
                    <p className="text-[11px]" style={{ color: tk.textMutedOnMedia }}>
                      {isStay
                        ? t("home.hero.perNight", "per night")
                        : t("home.hero.perDay", "per day")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-8 lg:mt-14 w-full max-w-6xl mx-auto">
      <div className="grid gap-4 lg:grid-cols-2">
        {side !== "cars" && staysPanel}
        {side !== "stays" && carsPanel}
      </div>
    </div>
  );
};

export default HeroInventoryPreview;
