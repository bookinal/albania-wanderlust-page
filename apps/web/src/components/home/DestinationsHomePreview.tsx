import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { addDestinationToCurrentUserWishlist, getCurrentUserWishlist } from "@/services/api/destinationService";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "./homeTheme";
import { useDestinations } from "@/hooks/useDestinations";
import { DestinationCard } from "@/pages/home/Destinations/DestinationCard";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Button } from "@/components/ui/button";

const animation = { duration: 50000, easing: (t: number) => t };

const DESTINATION_CATEGORIES = [
  { label: "Destinations", slug: "destinations" },
  { label: "Eat, drink & dance", slug: "eat-drink-dance" },
  { label: "History & culture", slug: "history-culture" },
  { label: "Experiences", slug: "experiences" },
];

const DestinationsHomePreview = () => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const { toast } = useToast();

  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(null);

  const { data: destinations = [], isLoading } = useDestinations();

  const grouped = useMemo(() => {
    const groups: Record<string, typeof destinations> = {};
    for (const cat of DESTINATION_CATEGORIES) {
      groups[cat.label] = destinations.filter(
        (d) => d.category?.toLowerCase() === cat.label.toLowerCase(),
      );
    }
    return groups;
  }, [destinations]);

  const tk = {
    sectionBg: isDark ? "#0a0a0c" : isBlue ? "hsl(205 55% 96%)" : "#f8fafc",
    textMain: homeTk.textMain,
    textMuted: homeTk.textMuted,
    brand: homeTk.brand,
    brandSoft: homeTk.brandSoft,
    panelBg: isDark
      ? "rgba(20,20,23,0.92)"
      : isBlue
        ? "rgba(255,255,255,0.86)"
        : "rgba(255,255,255,0.96)",
    panelBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.16)"
        : "rgba(15,23,42,0.08)",
    panelShadow: isDark
      ? "0 20px 50px rgba(0,0,0,0.35)"
      : isBlue
        ? "0 18px 40px rgba(3,37,65,0.12)"
        : "0 18px 40px rgba(15,23,42,0.08)",
    heroGradient: isDark
      ? "linear-gradient(135deg, rgba(17,17,21,0.92), rgba(40,40,48,0.72), rgba(17,17,21,0.92))"
      : isBlue
        ? "linear-gradient(135deg, rgba(8,47,73,0.94), rgba(3,105,161,0.76), rgba(56,189,248,0.34))"
        : "linear-gradient(135deg, rgba(232,25,44,0.88), rgba(127,29,29,0.72), rgba(17,17,21,0.5))",
    buttonGhostBg: isDark
      ? "rgba(255,255,255,0.05)"
      : isBlue
        ? "rgba(255,255,255,0.74)"
        : "rgba(255,255,255,0.8)",
    buttonGhostBorder: isDark
      ? "rgba(255,255,255,0.12)"
      : isBlue
        ? "rgba(2,132,199,0.18)"
        : "rgba(15,23,42,0.08)",
  };

  const cardTk = {
    panelBg: tk.panelBg,
    panelBorder: tk.panelBorder,
    panelShadow: tk.panelShadow,
    heroGradient: tk.heroGradient,
    textMain: tk.textMain,
    textMuted: tk.textMuted,
    brand: tk.brand,
    buttonGhostBg: tk.buttonGhostBg,
    buttonGhostBorder: tk.buttonGhostBorder,
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        await getCurrentUserWishlist();
      } catch (_err) {}
    };
    fetchWishlist();
  }, []);

  const handleAddToWishlist = async (destinationId: string) => {
    try {
      setWishlistLoadingId(destinationId);
      await addDestinationToCurrentUserWishlist(destinationId);
      toast({
        title: t("common.success"),
        description: t("home.destinations.addedToWishlist"),
      });
    } catch (err: any) {
      console.error("Failed to add to wishlist:", err);
      toast({
        title: err?.code === 23505 ? t("common.warning") : t("common.error"),
        description:
          err?.code === 23505
            ? t("home.destinations.alreadyInWishlist")
            : t("home.destinations.loginToAddWishlist"),
        variant: err?.code === 23505 ? "default" : "destructive",
      });
    } finally {
      setWishlistLoadingId(null);
    }
  };

  return (
    <section
      id="destinations"
      className="py-24 transition-colors duration-300"
      style={{ background: tk.sectionBg }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-5 mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div
              className="text-[11px] font-bold uppercase tracking-[0.25em] mb-3"
              style={{ color: tk.brand }}
            >
              {t("common.destinations")}
            </div>
            <h2
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ color: tk.textMain }}
            >
              {t("home.destinations.title")}
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: tk.textMuted }}
            >
              {t("home.destinations.description")}
            </p>
          </div>

          <Button
            variant="ghost"
            className="group p-0 hover:bg-transparent font-semibold gap-2"
            style={{ color: tk.brand }}
            asChild
          >
            <Link to="/destinations">
              {t("home.destinations.seeAllDestinations")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: tk.brand }}
            />
          </div>
        )}

        {!isLoading && destinations.length === 0 && (
          <p className="text-center py-20" style={{ color: tk.textMuted }}>
            {t("home.destinations.noDestinations")}
          </p>
        )}

        {!isLoading &&
          DESTINATION_CATEGORIES.map((cat) => {
            const items = grouped[cat.label];
            if (!items || items.length === 0) return null;
            return <CategoryRow key={cat.label} category={cat.label} destinations={items} cardTk={cardTk} wishlistLoadingId={wishlistLoadingId} onAddToWishlist={handleAddToWishlist} />;
          })}
      </div>
    </section>
  );
};

const CategoryRow = ({
  category,
  destinations,
  cardTk,
  wishlistLoadingId,
  onAddToWishlist,
}: {
  category: string;
  destinations: any[];
  cardTk: any;
  wishlistLoadingId: string | null;
  onAddToWishlist: (id: string) => Promise<void>;
}) => {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
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
      "(min-width: 1024px)": {
        slides: { perView: 2.2, spacing: 24 },
      },
      "(min-width: 1280px)": {
        slides: { perView: 3.2, spacing: 24 },
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
    <div className="mb-10 last:mb-0">
      <h3
        className="text-xl md:text-2xl font-bold mb-4"
        style={{ color: cardTk.textMain }}
      >
        {category}
      </h3>
      <div ref={sliderRef} className="keen-slider rounded-2xl overflow-hidden">
        {destinations.map((destination, index) => (
          <div
            key={destination.id}
            className="keen-slider__slide"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <DestinationCard
              destination={destination}
              tk={cardTk}
              onAddToWishlist={onAddToWishlist}
              isLoadingWishlist={wishlistLoadingId === destination.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationsHomePreview;