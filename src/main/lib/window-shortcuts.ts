import { BrowserWindow, type Input } from "electron";
import { is } from "@electron-toolkit/utils";
import { loadSettings } from "./settings";

function isReloadChord(input: Input): boolean {
  return (
    input.code === "KeyR" && (input.control || input.meta) && !input.alt
  );
}

function isDevToolsChord(input: Input): boolean {
  if (input.code === "F12") return true;
  return (
    input.code === "KeyI" &&
    input.shift &&
    (input.control || input.meta) &&
    !input.alt
  );
}

/**
 * Production: block reload + DevTools unless debugMode is on.
 * Dev builds: leave Chromium defaults (and F12 opens DevTools).
 */
export function attachWindowShortcuts(window: BrowserWindow): void {
  const { webContents } = window;

  webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;

    // Match electron-toolkit default: block accidental zoom chords
    if (
      (input.code === "Minus" || input.code === "Equal") &&
      (input.control || input.meta)
    ) {
      event.preventDefault();
      return;
    }

    if (is.dev) {
      if (input.code === "F12") {
        event.preventDefault();
        if (webContents.isDevToolsOpened()) webContents.closeDevTools();
        else webContents.openDevTools({ mode: "undocked" });
      }
      return;
    }

    const debugMode = loadSettings().debugMode;

    if (isReloadChord(input)) {
      event.preventDefault();
      if (!debugMode) return;
      if (input.shift) webContents.reloadIgnoringCache();
      else webContents.reload();
      return;
    }

    if (isDevToolsChord(input)) {
      event.preventDefault();
      if (!debugMode) return;
      if (webContents.isDevToolsOpened()) webContents.closeDevTools();
      else webContents.openDevTools({ mode: "undocked" });
    }
  });
}

export function closeDevToolsIfDisabled(): void {
  if (is.dev) return;
  if (loadSettings().debugMode) return;
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed() && win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    }
  }
}
