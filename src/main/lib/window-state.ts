import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { screen, type BrowserWindow, type Rectangle } from "electron";
import type { WindowBounds } from "../../shared/types";
import { getDotPath, setupApplicationDirs } from "./paths";

const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 810;
const MIN_WIDTH = 900;
const MIN_HEIGHT = 560;

export function getDefaultWindowSize(): { width: number; height: number } {
  const { width: workWidth, height: workHeight } =
    screen.getPrimaryDisplay().workAreaSize;
  return {
    width: Math.min(DEFAULT_WIDTH, workWidth),
    height: Math.min(DEFAULT_HEIGHT, workHeight),
  };
}

export function getMinWindowSize(): { minWidth: number; minHeight: number } {
  return { minWidth: MIN_WIDTH, minHeight: MIN_HEIGHT };
}

function windowStatePath(): string {
  return join(getDotPath(), "window.json");
}

function ensureWindowStateFile(): void {
  setupApplicationDirs();
  const path = windowStatePath();
  if (!existsSync(path)) {
    writeFileSync(path, JSON.stringify({}));
  }
}

function isVisibleOnDisplay(bounds: Rectangle): boolean {
  const display = screen.getDisplayMatching(bounds);
  const area = display.workArea;
  const margin = 40;
  return (
    bounds.x + bounds.width > area.x + margin &&
    bounds.y + bounds.height > area.y + margin &&
    bounds.x < area.x + area.width - margin &&
    bounds.y < area.y + area.height - margin
  );
}

export function loadWindowBounds(): WindowBounds | null {
  ensureWindowStateFile();
  try {
    const raw = readFileSync(windowStatePath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<WindowBounds>;
    if (
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      typeof parsed.width !== "number" ||
      typeof parsed.height !== "number"
    ) {
      return null;
    }
    const bounds: WindowBounds = {
      x: parsed.x,
      y: parsed.y,
      width: Math.max(MIN_WIDTH, parsed.width),
      height: Math.max(MIN_HEIGHT, parsed.height),
      isMaximized: Boolean(parsed.isMaximized),
    };
    if (!isVisibleOnDisplay(bounds)) return null;
    return bounds;
  } catch {
    return null;
  }
}

export function saveWindowBounds(bounds: WindowBounds): void {
  ensureWindowStateFile();
  writeFileSync(windowStatePath(), JSON.stringify(bounds, null, 2));
}

export function attachWindowStatePersistence(win: BrowserWindow): void {
  let saveTimer: NodeJS.Timeout | null = null;

  const persist = (): void => {
    if (win.isDestroyed()) return;
    const isMaximized = win.isMaximized();
    const bounds = isMaximized ? win.getNormalBounds() : win.getBounds();
    saveWindowBounds({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized,
    });
  };

  const schedulePersist = (): void => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 400);
  };

  win.on("resize", schedulePersist);
  win.on("move", schedulePersist);
  win.on("maximize", schedulePersist);
  win.on("unmaximize", schedulePersist);
  win.on("close", () => {
    if (saveTimer) clearTimeout(saveTimer);
    persist();
  });
}
