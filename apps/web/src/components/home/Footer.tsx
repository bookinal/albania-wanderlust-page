import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
  Youtube,
  CreditCard,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const Footer = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#0A0A0B" : "#f8fafc",
        color: isDark ? "#ffffff" : "#0f172a",
        borderTop: isDark
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              BOOKinAL<span style={{ color: "#E8192C" }}>.</span>
            </button>
            <p
              className="mb-5 leading-relaxed text-sm transition-colors duration-300"
              style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}
            >
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border hover:bg-red-600 hover:border-red-600 hover:text-white"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                  color: isDark ? "#e2e8f0" : "#475569",
                }}
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border hover:bg-gradient-to-br hover:from-red-600 hover:to-red-800 hover:text-white hover:border-transparent"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                  color: isDark ? "#e2e8f0" : "#475569",
                }}
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border hover:bg-red-600 hover:border-red-600 hover:text-white"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                  color: isDark ? "#e2e8f0" : "#475569",
                }}
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border hover:bg-red-600 hover:border-red-600 hover:text-white"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                  color: isDark ? "#e2e8f0" : "#475569",
                }}
                aria-label="Youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-base font-semibold mb-6 transition-colors duration-300"
              style={{ color: isDark ? "#ffffff" : "#0f172a" }}
            >
              {t("footer.explore")}
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/searchResults", label: "footer.hotelsApartments" },
                { to: "/searchCarResults", label: "footer.carRentals" },
                { to: "/properties-map", label: "footer.mapView" },
                { to: "/CultureDetails", label: "footer.cultureCuisine" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="transition-colors inline-flex items-center gap-2 group"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = isDark
                        ? "#ffffff"
                        : "#0f172a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = isDark
                        ? "rgba(255,255,255,0.6)"
                        : "#475569")
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4
              className="text-base font-semibold mb-6 transition-colors duration-300"
              style={{ color: isDark ? "#ffffff" : "#0f172a" }}
            >
              {t("footer.support")}
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/help", label: "footer.helpCenter" },
                { to: "/rental-terms", label: "footer.rentalTerms" },
                {
                  to: "/cancellation-policy",
                  label: "footer.cancellationPolicy",
                },
                { to: "/privacy-policy", label: "footer.privacyPolicy" },
                { to: "/terms-of-service", label: "footer.termsOfService" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="transition-colors inline-flex items-center gap-2 group"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = isDark
                        ? "#ffffff"
                        : "#0f172a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = isDark
                        ? "rgba(255,255,255,0.6)"
                        : "#475569")
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-base font-semibold mb-6 transition-colors duration-300"
              style={{ color: isDark ? "#ffffff" : "#0f172a" }}
            >
              {t("footer.contactUs")}
            </h4>
            <ul className="space-y-4">
              <li
                className="flex items-start gap-3 transition-colors duration-300"
                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(239,68,68,0.1)",
                  }}
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm">
                  {t("footer.addressCity")}
                  <br />
                  {t("footer.addressStreet")}
                </span>
              </li>
              <li
                className="flex items-center gap-3 transition-colors duration-300"
                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(239,68,68,0.1)",
                  }}
                >
                  <Phone className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm">+355 4 123 4567</span>
              </li>
              <li
                className="flex items-center gap-3 transition-colors duration-300"
                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(239,68,68,0.1)",
                  }}
                >
                  <Mail className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm">support@bookinal.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: isDark
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              className="text-sm transition-colors duration-300"
              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}
            >
              © {currentYear} BookinAL. {t("footer.rightsReserved")}
            </p>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-2 text-xs transition-colors duration-300"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}
              >
                <Shield className="w-4 h-4" />
                <span>{t("footer.securePayments")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard
                  className="w-5 h-5 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                  }}
                />
                <span
                  className="text-xs transition-colors duration-300"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                  }}
                >
                  Stripe
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
