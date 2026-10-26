import {
  Archive,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  BookOpen,
  ClipboardPaste,
  ClipboardType,
  ClockFading,
  Copy,
  File,
  FilePlus,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderTree,
  GitPullRequestCreateArrow,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Info,
  Italic,
  Keyboard,
  Layers2,
  Lightbulb,
  LogOut,
  Maximize2,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
  Printer,
  Redo2,
  RefreshCw,
  Save,
  Scissors,
  Search,
  Settings2,
  SquareDashed,
  SquareDashedX,
  Trash2,
  TriangleAlert,
  Undo2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { formatShortcut } from "@/lib/shortcuts";
import { WindowButtons } from "./window-buttons";
import type { AppTheme } from "@shared/types";

export type MenuActions = {
  saveAll: () => void;
  saveAndClose: () => void;
  openProjectFolder: () => void;
  chooseProject: () => void;
  newFile: () => void;
  newFolder: () => void;
  importFiles: () => void;
  importFolder: () => void;
  duplicate: () => void;
  cutPaths: () => void;
  copyPaths: () => void;
  pastePaths: () => void;
  copyPath: () => void;
  rename: () => void;
  save: () => void;
  revealActiveFile: () => void;
  closeTab: () => void;
  deleteFile: () => void;
  copy: () => void;
  cut: () => void;
  paste: () => void;
  pastePlain: () => void;
  selectAll: () => void;
  deselect: () => void;
  undo: () => void;
  redo: () => void;
  bold: () => void;
  italic: () => void;
  findFiles: () => void;
  openSettings: () => void;
  addCode: () => void;
  addSubcode: () => void;
  renameCode: () => void;
  openCode: () => void;
  deleteCode: () => void;
  expandAllFolders: () => void;
  collapseAllFolders: () => void;
  contact: () => void;
  reportIssue: () => void;
  openAbout: () => void;
  openDocs: () => void;
  openTutorial: () => void;
  openFaq: () => void;
  openShortcuts: () => void;
  openSuggest: () => void;
  openReportIssueDocs: () => void;
  openRequestFeature: () => void;
  openSupport: () => void;
  toggleDevTools: () => void;
  reloadWindow: () => void;
};

type AppMenubarProps = {
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  debugMode: boolean;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  projectTitle: string | null;
  canPastePaths?: boolean;
  actions: MenuActions;
  onWindowClose?: () => void;
};

const ItemIcon = ({ icon: Icon }: { icon: typeof File }) => (
  <Icon aria-hidden="true" className="mr-2 size-4" />
);

const MENU_WIDTHS = {
  project: "w-72",
  file: "w-80",
  edit: "w-72",
  view: "w-64",
  coding: "w-80",
  window: "w-64",
  help: "w-60",
} as const;

export function AppMenubar({
  leftOpen,
  rightOpen,
  onToggleLeft,
  onToggleRight,
  debugMode,
  theme,
  onThemeChange,
  projectTitle,
  canPastePaths = false,
  actions,
  onWindowClose,
}: AppMenubarProps) {
  const { t } = useTranslation();
  const windowTitle = projectTitle
    ? `${projectTitle} ・ ${t("common.appName")}`
    : t("common.appName");

  return (
    <Menubar className="app-titlebar relative h-9 rounded-none border-x-0 border-t-0 px-2">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 max-w-[40%] -translate-x-1/2 -translate-y-1/2 truncate text-xs text-muted-foreground select-none"
        aria-hidden="true"
        title={windowTitle}
      >
        {windowTitle}
      </div>
      <MenubarMenu>
        <MenubarTrigger>{t("menu.project.label")}</MenubarTrigger>
        <MenubarContent className={MENU_WIDTHS.project}>
          <MenubarSub>
            <MenubarSubTrigger>
              <ItemIcon icon={ClockFading} />
              {t("menu.project.recent")}
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem disabled>
                {t("menu.project.recentPlaceholder", { n: 1 })}
              </MenubarItem>
              <MenubarItem disabled>
                {t("menu.project.recentPlaceholder", { n: 2 })}
              </MenubarItem>
              <MenubarItem disabled>
                {t("menu.project.recentPlaceholder", { n: 3 })}
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem onClick={actions.chooseProject}>
            <ItemIcon icon={FolderOpen} />
            {t("menu.project.choose")}
          </MenubarItem>
          <MenubarItem onClick={actions.saveAll}>
            <ItemIcon icon={Save} />
            {t("menu.project.saveAll")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.openProjectFolder}>
            <ItemIcon icon={FolderOpen} />
            {t("menu.project.openFolder")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            variant="destructive"
            onClick={actions.saveAndClose}
          >
            <ItemIcon icon={LogOut} />
            {t("menu.project.saveAndClose")}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>{t("menu.file.label")}</MenubarTrigger>
        <MenubarContent className={MENU_WIDTHS.file}>
          <MenubarItem onClick={actions.newFile}>
            <ItemIcon icon={FilePlus} />
            {t("menu.file.newFile")}
            <MenubarShortcut>{formatShortcut(["Mod", "N"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.newFolder}>
            <ItemIcon icon={FolderPlus} />
            {t("menu.file.newFolder")}
            <MenubarShortcut>
              {formatShortcut(["Shift", "Mod", "N"])}
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.importFiles}>
            <ItemIcon icon={ArrowUpToLine} />
            {t("menu.file.importFiles")}
          </MenubarItem>
          <MenubarItem onClick={actions.importFolder}>
            <ItemIcon icon={ArrowUpToLine} />
            {t("menu.file.importFolders")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.expandAllFolders}>
            <ItemIcon icon={FolderTree} />
            {t("menu.file.expandAll")}
          </MenubarItem>
          <MenubarItem onClick={actions.collapseAllFolders}>
            <ItemIcon icon={Folder} />
            {t("menu.file.collapseAll")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.duplicate}>
            <ItemIcon icon={Layers2} />
            {t("menu.file.duplicate")}
            <MenubarShortcut>{formatShortcut(["Mod", "D"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.cutPaths}>
            <ItemIcon icon={Scissors} />
            {t("menu.file.cut")}
            <MenubarShortcut>{formatShortcut(["Mod", "X"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.copyPaths}>
            <ItemIcon icon={Copy} />
            {t("menu.file.copy")}
            <MenubarShortcut>{formatShortcut(["Mod", "C"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            disabled={!canPastePaths}
            onClick={actions.pastePaths}
          >
            <ItemIcon icon={ClipboardPaste} />
            {t("menu.file.paste")}
            <MenubarShortcut>{formatShortcut(["Mod", "V"])}</MenubarShortcut>
          </MenubarItem>
          {/* <MenubarItem onClick={actions.copyPath}>
            <ItemIcon icon={Clipboard} />
            {t("menu.file.copyPath")}
          </MenubarItem> */}
          <MenubarItem onClick={actions.rename}>
            <ItemIcon icon={Pencil} />
            {t("menu.file.rename")}
            <MenubarShortcut>F2</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.save}>
            <ItemIcon icon={Save} />
            {t("menu.file.save")}
            <MenubarShortcut>{formatShortcut(["Mod", "S"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.revealActiveFile}>
            <ItemIcon icon={FolderOpen} />
            {t("menu.file.reveal")}
          </MenubarItem>
          <MenubarItem disabled>
            <ItemIcon icon={Printer} />
            {t("menu.file.print")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.closeTab}>
            <ItemIcon icon={X} />
            {t("menu.file.close")}
          </MenubarItem>
          <MenubarItem variant="destructive" onClick={actions.deleteFile}>
            <ItemIcon icon={Trash2} />
            {t("menu.file.delete")}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>{t("menu.edit.label")}</MenubarTrigger>
        <MenubarContent className={MENU_WIDTHS.edit}>
          <MenubarItem onClick={actions.undo}>
            <ItemIcon icon={Undo2} />
            {t("menu.edit.undo")}
            <MenubarShortcut>{formatShortcut(["Mod", "Z"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.redo}>
            <ItemIcon icon={Redo2} />
            {t("menu.edit.redo")}
            <MenubarShortcut>
              {formatShortcut(["Shift", "Mod", "Z"])}
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.cut}>
            <ItemIcon icon={Scissors} />
            {t("menu.edit.cut")}
            <MenubarShortcut>{formatShortcut(["Mod", "X"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.copy}>
            <ItemIcon icon={Copy} />
            {t("menu.edit.copy")}
            <MenubarShortcut>{formatShortcut(["Mod", "C"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.paste}>
            <ItemIcon icon={ClipboardPaste} />
            {t("menu.edit.paste")}
            <MenubarShortcut>{formatShortcut(["Mod", "V"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.pastePlain}>
            <ItemIcon icon={ClipboardType} />
            {t("menu.edit.pastePlain")}
            <MenubarShortcut>{formatShortcut(["Shift", "Mod", "V"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.bold}>
            <ItemIcon icon={Bold} />
            {t("menu.edit.bold")}
            <MenubarShortcut>{formatShortcut(["Mod", "B"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.italic}>
            <ItemIcon icon={Italic} />
            {t("menu.edit.italic")}
            <MenubarShortcut>{formatShortcut(["Mod", "I"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.selectAll}>
            <ItemIcon icon={SquareDashed} />
            {t("menu.edit.selectAll")}
            <MenubarShortcut>
              {formatShortcut(["Mod", "A"])}
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.deselect}>
            <ItemIcon icon={SquareDashedX} />
            {t("menu.edit.deselect")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.findFiles}>
            <ItemIcon icon={Search} />
            {t("menu.edit.find")}
            <MenubarShortcut>{formatShortcut(["Mod", "F"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            <ItemIcon icon={Search} />
            {t("menu.edit.replace")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.openSettings}>
            <ItemIcon icon={Settings2} />
            {t("menu.edit.preferences")}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>{t("menu.view.label")}</MenubarTrigger>
        <MenubarContent className={MENU_WIDTHS.view}>
          <MenubarCheckboxItem
            checked={leftOpen}
            onCheckedChange={onToggleLeft}
          >
            {t("menu.view.fileTree")}
            <MenubarShortcut>{formatShortcut(["Mod", "\\"])}</MenubarShortcut>
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={rightOpen}
            onCheckedChange={onToggleRight}
          >
            {t("menu.view.codeList")}
            <MenubarShortcut>
              {formatShortcut(["Alt", "Mod", "\\"])}
            </MenubarShortcut>
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={false} disabled>
            {t("menu.view.favorites")}
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup
            value={theme}
            onValueChange={(value) => onThemeChange(value as AppTheme)}
          >
            <MenubarRadioItem value="light">
              {t("menu.view.themeLight")}
            </MenubarRadioItem>
            <MenubarRadioItem value="dark">
              {t("menu.view.themeDark")}
            </MenubarRadioItem>
            <MenubarRadioItem value="sepia">
              {t("menu.view.themeSepia")}
            </MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem disabled>
            <ItemIcon icon={Plus} />
            {t("menu.view.zoomIn")}
            <MenubarShortcut>{formatShortcut(["Mod", "+"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            <ItemIcon icon={Minus} />
            {t("menu.view.zoomOut")}
            <MenubarShortcut>{formatShortcut(["Mod", "-"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            <ItemIcon icon={RefreshCw} />
            {t("menu.view.zoomReset")}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>{t("menu.coding.label")}</MenubarTrigger>
        <MenubarContent className={MENU_WIDTHS.coding}>
          {/* <MenubarItem disabled>
            <ItemIcon icon={Plus} />
            {t("menu.coding.addCategory")}
          </MenubarItem> */}
          <MenubarItem onClick={actions.addCode}>
            <ItemIcon icon={Plus} />
            {t("menu.coding.addCode")}
          </MenubarItem>
          <MenubarItem onClick={actions.addSubcode}>
            <ItemIcon icon={Plus} />
            {t("menu.coding.addSubcode")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.renameCode}>
            <ItemIcon icon={Pencil} />
            {t("menu.coding.rename")}
          </MenubarItem>
          <MenubarItem onClick={actions.openCode}>
            <ItemIcon icon={FolderOpen} />
            {t("menu.coding.open")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            <ItemIcon icon={ArrowDownToLine} />
            {t("menu.coding.exportList")}
          </MenubarItem>
          <MenubarItem disabled>
            <ItemIcon icon={Archive} />
            {t("menu.coding.exportCodebook")}
          </MenubarItem>
          <MenubarItem variant="destructive" onClick={actions.deleteCode}>
            <ItemIcon icon={Trash2} />
            {t("menu.coding.delete")}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>{t("menu.window.label")}</MenubarTrigger>
        <MenubarContent className={MENU_WIDTHS.window}>
          <MenubarItem onClick={() => window.context?.toggleMaximizeWindow()}>
            <ItemIcon icon={Maximize2} />
            {t("menu.window.toggleMaximize")}
          </MenubarItem>
          <MenubarItem onClick={() => window.context?.minimizeWindow()}>
            <ItemIcon icon={Minus} />
            {t("menu.window.minimize")}
            <MenubarShortcut>{formatShortcut(["Mod", "M"])}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={actions.saveAndClose}>
            <ItemIcon icon={X} />
            {t("menu.window.close")}
          </MenubarItem>
          {/* <MenubarSeparator />
          <MenubarItem disabled>
            <ItemIcon icon={Square} />
            {t("menu.window.closeAll")}
          </MenubarItem> */}
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>{t("menu.help.label")}</MenubarTrigger>
        <MenubarContent className={MENU_WIDTHS.help}>
          <MenubarItem onClick={actions.openAbout}>
            <ItemIcon icon={Info} />
            {t("menu.help.about")}
          </MenubarItem>
          <MenubarItem onClick={actions.openDocs}>
            <ItemIcon icon={BookOpen} />
            {t("menu.help.docs")}
          </MenubarItem>
          <MenubarItem onClick={actions.openTutorial}>
            <ItemIcon icon={GraduationCap} />
            {t("menu.help.tutorial")}
          </MenubarItem>
          <MenubarItem onClick={actions.openFaq}>
            <ItemIcon icon={HelpCircle} />
            {t("menu.help.faq")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.openShortcuts}>
            <ItemIcon icon={Keyboard} />
            {t("menu.help.shortcuts")}
          </MenubarItem>
          <MenubarItem disabled>
            <ItemIcon icon={RefreshCw} />
            {t("menu.help.updates")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.contact}>
            <ItemIcon icon={MessageCircle} />
            {t("menu.help.contact")}
          </MenubarItem>
          <MenubarItem onClick={actions.openSuggest}>
            <ItemIcon icon={Lightbulb} />
            {t("menu.help.suggest")}
          </MenubarItem>
          <MenubarItem onClick={actions.openReportIssueDocs}>
            <ItemIcon icon={TriangleAlert} />
            {t("menu.help.reportIssue")}
          </MenubarItem>
          <MenubarItem onClick={actions.openRequestFeature}>
            <ItemIcon icon={GitPullRequestCreateArrow} />
            {t("menu.help.requestFeature")}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={actions.openSupport}>
            <ItemIcon icon={HeartHandshake} />
            {t("menu.help.support")}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {debugMode && (
        <MenubarMenu>
          <MenubarTrigger>{t("menu.debug.label")}</MenubarTrigger>
          <MenubarContent className="w-64">
            <MenubarItem onClick={actions.toggleDevTools}>
              {t("menu.debug.showDevTools")}
            </MenubarItem>
            <MenubarCheckboxItem disabled>
              {t("menu.debug.showDiagnostics")}
            </MenubarCheckboxItem>
            <MenubarItem onClick={actions.reloadWindow}>
              <ItemIcon icon={RefreshCw} />
              {t("menu.debug.reload")}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}

      <WindowButtons
        className="ml-auto"
        onClose={onWindowClose ?? actions.saveAndClose}
      />
    </Menubar>
  );
}
