import { useTranslation } from "react-i18next";

const SuspendedPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">
          {t("common.accountSuspended")}
        </p>
      </div>
    </div>
  );
};

export default SuspendedPage;
