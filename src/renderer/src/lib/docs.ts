import type { AppLocale } from "@shared/i18n";

const DOCS_ORIGIN = "https://docs.reiwa.ca";

/**
 * Locale-aware docs URL.
 * English is unprefixed: /qaddoe/...
 * Other locales: /{locale}/qaddoe/...
 */
export function docsUrl(
  path: string = "",
  locale: string | AppLocale = "en"
): string {
  const normalized = path.replace(/^\/+/, "");
  const suffix = normalized ? `/${normalized}` : "";
  const lang = locale.split("-")[0]?.toLowerCase() || "en";
  if (lang === "en") {
    return `${DOCS_ORIGIN}/qaddoe${suffix}`;
  }
  return `${DOCS_ORIGIN}/${lang}/qaddoe${suffix}`;
}

export function openDocs(
  path: string = "",
  locale: string | AppLocale = "en"
): void {
  window.open(docsUrl(path, locale), "_blank", "noopener,noreferrer");
}
