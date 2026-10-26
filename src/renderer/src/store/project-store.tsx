import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type {
  CodesDocument,
  DirTreeNode,
  ProjectOpenedPayload,
} from "@shared/types";
import {
  buildCodeRetrievalContent,
  createCode,
  createEmptyCode,
  deleteCode,
  denormalize,
  emptyCodesDocument,
  normalize,
  normalizeCodesDocument,
  remapExcerptFilePaths,
  renameCode,
  reparentCode,
  setCodeColor,
} from "@/lib/coding";
import {
  basenamePath,
  dirnamePath,
  ensureMdExtension,
  joinPath,
  remapPath,
} from "@/lib/path-utils";
import {
  dirTreeToNodes,
  findNodeByPath,
  type TreeNode,
} from "@/lib/tree-utils";
import type { CmPosition } from "@shared/types";
import i18n from "@/i18n";

export type EditorTab = {
  id: string;
  title: string;
  content: string;
  path: string | null;
  dirty: boolean;
  readOnly: boolean;
};

export type InlineCreateKind = "file" | "folder";

export type InlineCreateRequest = {
  id: number;
  kind: InlineCreateKind;
  parentPath: string;
};

export type FileClipboard = {
  mode: "cut" | "copy";
  paths: string[];
};

export type AppDialog =
  | {
      kind: "delete";
      paths: string[];
      title: string;
      description: string;
    }
  | {
      kind: "deleteCode";
      codeId: number;
      title: string;
      description: string;
    }
  | {
      kind: "error";
      title: string;
      description: string;
    };

type ProjectState = {
  projectPath: string | null;
  projectTitle: string | null;
  dirTree: DirTreeNode | null;
  treeNodes: TreeNode[];
  codes: CodesDocument;
  tabs: EditorTab[];
  activeTabId: string | null;
  selectedFilePath: string | null;
  treeSelection: string[];
  selectedCodeId: number | null;
  statusMessage: string;
  inlineCreateRequest: InlineCreateRequest | null;
  renameRequestPath: string | null;
  fileClipboard: FileClipboard | null;
  dialog: AppDialog | null;
};

type Action =
  | { type: "PROJECT_OPENED"; payload: ProjectOpenedPayload }
  | { type: "SET_TREE"; tree: DirTreeNode | null }
  | { type: "SET_CODES"; codes: CodesDocument }
  | { type: "OPEN_TAB"; tab: EditorTab }
  | { type: "CLOSE_TAB"; tabId: string }
  | { type: "SET_ACTIVE_TAB"; tabId: string }
  | { type: "UPDATE_TAB_CONTENT"; tabId: string; content: string }
  | { type: "MARK_TAB_SAVED"; tabId: string }
  | { type: "SET_SELECTED_FILE"; path: string | null }
  | { type: "SET_TREE_SELECTION"; paths: string[] }
  | { type: "SET_SELECTED_CODE"; codeId: number | null }
  | { type: "SET_TAB_READONLY"; tabId: string; readOnly: boolean }
  | { type: "REMAP_TAB_PATHS"; mappings: { from: string; to: string }[] }
  | { type: "CLOSE_TABS_FOR_PATHS"; paths: string[] }
  | { type: "SET_STATUS"; message: string }
  | { type: "REQUEST_INLINE_CREATE"; kind: InlineCreateKind; parentPath: string }
  | { type: "CLEAR_INLINE_CREATE" }
  | { type: "REQUEST_RENAME"; path: string }
  | { type: "CLEAR_RENAME_REQUEST" }
  | { type: "SET_FILE_CLIPBOARD"; clipboard: FileClipboard | null }
  | { type: "SET_DIALOG"; dialog: AppDialog | null };

const initialState: ProjectState = {
  projectPath: null,
  projectTitle: null,
  dirTree: null,
  treeNodes: [],
  codes: emptyCodesDocument(),
  tabs: [],
  activeTabId: null,
  selectedFilePath: null,
  treeSelection: [],
  selectedCodeId: null,
  statusMessage: i18n.t("store.ready"),
  inlineCreateRequest: null,
  renameRequestPath: null,
  fileClipboard: null,
  dialog: null,
};

function syncTreeToActiveTab(
  state: ProjectState,
  activeTabId: string | null
): Pick<ProjectState, "treeSelection" | "selectedFilePath"> {
  const tab = state.tabs.find((t) => t.id === activeTabId);
  if (tab?.path) {
    return { treeSelection: [tab.path], selectedFilePath: tab.path };
  }
  return {
    treeSelection: state.treeSelection,
    selectedFilePath: state.selectedFilePath,
  };
}

let createRequestCounter = 0;

function reducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case "PROJECT_OPENED":
      return {
        ...initialState,
        projectPath: action.payload.projectPath,
        projectTitle: action.payload.projectTitle,
        statusMessage: i18n.t("store.ready"),
      };
    case "SET_TREE":
      return {
        ...state,
        dirTree: action.tree,
        treeNodes: dirTreeToNodes(action.tree),
      };
    case "SET_CODES":
      return { ...state, codes: action.codes };
    case "OPEN_TAB": {
      const existing = state.tabs.find(
        (t) =>
          (t.path && action.tab.path && t.path === action.tab.path) ||
          t.id === action.tab.id
      );
      if (existing) {
        const next = { ...state, activeTabId: existing.id };
        return { ...next, ...syncTreeToActiveTab(next, existing.id) };
      }
      const tabs = [...state.tabs, action.tab];
      const next = {
        ...state,
        tabs,
        activeTabId: action.tab.id,
      };
      return { ...next, ...syncTreeToActiveTab(next, action.tab.id) };
    }
    case "CLOSE_TAB": {
      const index = state.tabs.findIndex((t) => t.id === action.tabId);
      if (index === -1) return state;
      const tabs = state.tabs.filter((t) => t.id !== action.tabId);
      let activeTabId = state.activeTabId;
      if (state.activeTabId === action.tabId) {
        activeTabId =
          tabs.length > 0 ? tabs[Math.max(0, index - 1)]?.id ?? null : null;
      }
      const next = { ...state, tabs, activeTabId };
      return { ...next, ...syncTreeToActiveTab(next, activeTabId) };
    }
    case "SET_ACTIVE_TAB": {
      const next = { ...state, activeTabId: action.tabId };
      return { ...next, ...syncTreeToActiveTab(next, action.tabId) };
    }
    case "UPDATE_TAB_CONTENT":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.tabId
            ? { ...t, content: action.content, dirty: true }
            : t
        ),
      };
    case "MARK_TAB_SAVED":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.tabId ? { ...t, dirty: false } : t
        ),
      };
    case "SET_SELECTED_FILE":
      return { ...state, selectedFilePath: action.path };
    case "SET_TREE_SELECTION":
      return { ...state, treeSelection: action.paths };
    case "SET_SELECTED_CODE":
      return { ...state, selectedCodeId: action.codeId };
    case "SET_TAB_READONLY":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.tabId ? { ...t, readOnly: action.readOnly } : t
        ),
      };
    case "REMAP_TAB_PATHS": {
      const tabs = state.tabs.map((tab) => {
        if (!tab.path) return tab;
        for (const { from, to } of action.mappings) {
          const next = remapPath(tab.path, from, to);
          if (next) {
            return { ...tab, path: next, title: basenamePath(next) };
          }
        }
        return tab;
      });
      let selectedFilePath = state.selectedFilePath;
      if (selectedFilePath) {
        for (const { from, to } of action.mappings) {
          const next = remapPath(selectedFilePath, from, to);
          if (next) {
            selectedFilePath = next;
            break;
          }
        }
      }
      const treeSelection = state.treeSelection.map((path) => {
        for (const { from, to } of action.mappings) {
          const next = remapPath(path, from, to);
          if (next) return next;
        }
        return path;
      });
      return { ...state, tabs, selectedFilePath, treeSelection };
    }
    case "CLOSE_TABS_FOR_PATHS": {
      const shouldClose = (path: string | null): boolean => {
        if (!path) return false;
        return action.paths.some(
          (p) => path === p || path.startsWith(p + "/") || path.startsWith(p + "\\")
        );
      };
      const tabs = state.tabs.filter((t) => !shouldClose(t.path));
      const activeStillOpen = tabs.some((t) => t.id === state.activeTabId);
      const activeTabId = activeStillOpen
        ? state.activeTabId
        : tabs[tabs.length - 1]?.id ?? null;
      const next = { ...state, tabs, activeTabId };
      return { ...next, ...syncTreeToActiveTab(next, activeTabId) };
    }
    case "SET_STATUS":
      return { ...state, statusMessage: action.message };
    case "REQUEST_INLINE_CREATE":
      createRequestCounter += 1;
      return {
        ...state,
        inlineCreateRequest: {
          id: createRequestCounter,
          kind: action.kind,
          parentPath: action.parentPath,
        },
      };
    case "CLEAR_INLINE_CREATE":
      return { ...state, inlineCreateRequest: null };
    case "REQUEST_RENAME":
      return { ...state, renameRequestPath: action.path };
    case "CLEAR_RENAME_REQUEST":
      return { ...state, renameRequestPath: null };
    case "SET_FILE_CLIPBOARD":
      return { ...state, fileClipboard: action.clipboard };
    case "SET_DIALOG":
      return { ...state, dialog: action.dialog };
    default:
      return state;
  }
}

