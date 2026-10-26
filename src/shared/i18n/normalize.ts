import {
  DEFAULT_LOCALE,
  isAppLocale,
  type AppLocale,
} from "./types";

const LEGACY_LANGUAGE_MAP: Record<string, AppLocale> = {
  français: "fr",
  francais: "fr",
  french: "fr",
  fr: "fr",
  "fr-fr": "fr",
  "fr-ca": "fr",
  english: "en",
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  "en-ca": "en",
};

/**
 * Map stored / OS locale strings onto a supported app locale.
 * Accepts legacy display names ("Français", "English") and BCP-47 tags.
 */
export function normalizeLanguage(
  value: unknown,
  fallback: AppLocale = DEFAULT_LOCALE
): AppLocale {
  if (isAppLocale(value)) return value;
  if (typeof value !== "string" || !value.trim()) return fallback;

  const trimmed = value.trim();
  if (isAppLocale(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (LEGACY_LANGUAGE_MAP[lower]) return LEGACY_LANGUAGE_MAP[lower];

  const primary = lower.split(/[-_]/)[0];
  if (isAppLocale(primary)) return primary;
  if (LEGACY_LANGUAGE_MAP[primary]) return LEGACY_LANGUAGE_MAP[primary];

  return fallback;
}

/** Prefer a supported locale from an OS tag (e.g. app.getLocale()). */
export function localeFromSystem(
  systemLocale: string | undefined | null,
  fallback: AppLocale = DEFAULT_LOCALE
): AppLocale {
  return normalizeLanguage(systemLocale, fallback);
}
