import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ArrowLeft, MapPin, Heart, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Destination } from "@albania/shared-types";
import {
  getDestinationById,
  addDestinationToCurrentUserWishlist,
} from "@albania/api-client";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/useLocalized";

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DestinationDetails = () => {
  const { t } = useTranslation();
  const { localize } = useLocalized();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchDestination = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getDestinationById(id);
        setDestination(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching destination:", err);
        setError("Failed to load destination details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  const handleAddToWishlist = async () => {
    if (!destination) return;

    try {
      setIsAddingToWishlist(true);
      await addDestinationToCurrentUserWishlist(destination.id);
      toast({
        title: "Success",
        description: "Destination added to your wishlist.",
      });
    } catch (err: any) {
      console.error("Failed to add to wishlist:", err);
      if (err.code === "23505") {
        toast({
          title: "Already in Wishlist",
          description: "This destination is already in your wishlist.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Please login to add to wishlist.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShare = async () => {
    if (!destination) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: localize(destination.name),
          text: localize(destination.description),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Destination link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          {error || "Destination not found"}
        </h2>
        <Button
          onClick={() => navigate("/")}
          className="bg-red-600 hover:bg-red-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const mapCenter: [number, number] = [
    destination.lat || 41.3275,
    destination.lng || 19.8187,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="hover:bg-slate-100"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                {isAddingToWishlist ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Main Image */}
          <div className="space-y-4">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={
                  destination.imageUrls[selectedImageIndex] ||
                  "/placeholder.svg"
                }
                alt={localize(destination.name)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                {destination.category}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {destination.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {destination.imageUrls.slice(0, 4).map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? "ring-4 ring-red-600 scale-105"
                        : "hover:scale-105"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${localize(destination.name)} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <h1 className="text-4xl font-bold text-slate-900">
                  {localize(destination.name)}
                </h1>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                {localize(destination.description)}
              </p>
            </div>

            {/* Location Map */}
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-0">
                <div className="h-64 lg:h-80">
                  {destination.lat && destination.lng ? (
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={mapCenter}>
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-bold">
                              {localize(destination.name)}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {destination.category}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-100">
                      <p className="text-slate-500">Location not available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl"
              >
                {isAddingToWishlist ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 mr-2" />
                )}
                Add to Wishlist
              </Button>
              <Button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`,
                    "_blank",
                  )
                }
                variant="outline"
                className="flex-1 hover:bg-slate-100"
                disabled={!destination.lat || !destination.lng}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t("map.openInGoogleMaps")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
