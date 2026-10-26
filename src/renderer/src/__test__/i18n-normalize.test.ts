import { describe, expect, test } from "vitest";
import { localeFromSystem, normalizeLanguage } from "@shared/i18n";

describe("normalizeLanguage", () => {
  test("accepts supported codes", () => {
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage("fr")).toBe("fr");
  });

  test("migrates legacy display names", () => {
    expect(normalizeLanguage("Français")).toBe("fr");
    expect(normalizeLanguage("English")).toBe("en");
    expect(normalizeLanguage("Deutsch")).toBe("fr");
  });

  test("maps system locales", () => {
    expect(localeFromSystem("en-US")).toBe("en");
    expect(localeFromSystem("fr-CA")).toBe("fr");
    expect(localeFromSystem("de-DE")).toBe("fr");
  });
});
