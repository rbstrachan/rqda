import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_ACCENT,
  type AppSettings,
  type AppTheme,
} from "@shared/types";
import { normalizeLanguage, type AppLocale } from "@shared/i18n";
import { setAppLanguage } from "@/i18n";
import {
  clampEditorFontSize,
  normalizeEditorFontFamily,
} from "@/lib/editor-theme";

const ACCENT_PROPERTIES = [
  "--app-accent",
  "--ring",
  "--primary",
  "--sidebar-primary",
  "--accent",
  "--accent-foreground",
] as const;

function applyAccent(accent: string | null): void {
  const root = document.documentElement;
  if (!accent) {
    ACCENT_PROPERTIES.forEach((property) => root.style.removeProperty(property));
    return;
  }
  root.style.setProperty("--app-accent", accent);
  root.style.setProperty("--ring", accent);
  root.style.setProperty("--primary", accent);
  root.style.setProperty("--sidebar-primary", accent);
  root.style.setProperty("--accent", accent);
  root.style.setProperty(
    "--accent-foreground",
    accent === "white" ? "black" : "white"
  );
}

function applyTheme(theme: AppTheme): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark", "sepia");
  root.classList.add(theme);
}

function applyAccessibility(
  reducedMotion: boolean,
  highContrast: boolean
): void {
  const root = document.documentElement;
  root.classList.toggle("reduce-motion", reducedMotion);
  root.classList.toggle("high-contrast", highContrast);
}

function applySettings(settings: AppSettings): void {
  applyAccent(settings.accent);
  applyTheme(settings.theme);
  applyAccessibility(settings.reducedMotion, settings.highContrast);
  void setAppLanguage(normalizeLanguage(settings.language));
}

function normalizeLoaded(settings: AppSettings): AppSettings {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...settings,
    language: normalizeLanguage(settings.language),
    editorFontFamily: normalizeEditorFontFamily(settings.editorFontFamily),
    editorFontSize: clampEditorFontSize(settings.editorFontSize),
    editorLivePreview: Boolean(settings.editorLivePreview),
  };
}

export function usePreferences() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    applySettings(DEFAULT_APP_SETTINGS);

    let cancelled = false;

    async function hydrate(): Promise<void> {
      try {
        const loaded = await window.context.getSettings();
        if (cancelled) return;
        const next = normalizeLoaded({
          ...DEFAULT_APP_SETTINGS,
          ...loaded,
          accent: loaded.accent === undefined ? DEFAULT_ACCENT : loaded.accent,
        });
        setSettingsState(next);
        applySettings(next);
      } catch {
        if (cancelled) return;
        applySettings(DEFAULT_APP_SETTINGS);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = normalizeLoaded({
        ...prev,
        ...partial,
        language:
          partial.language !== undefined
            ? normalizeLanguage(partial.language)
            : prev.language,
      });
      applySettings(next);
      return next;
    });

    try {
      const payload =
        partial.language !== undefined
          ? {
              ...partial,
              language: normalizeLanguage(partial.language) as AppLocale,
            }
          : partial;
      const saved = await window.context.setSettings(payload);
      const normalized = normalizeLoaded(saved);
      setSettingsState(normalized);
      applySettings(normalized);
      return normalized;
    } catch {
      return null;
    }
  }, []);

  const setTheme = useCallback(
    (theme: AppTheme) => updateSettings({ theme }),
    [updateSettings]
  );

  const cycleTheme = useCallback(() => {
    const order: AppTheme[] = ["light", "dark", "sepia"];
    const index = order.indexOf(settings.theme);
    const next = order[(index + 1) % order.length];
    return setTheme(next);
  }, [setTheme, settings.theme]);

  return {
    settings,
    ready,
    updateSettings,
    setTheme,
    cycleTheme,
  };
}
