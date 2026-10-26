import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LOCALE,
  localeResources,
  type AppLocale,
} from "@shared/i18n";

void i18n.use(initReactI18next).init({
  resources: localeResources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export function applyDocumentLang(locale: AppLocale): void {
  document.documentElement.lang = locale;
}

export async function setAppLanguage(locale: AppLocale): Promise<void> {
  applyDocumentLang(locale);
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
}

applyDocumentLang(DEFAULT_LOCALE);

export default i18n;
