import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePanelRef } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePreferences } from "@/hooks/use-preferences";
import { useProjectStore } from "@/store/project-store";
import { AppMenubar, type MenuActions } from "./app-menubar";
import { AppToolbar, type AppToolbarHandle } from "./app-toolbar";
import {
  EditorCanvas,
  type EditorCanvasHandle,
  type EditorCursorPosition,
} from "./editor-canvas";
import { openDocs } from "@/lib/docs";
import { FileTree, type FileTreeHandle } from "./file-tree";
import { CodesPanel, type CodesPanelHandle } from "./codes-panel";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { StatusBar } from "./status-bar";

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 shrink-0 items-center border-b px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  );
}

export function AppShell() {
  const { t, i18n } = useTranslation();
  const leftPanel = usePanelRef();
  const rightPanel = usePanelRef();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [fileFilter, setFileFilter] = useState("");
  const [cursor, setCursor] = useState<EditorCursorPosition>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { settings, updateSettings, setTheme, cycleTheme } = usePreferences();
  const editorRef = useRef<EditorCanvasHandle>(null);
  const toolbarRef = useRef<AppToolbarHandle>(null);
  const codesPanelRef = useRef<CodesPanelHandle>(null);
  const fileTreeRef = useRef<FileTreeHandle>(null);

  const {
    state,
    activeTab,
    openFile,
    closeTab,
    setActiveTab,
    updateTabContent,
    saveTab,
    saveAllTabs,
    createNewFile,
    createNewFolder,
    importFiles,
    importFolder,
    deleteSelection,
    revealInFolder,
    openProjectFolder,
    applyCode,
    createEmptyCodeAction,
    reparentSelectedCode,
    setSelectedCodeColor,
    renameSelectedCode,
    deleteSelectedCode,
    requestDeleteCode,
    openSelectedCode,
    setSelectedCode,
    replaceCodes,
    setTreeSelection,
    commitCreate,
    clearInlineCreate,
    clearRenameRequest,
    requestRename,
    renameNode,
    moveNodes,
    duplicateSelection,
    copyPathToClipboard,
    cutSelection,
    copySelection,
    pasteClipboard,
    confirmDialog,
    dismissDialog,
    returnToProjectChooser,
    saveAndClose,
  } = useProjectStore();

  const togglePanel = (ref: typeof leftPanel) => {
    const panel = ref.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  };

  const openMailto = (reason?: string) => {
    const subject = encodeURIComponent(
      reason ? `[QADDOE] ${reason}` : "[QADDOE]"
    );
    window.location.href = `mailto:qaddoe@reiwa.ca?subject=${subject}`;
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      if (event.key.toLowerCase() === "f" && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        toolbarRef.current?.focusFileSearch();
        return;
      }

      if (event.key === "\\" && !event.shiftKey) {
        event.preventDefault();
        if (event.altKey) togglePanel(rightPanel);
        else togglePanel(leftPanel);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leftPanel, rightPanel]);

  const menuActions: MenuActions = useMemo(
    () => ({
      saveAll: () => void saveAllTabs(),
      saveAndClose: () => void saveAndClose(),
      openProjectFolder: () => void openProjectFolder(),
      chooseProject: () => void returnToProjectChooser(),
      newFile: () => createNewFile(),
      newFolder: () => createNewFolder(),
      importFiles: () => void importFiles(),
      importFolder: () => void importFolder(),
      duplicate: () => void duplicateSelection(),
      cutPaths: () => cutSelection(),
      copyPaths: () => copySelection(),
      pastePaths: () => void pasteClipboard(),
      copyPath: () => void copyPathToClipboard(),
      rename: () => requestRename(),
      save: () => {
        if (activeTab) void saveTab(activeTab.id);
      },
      revealActiveFile: () => void revealInFolder(),
      closeTab: () => {
        if (activeTab) void closeTab(activeTab.id);
      },
      deleteFile: () => void deleteSelection(),
      copy: () => {
        const text = window.getSelection()?.toString();
        if (text) void navigator.clipboard.writeText(text);
      },
      cut: () => {
        const text = window.getSelection()?.toString();
        if (text) void navigator.clipboard.writeText(text);
      },
      paste: () => editorRef.current?.paste(),
      pastePlain: () => editorRef.current?.pastePlain(),
      selectAll: () => editorRef.current?.selectAll(),
      deselect: () => editorRef.current?.deselect(),
      undo: () => editorRef.current?.undo(),
      redo: () => editorRef.current?.redo(),
      bold: () => editorRef.current?.bold(),
      italic: () => editorRef.current?.italic(),
      findFiles: () => toolbarRef.current?.focusFileSearch(),
      openSettings: () => setSettingsOpen(true),
      addCode: () => codesPanelRef.current?.startCreate(null),
      addSubcode: () =>
        codesPanelRef.current?.startCreate(state.selectedCodeId),
      renameCode: () => codesPanelRef.current?.startRename(),
      openCode: () => openSelectedCode(),
      deleteCode: () => codesPanelRef.current?.startDelete(),
      expandAllFolders: () => fileTreeRef.current?.expandAll(),
      collapseAllFolders: () => fileTreeRef.current?.collapseAll(),
      contact: () => openMailto(),
      reportIssue: () => openMailto(t("shell.reportIssueSubject")),
      openAbout: () =>
        window.open(
          "https://reiwa.ca/projects/QADDOE",
          "_blank",
          "noopener,noreferrer"
        ),
      openDocs: () => openDocs("", i18n.language),
      openTutorial: () => openDocs("tutorial", i18n.language),
      openFaq: () => openDocs("faq", i18n.language),
      openShortcuts: () => setShortcutsOpen(true),
      openSuggest: () => openDocs("suggestions", i18n.language),
      openReportIssueDocs: () => openDocs("issues", i18n.language),
      openRequestFeature: () => openDocs("features", i18n.language),
      openSupport: () => openDocs("support", i18n.language),
      toggleDevTools: () => void window.context.toggleDevTools(),
      reloadWindow: () => void window.context.reloadWindow(),
    }),
    [
      activeTab,
      closeTab,
      copyPathToClipboard,
      copySelection,
      createNewFile,
      createNewFolder,
      cutSelection,
      deleteSelection,
      duplicateSelection,
      i18n.language,
      importFiles,
      importFolder,
      openProjectFolder,
      openSelectedCode,
      pasteClipboard,
      requestRename,
      returnToProjectChooser,
      revealInFolder,
      saveAllTabs,
      saveAndClose,
      saveTab,
      state.selectedCodeId,
      t,
    ]
  );

  const fileName = activeTab?.title ?? "";
  const dialog = state.dialog;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground select-none">
      <AppMenubar
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => togglePanel(leftPanel)}
        onToggleRight={() => togglePanel(rightPanel)}
        debugMode={settings.debugMode}
        theme={settings.theme}
        onThemeChange={(theme) => void setTheme(theme)}
        projectTitle={state.projectTitle}
        canPastePaths={Boolean(state.fileClipboard?.paths.length)}
        actions={menuActions}
        onWindowClose={() => void saveAndClose()}
      />
      <AppToolbar
        ref={toolbarRef}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => togglePanel(leftPanel)}
        onToggleRight={() => togglePanel(rightPanel)}
        settings={settings}
        onSettingsChange={(partial) => void updateSettings(partial)}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
        onCycleTheme={() => void cycleTheme()}
        onNewFile={() => createNewFile()}
        onNewFolder={() => createNewFolder()}
        onSave={() => {
          if (activeTab) void saveTab(activeTab.id);
        }}
        treeNodes={state.treeNodes}
        onOpenFile={(path) => void openFile(path)}
      />

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel
          id="explorer"
          panelRef={leftPanel}
          defaultSize="20%"
          minSize="12%"
          maxSize="40%"
          collapsible
          collapsedSize={0}
          onResize={(size) => setLeftOpen(size.inPixels > 0)}
          className="bg-muted/30"
        >
          <aside
            aria-label={t("shell.projectFilesAria")}
            className="flex h-full flex-col"
          >
            <div className="flex h-9 shrink-0 items-center gap-1.5 border-b px-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={fileFilter}
                  onChange={(event) => setFileFilter(event.target.value)}
                  placeholder={t("shell.filterPlaceholder")}
                  aria-label={t("shell.filterAria")}
                  className="h-7 w-full rounded-md border border-transparent bg-transparent pr-2 pl-7 text-xs outline-none select-text placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <FileTree
                ref={fileTreeRef}
                nodes={state.treeNodes}
                projectPath={state.projectPath}
                selectedPaths={state.treeSelection}
                filter={fileFilter}
                inlineCreate={state.inlineCreateRequest}
                renamePath={state.renameRequestPath}
                fileClipboard={state.fileClipboard}
                onSelectionChange={setTreeSelection}
                onActivateFile={(path) => void openFile(path)}
                onMove={(sources, dest) => {
                  void moveNodes(sources, dest);
                }}
                onRename={(oldPath, newName) => renameNode(oldPath, newName)}
                onCommitCreate={(parent, kind, name) =>
                  commitCreate(parent, kind, name)
                }
                onCancelCreate={clearInlineCreate}
                onDiscardCreate={(path) =>
                  void deleteSelection([path], { confirm: false })
                }
                onClearRename={clearRenameRequest}
                onDelete={(paths) => void deleteSelection(paths)}
                onCreateIn={(kind, parent) =>
                  kind === "file"
                    ? createNewFile(parent)
                    : createNewFolder(parent)
                }
                onReveal={(path) => void revealInFolder(path)}
                onRequestRename={(path) => requestRename(path)}
                onDuplicate={(paths) => void duplicateSelection(paths)}
                onCopyPath={(path) => void copyPathToClipboard(path)}
                onCut={(paths) => cutSelection(paths)}
                onCopy={(paths) => copySelection(paths)}
                onPaste={(dest) => void pasteClipboard(dest)}
              />
            </div>
          </aside>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel id="editor" minSize="30%">
          <EditorCanvas
            ref={editorRef}
            tabs={state.tabs}
            activeTabId={state.activeTabId}
            codes={state.codes}
            fontFamily={settings.editorFontFamily}
            fontSize={settings.editorFontSize}
            livePreview={settings.editorLivePreview}
            onSelectTab={setActiveTab}
            onCloseTab={(id) => void closeTab(id)}
            onContentChange={updateTabContent}
            onCursorChange={setCursor}
            onApplyCode={(name, selection) => void applyCode(name, selection)}
            onCodesRemap={(next) => void replaceCodes(next)}
            onNewFile={() => createNewFile()}
            onNewFolder={() => createNewFolder()}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          id="outline"
          panelRef={rightPanel}
          defaultSize="18%"
          minSize="12%"
          maxSize="35%"
          collapsible
          collapsedSize={0}
          onResize={(size) => setRightOpen(size.inPixels > 0)}
          className="bg-muted/30"
        >
          <aside
            aria-label={t("shell.codesAria")}
            className="flex h-full min-h-0 flex-col"
          >
            <PanelHeader>{t("shell.codes")}</PanelHeader>

            <div className="min-h-0 flex-1">
              <CodesPanel
                ref={codesPanelRef}
                codes={state.codes}
                selectedCodeId={state.selectedCodeId}
                onSelect={setSelectedCode}
                onRenameCommit={async (codeId, newName) => {
                  await renameSelectedCode(newName, codeId);
                }}
                onCreateEmpty={async (name, parentId) =>
                  createEmptyCodeAction(name, parentId ?? null)
                }
                onDiscardCreate={async (codeId) => {
                  await deleteSelectedCode(codeId);
                }}
                onRequestDelete={(codeId) => requestDeleteCode(codeId)}
                onOpen={(codeId) => {
                  setSelectedCode(codeId);
                  openSelectedCode(codeId);
                }}
                onReparent={(codeId, newParentId) => {
                  void reparentSelectedCode(codeId, newParentId);
                }}
                onSetColor={(codeId, color) => {
                  void setSelectedCodeColor(color, codeId);
                }}
              />
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>

      <StatusBar
        projectTitle={state.projectTitle}
        fileName={fileName}
        statusMessage={state.statusMessage}
        cursor={cursor}
      />

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <AlertDialog
        open={dialog != null}
        onOpenChange={(open) => {
          if (!open) dismissDialog();
        }}
      >
        <AlertDialogPopup>
          <AlertDialogTitle>{dialog?.title}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap">
            {dialog?.description}
          </AlertDialogDescription>
          <AlertDialogFooter>
            {dialog?.kind === "delete" || dialog?.kind === "deleteCode" ? (
              <>
                <AlertDialogClose variant="outline" onClick={dismissDialog}>
                  {t("shell.cancel")}
                </AlertDialogClose>
                <AlertDialogClose
                  variant="destructive"
                  onClick={() => void confirmDialog()}
                >
                  {dialog.kind === "deleteCode"
                    ? t("outline.deleteAction")
                    : t("shell.trash")}
                </AlertDialogClose>
              </>
            ) : (
              <AlertDialogClose variant="default" onClick={dismissDialog}>
                {t("common.ok")}
              </AlertDialogClose>
            )}
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}
