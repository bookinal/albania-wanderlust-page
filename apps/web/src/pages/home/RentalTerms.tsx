import PrimarySearchAppBar from "@/components/home/AppBar";
import { useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";
import RentalTermsSection from "@/components/home/RentalTermsSection";

const RentalTerms = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: isDark ? "#0a0a0c" : "#fafafa",
        transition: "background 0.3s",
      }}
    >
      <PrimarySearchAppBar />
      <div className="pt-20">
        <RentalTermsSection />
      </div>
    </div>
  );
};

export default RentalTerms;
