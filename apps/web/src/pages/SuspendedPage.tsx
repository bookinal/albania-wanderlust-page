import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const SuspendedPage = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const pageBg = isDark ? '#0d0d0d' : '#f5f4f1';
  const pageText = isDark ? '#ffffff' : '#111115';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 700, color: '#E8192C' }}>Suspended</h1>
        <p style={{ marginBottom: '1rem', fontSize: '1.25rem', color: pageText }}>
          {t("common.accountSuspended")}
        </p>
      </div>
    </div>
  );
};

export default SuspendedPage;
