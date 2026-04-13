import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  const pageBg = isDark ? '#0d0d0d' : '#f5f4f1';
  const pageText = isDark ? '#ffffff' : '#111115';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 700, color: '#E8192C' }}>404</h1>
        <p style={{ marginBottom: '1rem', fontSize: '1.25rem', color: pageText }}>
          {t("common.pageNotFound")}
        </p>
        <a href="/" style={{ color: '#E8192C', textDecoration: 'underline' }}>
          {t("common.returnToHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
