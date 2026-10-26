import { watch, type FSWatcher } from "fs";
import type { BrowserWindow } from "electron";

let watcher: FSWatcher | null = null;
let watchedPath: string | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function startProjectWatch(
  projectPath: string,
  getWindow: () => BrowserWindow | null
): void {
  stopProjectWatch();
  watchedPath = projectPath;

  try {
    watcher = watch(projectPath, { recursive: true }, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const win = getWindow();
        if (win && !win.isDestroyed()) {
          win.webContents.send("project:fs-changed");
        }
      }, 300);
    });
    watcher.on("error", () => {
      stopProjectWatch();
    });
  } catch (error) {
    console.error("Failed to watch project folder:", error);
    watcher = null;
    watchedPath = null;
  }
}

export function stopProjectWatch(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (watcher) {
    try {
      watcher.close();
    } catch {
      // ignore
    }
    watcher = null;
  }
  watchedPath = null;
}

export function getWatchedProjectPath(): string | null {
  return watchedPath;
}
