import { electronAPI } from "@electron-toolkit/preload";
import { DEFAULT_LOCALE, type AppLocale } from "./i18n";

export type { AppLocale } from "./i18n";

export type GetVersionsFn = () => Promise<typeof electronAPI.process.versions>;

/** CodeMirror 5-shaped cursor used in persisted codes JSON */
export type CmPosition = { line: number; ch: number };

export type CodedExcerpt = {
  id: number;
  start: CmPosition;
  end: CmPosition;
  extract: string;
  filePath: string;
};

export type Code = {
  id: number;
  name: string;
  codedExcerpts: CodedExcerpt[];
  /** null = root code */
  parentId: number | null;
  /** CSS color; null → use app accent for highlights */
  color: string | null;
};

export type CodesDocument = {
  codes: Code[];
};

export type ProjectInfo = {
  name: string;
  path: string;
  creationDate: Date | string;
};

export type ProjectOpenedPayload = {
  projectPath: string;
  projectTitle: string;
};

/** directory-tree node shape (subset we use) */
export type DirTreeNode = {
  path: string;
  name: string;
  type?: string;
  children?: DirTreeNode[];
};

export type DirTreeResult = {
  directoryTree: DirTreeNode | null;
  projectTitle: string;
};

export type SaveDialogResult = {
  filePath: string;
  fileName: string;
} | null;

export type OpenDialogResult = {
  canceled: boolean;
  filePaths: string[];
};

export type UnsubscribeFn = () => void;

export type AppTheme = "light" | "dark" | "sepia";

export type EditorFontFamily = "serif" | "sans" | "mono";

export type AppSettings = {
  accent: string | null;
  language: AppLocale;
  reducedMotion: boolean;
  highContrast: boolean;
  debugMode: boolean;
  theme: AppTheme;
  editorFontFamily: EditorFontFamily;
  editorFontSize: number;
  editorLivePreview: boolean;
};

export const DEFAULT_ACCENT = "oklch(0.58 0.18 145)";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  accent: DEFAULT_ACCENT,
  language: DEFAULT_LOCALE,
  reducedMotion: false,
  highContrast: false,
  debugMode: false,
  theme: "dark",
  editorFontFamily: "serif",
  editorFontSize: 16,
  editorLivePreview: true,
};

export type WindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
};

export type ProjectSession = {
  openPaths: string[];
  activePath: string | null;
};

export type AppContextApi = {
  getVersions: GetVersionsFn;
  triggerIPC: () => Promise<void>;

  getListOfProjects: () => Promise<ProjectInfo[]>;
  getDirTree: (folderPath: string) => Promise<DirTreeResult>;
  readFile: (filePath: string) => Promise<string>;
  saveFile: (filePath: string, content: string) => Promise<void>;
  createFile: (filePath: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  deletePaths: (paths: string[]) => Promise<void>;
  renamePath: (fromPath: string, toPath: string) => Promise<void>;
  movePaths: (
    sources: string[],
    destDir: string
  ) => Promise<{ from: string; to: string }[]>;
  copyPaths: (
    sources: string[],
    destDir: string
  ) => Promise<{ from: string; to: string }[]>;
  saveDialog: (arg: { defaultPath?: string }) => Promise<SaveDialogResult>;
  openFileDialog: () => Promise<OpenDialogResult>;
  openFolderDialog: () => Promise<string | undefined>;
  copyFilesToProject: (
    files: string[],
    projectPath: string,
    destDir?: string
  ) => Promise<void>;
  importFolderToProject: (
    sourceFolder: string,
    projectPath: string
  ) => Promise<void>;
  showItemInFolder: (filePath: string) => Promise<void>;
  openPath: (targetPath: string) => Promise<string>;
  saveCodes: (projectName: string, codes: CodesDocument) => Promise<void>;
  loadCodes: (projectName: string) => Promise<CodesDocument | undefined>;
  createFolder: (folderPath: string) => Promise<void>;
  startProjectWatch: (projectPath: string) => Promise<void>;
  stopProjectWatch: () => Promise<void>;
  returnToProjectChooser: () => Promise<void>;
  platform: "darwin" | "win32" | "linux" | string;

  minimizeWindow: () => void;
  toggleMaximizeWindow: () => void;
  closeWindow: () => void;
  quitApp: () => Promise<void>;
  onWindowFocusChange: (callback: (focused: boolean) => void) => UnsubscribeFn;

  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;

  toggleDevTools: () => Promise<void>;
  reloadWindow: () => Promise<void>;

  getProjectSession: (projectPath: string) => Promise<ProjectSession | null>;
  setProjectSession: (
    projectPath: string,
    session: ProjectSession
  ) => Promise<void>;

  onProjectOpened: (
    callback: (payload: ProjectOpenedPayload) => void
  ) => UnsubscribeFn;
  onProjectFsChanged: (callback: () => void) => UnsubscribeFn;
};

export type ChooserStrings = {
  welcomeTitle: string;
  welcomeBlurb1: string;
  welcomeBlurb2: string;
  projectNamePlaceholder: string;
  createNewProject: string;
  open: string;
  createdOn: string;
  nameProjectTitle: string;
  nameProjectBlurb: string;
  createProject: string;
  createProjectNamed: string;
  enterNameAlert: string;
};

export type ProjectApi = {
  send: (channel: string, data?: unknown) => void;
  newProject: (projectName: string) => void;
  getListOfProjects: () => Promise<ProjectInfo[]>;
  getSettings: () => Promise<AppSettings>;
  getChooserStrings: () => Promise<ChooserStrings>;
};
