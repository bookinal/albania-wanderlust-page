import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const Unauthorized = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  useEffect(() => {
    console.error(
      "401 Error: User attempted to access unauthorized route:",
      location.pathname,
    );
  }, [location.pathname]);

  const pageBg = isDark ? '#0d0d0d' : '#f5f4f1';
  const pageText = isDark ? '#ffffff' : '#111115';
  const mutedText = isDark ? 'rgba(255,255,255,0.5)' : '#6b6663';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 700, color: '#E8192C' }}>401</h1>
        <p style={{ marginBottom: '1rem', fontSize: '1.25rem', color: pageText }}>
          {t("common.unauthorizedAccess")}
        </p>
        <a href="/" style={{ color: '#E8192C', textDecoration: 'underline' }}>
          {t("common.returnToHome")}
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