type ProjectStoreValue = {
  state: ProjectState;
  activeTab: EditorTab | null;
  refreshTree: () => Promise<void>;
  openFile: (filePath: string) => Promise<void>;
  closeTab: (tabId: string, save?: boolean) => Promise<void>;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  saveTab: (tabId: string) => Promise<void>;
  saveAllTabs: () => Promise<{ ok: true } | { ok: false; error: string }>;
  createNewFile: (parentPath?: string) => void;
  createNewFolder: (parentPath?: string) => void;
  resolveCreateParent: (explicit?: string) => string | null;
  clearInlineCreate: () => void;
  clearRenameRequest: () => void;
  requestRename: (path?: string) => void;
  commitCreate: (
    parentPath: string,
    kind: InlineCreateKind,
    name: string
  ) => Promise<string | null>;
  renameNode: (oldPath: string, newName: string) => Promise<void>;
  moveNodes: (sources: string[], destDir: string) => Promise<void>;
  deleteSelection: (
    paths?: string[],
    options?: { confirm?: boolean }
  ) => Promise<void>;
  importFiles: () => Promise<void>;
  importFolder: () => Promise<void>;
  deleteActiveFile: () => Promise<void>;
  setTreeSelection: (paths: string[]) => void;
  revealInFolder: (path?: string | null) => Promise<void>;
  openProjectFolder: () => Promise<void>;
  duplicateSelection: (paths?: string[]) => Promise<void>;
  copyPathToClipboard: (path?: string) => Promise<void>;
  cutSelection: (paths?: string[]) => void;
  copySelection: (paths?: string[]) => void;
  pasteClipboard: (destDir?: string) => Promise<void>;
  confirmDialog: () => Promise<void>;
  dismissDialog: () => void;
  returnToProjectChooser: () => Promise<void>;
  saveAndClose: () => Promise<void>;
  applyCode: (
    codeName: string,
    selection: { start: CmPosition; end: CmPosition; extract: string },
    options?: { parentId?: number | null }
  ) => Promise<void>;
  createEmptyCodeAction: (
    name: string,
    parentId?: number | null
  ) => Promise<number | null>;
  reparentSelectedCode: (
    codeId: number,
    newParentId: number | null
  ) => Promise<void>;
  setSelectedCodeColor: (
    color: string | null,
    codeId?: number
  ) => Promise<void>;
  renameSelectedCode: (newName: string, codeId?: number) => Promise<void>;
  deleteSelectedCode: (codeId?: number) => Promise<void>;
  requestDeleteCode: (codeId?: number) => void;
  openSelectedCode: (codeId?: number) => void;
  setSelectedCode: (codeId: number | null) => void;
  persistCodes: (codes: CodesDocument) => Promise<void>;
  /** Phase 2: replace codes after CM6 position remap (no disk if unchanged). */
  replaceCodes: (codes: CodesDocument) => Promise<void>;
};

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null);

