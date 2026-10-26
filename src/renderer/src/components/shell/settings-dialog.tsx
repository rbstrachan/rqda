import { ALargeSmall, Bug, Check, Eye, Palette, Settings2, Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_ITEMS, type AppLocale } from "@shared/i18n";
import {
  DEFAULT_ACCENT,
  type AppSettings,
  type EditorFontFamily,
} from "@shared/types";
import {
  MAX_EDITOR_FONT_SIZE,
  MIN_EDITOR_FONT_SIZE,
} from "@/lib/editor-theme";

const fontFamilyItems: { value: EditorFontFamily; labelKey: string }[] = [
  { value: "serif", labelKey: "settings.fontSerif" },
  { value: "sans", labelKey: "settings.fontSans" },
  { value: "mono", labelKey: "settings.fontMono" },
];

const accentOptions = [
  { key: "none" as const, value: null as string | null },
  {
    key: "indigo" as const,
    value: "oklch(0.55 0.22 264)",
    foreground: "white",
  },
  {
    key: "blue" as const,
    value: "oklch(0.58 0.19 245)",
    foreground: "white",
  },
  { key: "green" as const, value: DEFAULT_ACCENT, foreground: "white" },
  {
    key: "orange" as const,
    value: "oklch(0.65 0.19 55)",
    foreground: "black",
  },
  {
    key: "pink" as const,
    value: "oklch(0.62 0.2 350)",
    foreground: "white",
  },
  { key: "white" as const, value: "white", foreground: "black" },
];

const accentLabelKeys = {
  none: "settings.accentNone",
  indigo: "settings.accentIndigo",
  blue: "settings.accentBlue",
  green: "settings.accentGreen",
  orange: "settings.accentOrange",
  pink: "settings.accentPink",
  white: "settings.accentWhite",
} as const;

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSettingsChange: (partial: Partial<AppSettings>) => void;
};

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: SettingsDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-xl">
        <div className="flex flex-col gap-1 pr-8">
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-4" />
            {t("settings.title")}
          </DialogTitle>
          <DialogDescription>{t("settings.description")}</DialogDescription>
        </div>
        <div className="mt-6 flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Palette className="size-4 text-muted-foreground" />
              {t("settings.accent")}
            </h3>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label={t("settings.accent")}
            >
              {accentOptions.map((option) => {
                const name = t(accentLabelKeys[option.key]);
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={settings.accent === option.value}
                    aria-label={name}
                    onClick={() => onSettingsChange({ accent: option.value })}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-muted aria-checked:border-primary aria-checked:ring-2 aria-checked:ring-primary/30"
                  >
                    <span
                      className="size-3 rounded-full border border-border"
                      style={{
                        backgroundColor: option.value ?? "transparent",
                      }}
                    />
                    {name}
                    {settings.accent === option.value && (
                      <Check className="size-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Type className="size-4 text-muted-foreground" />
              {t("settings.language")}
            </h3>
            <Select
              items={LANGUAGE_ITEMS}
              value={settings.language}
              onValueChange={(value) => {
                if (value == null) return;
                onSettingsChange({ language: value as AppLocale });
              }}
            >
              <SelectTrigger
                className="w-full"
                aria-label={t("settings.language")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {LANGUAGE_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <ALargeSmall className="size-4 text-muted-foreground" />
              {t("settings.typography")}
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">
                {t("settings.fontFamily")}
              </label>
              <Select
                items={fontFamilyItems.map((item) => ({
                  value: item.value,
                  label: t(item.labelKey),
                }))}
                value={settings.editorFontFamily}
                onValueChange={(value) => {
                  if (value == null) return;
                  onSettingsChange({
                    editorFontFamily: value as EditorFontFamily,
                  });
                }}
              >
                <SelectTrigger
                  className="w-full"
                  aria-label={t("settings.fontFamily")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {fontFamilyItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {t(item.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="editor-font-size"
              >
                {t("settings.fontSize")}
              </label>
              <Input
                id="editor-font-size"
                type="number"
                min={MIN_EDITOR_FONT_SIZE}
                max={MAX_EDITOR_FONT_SIZE}
                value={settings.editorFontSize}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  onSettingsChange({ editorFontSize: next });
                }}
                className="h-9 w-28"
              />
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  {t("settings.livePreview")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("settings.livePreviewDescription")}
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.editorLivePreview}
                onChange={(event) =>
                  onSettingsChange({
                    editorLivePreview: event.target.checked,
                  })
                }
                className="size-4 accent-[var(--app-accent)]"
                aria-label={t("settings.livePreviewAria")}
              />
            </label>
          </section>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">
              {t("settings.accessibility")}
            </legend>
            <label className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>{t("settings.reducedMotion")}</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(event) =>
                  onSettingsChange({ reducedMotion: event.target.checked })
                }
                className="size-4 accent-[var(--app-accent)]"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>{t("settings.highContrast")}</span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(event) =>
                  onSettingsChange({ highContrast: event.target.checked })
                }
                className="size-4 accent-[var(--app-accent)]"
              />
            </label>
          </fieldset>

          <section className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Bug className="size-4 text-muted-foreground" />
                {t("settings.debugMode")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("settings.debugModeDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.debugMode}
              onChange={(event) =>
                onSettingsChange({ debugMode: event.target.checked })
              }
              className="size-4 accent-[var(--app-accent)]"
              aria-label={t("settings.debugModeAria")}
            />
          </section>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("settings.done")}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
