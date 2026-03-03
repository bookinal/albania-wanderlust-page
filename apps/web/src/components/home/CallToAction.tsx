import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Shield, Clock, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-br from-red-900 via-red-800 to-black relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-600 rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-red-300 font-semibold tracking-wider uppercase text-xs rounded-full mb-4 border border-white/10">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Book With Confidence
            </h2>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
              Experience hassle-free bookings with our trusted platform. Your
              perfect Albanian getaway is just a few clicks away.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 md:mb-12">
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                Secure Payment
              </h3>
              <p className="text-sm text-white/60">
                Your transactions are protected with industry-standard
                encryption
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                Instant Confirmation
              </h3>
              <p className="text-sm text-white/60">
                Get immediate booking confirmation sent to your email
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                Best Price Guarantee
              </h3>
              <p className="text-sm text-white/60">
                We match any lower price you find elsewhere
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                24/7 Support
              </h3>
              <p className="text-sm text-white/60">
                Our team is available around the clock to assist you
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                Flexible Booking
              </h3>
              <p className="text-sm text-white/60">
                Free cancellation on most properties up to 24 hours before
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                Local Expertise
              </h3>
              <p className="text-sm text-white/60">
                Curated recommendations from Albania travel experts
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/searchResults">
              <Button
                size="lg"
                className="bg-white text-red-900 hover:bg-white/90 text-base px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold w-full sm:w-auto"
              >
                Start Booking Now
              </Button>
            </Link>

            <Link to="/properties-map">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 text-base px-8 py-6 rounded-full transition-all hover:scale-105 font-semibold w-full sm:w-auto"
              >
                Explore on Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
