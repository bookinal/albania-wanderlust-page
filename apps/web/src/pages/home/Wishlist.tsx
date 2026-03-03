import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Trash2, Star, ArrowRight, Heart } from "lucide-react";
import { Wishlist } from "@/types/destination.types";
import {
  getCurrentUserWishlist,
  removeDestinationFromCurrentUserWishlist,
} from "@/services/api/destinationService";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/useLocalized";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        const data = await getCurrentUserWishlist();
        setWishlist(data);
      } catch (err) {
        setError(t("wishlist.loadError"));
      } finally {
        setIsLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = async (destinationId: string) => {
    if (!wishlist) return;

    // Optimistic UI Update: Remove locally immediately
    const previousWishlist = { ...wishlist };
    setWishlist({
      ...wishlist,
      destinations: wishlist.destinations.filter((d) => d.id !== destinationId),
    });

    try {
      await removeDestinationFromCurrentUserWishlist(destinationId);
    } catch (err) {
      // Rollback if API fails
      setWishlist(previousWishlist);
      alert(t("wishlist.removeError"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          {t("wishlist.findingFavorites")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PrimarySearchAppBar />

      <main className="container mx-auto px-4 py-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {t("wishlist.savedForLater")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("wishlist.destinationsCount", {
                count: wishlist?.destinations.length || 0,
              })}
            </p>
          </div>
        </header>

        {!wishlist || wishlist.destinations.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t("wishlist.emptyTitle")}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              {t("wishlist.emptyDescription")}
            </p>
            <Button size="lg" className="rounded-full px-8">
              {t("wishlist.exploreDestinations")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.destinations.map((destination) => (
              <Card
                key={destination.id}
                className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.imageUrls[0]}
                    alt={localize(destination.name)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-md bg-white/90 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => handleRemoveFromWishlist(destination.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm border-none">
                    {t("wishlist.topRated")}
                  </Badge>
                </div>

                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-primary font-medium text-sm">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {localize(destination.name) ||
                        t("wishlist.international")}
                    </div>
                    <div className="flex items-center text-sm font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 mr-1 fill-yellow-700" />
                      4.8
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {localize(destination.name)}
                  </h3>

                  <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                    {localize(destination.description)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button
                      className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/destination/${destination.id}`)}
                    >
                      {t("wishlist.seeMore")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
