import Hero from "@/components/home/Hero";
import Destinations from "@/components/home/Destinations";
import Culture from "@/components/home/Culture";
import PrimarySearchAppBar from "@/components/home/AppBar";
import HotelsPreview from "@/components/home/HotelsPreview";
import ApartmentsPreview from "@/components/home/ApartmentsPreview";
import CarsPreview from "@/components/home/CarsPreview";
import LoadingScreen from "@/components/home/LoadingScreen";
import { Building2, Car, Star, Users, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const Index = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const sectionAlt = isDark ? '#0a0a0c' : '#f5f4f1';
  const sectionMain = isDark ? '#111115' : '#ffffff';
  const textMain = isDark ? '#ffffff' : '#111115';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#6b6663';
  const badgeBg = isDark ? 'rgba(232,25,44,0.12)' : '#fef2f2';
  const badgeText = isDark ? '#f87171' : '#b91c1c';
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(100,92,84,0.15)';

  return (
    <div style={{ minHeight: '100vh', background: sectionMain }}>
      <LoadingScreen />
      <PrimarySearchAppBar />
      <Hero />

      {/* Cars Section */}
      <section style={{ padding: '3rem 0', background: sectionAlt, overflow: 'hidden' }}>
        <div className="container mx-auto px-4">
          <CarsPreview />
        </div>
      </section>

      {/* Trust Indicators Section — always dark crimson gradient, works on both themes */}
      <section style={{ padding: '2rem 0', background: 'linear-gradient(to right, #7f1d1d, #991b1b, #000000)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { Icon: Building2, value: '500+', labelKey: 'home.trustIndicators.propertiesListed', iconColor: 'white' },
              { Icon: Users, value: '10K+', labelKey: 'home.trustIndicators.happyGuests', iconColor: 'white' },
              { Icon: Star, value: '4.8', labelKey: 'home.trustIndicators.averageRating', iconColor: '#fbbf24' },
              { Icon: Shield, value: '100%', labelKey: 'home.trustIndicators.secureBooking', iconColor: 'white' },
            ].map(({ Icon, value, labelKey, iconColor }) => (
              <div key={labelKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.75rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff' }}>{value}</span>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodations Section */}
      <section style={{ padding: '3rem 0', background: sectionMain, overflow: 'hidden' }}>
        <div className="container mx-auto px-4">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="animate-fade-in">
            <span style={{ display: 'inline-block', padding: '0.375rem 1rem', background: badgeBg, color: badgeText, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem', borderRadius: '9999px', marginBottom: '0.75rem' }}>
              {t("home.accommodations.badge")}
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: textMain, marginBottom: '0.75rem' }}>
              {t("home.accommodations.title")}
            </h2>
            <p style={{ fontSize: '1.05rem', color: textMuted, maxWidth: '40rem', margin: '0 auto' }}>
              {t("home.accommodations.description")}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '2rem 3rem' }}>
            <div id="hotels">
              <HotelsPreview />
            </div>
            <div
              id="apartments"
              style={{ borderLeft: `1px solid ${dividerColor}`, paddingLeft: '1.5rem' }}
            >
              <ApartmentsPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <Destinations />

      {/* Culture Section */}
      <Culture />
    </div>
  );
};

export default Index;
