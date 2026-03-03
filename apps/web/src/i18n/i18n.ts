import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en.json";
import sqTranslation from "./locales/sq.json";
import itTranslation from "./locales/it.json";
import frTranslation from "./locales/fr.json";

// Language resources
const resources = {
  en: {
    translation: enTranslation,
  },
  sq: {
    translation: sqTranslation,
  },
  it: { 
    translation: itTranslation,
  },
  fr : {
    translation: frTranslation,
  }
};

i18n.use(initReactI18next).init({
  resources,
  defaultNS: "translation",
  fallbackLng: "en",
  lng: localStorage.getItem("language") || "en",

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  react: {
    useSuspense: true,
    bindI18n: "languageChanged loaded",
    bindI18nStore: "added removed",
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "em"],
  },
});

export default i18n;
