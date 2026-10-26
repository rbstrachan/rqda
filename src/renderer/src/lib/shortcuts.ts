export type PlatformId = "darwin" | "win32" | "linux" | string;

export function getPlatform(): PlatformId {
  try {
    return window.context?.platform ?? "win32";
  } catch {
    return "win32";
  }
}

export function isMacPlatform(platform: PlatformId = getPlatform()): boolean {
  return platform === "darwin";
}

/** Keys: Mod (Cmd/Ctrl), Shift, Alt, plus a primary key like "N" or "F2". */
export function formatShortcut(
  parts: string[],
  platform: PlatformId = getPlatform()
): string {
  const mac = isMacPlatform(platform);
  return parts
    .map((part) => {
      const key = part.toLowerCase();
      if (key === "mod" || key === "cmd" || key === "meta" || key === "ctrl") {
        return mac ? "⌘" : "Ctrl";
      }
      if (key === "shift") return mac ? "⇧" : "Shift";
      if (key === "alt" || key === "option") return mac ? "⌥" : "Alt";
      if (key === "enter" || key === "return") return mac ? "↩" : "Enter";
      if (key === "backspace") return mac ? "⌫" : "Backspace";
      if (key === "delete") return mac ? "⌦" : "Del";
      return part.length === 1 ? part.toUpperCase() : part;
    })
    .join(mac ? "" : "+");
}

export type ShortcutGroupId = "file" | "edit" | "view" | "window";

/** Curated list for the Help → Keyboard shortcuts dialog (keep in sync with menubar). */
export type ShortcutEntry = {
  group: ShortcutGroupId;
  /** i18n key for the action label */
  labelKey: string;
  keys: string[];
};

export const SHORTCUT_ENTRIES: ShortcutEntry[] = [
  { group: "file", labelKey: "menu.file.newFile", keys: ["Mod", "N"] },
  { group: "file", labelKey: "menu.file.newFolder", keys: ["Shift", "Mod", "N"] },
  { group: "file", labelKey: "menu.file.duplicate", keys: ["Mod", "D"] },
  { group: "file", labelKey: "menu.file.cut", keys: ["Mod", "X"] },
  { group: "file", labelKey: "menu.file.copy", keys: ["Mod", "C"] },
  { group: "file", labelKey: "menu.file.paste", keys: ["Mod", "V"] },
  { group: "file", labelKey: "menu.file.rename", keys: ["F2"] },
  { group: "file", labelKey: "menu.file.save", keys: ["Mod", "S"] },
  { group: "edit", labelKey: "menu.edit.undo", keys: ["Mod", "Z"] },
  { group: "edit", labelKey: "menu.edit.redo", keys: ["Shift", "Mod", "Z"] },
  { group: "edit", labelKey: "menu.edit.cut", keys: ["Mod", "X"] },
  { group: "edit", labelKey: "menu.edit.copy", keys: ["Mod", "C"] },
  { group: "edit", labelKey: "menu.edit.paste", keys: ["Mod", "V"] },
  { group: "edit", labelKey: "menu.edit.pastePlain", keys: ["Shift", "Mod", "V"] },
  { group: "edit", labelKey: "menu.edit.bold", keys: ["Mod", "B"] },
  { group: "edit", labelKey: "menu.edit.italic", keys: ["Mod", "I"] },
  { group: "edit", labelKey: "menu.edit.selectAll", keys: ["Mod", "A"] },
  { group: "edit", labelKey: "menu.edit.find", keys: ["Mod", "F"] },
  { group: "view", labelKey: "menu.view.fileTree", keys: ["Mod", "\\"] },
  { group: "view", labelKey: "menu.view.codeList", keys: ["Alt", "Mod", "\\"] },
  { group: "window", labelKey: "menu.window.minimize", keys: ["Mod", "M"] },
];

export const SHORTCUT_GROUP_ORDER: ShortcutGroupId[] = [
  "file",
  "edit",
  "view",
  "window",
];

export const SHORTCUT_GROUP_LABEL_KEYS: Record<ShortcutGroupId, string> = {
  file: "menu.file.label",
  edit: "menu.edit.label",
  view: "menu.view.label",
  window: "menu.window.label",
};
