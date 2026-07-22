import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import idCommon from "./locales/id/common.json";
import enCommon from "./locales/en/common.json";

const resources = {
  id: { common: idCommon },
  en: { common: enCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: "common",
    fallbackLng: "id",

    detection: {
      order: ["cookie", "navigator"],
      lookupCookie: "psych_lang",
      caches: ["cookie"],
      cookieMinutes: 60 * 24 * 365,
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
