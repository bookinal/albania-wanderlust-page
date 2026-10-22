import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  CreditCard,
  Handshake,
  Home,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getHomeThemeTokens } from "@/components/home/homeTheme";
import { getBookingThemeTokens } from "@/pages/home/booking/bookingTheme";

type StepKey = "choose" | "review" | "confirm" | "fee" | "meet";

const STEPS: { key: StepKey; icons: LucideIcon[] }[] = [
  { key: "choose", icons: [Car, Home] },
  { key: "review", icons: [UserCheck] },
  { key: "confirm", icons: [Mail] },
  { key: "fee", icons: [CreditCard] },
  { key: "meet", icons: [Handshake] },
];

const RentalTermsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark, isBlue } = useTheme();
  const home = getHomeThemeTokens({ isDark, isBlue });
  const tk = getBookingThemeTokens({ isDark, isBlue });

  const list = (key: string) =>
    t(key, { returnObjects: true, defaultValue: [] }) as string[];

  const cardStyle = {
    background: tk.cardBg,
    border: `1px solid ${tk.cardBorder}`,
    boxShadow: tk.cardShadow,
  };

  return (
    <div className="rt-page pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: tk.brandSoft }}
        />
        <div className="rt-fade relative mx-auto max-w-3xl text-center">
          <span
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: home.badgeBg, color: home.badgeText }}
          >
            <ShieldCheck className="h-4 w-4" />
            {t("rentalTermsPage.badge")}
          </span>
          <h1
            className="mb-5 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: tk.pageText }}
          >
            {t("rentalTermsPage.titleStart")}{" "}
            <span style={{ color: tk.brand }}>{t("rentalTermsPage.titleHighlight")}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: tk.dimText }}>
            {t("rentalTermsPage.subtitle")}
          </p>
        </div>
      </section>

      {/* Steps timeline */}
      <section className="px-4">
        <ol className="mx-auto max-w-3xl">
          {STEPS.map(({ key, icons }, index) => {
            const isLast = index === STEPS.length - 1;
            return (
              <li
                key={key}
                className="rt-fade relative grid grid-cols-[2.5rem_1fr] gap-4 pb-6 sm:grid-cols-[3rem_1fr] sm:gap-6 sm:pb-8"
                style={{ animationDelay: `${(index + 1) * 90}ms` }}
              >
                {/* Number + connecting line */}
                <div className="relative flex justify-center">
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute top-10 bottom-[-0.25rem] w-0.5 sm:top-12"
                      style={{ background: `linear-gradient(${tk.brandBorder}, ${tk.divider})` }}
                    />
                  )}
                  <span
                    className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-base font-black text-white sm:h-12 sm:w-12 sm:text-lg"
                    style={{ background: tk.brand, boxShadow: tk.primaryShadow }}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Card */}
                <div
                  className="rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-7"
                  style={cardStyle}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="flex h-10 items-center gap-1.5 rounded-xl px-2.5"
                      style={{ background: tk.brandSoft, color: tk.brand }}
                    >
                      {icons.map((Icon, i) => (
                        <Icon key={i} className="h-5 w-5" />
                      ))}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: tk.mutedText }}>
                      {t("rentalTermsPage.stepLabel", { n: index + 1 })}
                    </span>
                  </div>
                  <h2 className="mb-2 text-xl font-bold sm:text-2xl" style={{ color: tk.pageText }}>
                    {t(`rentalTermsPage.steps.${key}.title`)}
                  </h2>
                  <p className="text-sm leading-relaxed sm:text-base" style={{ color: tk.dimText }}>
                    {t(`rentalTermsPage.steps.${key}.description`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* What you pay, and when */}
      <section className="rt-fade px-4 pt-6 sm:pt-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-center text-2xl font-bold sm:text-3xl" style={{ color: tk.pageText }}>
            {t("rentalTermsPage.payTitle")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: Lock, title: t("rentalTermsPage.payOnlineTitle"), items: list("rentalTermsPage.payOnlineItems") },
              { icon: Handshake, title: t("rentalTermsPage.payProviderTitle"), items: list("rentalTermsPage.payProviderItems") },
            ].map(({ icon: Icon, title, items }) => (
              <div key={title} className="rounded-2xl p-5 sm:p-6" style={cardStyle}>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: tk.brandSoftStrong, color: tk.brand }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold" style={{ color: tk.pageText }}>
                    {title}
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base" style={{ color: tk.dimText }}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: tk.brand }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why the service fee */}
      <section className="rt-fade px-4 pt-10">
        <div className="mx-auto max-w-3xl">
          <div
            className="relative overflow-hidden rounded-3xl p-7 text-white sm:p-10"
            style={{ background: tk.brand, boxShadow: tk.primaryShadow }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.28) 100%)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
            />
            <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex-shrink-0 rounded-full bg-white/15 p-4 backdrop-blur-md">
                <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>
              <div>
                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{t("rentalTermsPage.feeTitle")}</h2>
                <p className="text-base leading-relaxed text-white/90 sm:text-lg">{t("rentalTermsPage.feeText")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="rt-fade px-4 pt-12 text-center">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={{ color: tk.pageText }}>
          {t("rentalTermsPage.ctaTitle")}
        </h2>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/searchCarResults"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{ background: tk.brand }}
          >
            <Car className="h-5 w-5" />
            {t("rentalTermsPage.ctaCars")}
          </Link>
          <button
            type="button"
            onClick={() => navigate("/searchResults", { state: { type: "apartment" } })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-opacity hover:opacity-80 sm:w-auto"
            style={{ background: tk.brandSoft, color: tk.brand, border: `1px solid ${tk.brandBorder}` }}
          >
            <Home className="h-5 w-5" />
            {t("rentalTermsPage.ctaStays")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <style>{`
        @keyframes rt-fade-in-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rt-page .rt-fade {
          animation: rt-fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .rt-page .rt-fade { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default RentalTermsSection;
