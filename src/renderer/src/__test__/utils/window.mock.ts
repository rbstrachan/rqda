import { vi } from "vitest";

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const context = Object.defineProperty(window, "context", {
  writable: true,
  value: {
    getVersions: vi.fn().mockResolvedValue({
      electron: "0.0",
      chrome: "0.0",
      node: "0.0",
    }),
    triggerIPC: vi.fn().mockResolvedValue(undefined),
    getListOfProjects: vi.fn().mockResolvedValue([]),
    getDirTree: vi.fn().mockResolvedValue({
      directoryTree: null,
      projectTitle: "",
    }),
    readFile: vi.fn().mockResolvedValue(""),
    saveFile: vi.fn().mockResolvedValue(undefined),
    createFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    deletePaths: vi.fn().mockResolvedValue(undefined),
    renamePath: vi.fn().mockResolvedValue(undefined),
    movePaths: vi.fn().mockResolvedValue([]),
    copyPaths: vi.fn().mockResolvedValue([]),
    saveDialog: vi.fn().mockResolvedValue(null),
    openFileDialog: vi.fn().mockResolvedValue({
      canceled: true,
      filePaths: [],
    }),
    openFolderDialog: vi.fn().mockResolvedValue(undefined),
    copyFilesToProject: vi.fn().mockResolvedValue(undefined),
    importFolderToProject: vi.fn().mockResolvedValue(undefined),
    showItemInFolder: vi.fn().mockResolvedValue(undefined),
    openPath: vi.fn().mockResolvedValue(""),
    saveCodes: vi.fn().mockResolvedValue(undefined),
    loadCodes: vi.fn().mockResolvedValue(undefined),
    createFolder: vi.fn().mockResolvedValue(undefined),
    startProjectWatch: vi.fn().mockResolvedValue(undefined),
    stopProjectWatch: vi.fn().mockResolvedValue(undefined),
    returnToProjectChooser: vi.fn().mockResolvedValue(undefined),
    platform: "linux",
    minimizeWindow: vi.fn(),
    toggleMaximizeWindow: vi.fn(),
    closeWindow: vi.fn(),
    quitApp: vi.fn().mockResolvedValue(undefined),
    onWindowFocusChange: vi.fn().mockImplementation(() => () => {}),
    getSettings: vi.fn().mockResolvedValue({
      accent: "oklch(0.58 0.18 145)",
      language: "fr",
      reducedMotion: false,
      highContrast: false,
      debugMode: false,
      theme: "dark",
      editorFontFamily: "serif",
      editorFontSize: 16,
      editorLivePreview: true,
    }),
    setSettings: vi.fn().mockImplementation(async (partial) => ({
      accent: "oklch(0.58 0.18 145)",
      language: "fr",
      reducedMotion: false,
      highContrast: false,
      debugMode: false,
      theme: "dark",
      editorFontFamily: "serif",
      editorFontSize: 16,
      editorLivePreview: true,
      ...partial,
    })),
    toggleDevTools: vi.fn().mockResolvedValue(undefined),
    reloadWindow: vi.fn().mockResolvedValue(undefined),
    getProjectSession: vi.fn().mockResolvedValue(null),
    setProjectSession: vi.fn().mockResolvedValue(undefined),
    onProjectOpened: vi.fn().mockImplementation(() => () => {}),
    onProjectFsChanged: vi.fn().mockImplementation(() => () => {}),
  },
});

export { context };
