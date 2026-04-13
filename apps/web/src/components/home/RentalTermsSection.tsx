import { useTheme } from "@/context/ThemeContext";
import { 
  CheckCircle2, 
  Car, 
  Home, 
  Mail, 
  CreditCard, 
  Phone, 
  ShieldCheck
} from "lucide-react";

const RentalTermsSection = () => {
  const { isDark } = useTheme();

  const steps = [
    {
      icon: <Car className="w-6 h-6 text-red-600" />,
      icon2: <Home className="w-6 h-6 text-red-600" />,
      title: "1. Choose Your Booking",
      description: "Start by selecting the car or apartment you wish to book. Browse our extensive catalog and submit your booking request with your preferred dates."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-red-600" />,
      title: "2. Provider Review",
      description: "The property owner (provider) will review your booking request. This ensures that the vehicle or apartment is perfectly ready and available for your requested dates."
    },
    {
      icon: <Mail className="w-6 h-6 text-red-600" />,
      title: "3. Confirmation Email",
      description: "Once the provider confirms your request, you will receive an immediate email notification confirming that your booking has been accepted."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-red-600" />,
      title: "4. Pay the 7% Platform Fee",
      description: "To secure your reservation, you will pay a small 7% service fee of the total booking price directly through our secure platform."
    },
    {
      icon: <Phone className="w-6 h-6 text-red-600" />,
      title: "5. Direct Contact & Final Payment",
      description: "After the 7% fee is paid, you will instantly receive the provider's direct contact details. You can then communicate directly with them and pay the remaining balance outside the platform upon arrival."
    }
  ];

  return (
    <div
      className="py-16"
      style={{
        background: isDark ? "#0a0a0c" : "#fafafa",
        transition: "background 0.3s",
      }}
    >
      {/* Hero Section */}
      <section className="relative pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20 dark:to-transparent" />
        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center animate-fade-in-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold tracking-widest uppercase mb-6">
            Booking Policy
          </span>
          <h2 
            className="text-4xl md:text-5xl font-black mb-6"
            style={{ color: isDark ? "#ffffff" : "#111115" }}
          >
            How Booking <span className="text-red-600">Works</span>
          </h2>
          <p 
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#6b7280" }}
          >
            Our transparent and secure process ensures a smooth experience for both guests and property owners. Here is exactly how your reservation is handled from start to finish.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 md:left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-red-600/50 to-transparent hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start group animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div 
                    className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ 
                      background: isDark ? "#1a1a1c" : "#ffffff",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`
                    }}
                  >
                    <div className="flex gap-1">
                      {step.icon}
                      {step.icon2 && <span className="hidden md:block">{step.icon2}</span>}
                    </div>
                  </div>
                  
                  <div 
                    className="flex-1 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl"
                    style={{ 
                      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                    }}
                  >
                    <h3 
                      className="text-2xl font-bold mb-3"
                      style={{ color: isDark ? "#ffffff" : "#111115" }}
                    >
                      {step.title}
                    </h3>
                    <p 
                      className="text-base md:text-lg leading-relaxed"
                      style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Card */}
      <section className="px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-red-600 to-red-900 text-white shadow-2xl relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 p-4 bg-white/10 rounded-full backdrop-blur-md">
                <ShieldCheck className="w-12 h-12 text-red-100" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Why 7%?</h3>
                <p className="text-red-100/90 text-lg leading-relaxed">
                  The 7% platform fee helps us maintain our secure verification process, provide 24/7 customer support, and keep the platform running smoothly. The remaining balance goes entirely to the local provider.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { 
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
          opacity: 0; 
        }
      `}</style>
    </div>
  );
};

export default RentalTermsSection;
