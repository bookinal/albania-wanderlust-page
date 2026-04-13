import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Music } from "lucide-react";
import foodImage from "@/assets/food/albanian-food.jpg";
import cultureImage from "@/assets/culture/albanian-culture.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Culture = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <section id="culture" className="py-24" style={{ background: isDark ? '#111115' : 'hsl(var(--background))' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
<h2 className="mb-4" style={{ color: isDark ? '#ffffff' : 'hsl(var(--foreground))' }}>{t("home.culture.title")}</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'hsl(var(--muted-foreground))' }}>
            {t("home.culture.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Cuisine Card */}
          <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up" style={{ background: isDark ? '#1a1a1d' : 'hsl(var(--card))' }}>
            <div className="relative h-80 overflow-hidden">
              <img
                src={foodImage}
                alt={t("home.culture.traditionalCuisine")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-6 left-6">
                <div className="bg-terracotta text-white p-3 rounded-full">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
              </div>
            </div>

<CardContent className="p-8" style={{ background: isDark ? '#1a1a1d' : 'hsl(var(--card))' }}>
              <h3 className="text-3xl mb-4" style={{ color: isDark ? '#ffffff' : 'hsl(var(--foreground))' }}>
                {t("home.culture.traditionalCuisine")}
              </h3>
              <p className="mb-6 leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'hsl(var(--muted-foreground))' }}>
                Savor the flavors of Albania with dishes like Tavë Kosi (baked
                lamb with yogurt), Byrek (savory pastries), and fresh
                Mediterranean ingredients. Albanian cuisine blends Ottoman,
                Greek, and Italian influences into a unique culinary experience.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium">
                  Tavë Kosi
                </span>
                <span className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium">
                  Byrek
                </span>
                <span className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium">
                  Fërgesë
                </span>
                <span className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-sm font-medium">
                  Baklava
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Culture Card */}
<Card
            className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
            style={{ animationDelay: "200ms", background: isDark ? '#1a1a1d' : 'hsl(var(--card))' }}
          >
            <div className="relative h-80 overflow-hidden">
              <img
                src={cultureImage}
                alt="Albanian culture and traditions"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-6 left-6">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <Music className="w-6 h-6" />
                </div>
              </div>
            </div>

<CardContent className="p-8" style={{ background: isDark ? '#1a1a1d' : 'hsl(var(--card))' }}>
              <h3 className="text-3xl mb-4" style={{ color: isDark ? '#ffffff' : 'hsl(var(--foreground))' }}>
                {t("home.culture.festivalsAndTraditions")}
              </h3>
              <p className="mb-6 leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'hsl(var(--muted-foreground))' }}>
                Experience Albania's vibrant culture through traditional folk
                dances, colorful festivals, and ancient customs. The Albanian
                people are known for their warm hospitality and pride in
                preserving their unique cultural identity across centuries.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Folk Music
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Traditional Dance
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Festivals
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Crafts
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* ✅ Centered Button */}
        <div className="flex justify-center mt-10">
          <Link
            to="/CultureDetails"
            className="px-6 py-3 bg-foreground text-background rounded-full font-semibold hover:bg-foreground/90 transition inline-block text-center"
          >
            {t("common.explore")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Culture;
