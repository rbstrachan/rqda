import {
  getCatalog,
  lookupTranslation,
  normalizeLanguage,
  type AppLocale,
} from "../../shared/i18n";
import { loadSettings } from "./settings";

export function getAppLocale(): AppLocale {
  return normalizeLanguage(loadSettings().language);
}

export function t(
  key: string,
  vars?: Record<string, string | number>,
  locale?: AppLocale
): string {
  const lang = locale ?? getAppLocale();
  return lookupTranslation(getCatalog(lang), key, vars);
}