let tabCounter = 0;
function nextTabId(): string {
  tabCounter += 1;
  return `tab-${tabCounter}-${Date.now()}`;
}

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const suppressFsUntil = useRef(0);

  const markLocalFsMutation = useCallback(() => {
    suppressFsUntil.current = Date.now() + 800;
  }, []);

  const refreshTree = useCallback(async () => {
    const { projectPath } = stateRef.current;
    if (!projectPath) return;
    const result = await window.context.getDirTree(projectPath);
    dispatch({ type: "SET_TREE", tree: result.directoryTree });
  }, []);

  const persistCodes = useCallback(async (codes: CodesDocument) => {
    const title = stateRef.current.projectTitle;
    if (!title) return;
    await window.context.saveCodes(normalize(title), codes);
    dispatch({ type: "SET_CODES", codes });
  }, []);

  const applyPathMappingsToCodes = useCallback(
    async (mappings: { from: string; to: string }[]) => {
      if (!mappings.length) return;
      const next = remapExcerptFilePaths(stateRef.current.codes, mappings);
      if (next !== stateRef.current.codes) {
        await persistCodes(next);
      }
    },
    [persistCodes]
  );

  const openFile = useCallback(async (filePath: string) => {
    const content = await window.context.readFile(filePath);
    const title = basenamePath(filePath);
    dispatch({
      type: "OPEN_TAB",
      tab: {
        id: nextTabId(),
        title,
        content,
        path: filePath,
        dirty: false,
        readOnly: false,
      },
    });
  }, []);

  const saveTab = useCallback(async (tabId: string) => {
    const tab = stateRef.current.tabs.find((t) => t.id === tabId);
    if (!tab?.path) return;
    await window.context.saveFile(tab.path, tab.content);
    dispatch({ type: "MARK_TAB_SAVED", tabId });
  }, []);

  const saveAllTabs = useCallback(async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    try {
      for (const tab of stateRef.current.tabs) {
        if (tab.path && tab.dirty) {
          await window.context.saveFile(tab.path, tab.content);
          dispatch({ type: "MARK_TAB_SAVED", tabId: tab.id });
        }
      }
      return { ok: true };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : i18n.t("store.saveFailed"),
      };
    }
  }, []);

  const closeTab = useCallback(
    async (tabId: string, save = true) => {
      if (save) await saveTab(tabId);
      dispatch({ type: "CLOSE_TAB", tabId });
    },
    [saveTab]
  );

  const setActiveTab = useCallback((tabId: string) => {
    dispatch({ type: "SET_ACTIVE_TAB", tabId });
  }, []);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    dispatch({ type: "UPDATE_TAB_CONTENT", tabId, content });
  }, []);

  const setTreeSelection = useCallback((paths: string[]) => {
    dispatch({ type: "SET_TREE_SELECTION", paths });
    dispatch({
      type: "SET_SELECTED_FILE",
      path: paths.length === 1 ? paths[0] : null,
    });
  }, []);

  const resolveCreateParent = useCallback((explicit?: string): string | null => {
    const { projectPath, treeSelection, treeNodes, selectedFilePath } =
      stateRef.current;
    if (!projectPath) return null;

    const resolveOne = (path: string): string => {
      const node = findNodeByPath(treeNodes, path);
      if (node?.type === "folder") return node.path;
      if (node?.type === "file") return dirnamePath(node.path);
      // Unknown path: treat as folder if it looks like one, else parent of file
      return /\.[^./\\]+$/.test(path) ? dirnamePath(path) : path;
    };

    if (explicit) return resolveOne(explicit);

    const primary = treeSelection[0] ?? selectedFilePath;
    if (primary) return resolveOne(primary);
    return projectPath;
  }, []);

  const createNewFile = useCallback(
    (parentPath?: string) => {
      const parent = resolveCreateParent(parentPath);
      if (!parent) return;
      dispatch({
        type: "REQUEST_INLINE_CREATE",
        kind: "file",
        parentPath: parent,
      });
    },
    [resolveCreateParent]
  );

  const createNewFolder = useCallback(
    (parentPath?: string) => {
      const parent = resolveCreateParent(parentPath);
      if (!parent) return;
      dispatch({
        type: "REQUEST_INLINE_CREATE",
        kind: "folder",
        parentPath: parent,
      });
    },
    [resolveCreateParent]
  );

  const clearInlineCreate = useCallback(() => {
    dispatch({ type: "CLEAR_INLINE_CREATE" });
  }, []);

  const clearRenameRequest = useCallback(() => {
    dispatch({ type: "CLEAR_RENAME_REQUEST" });
  }, []);

  const requestRename = useCallback((path?: string) => {
    const target =
      path ??
      stateRef.current.treeSelection[0] ??
      stateRef.current.selectedFilePath;
    if (!target) return;
    dispatch({ type: "REQUEST_RENAME", path: target });
  }, []);

  const commitCreate = useCallback(
    async (
      parentPath: string,
      kind: InlineCreateKind,
      name: string
    ): Promise<string | null> => {
      const trimmed = name.trim();
      if (!trimmed) {
        dispatch({ type: "CLEAR_INLINE_CREATE" });
        return null;
      }
      const finalName =
        kind === "file" ? ensureMdExtension(trimmed) : trimmed;
      const fullPath = joinPath(parentPath, finalName);
      try {
        markLocalFsMutation();
        if (kind === "folder") {
          await window.context.createFolder(fullPath);
        } else {
          await window.context.createFile(fullPath);
        }
        dispatch({ type: "CLEAR_INLINE_CREATE" });
        await refreshTree();
        return fullPath;
      } catch (error) {
        console.error(error);
        window.alert(
          error instanceof Error ? error.message : i18n.t("store.createFailed")
        );
        dispatch({ type: "CLEAR_INLINE_CREATE" });
        return null;
      }
    },
    [markLocalFsMutation, refreshTree]
  );

  const renameNode = useCallback(
    async (oldPath: string, newName: string) => {
      const trimmed = newName.trim();
      const node = findNodeByPath(stateRef.current.treeNodes, oldPath);
      const isFile = node?.type === "file" || /\.[^./\\]+$/.test(oldPath);
      if (!trimmed) {
        dispatch({ type: "CLEAR_RENAME_REQUEST" });
        return;
      }
      const finalName = isFile ? ensureMdExtension(trimmed) : trimmed;
      if (finalName === basenamePath(oldPath)) {
        dispatch({ type: "CLEAR_RENAME_REQUEST" });
        if (isFile) await openFile(oldPath);
        return;
      }
      const toPath = joinPath(dirnamePath(oldPath), finalName);
      try {
        markLocalFsMutation();
        await window.context.renamePath(oldPath, toPath);
        const mappings = [{ from: oldPath, to: toPath }];
        dispatch({ type: "REMAP_TAB_PATHS", mappings });
        await applyPathMappingsToCodes(mappings);
        dispatch({ type: "CLEAR_RENAME_REQUEST" });
        await refreshTree();
        if (isFile) await openFile(toPath);
      } catch (error) {
        console.error(error);
        window.alert(
          error instanceof Error ? error.message : i18n.t("store.renameFailed")
        );
        dispatch({ type: "CLEAR_RENAME_REQUEST" });
      }
    },
    [applyPathMappingsToCodes, markLocalFsMutation, openFile, refreshTree]
  );

  const moveNodes = useCallback(
    async (sources: string[], destDir: string) => {
      if (!sources.length) return;
      try {
        markLocalFsMutation();
        const mappings = await window.context.movePaths(sources, destDir);
        if (mappings.length) {
          dispatch({ type: "REMAP_TAB_PATHS", mappings });
          await applyPathMappingsToCodes(mappings);
        }
        await refreshTree();
      } catch (error) {
        console.error(error);
        window.alert(
          error instanceof Error ? error.message : i18n.t("store.moveFailed")
        );
      }
    },
    [applyPathMappingsToCodes, markLocalFsMutation, refreshTree]
  );

  const performDelete = useCallback(
    async (targets: string[]) => {
      try {
        markLocalFsMutation();
        await window.context.deletePaths(targets);
        dispatch({ type: "CLOSE_TABS_FOR_PATHS", paths: targets });
        await refreshTree();
      } catch (error) {
        console.error(error);
        dispatch({
          type: "SET_DIALOG",
          dialog: {
            kind: "error",
            title: i18n.t("dialog.deleteFailedTitle"),
            description:
              error instanceof Error
                ? error.message
                : i18n.t("store.deleteFailed"),
          },
        });
      }
    },
    [markLocalFsMutation, refreshTree]
  );

  const deleteSelection = useCallback(
    async (paths?: string[], options?: { confirm?: boolean }) => {
      const targets =
        paths ??
        (stateRef.current.treeSelection.length
          ? stateRef.current.treeSelection
          : stateRef.current.selectedFilePath
            ? [stateRef.current.selectedFilePath]
            : []);
      if (!targets.length) return;

      if (options?.confirm === false) {
        await performDelete(targets);
        return;
      }

      const label =
        targets.length === 1
          ? basenamePath(targets[0])
          : i18n.t("dialog.itemsCount", { count: targets.length });
      dispatch({
        type: "SET_DIALOG",
        dialog: {
          kind: "delete",
          paths: targets,
          title: i18n.t("dialog.trashTitle"),
          description: i18n.t("dialog.trashDescription", { label }),
        },
      });
    },
    [performDelete]
  );

  const dismissDialog = useCallback(() => {
    dispatch({ type: "SET_DIALOG", dialog: null });
  }, []);

  const confirmDialog = useCallback(async () => {
    const dialog = stateRef.current.dialog;
    dispatch({ type: "SET_DIALOG", dialog: null });
    if (dialog?.kind === "delete") {
      await performDelete(dialog.paths);
    } else if (dialog?.kind === "deleteCode") {
      const next = deleteCode(stateRef.current.codes, dialog.codeId);
      await persistCodes(next);
      dispatch({ type: "SET_SELECTED_CODE", codeId: null });
    }
  }, [performDelete, persistCodes]);

  const persistOpenSession = useCallback(async () => {
    const { projectPath, tabs, activeTabId } = stateRef.current;
    if (!projectPath) return;
    const openPaths = tabs
      .map((t) => t.path)
      .filter((p): p is string => Boolean(p));
    const active = tabs.find((t) => t.id === activeTabId);
    try {
      await window.context.setProjectSession(projectPath, {
        openPaths,
        activePath: active?.path ?? null,
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const saveBeforeLeave = useCallback(async (): Promise<boolean> => {
    const result = await saveAllTabs();
    if (!result.ok) {
      dispatch({
        type: "SET_DIALOG",
        dialog: {
          kind: "error",
          title: i18n.t("dialog.saveFailedTitle"),
          description: i18n.t("dialog.saveFailedKeepOpen", {
            error: result.error,
          }),
        },
      });
      return false;
    }
    await persistOpenSession();
    return true;
  }, [persistOpenSession, saveAllTabs]);

  const returnToProjectChooser = useCallback(async () => {
    if (!(await saveBeforeLeave())) return;
    await window.context.returnToProjectChooser();
  }, [saveBeforeLeave]);

  const saveAndClose = useCallback(async () => {
    if (!(await saveBeforeLeave())) return;
    await window.context.quitApp();
  }, [saveBeforeLeave]);

  const importFiles = useCallback(async () => {
    const { projectPath } = stateRef.current;
    if (!projectPath) return;
    const result = await window.context.openFileDialog();
    if (result.canceled || !result.filePaths.length) return;
    markLocalFsMutation();
    await window.context.copyFilesToProject(result.filePaths, projectPath);
    await refreshTree();
  }, [markLocalFsMutation, refreshTree]);

  const importFolder = useCallback(async () => {
    const { projectPath } = stateRef.current;
    if (!projectPath) return;
    const folder = await window.context.openFolderDialog();
    if (!folder) return;
    markLocalFsMutation();
    await window.context.importFolderToProject(folder, projectPath);
    await refreshTree();
  }, [markLocalFsMutation, refreshTree]);

  const resolveClipboardTargets = useCallback((paths?: string[]) => {
    if (paths?.length) return paths;
    if (stateRef.current.treeSelection.length) {
      return stateRef.current.treeSelection;
    }
    if (stateRef.current.selectedFilePath) {
      return [stateRef.current.selectedFilePath];
    }
    return [];
  }, []);

  const duplicateSelection = useCallback(
    async (paths?: string[]) => {
      const targets = resolveClipboardTargets(paths);
      if (!targets.length) return;
      try {
        markLocalFsMutation();
        const created: string[] = [];
        for (const source of targets) {
          const destDir = dirnamePath(source);
          const mappings = await window.context.copyPaths([source], destDir);
          for (const m of mappings) created.push(m.to);
        }
        await refreshTree();
        if (created.length === 1) {
          const node = findNodeByPath(stateRef.current.treeNodes, created[0]);
          if (node?.type === "file" || /\.[^./\\]+$/.test(created[0])) {
            await openFile(created[0]);
          }
        }
      } catch (error) {
        console.error(error);
        window.alert(
          error instanceof Error ? error.message : i18n.t("store.duplicateFailed")
        );
      }
    },
    [markLocalFsMutation, openFile, refreshTree, resolveClipboardTargets]
  );

  const copyPathToClipboard = useCallback(async (path?: string) => {
    const target =
      path ??
      stateRef.current.treeSelection[0] ??
      stateRef.current.selectedFilePath;
    if (!target) return;
    await navigator.clipboard.writeText(target);
  }, []);

  const cutSelection = useCallback(
    (paths?: string[]) => {
      const targets = resolveClipboardTargets(paths);
      if (!targets.length) return;
      dispatch({
        type: "SET_FILE_CLIPBOARD",
        clipboard: { mode: "cut", paths: targets },
      });
    },
    [resolveClipboardTargets]
  );

  const copySelection = useCallback(
    (paths?: string[]) => {
      const targets = resolveClipboardTargets(paths);
      if (!targets.length) return;
      dispatch({
        type: "SET_FILE_CLIPBOARD",
        clipboard: { mode: "copy", paths: targets },
      });
    },
    [resolveClipboardTargets]
  );

  const pasteClipboard = useCallback(
    async (destDir?: string) => {
      const clipboard = stateRef.current.fileClipboard;
      if (!clipboard?.paths.length) return;
      const dest = destDir ?? resolveCreateParent() ?? stateRef.current.projectPath;
      if (!dest) return;
      try {
        markLocalFsMutation();
        if (clipboard.mode === "cut") {
          const mappings = await window.context.movePaths(clipboard.paths, dest);
          if (mappings.length) {
            dispatch({ type: "REMAP_TAB_PATHS", mappings });
            await applyPathMappingsToCodes(mappings);
          }
          dispatch({ type: "SET_FILE_CLIPBOARD", clipboard: null });
        } else {
          await window.context.copyPaths(clipboard.paths, dest);
        }
        await refreshTree();
      } catch (error) {
        console.error(error);
        window.alert(
          error instanceof Error ? error.message : i18n.t("store.pasteFailed")
        );
      }
    },
    [
      applyPathMappingsToCodes,
      markLocalFsMutation,
      refreshTree,
      resolveCreateParent,
    ]
  );

  const deleteActiveFile = useCallback(async () => {
    const tab = stateRef.current.tabs.find(
      (t) => t.id === stateRef.current.activeTabId
    );
    if (!tab?.path) return;
    await deleteSelection([tab.path]);
  }, [deleteSelection]);

  const revealInFolder = useCallback(async (path?: string | null) => {
    const target =
      path ??
      stateRef.current.treeSelection[0] ??
      stateRef.current.tabs.find((t) => t.id === stateRef.current.activeTabId)
        ?.path ??
      stateRef.current.projectPath;
    if (!target) return;
    await window.context.showItemInFolder(target);
  }, []);

  const openProjectFolder = useCallback(async () => {
    const target = stateRef.current.projectPath;
    if (!target) return;
    await window.context.openPath(target);
  }, []);

  const applyCode = useCallback(
    async (
      codeName: string,
      selection: { start: CmPosition; end: CmPosition; extract: string },
      options?: { parentId?: number | null }
    ) => {
      const tab = stateRef.current.tabs.find(
        (t) => t.id === stateRef.current.activeTabId
      );
      if (!tab?.path || !codeName.trim()) return;
      const next = createCode(
        stateRef.current.codes,
        codeName,
        selection,
        tab.path,
        { parentId: options?.parentId ?? null }
      );
      await persistCodes(next);
    },
    [persistCodes]
  );

  const createEmptyCodeAction = useCallback(
    async (name: string, parentId: number | null = null) => {
      const next = createEmptyCode(stateRef.current.codes, name, parentId);
      if (next === stateRef.current.codes) return null;
      const created = next.codes.find(
        (c) =>
          !stateRef.current.codes.codes.some((prev) => prev.id === c.id)
      );
      await persistCodes(next);
      if (created) {
        dispatch({ type: "SET_SELECTED_CODE", codeId: created.id });
        return created.id;
      }
      return null;
    },
    [persistCodes]
  );

  const reparentSelectedCode = useCallback(
    async (codeId: number, newParentId: number | null) => {
      const next = reparentCode(stateRef.current.codes, codeId, newParentId);
      if (next === stateRef.current.codes) return;
      await persistCodes(next);
    },
    [persistCodes]
  );

  const setSelectedCodeColor = useCallback(
    async (color: string | null, codeId?: number) => {
      const id = codeId ?? stateRef.current.selectedCodeId;
      if (id == null) return;
      const next = setCodeColor(stateRef.current.codes, id, color);
      await persistCodes(next);
    },
    [persistCodes]
  );

  const setSelectedCode = useCallback((codeId: number | null) => {
    dispatch({ type: "SET_SELECTED_CODE", codeId });
  }, []);

  const renameSelectedCode = useCallback(
    async (newName: string, codeId?: number) => {
      const id = codeId ?? stateRef.current.selectedCodeId;
      if (id == null) return;
      const next = renameCode(stateRef.current.codes, id, newName);
      await persistCodes(next);
    },
    [persistCodes]
  );

  const deleteSelectedCode = useCallback(
    async (codeId?: number) => {
      const id = codeId ?? stateRef.current.selectedCodeId;
      if (id == null) return;
      const next = deleteCode(stateRef.current.codes, id);
      await persistCodes(next);
      dispatch({ type: "SET_SELECTED_CODE", codeId: null });
    },
    [persistCodes]
  );

  const requestDeleteCode = useCallback((codeId?: number) => {
    const id = codeId ?? stateRef.current.selectedCodeId;
    if (id == null) return;
    const code = stateRef.current.codes.codes.find((c) => c.id === id);
    if (!code) return;
    dispatch({ type: "SET_SELECTED_CODE", codeId: id });
    dispatch({
      type: "SET_DIALOG",
      dialog: {
        kind: "deleteCode",
        codeId: id,
        title: i18n.t("outline.deleteTitle"),
        description: i18n.t("outline.deleteConfirm", {
          name: denormalize(code.name),
        }),
      },
    });
  }, []);

  const openSelectedCode = useCallback((codeId?: number) => {
    const id = codeId ?? stateRef.current.selectedCodeId;
    const code = stateRef.current.codes.codes.find((c) => c.id === id);
    const projectPath = stateRef.current.projectPath;
    if (!code || !projectPath) return;
    const content = buildCodeRetrievalContent(code, projectPath);
    dispatch({
      type: "OPEN_TAB",
      tab: {
        id: nextTabId(),
        title: `Extracts: ${denormalize(code.name)}`,
        content,
        path: null,
        dirty: false,
        readOnly: true,
      },
    });
  }, []);

  const replaceCodes = useCallback(
    async (codes: CodesDocument) => {
      if (codes === stateRef.current.codes) return;
      await persistCodes(codes);
    },
    [persistCodes]
  );

  useEffect(() => {
    const unsub = window.context.onProjectOpened(
      async (payload: ProjectOpenedPayload) => {
        dispatch({ type: "PROJECT_OPENED", payload });
        const tree = await window.context.getDirTree(payload.projectPath);
        dispatch({ type: "SET_TREE", tree: tree.directoryTree });
        const codes = await window.context.loadCodes(
          normalize(payload.projectTitle)
        );
        dispatch({
          type: "SET_CODES",
          codes: normalizeCodesDocument(codes),
        });
        await window.context.startProjectWatch(payload.projectPath);

        const session = await window.context.getProjectSession(
          payload.projectPath
        );
        if (!session?.openPaths.length) return;

        for (const filePath of session.openPaths) {
          try {
            await openFile(filePath);
          } catch {
            // skip missing
          }
        }

        if (session.activePath) {
          const active = stateRef.current.tabs.find(
            (t) => t.path === session.activePath
          );
          if (active) {
            dispatch({ type: "SET_ACTIVE_TAB", tabId: active.id });
          }
        }
      }
    );
    return unsub;
  }, [openFile]);

  useEffect(() => {
    const projectPath = state.projectPath;
    if (!projectPath) return;
    const openPaths = state.tabs
      .map((t) => t.path)
      .filter((p): p is string => Boolean(p));
    const active = state.tabs.find((t) => t.id === state.activeTabId);
    const timer = window.setTimeout(() => {
      void window.context.setProjectSession(projectPath, {
        openPaths,
        activePath: active?.path ?? null,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state.projectPath, state.tabs, state.activeTabId]);

  useEffect(() => {
    if (!state.projectPath) return;
    return window.context.onProjectFsChanged(() => {
      if (Date.now() < suppressFsUntil.current) return;
      void refreshTree();
    });
  }, [state.projectPath, refreshTree]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void saveAllTabs();
    }, 30000);
    return () => window.clearInterval(id);
  }, [saveAllTabs]);

  const activeTab =
    state.tabs.find((t) => t.id === state.activeTabId) ?? null;

  const value = useMemo<ProjectStoreValue>(
    () => ({
      state,
      activeTab,
      refreshTree,
      openFile,
      closeTab,
      setActiveTab,
      updateTabContent,
      saveTab,
      saveAllTabs,
      createNewFile,
      createNewFolder,
      resolveCreateParent,
      clearInlineCreate,
      clearRenameRequest,
      requestRename,
      commitCreate,
      renameNode,
      moveNodes,
      deleteSelection,
      importFiles,
      importFolder,
      deleteActiveFile,
      setTreeSelection,
      revealInFolder,
      openProjectFolder,
      duplicateSelection,
      copyPathToClipboard,
      cutSelection,
      copySelection,
      pasteClipboard,
      confirmDialog,
      dismissDialog,
      returnToProjectChooser,
      saveAndClose,
      applyCode,
      createEmptyCodeAction,
      reparentSelectedCode,
      setSelectedCodeColor,
      renameSelectedCode,
      deleteSelectedCode,
      requestDeleteCode,
      openSelectedCode,
      setSelectedCode,
      persistCodes,
      replaceCodes,
    }),
    [
      state,
      activeTab,
      refreshTree,
      openFile,
      closeTab,
      setActiveTab,
      updateTabContent,
      saveTab,
      saveAllTabs,
      createNewFile,
      createNewFolder,
      resolveCreateParent,
      clearInlineCreate,
      clearRenameRequest,
      requestRename,
      commitCreate,
      renameNode,
      moveNodes,
      deleteSelection,
      importFiles,
      importFolder,
      deleteActiveFile,
      setTreeSelection,
      revealInFolder,
      openProjectFolder,
      duplicateSelection,
      copyPathToClipboard,
      cutSelection,
      copySelection,
      pasteClipboard,
      confirmDialog,
      dismissDialog,
      returnToProjectChooser,
      saveAndClose,
      applyCode,
      createEmptyCodeAction,
      reparentSelectedCode,
      setSelectedCodeColor,
      renameSelectedCode,
      deleteSelectedCode,
      requestDeleteCode,
      openSelectedCode,
      setSelectedCode,
      persistCodes,
      replaceCodes,
    ]
  );

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore(): ProjectStoreValue {
  const ctx = useContext(ProjectStoreContext);
  if (!ctx) {
    throw new Error("useProjectStore must be used within ProjectStoreProvider");
  }
  return ctx;
}
