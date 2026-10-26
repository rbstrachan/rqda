export const SUPPORTED_LOCALES = ["en", "fr"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "fr";

/** Native-language labels for the language picker (not UI-translated). */
export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
};

export const LANGUAGE_ITEMS = SUPPORTED_LOCALES.map((value) => ({
  value,
  label: LOCALE_LABELS[value],
}));

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}
