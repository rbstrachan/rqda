import { app, BrowserWindow, ipcMain, shell } from "electron";
import { is } from "@electron-toolkit/utils";
import { listProjects, createProject, projectTitleFromPath } from "./projects";
import {
  getDirTree,
  readFile,
  saveFile,
  createFile,
  createFolder,
  deleteFile,
  deletePaths,
  renamePath,
  movePaths,
  copyFilesToProject,
  importFolderToProject,
  copyPaths,
} from "./files";
import { saveCodes, loadCodes } from "./codes";
import {
  openFolderDialog,
  openFileDialog,
  saveDialog,
  showItemInFolder,
  openPath,
} from "./dialogs";
import { loadSettings, saveSettings } from "./settings";
import { loadProjectSession, saveProjectSession } from "./sessions";
import { startProjectWatch, stopProjectWatch } from "./project-watcher";
import { closeDevToolsIfDisabled } from "./window-shortcuts";
import { getCatalog, normalizeLanguage } from "../../shared/i18n";
import type {
  AppSettings,
  CodesDocument,
  ProjectSession,
} from "../../shared/types";
import type { BrowserWindow as BrowserWindowType } from "electron";

export type WindowRefs = {
  getMainWindow: () => BrowserWindowType | null;
  getProjectWindow: () => BrowserWindowType | null;
  openProjectInMain: (projectPath: string) => void;
  closeProjectScreen: () => void;
  returnToProjectChooser: () => void;
};

function windowFromEvent(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent): BrowserWindowType | null {
  return BrowserWindow.fromWebContents(event.sender);
}

export function registerIpcHandlers(refs: WindowRefs): void {
  ipcMain.handle("get-list-of-projects", () => listProjects());

  ipcMain.on("create-new-project", (_event, projectName: string) => {
    const projectPath = createProject(projectName);
    refs.openProjectInMain(projectPath);
  });

  ipcMain.on("request-open-project", (_event, projectPath: string) => {
    refs.openProjectInMain(projectPath);
  });

  ipcMain.on("request-close-project-screen", () => {
    refs.closeProjectScreen();
  });

  ipcMain.handle("get-dir-tree", (_event, folderPath: string) =>
    getDirTree(folderPath)
  );

  ipcMain.handle("read-file", (_event, filePath: string) => readFile(filePath));

  ipcMain.handle(
    "save-file",
    (_event, data: { filePath: string; content: string }) => {
      saveFile(data.filePath, data.content);
    }
  );

  ipcMain.handle("create-file", (_event, filePath: string) => {
    createFile(filePath);
  });

  ipcMain.handle("create-folder", (_event, folderPath: string) => {
    createFolder(folderPath);
  });

  ipcMain.handle("delete-file", async (_event, filePath: string) => {
    await deleteFile(filePath);
  });

  ipcMain.handle("delete-paths", async (_event, paths: string[]) => {
    await deletePaths(paths);
  });

  ipcMain.handle(
    "rename-path",
    (_event, fromPath: string, toPath: string) => {
      renamePath(fromPath, toPath);
    }
  );

  ipcMain.handle(
    "move-paths",
    (_event, sources: string[], destDir: string) => movePaths(sources, destDir)
  );

  ipcMain.handle(
    "copy-paths",
    (_event, sources: string[], destDir: string) => copyPaths(sources, destDir)
  );

  ipcMain.handle("start-project-watch", (_event, projectPath: string) => {
    startProjectWatch(projectPath, refs.getMainWindow);
  });

  ipcMain.handle("stop-project-watch", () => {
    stopProjectWatch();
  });

  ipcMain.handle("return-to-project-chooser", () => {
    refs.returnToProjectChooser();
  });

  ipcMain.handle("open-folder-dialog", async () => {
    const result = await openFolderDialog();
    return result;
  });

  ipcMain.handle("open-file-dialog", async () => openFileDialog());

  ipcMain.handle(
    "save-dialog",
    async (_event, arg: { defaultPath?: string }) => saveDialog(arg)
  );

  ipcMain.handle(
    "copy-files-to-project",
    async (
      _event,
      files: string[],
      projectPath: string,
      destDir?: string
    ) => {
      await copyFilesToProject(files, projectPath, destDir);
    }
  );

  ipcMain.handle(
    "import-folder-to-project",
    async (_event, sourceFolder: string, projectPath: string) => {
      await importFolderToProject(sourceFolder, projectPath);
    }
  );

  ipcMain.handle(
    "save-codes",
    (_event, projectName: string, codesJSON: CodesDocument) => {
      saveCodes(projectName, codesJSON);
    }
  );

  ipcMain.handle("load-codes", (_event, projectName: string) =>
    loadCodes(projectName)
  );

  ipcMain.handle("show-item-in-folder", (_event, filePath: string) => {
    showItemInFolder(filePath);
  });

  ipcMain.handle("open-path", (_event, targetPath: string) =>
    openPath(targetPath)
  );

  ipcMain.handle("open-external", (_event, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.on("app/minimize", (event) => {
    windowFromEvent(event)?.minimize();
  });

  ipcMain.on("app/toggle-maximize", (event) => {
    const win = windowFromEvent(event);
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });

  ipcMain.on("app/close", (event) => {
    windowFromEvent(event)?.close();
  });

  ipcMain.handle("quit-app", () => {
    app.quit();
  });

  ipcMain.handle("get-settings", () => loadSettings());

  ipcMain.handle(
    "set-settings",
    (_event, partial: Partial<AppSettings>) => {
      const next = saveSettings(partial);
      if (partial.debugMode === false) {
        closeDevToolsIfDisabled();
      }
      return next;
    }
  );

  ipcMain.handle("toggle-devtools", (event) => {
    if (!is.dev && !loadSettings().debugMode) return;
    const win = windowFromEvent(event);
    if (!win) return;
    const { webContents } = win;
    if (webContents.isDevToolsOpened()) webContents.closeDevTools();
    else webContents.openDevTools({ mode: "undocked" });
  });

  ipcMain.handle("reload-window", (event) => {
    if (!is.dev && !loadSettings().debugMode) return;
    windowFromEvent(event)?.webContents.reload();
  });

  ipcMain.handle("get-chooser-strings", () => {
    const locale = normalizeLanguage(loadSettings().language);
    return getCatalog(locale).chooser;
  });

  ipcMain.handle("get-project-session", (_event, projectPath: string) =>
    loadProjectSession(projectPath)
  );

  ipcMain.handle(
    "set-project-session",
    (_event, projectPath: string, session: ProjectSession) => {
      saveProjectSession(projectPath, session);
    }
  );

  // Keep for title helper usage from other modules if needed
  void projectTitleFromPath;
}
