// red THEME VERSION
import PrimarySearchAppBar from "@/components/home/AppBar";
import {
  UtensilsCrossed,
  Music,
  Calendar,
  Heart,
  Users,
  Sparkles,
  ChefHat,
  Wine,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const CultureDetails = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState("cuisine");

  const cuisineData = [
    {
      name: "Tavë Kosi",
      description:
        "A national dish of baked lamb with rice in a creamy yogurt sauce, seasoned with garlic and herbs.",
      region: "Central Albania",
      type: "Main Course",
      image: "Tave-Kosi-recipe-joghurt.jpg",
    },
    {
      name: "Byrek",
      description:
        "Flaky phyllo pastry filled with cheese, spinach, or meat. Perfect for breakfast or snacks.",
      region: "Nationwide",
      type: "Pastry",
      image: "byrek.png",
    },
    {
      name: "Fërgesë",
      description:
        "A hearty dish of peppers, tomatoes, cottage cheese, and sometimes meat, cooked in a clay pot.",
      region: "Tirana",
      type: "Main Course",
      image: "Fërgesë.jpeg",
    },
    {
      name: "Qofte",
      description:
        "Seasoned meatballs made with ground beef or lamb, herbs, and spices, grilled to perfection.",
      region: "Nationwide",
      type: "Main Course",
      image: "Boulettes.webp",
    },
    {
      name: "Baklava",
      description:
        "Sweet pastry made of layers of filo filled with chopped nuts and sweetened with syrup or honey.",
      region: "Southern Albania",
      type: "Dessert",
      image: "DSC_6546.jpg",
    },
    {
      name: "Raki",
      description:
        "Traditional Albanian spirit distilled from grapes or plums, served as a welcome drink.",
      region: "Nationwide",
      type: "Beverage",
      image: "rakija-boisson-alcoolisee.jpg",
    },
  ];

  const festivals = [
    {
      name: "Summer Day (Dita e Verës)",
      date: "March 14",
      description:
        "Ancient pagan festival celebrating the end of winter with traditional sweets and outdoor activities.",
    },
    {
      name: "Independence Day",
      date: "November 28",
      description:
        "Celebrating Albania's independence from the Ottoman Empire in 1912 with parades and festivities.",
    },
    {
      name: "National Folklore Festival",
      date: "May (Every 5 years)",
      description:
        "Gjirokastër hosts this spectacular showcase of traditional music, dance, and costumes.",
    },
    {
      name: "Kala Festival",
      date: "August",
      description:
        "Electronic music festival held in the historic Dhërmi Castle overlooking the Ionian Sea.",
    },
  ];

  const traditions = [
    {
      title: "Besa",
      description:
        "A code of honor meaning 'to keep the promise' — the cornerstone of Albanian culture emphasizing trust, loyalty, and protection of guests.",
      icon: <Heart className="w-6 h-6 text-white" />,
    },
    {
      title: "Albanian Iso-Polyphony",
      description:
        "UNESCO-recognized traditional singing style featuring multiple vocal parts creating rich harmonies, especially in southern Albania.",
      icon: <Music className="w-6 h-6 text-white" />,
    },
    {
      title: "Hospitality (Mikpritja)",
      description:
        "Guests are treated as sacred. It's common to be invited into homes and offered food and drink, even by strangers.",
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      title: "Traditional Crafts",
      description:
        "Skilled artisans create intricate filigree jewelry, handwoven rugs, and carved wooden items using centuries-old techniques.",
      icon: <Sparkles className="w-6 h-6 text-white" />,
    },
  ];

  const tabs = [
    { id: "cuisine", label: "Cuisine", icon: <ChefHat className="w-4 h-4" /> },
    {
      id: "festivals",
      label: "Festivals",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "traditions",
      label: "Traditions",
      icon: <Heart className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: isDark ? "#0a0a0c" : "#ffffff",
        transition: "background 0.3s",
      }}
    >
      <PrimarySearchAppBar />

      {/* ── HERO ── */}
      <section className="relative min-h-[56vh] flex items-end overflow-hidden">
        {/* Albanian flag gradient — red to black */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-900 to-black" />

        {/* Decorative cross-hatched overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Red vignette edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

        <div className="relative z-10 container mx-auto px-4 pb-16 pt-24">
          <div className="max-w-3xl animate-fade-in">
            {/* Eyebrow */}
            <span className="inline-block text-red-300 text-xs font-bold uppercase tracking-[0.3em] mb-5">
              Albania · Heritage & Culture
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6">
              Albanian
              <br />
              <span className="text-red-400">Culture</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-xl">
              Discover the rich traditions, vibrant festivals, and exquisite
              cuisine that define Albania's unique cultural identity.
            </p>
          </div>
        </div>
      </section>

      {/* ── TAB NAV ── */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: isDark ? "rgba(10,10,12,0.95)" : "rgba(255,255,255,0.95)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-red-600 to-red-900 text-white shadow-md shadow-red-900/30"
                    : isDark
                      ? "text-white/50 hover:text-white/80 hover:bg-white/5"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CUISINE TAB ── */}
      {activeTab === "cuisine" && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 animate-fade-in">
              <div>
                <span className="text-red-600 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 mb-3">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  Traditional Flavors
                </span>
                <h2
                  className="text-4xl md:text-5xl font-black"
                  style={{ color: isDark ? "#f0ece8" : "#111115" }}
                >
                  Albanian Cuisine
                </h2>
              </div>
              <p
                className="hidden md:block text-sm leading-relaxed text-right max-w-xs"
                style={{ color: isDark ? "rgba(240,236,232,0.45)" : "#6b7280" }}
              >
                Mediterranean freshness meets Balkan heartiness in every plate.
              </p>
            </div>

            {/* Cuisine grid — editorial image-first cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cuisineData.map((dish, index) => (
                <div
                  key={index}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Image fills the card */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={`/src/assets/food/${dish.image}`}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Red-to-black gradient overlay — content lives here */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950/60 to-transparent" />
                  </div>

                  {/* Content floated over image */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-white font-black text-xl leading-tight">
                        {dish.name}
                      </h3>
                      <span className="flex-shrink-0 text-[10px] font-bold bg-red-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                        {dish.type}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-3">
                      {dish.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-red-300 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      {dish.region}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Wine & Spirits callout */}
            <div className="mt-14 rounded-3xl overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-red-700 via-red-900 to-black p-10 md:p-14 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Wine className="w-10 h-10 text-red-300" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-black text-white mb-3">
                    Albanian Wine & Spirits
                  </h3>
                  <p className="text-white/65 leading-relaxed max-w-xl">
                    Albania's wine tradition dates to Illyrian times, producing
                    unique wines from ancient grapes like Shesh i Zi and
                    Kallmet. Raki remains the national spirit — shared proudly
                    with guests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FESTIVALS TAB ── */}
      {activeTab === "festivals" && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-12 animate-fade-in">
              <span className="text-red-600 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                Throughout the Year
              </span>
              <h2
                className="text-4xl md:text-5xl font-black"
                style={{ color: isDark ? "#f0ece8" : "#111115" }}
              >
                Festivals &<br />
                Celebrations
              </h2>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical red line */}
              <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-red-600 via-red-800 to-black hidden md:block" />

              <div className="space-y-6">
                {festivals.map((festival, index) => (
                  <div
                    key={index}
                    className="group flex gap-6 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-black items-center justify-center shadow-lg shadow-red-900/30 z-10 group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-red-100 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h3 className="text-xl font-black text-gray-900">
                          {festival.name}
                        </h3>
                        <span className="self-start sm:self-auto flex-shrink-0 px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-900 text-white text-xs font-bold rounded-full">
                          {festival.date}
                        </span>
                      </div>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        {festival.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA banner */}
            <div className="mt-14 bg-gradient-to-br from-red-700 to-black rounded-3xl p-10 text-center animate-fade-in">
              <h3 className="text-2xl font-black text-white mb-2">
                Plan Around Albania's Festivals
              </h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Time your visit to experience the country at its most vibrant.
              </p>
              <button className="inline-flex items-center gap-2 bg-white text-red-800 font-bold px-7 py-3 rounded-full hover:bg-red-50 transition-colors">
                Browse Properties
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── TRADITIONS TAB ── */}
      {activeTab === "traditions" && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-12 animate-fade-in">
              <span className="text-red-600 text-[11px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 mb-3">
                <Heart className="w-3.5 h-3.5" />
                Centuries of Heritage
              </span>
              <h2
                className="text-4xl md:text-5xl font-black"
                style={{ color: isDark ? "#f0ece8" : "#111115" }}
              >
                Cultural Traditions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {traditions.map((tradition, index) => (
                <div
                  key={index}
                  className="group bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-5">
                    {/* Icon in gradient circle */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-black flex items-center justify-center shadow-md shadow-red-900/25 group-hover:scale-110 transition-transform duration-300">
                      {tradition.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        {tradition.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {tradition.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full-width Albanian spirit banner */}
            <div className="mt-14 rounded-3xl overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-br from-red-700 via-red-900 to-black px-10 py-14 md:px-16 text-center">
                {/* Decorative dots */}
                <div className="flex justify-center gap-1.5 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`block rounded-full bg-red-400 ${i === 2 ? "w-6 h-1.5" : "w-1.5 h-1.5 opacity-50"}`}
                    />
                  ))}
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  The Albanian Spirit
                </h3>
                <p className="text-white/60 leading-relaxed max-w-2xl mx-auto mb-8 text-sm md:text-base">
                  Albanian identity is rooted in honor, family, and hospitality.
                  From ancient symbols to vibrant music and art, the spirit of
                  the country lives on through its traditions.
                </p>
                <button className="inline-flex items-center gap-2 bg-white text-red-800 font-bold px-8 py-3.5 rounded-full hover:bg-red-50 transition-colors shadow-lg">
                  Experience Albania
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default CultureDetails;
