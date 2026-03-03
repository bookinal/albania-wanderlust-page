// red THEME VERSION
import PrimarySearchAppBar from "@/components/home/AppBar";
import { Card, CardContent } from "@/components/ui/card";
import {
  UtensilsCrossed,
  Music,
  Calendar,
  Heart,
  Users,
  Sparkles,
  ChefHat,
  Wine,
} from "lucide-react";
import { useState, useEffect } from "react";

const CultureDetails = () => {
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
        "A code of honor meaning 'to keep the promise' - the cornerstone of Albanian culture emphasizing trust, loyalty, and protection of guests.",
      icon: <Heart className="w-6 h-6 text-red-600" />,
    },
    {
      title: "Albanian Iso-Polyphony",
      description:
        "UNESCO-recognized traditional singing style featuring multiple vocal parts creating rich harmonies, especially in southern Albania.",
      icon: <Music className="w-6 h-6 text-red-600" />,
    },
    {
      title: "Hospitality (Mikpritja)",
      description:
        "Guests are treated as sacred. It's common to be invited into homes and offered food and drink, even by strangers.",
      icon: <Users className="w-6 h-6 text-red-600" />,
    },
    {
      title: "Traditional Crafts",
      description:
        "Skilled artisans create intricate filigree jewelry, handwoven rugs, and carved wooden items using centuries-old techniques.",
      icon: <Sparkles className="w-6 h-6 text-red-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-red-100/40 to-red-200/20">
      <PrimarySearchAppBar />

      {/* HERO */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-red-300/20 to-red-600/10" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-t from-red-500 to-red-800 bg-clip-text text-transparent">
              Albanian Culture & Cuisine
            </h1>
            <p className="text-xl text-red-700/70 leading-relaxed">
              Discover the spirit of Albania through its rich traditions,
              ancient customs, and unforgettable cuisine.
            </p>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="sticky top-0 z-40 bg-red-50/90 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4 py-4">
            {/* Tab Buttons */}
            <button
              onClick={() => setActiveTab("cuisine")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === "cuisine"
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
            >
              <ChefHat className="w-5 h-5" />
              Cuisine
            </button>
            <button
              onClick={() => setActiveTab("festivals")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === "festivals"
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
            >
              <Calendar className="w-5 h-5" />
              Festivals
            </button>
            <button
              onClick={() => setActiveTab("traditions")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === "traditions"
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
            >
              <Heart className="w-5 h-5" />
              Traditions
            </button>
          </div>
        </div>
      </section>

      {/* CUISINE */}
      {activeTab === "cuisine" && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-200 rounded-full mb-4">
                <UtensilsCrossed className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Traditional Albanian Dishes
              </h2>
              <p className="text-lg text-red-700/70 max-w-2xl mx-auto">
                Albanian cuisine blends Mediterranean freshness with Balkan
                heartiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cuisineData.map((dish, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`/src/assets/food/${dish.image}`}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{dish.name}</h3>
                    <p className="text-red-700/70 mb-4">{dish.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-red-200 text-red-700 rounded-full text-xs font-medium">
                        {dish.region}
                      </span>
                      <span className="px-3 py-1 bg-red-600/10 text-red-700 rounded-full text-xs font-medium">
                        {dish.type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* WINE SECTION */}
            <div className="mt-16 bg-gradient-to-r from-red-200/40 to-red-600/20 rounded-3xl p-8 md:p-12 animate-fade-in">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-red-300/40 rounded-full flex items-center justify-center">
                    <Wine className="w-12 h-12 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4">
                    Albanian Wine & Spirits
                  </h3>
                  <p className="text-red-700/70 leading-relaxed">
                    Albania's wine tradition dates to Illyrian times, producing
                    unique wines from ancient grapes like Shesh i Zi and
                    Kallmet. Raki remains the national spirit—shared proudly
                    with guests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FESTIVALS */}
      {activeTab === "festivals" && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-200 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Festivals & Celebrations
              </h2>
              <p className="text-lg text-red-700/70 max-w-2xl mx-auto">
                Albania comes alive with music, culture, and tradition all year
                long.
              </p>
            </div>

            <div className="space-y-6">
              {festivals.map((festival, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                          <h3 className="text-2xl font-bold">
                            {festival.name}
                          </h3>
                          <span className="px-4 py-2 bg-red-300/20 text-red-700 rounded-full text-sm font-semibold">
                            {festival.date}
                          </span>
                        </div>
                        <p className="text-red-700/70">
                          {festival.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRADITIONS */}
      {activeTab === "traditions" && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-200 rounded-full mb-4">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Cultural Traditions</h2>
              <p className="text-lg text-red-700/70 max-w-2xl mx-auto">
                Albania preserves deep-rooted values of honor, hospitality, and
                unity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {traditions.map((tradition, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-300/20 rounded-full flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform duration-300">
                        {tradition.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">
                          {tradition.title}
                        </h3>
                        <p className="text-red-700/70 leading-relaxed">
                          {tradition.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 bg-gradient-to-br from-red-200/40 via-red-100 to-red-400/30 rounded-3xl p-8 md:p-12 animate-fade-in">
              <h3 className="text-3xl font-bold mb-6 text-center">
                The Albanian Spirit
              </h3>
              <p className="text-red-700/70 leading-relaxed text-center max-w-4xl mx-auto mb-6">
                Albanian identity is rooted in honor, family, and hospitality.
                From ancient symbols to vibrant music and art, the spirit of the
                country lives on through its traditions.
              </p>
              <div className="flex justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Experience Albania
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ANIMATIONS */}
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
