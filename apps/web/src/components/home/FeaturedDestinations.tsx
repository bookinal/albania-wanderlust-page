import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { addDestinationToCurrentUserWishlist } from "@albania/api-client";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useFeaturedDestinations } from "@/hooks/useDestinations";
import { DestinationCard } from "@/pages/home/Destinations/DestinationCard";
import { getHomeThemeTokens } from "./homeTheme";

/** Time on each card before the phone carousel moves on */
const AUTO_SLIDE_INTERVAL_MS = 4000;
/** Quiet time after a touch or swipe before it starts moving again */
const AUTO_SLIDE_RESUME_MS = 6000;

/** "Picked for you": the destinations the admin featured from the dashboard. */
const FeaturedDestinations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isDark, isBlue } = useTheme();
  const homeTk = getHomeThemeTokens({ isDark, isBlue });
  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(
    null,
  );
  const { data: destinations = [], isLoading } = useFeaturedDestinations();
  const rowRef = useRef<HTMLDivElement>(null);

  // Phones: slowly move to the next card, back to the first after the last.
  // Stops while the visitor touches the row and starts again a bit later.
  useEffect(() => {
    const row = rowRef.current;
    if (!row || destinations.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pausedUntil = 0;
    const pause = () => {
      pausedUntil = Date.now() + AUTO_SLIDE_RESUME_MS;
    };

    const timer = window.setInterval(() => {
      // Grid layout (tablet/desktop) or the visitor is using it: do nothing
      if (row.scrollWidth <= row.clientWidth || Date.now() < pausedUntil) return;
      const first = row.children[0] as HTMLElement | undefined;
      if (!first) return;
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
      row.scrollTo({
        left: atEnd ? 0 : row.scrollLeft + first.offsetWidth + gap,
        behavior: "smooth",
      });
    }, AUTO_SLIDE_INTERVAL_MS);

    const events = ["pointerdown", "touchstart", "wheel"] as const;
    events.forEach((e) => row.addEventListener(e, pause, { passive: true }));
    return () => {
      window.clearInterval(timer);
      events.forEach((e) => row.removeEventListener(e, pause));
    };
  }, [destinations.length]);

  const tk = {
    sectionBg: homeTk.sectionMain,
    textMain: homeTk.textMain,
    textMuted: homeTk.textMuted,
    brand: homeTk.brand,
    badgeBg: homeTk.badgeBg,
    badgeText: homeTk.badgeText,
    heroGradient: "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
    panelBg: isDark
      ? "rgba(20,20,23,0.92)"
      : isBlue
        ? "rgba(255,255,255,0.88)"
        : "rgba(255,255,255,0.98)",
    panelBorder: isDark
      ? "rgba(255,255,255,0.08)"
      : isBlue
        ? "rgba(2,132,199,0.14)"
        : "rgba(15,23,42,0.08)",
    panelShadow: isDark
      ? "0 20px 50px rgba(0,0,0,0.35)"
      : isBlue
        ? "0 18px 40px rgba(3,37,65,0.12)"
        : "0 18px 40px rgba(15,23,42,0.08)",
    buttonGhostBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.82)",
    buttonGhostBorder: isDark
      ? "rgba(255,255,255,0.12)"
      : "rgba(15,23,42,0.08)",
  };

  // Nothing picked yet: keep the home page as it was
  if (!isLoading && destinations.length === 0) return null;

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
        title: err?.code === "23505" ? t("common.warning") : t("common.error"),
        description:
          err?.code === "23505"
            ? t("home.destinations.alreadyInWishlist")
            : t("home.destinations.loginToAddWishlist"),
        variant: err?.code === "23505" ? "default" : "destructive",
      });
    } finally {
      setWishlistLoadingId(null);
    }
  };

  return (
    <section
      id="picked-for-you"
      className="py-16 md:py-20 transition-colors duration-300"
      style={{ background: tk.sectionBg }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-10">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase mb-4"
            style={{
              background: tk.badgeBg,
              color: tk.badgeText,
              letterSpacing: "0.1em",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("home.featured.badge")}
          </span>
          <h2
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ color: tk.textMain }}
          >
            {t("home.featured.title")}
          </h2>
        </div>

        {/* Phones: one swipeable row that snaps card by card, the next card peeking in.
            From sm up: a regular grid. */}
        <div
          ref={rowRef}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4"
          style={{ gap: "1.25rem", scrollbarWidth: "none" }}
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="w-[82%] flex-shrink-0 snap-start animate-pulse sm:w-auto"
                  style={{
                    height: "26rem",
                    borderRadius: "1.5rem",
                    background: tk.panelBg,
                    border: `1px solid ${tk.panelBorder}`,
                  }}
                />
              ))
            : destinations.map((destination) => (
                <div
                  key={destination.id}
                  // grid: the card fills the slot, so all cards share the row height
                  className="grid w-[82%] flex-shrink-0 snap-start sm:w-auto"
                >
                  <DestinationCard
                    destination={destination}
                    tk={tk}
                    onAddToWishlist={handleAddToWishlist}
                    isLoadingWishlist={wishlistLoadingId === destination.id}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
