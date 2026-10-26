import { Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SHORTCUT_ENTRIES,
  SHORTCUT_GROUP_LABEL_KEYS,
  SHORTCUT_GROUP_ORDER,
  formatShortcut,
  type ShortcutGroupId,
} from "@/lib/shortcuts";

type ShortcutsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const { t } = useTranslation();

  const byGroup = SHORTCUT_GROUP_ORDER.map((group) => ({
    group,
    entries: SHORTCUT_ENTRIES.filter((e) => e.group === group),
  })).filter((g) => g.entries.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-lg">
        <div className="flex flex-col gap-1 pr-8">
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="size-4" />
            {t("menu.help.shortcuts")}
          </DialogTitle>
          <DialogDescription>{t("shortcuts.description")}</DialogDescription>
        </div>
        <div className="mt-6 max-h-[60vh] space-y-5 overflow-y-auto thin-scrollbar pr-1">
          {byGroup.map(({ group, entries }) => (
            <section key={group} className="flex flex-col gap-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t(SHORTCUT_GROUP_LABEL_KEYS[group as ShortcutGroupId])}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {entries.map((entry) => (
                  <li
                    key={`${entry.group}-${entry.labelKey}`}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 truncate">{t(entry.labelKey)}</span>
                    <kbd className="shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {formatShortcut(entry.keys)}
                    </kbd>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogPopup>
    </Dialog>
  );
}
