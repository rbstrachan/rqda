import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
  type EditorFontFamily,
} from "../../shared/types";
import {
  localeFromSystem,
  normalizeLanguage,
  type AppLocale,
} from "../../shared/i18n";
import { getDotPath, setupApplicationDirs } from "./paths";

function settingsPath(): string {
  return join(getDotPath(), "settings.json");
}

function detectInitialLanguage(): AppLocale {
  try {
    return localeFromSystem(app.getLocale());
  } catch {
    return DEFAULT_APP_SETTINGS.language;
  }
}

function normalizeEditorFontFamily(value: unknown): EditorFontFamily {
  if (value === "serif" || value === "sans" || value === "mono") return value;
  return DEFAULT_APP_SETTINGS.editorFontFamily;
}

function normalizeEditorFontSize(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_APP_SETTINGS.editorFontSize;
  return Math.min(22, Math.max(12, Math.round(n)));
}

function normalizeSettings(partial: Partial<AppSettings>): AppSettings {
  const merged = { ...DEFAULT_APP_SETTINGS, ...partial };
  return {
    ...merged,
    language: normalizeLanguage(merged.language),
    editorFontFamily: normalizeEditorFontFamily(merged.editorFontFamily),
    editorFontSize: normalizeEditorFontSize(merged.editorFontSize),
    editorLivePreview: Boolean(merged.editorLivePreview),
  };
}

function ensureSettingsFile(): void {
  setupApplicationDirs();
  const path = settingsPath();
  if (!existsSync(path)) {
    const initial: AppSettings = {
      ...DEFAULT_APP_SETTINGS,
      language: detectInitialLanguage(),
    };
    writeFileSync(path, JSON.stringify(initial, null, 2));
  }
}

export function loadSettings(): AppSettings {
  ensureSettingsFile();
  try {
    const raw = readFileSync(settingsPath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const hadLanguage = Object.prototype.hasOwnProperty.call(parsed, "language");
    const next = normalizeSettings({
      ...parsed,
      language: hadLanguage
        ? parsed.language
        : detectInitialLanguage(),
    });

    // Persist migration from legacy display names / missing language
    if (
      !hadLanguage ||
      (typeof parsed.language === "string" && parsed.language !== next.language)
    ) {
      writeFileSync(settingsPath(), JSON.stringify(next, null, 2));
    }

    return next;
  } catch {
    return {
      ...DEFAULT_APP_SETTINGS,
      language: detectInitialLanguage(),
    };
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings();
  const next = normalizeSettings({
    ...current,
    ...partial,
    language:
      partial.language !== undefined
        ? normalizeLanguage(partial.language)
        : current.language,
  });
  ensureSettingsFile();
  writeFileSync(settingsPath(), JSON.stringify(next, null, 2));
  return next;
}
