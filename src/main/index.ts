import { app, shell, BrowserWindow, ipcMain } from "electron";
import { existsSync } from "fs";
import { join } from "path";
import { electronApp, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import {
  getVersions,
  triggerIPC,
  setupApplicationDirs,
  registerIpcHandlers,
  projectTitleFromPath,
  attachWindowStatePersistence,
  getDefaultWindowSize,
  getMinWindowSize,
  loadWindowBounds,
} from "./lib";
import { stopProjectWatch } from "./lib/project-watcher";
import { attachWindowShortcuts } from "./lib/window-shortcuts";
import type { GetVersionsFn } from "../shared/types";

let mainWindow: BrowserWindow | null = null;
let projectWindow: BrowserWindow | null = null;
let mainShouldMaximize = false;

function resolveProjectScreenHtml(): string {
  const candidates = [
    join(process.cwd(), "resources/project-screen/project.html"),
    join(app.getAppPath(), "resources/project-screen/project.html"),
    join(__dirname, "../../resources/project-screen/project.html"),
    join(process.resourcesPath, "project-screen/project.html"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

function resolveProjectPreload(): string {
  return join(__dirname, "../preload/project.js");
}

function ensureMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
  mainWindow = createMainWindow();
  return mainWindow;
}

function openProjectInMain(projectPath: string): void {
  const win = ensureMainWindow();
  const projectTitle = projectTitleFromPath(projectPath);
  win.setTitle(`${projectTitle} ・ QADDOE`);

  const sendOpened = (): void => {
    if (win.isDestroyed()) return;
    win.webContents.send("project:opened", {
      projectPath,
      projectTitle,
    });
  };

  if (win.webContents.isLoadingMainFrame()) {
    win.webContents.once("did-finish-load", sendOpened);
  } else {
    sendOpened();
  }

  if (projectWindow && !projectWindow.isDestroyed()) {
    projectWindow.destroy();
    projectWindow = null;
  }

  setTimeout(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainShouldMaximize) {
      mainWindow.maximize();
      mainShouldMaximize = false;
    }
    mainWindow.show();
  }, 500);
}

function returnToProjectChooser(): void {
  stopProjectWatch();

  // Create/show chooser first so the app never has zero windows mid-transition
  if (!projectWindow || projectWindow.isDestroyed()) {
    projectWindow = createProjectWindow();
  } else {
    projectWindow.show();
    projectWindow.focus();
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
    mainWindow = null;
  }
}

app.on("before-quit", () => {
  stopProjectWatch();
});

function closeProjectScreen(): void {
  if (projectWindow && !projectWindow.isDestroyed()) {
    projectWindow.destroy();
    projectWindow = null;
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
    mainWindow = null;
  }
}

function createMainWindow(): BrowserWindow {
  setupApplicationDirs();
  const saved = loadWindowBounds();
  const defaults = getDefaultWindowSize();
  const mins = getMinWindowSize();

  const win = new BrowserWindow({
    width: saved?.width ?? defaults.width,
    height: saved?.height ?? defaults.height,
    x: saved?.x,
    y: saved?.y,
    minWidth: mins.minWidth,
    minHeight: mins.minHeight,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: "QADDOE",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
    },
  });

  // Defer maximize until show — maximize() reveals a hidden window on Linux
  mainShouldMaximize = Boolean(saved?.isMaximized);

  attachWindowStatePersistence(win);

  win.on("ready-to-show", () => {
    // Kept hidden until a project is opened
  });

  win.on("focus", () => {
    win.webContents.send("window-focus", true);
  });

  win.on("blur", () => {
    win.webContents.send("window-focus", false);
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }

  win.on("closed", () => {
    mainWindow = null;
  });

  return win;
}

function createProjectWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1040,
    height: 700,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    transparent: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: resolveProjectPreload(),
      sandbox: true,
      contextIsolation: true,
    },
  });

  win.loadFile(resolveProjectScreenHtml());

  win.on("ready-to-show", () => {
    setupApplicationDirs();
    win.show();
  });

  win.on("closed", () => {
    projectWindow = null;
    // If chooser closed with no main window, quit (non-mac) / leave activate to recreate
    if (!mainWindow || mainWindow.isDestroyed()) {
      if (process.platform !== "darwin") {
        app.quit();
      }
    }
  });

  return win;
}

function createApplicationWindows(): void {
  mainWindow = createMainWindow();
  projectWindow = createProjectWindow();
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.reiwa.qaddoe");

  app.on("browser-window-created", (_, window) => {
    attachWindowShortcuts(window);
  });

  registerIpcHandlers({
    getMainWindow: () => mainWindow,
    getProjectWindow: () => projectWindow,
    openProjectInMain,
    closeProjectScreen,
    returnToProjectChooser,
  });

  ipcMain.handle(
    "getVersions",
    (_, ...args: Parameters<GetVersionsFn>) => getVersions(...args)
  );
  ipcMain.handle("triggerIPC", () => triggerIPC());

  createApplicationWindows();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createApplicationWindows();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
