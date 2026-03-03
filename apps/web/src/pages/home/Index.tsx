import Hero from "@/components/home/Hero";
import Destinations from "@/components/home/Destinations";
import Culture from "@/components/home/Culture";
import CallToAction from "@/components/home/CallToAction";
import PrimarySearchAppBar from "@/components/home/AppBar";
import HotelsPreview from "@/components/home/HotelsPreview";
import ApartmentsPreview from "@/components/home/ApartmentsPreview";
import CarsPreview from "@/components/home/CarsPreview";
import { Building2, Car, MapPin, Star, Users, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <PrimarySearchAppBar />
      <Hero />

      {/* Trust Indicators Section */}
      <section className="py-8 md:py-10 bg-gradient-to-r from-red-900 via-red-800 to-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white">
                500+
              </span>
              <span className="text-sm text-white/70 mt-1">
                {t("home.trustIndicators.propertiesListed")}
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white">
                10K+
              </span>
              <span className="text-sm text-white/70 mt-1">
                {t("home.trustIndicators.happyGuests")}
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white">
                4.8
              </span>
              <span className="text-sm text-white/70 mt-1">
                {t("home.trustIndicators.averageRating")}
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white">
                100%
              </span>
              <span className="text-sm text-white/70 mt-1">
                {t("home.trustIndicators.secureBooking")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Accommodations Section */}
      <section className="py-12 md:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in">
            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 font-semibold tracking-wider uppercase text-xs rounded-full mb-3">
              {t("home.accommodations.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
              {t("home.accommodations.title")}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.accommodations.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div id="hotels" className="lg:pr-6">
              <HotelsPreview />
            </div>
            <div
              id="apartments"
              className="lg:pl-6 lg:border-l lg:border-slate-200/60"
            >
              <ApartmentsPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Cars Section */}
      <section className="py-12 md:py-16 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <CarsPreview />
        </div>
      </section>

      {/* Destinations Section */}
      <Destinations />

      {/* Culture Section */}
      <Culture />

      {/* Call To Action */}
      {/*<CallToAction />*/}
    </div>
  );
};

export default Index;
