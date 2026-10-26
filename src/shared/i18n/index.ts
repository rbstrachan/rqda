export {
  DEFAULT_LOCALE,
  LANGUAGE_ITEMS,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  isAppLocale,
  type AppLocale,
} from "./types";
export { localeFromSystem, normalizeLanguage } from "./normalize";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import type { AppLocale } from "./types";

export const localeResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

export type TranslationResources = typeof en;

/** Simple nested-key lookup for non-i18next contexts (main, chooser). */
export function lookupTranslation(
  catalog: TranslationResources,
  key: string,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let node: unknown = catalog;
  for (const part of parts) {
    if (node == null || typeof node !== "object") return key;
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node !== "string") return key;
  if (!vars) return node;
  return node.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : `{{${name}}}`
  );
}

export function getCatalog(locale: AppLocale): TranslationResources {
  return locale === "en" ? en : fr;
}
