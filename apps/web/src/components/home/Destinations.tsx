import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Destination } from "@/types/destination.types";
import { getAllDestinations } from "@/services/api/destinationService";
import { addDestinationToCurrentUserWishlist } from "@/services/api/destinationService";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserWishlist } from "@/services/api/destinationService";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/useLocalized";

const Destinations = () => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(
    null,
  );
  const { toast } = useToast();

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        const data = await getAllDestinations();
        setDestinations(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Failed to load destinations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const wishlist = await getCurrentUserWishlist();
        // Handle the wishlist data as needed
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (isLoading || destinations.length === 0) return;

    const loadGSAP = async () => {
      const { default: gsap } = await import("gsap");
      const { default: ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      // Heading animation with parallax effect
      gsap.fromTo(
        headingRef.current,
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Cards stagger animation with advanced effects
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const image = card.querySelector(".destination-image");
        const overlay = card.querySelector(".destination-overlay");
        const tag = card.querySelector(".destination-tag");
        const content = card.querySelector(".destination-content");

        // Main card animation
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 100,
            rotateX: 15,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1,
            delay: index * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );

        // Image zoom on scroll
        gsap.fromTo(
          image,
          { scale: 1.3 },
          {
            scale: 1,
            duration: 1.2,
            delay: index * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );

        // Overlay fade in
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            delay: index * 0.15 + 0.3,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );

        // Tag slide in
        gsap.fromTo(
          tag,
          { x: 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.15 + 0.4,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );

        // Content fade up
        gsap.fromTo(
          content,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.15 + 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );

        // Hover animations
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -12,
            scale: 1.02,
            duration: 0.4,
            ease: "power2.out",
          });
          gsap.to(image, {
            scale: 1.15,
            duration: 0.6,
            ease: "power2.out",
          });
          gsap.to(overlay, {
            opacity: 0.95,
            duration: 0.3,
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          });
          gsap.to(image, {
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });
          gsap.to(overlay, {
            opacity: 1,
            duration: 0.3,
          });
        });
      });

      // Parallax effect for the section
      gsap.to(sectionRef.current, {
        yPercent: -5,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    };

    loadGSAP();
  }, [isLoading, destinations]);

  const handleAddToWishlist = async (destinationId: string) => {
    try {
      setWishlistLoadingId(destinationId);
      await addDestinationToCurrentUserWishlist(destinationId);
      toast({
        title: t("common.success"),
        description: t("home.destinations.addedToWishlist"),
      });
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      if (err.code == 23505) {
        toast({
          title: t("common.warning"),
          description: t("home.destinations.alreadyInWishlist"),
        });
      } else {
        toast({
          title: t("common.warning"),
          description: t("home.destinations.loginToAddWishlist"),
        });
      }
    } finally {
      setWishlistLoadingId(null);
    }
  };

  return (
    <section
      id="destinations"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-muted via-muted to-muted relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2
            ref={headingRef}
            className="mb-4 text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
          >
            {t("home.destinations.title")}
          </h2>
          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t("home.destinations.description")}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <p className="text-destructive text-lg">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {/* Destinations Grid */}
        {!isLoading && !error && destinations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <Card
                key={destination.id}
                ref={(el) => (cardsRef.current[index] = el)}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={destination.imageUrls[0] || "/images/placeholder.png"}
                    alt={localize(destination.name)}
                    className="destination-image w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.png";
                    }}
                  />
                  <div className="destination-tag absolute top-4 right-4 z-20">
                    <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
                      {destination.category}
                    </span>
                  </div>
                  <div className="destination-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                <CardContent className="destination-content p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {localize(destination.name)}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {localize(destination.description)}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:border-primary font-semibold"
                      onClick={() => navigate(`/destination/${destination.id}`)}
                    >
                      <span>{t("common.learnMore")}</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleAddToWishlist(destination.id)}
                      disabled={wishlistLoadingId === destination.id}
                      className="border border-primary/30 hover:bg-primary/10"
                    >
                      {wishlistLoadingId === destination.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart className="w-5 h-5 text-primary" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && destinations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {t("home.destinations.noDestinations")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Destinations;
