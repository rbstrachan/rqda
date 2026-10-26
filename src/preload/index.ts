import { contextBridge } from "electron";
import { ipcRenderer } from "electron/renderer";
import type {
  AppContextApi,
  AppSettings,
  CodesDocument,
  GetVersionsFn,
  OpenDialogResult,
  ProjectOpenedPayload,
  ProjectSession,
  SaveDialogResult,
} from "../shared/types";

if (!process.contextIsolated) {
  throw new Error("Context isolation must be enabled in the Browser window");
}

function subscribe<T>(
  channel: string,
  callback: (payload: T) => void
): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T): void => {
    callback(payload);
  };
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

try {
  const api: AppContextApi = {
    getVersions: (...args: Parameters<GetVersionsFn>) =>
      ipcRenderer.invoke("getVersions", ...args),
    triggerIPC: () => ipcRenderer.invoke("triggerIPC"),

    getListOfProjects: () => ipcRenderer.invoke("get-list-of-projects"),
    getDirTree: (folderPath: string) =>
      ipcRenderer.invoke("get-dir-tree", folderPath),
    readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
    saveFile: (filePath: string, content: string) =>
      ipcRenderer.invoke("save-file", { filePath, content }),
    createFile: (filePath: string) =>
      ipcRenderer.invoke("create-file", filePath),
    deleteFile: (filePath: string) =>
      ipcRenderer.invoke("delete-file", filePath),
    deletePaths: (paths: string[]) =>
      ipcRenderer.invoke("delete-paths", paths),
    renamePath: (fromPath: string, toPath: string) =>
      ipcRenderer.invoke("rename-path", fromPath, toPath),
    movePaths: (sources: string[], destDir: string) =>
      ipcRenderer.invoke("move-paths", sources, destDir) as Promise<
        { from: string; to: string }[]
      >,
    copyPaths: (sources: string[], destDir: string) =>
      ipcRenderer.invoke("copy-paths", sources, destDir) as Promise<
        { from: string; to: string }[]
      >,
    saveDialog: (arg: { defaultPath?: string }) =>
      ipcRenderer.invoke("save-dialog", arg) as Promise<SaveDialogResult>,
    openFileDialog: () =>
      ipcRenderer.invoke("open-file-dialog") as Promise<OpenDialogResult>,
    openFolderDialog: async () => {
      const result = (await ipcRenderer.invoke(
        "open-folder-dialog"
      )) as OpenDialogResult;
      return result.filePaths?.[0];
    },
    copyFilesToProject: (files, projectPath, destDir) =>
      ipcRenderer.invoke("copy-files-to-project", files, projectPath, destDir),
    importFolderToProject: (sourceFolder, projectPath) =>
      ipcRenderer.invoke("import-folder-to-project", sourceFolder, projectPath),
    showItemInFolder: (filePath: string) =>
      ipcRenderer.invoke("show-item-in-folder", filePath),
    openPath: (targetPath: string) =>
      ipcRenderer.invoke("open-path", targetPath) as Promise<string>,
    saveCodes: (projectName: string, codes: CodesDocument) =>
      ipcRenderer.invoke("save-codes", projectName, codes),
    loadCodes: (projectName: string) =>
      ipcRenderer.invoke("load-codes", projectName),
    createFolder: (folderPath: string) =>
      ipcRenderer.invoke("create-folder", folderPath),
    startProjectWatch: (projectPath: string) =>
      ipcRenderer.invoke("start-project-watch", projectPath),
    stopProjectWatch: () => ipcRenderer.invoke("stop-project-watch"),
    returnToProjectChooser: () =>
      ipcRenderer.invoke("return-to-project-chooser"),
    platform: process.platform,

    minimizeWindow: () => ipcRenderer.send("app/minimize"),
    toggleMaximizeWindow: () => ipcRenderer.send("app/toggle-maximize"),
    closeWindow: () => ipcRenderer.send("app/close"),
    quitApp: () => ipcRenderer.invoke("quit-app"),
    onWindowFocusChange: (callback) =>
      subscribe<boolean>("window-focus", callback),

    getSettings: () =>
      ipcRenderer.invoke("get-settings") as Promise<AppSettings>,
    setSettings: (settings) =>
      ipcRenderer.invoke("set-settings", settings) as Promise<AppSettings>,

    toggleDevTools: () => ipcRenderer.invoke("toggle-devtools"),
    reloadWindow: () => ipcRenderer.invoke("reload-window"),

    getProjectSession: (projectPath) =>
      ipcRenderer.invoke(
        "get-project-session",
        projectPath
      ) as Promise<ProjectSession | null>,
    setProjectSession: (projectPath, session) =>
      ipcRenderer.invoke(
        "set-project-session",
        projectPath,
        session
      ) as Promise<void>,

    onProjectOpened: (callback) =>
      subscribe<ProjectOpenedPayload>("project:opened", callback),
    onProjectFsChanged: (callback) =>
      subscribe<void>("project:fs-changed", () => callback()),
  };

  contextBridge.exposeInMainWorld("context", api);
} catch (error) {
  console.error("Error occured when establishing context bridge: ", error);
}
