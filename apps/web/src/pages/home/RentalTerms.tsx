import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTheme } from "@/context/ThemeContext";
import RentalTermsSection from "@/components/home/RentalTermsSection";
import { getBookingThemeTokens } from "@/pages/home/booking/bookingTheme";

const RentalTerms = () => {
  const { isDark, isBlue } = useTheme();
  const tk = getBookingThemeTokens({ isDark, isBlue });

  return (
    <div
      className="min-h-screen"
      style={{ background: tk.pageBg, transition: "background 0.3s" }}
    >
      {/* AppBar renders its own spacer below the fixed nav */}
      <PrimarySearchAppBar />
      <RentalTermsSection />
    </div>
  );
};

export default RentalTerms;
