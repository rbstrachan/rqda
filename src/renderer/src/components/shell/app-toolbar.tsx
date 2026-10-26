import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BookOpen,
  FilePlus,
  FolderPlus,
  HelpCircle,
  Moon,
  PanelLeft,
  PanelRight,
  Save,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsDialog } from "./settings-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { openDocs } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { searchProjectFiles } from "@/lib/file-search";
import type { TreeNode } from "@/lib/tree-utils";
import type { AppSettings, AppTheme } from "@shared/types";

export type AppToolbarHandle = {
  focusFileSearch: () => void;
};

type AppToolbarProps = {
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  settings: AppSettings;
  onSettingsChange: (partial: Partial<AppSettings>) => void;
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  onCycleTheme: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onSave: () => void;
  treeNodes: TreeNode[];
  onOpenFile: (path: string) => void;
};

export const AppToolbar = forwardRef<AppToolbarHandle, AppToolbarProps>(
  function AppToolbar(
    {
      leftOpen,
      rightOpen,
      onToggleLeft,
      onToggleRight,
      settings,
      onSettingsChange,
      settingsOpen,
      onSettingsOpenChange,
      onCycleTheme,
      onNewFile,
      onNewFolder,
      onSave,
      treeNodes,
      onOpenFile,
    },
    ref
  ) {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const hits = useMemo(
      () => searchProjectFiles(treeNodes, query),
      [treeNodes, query]
    );

    useImperativeHandle(
      ref,
      () => ({
        focusFileSearch: () => {
          setOpen(true);
          inputRef.current?.focus();
          inputRef.current?.select();
        },
      }),
      []
    );

    useEffect(() => {
      setHighlight(0);
    }, [query]);

    useEffect(() => {
      const onPointerDown = (event: MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      window.addEventListener("mousedown", onPointerDown);
      return () => window.removeEventListener("mousedown", onPointerDown);
    }, []);

    const themeMeta: Record<
      AppTheme,
      { icon: typeof Moon; label: string; title: string }
    > = {
      light: {
        icon: Moon,
        label: t("toolbar.themeToDark"),
        title: t("toolbar.themeToDarkTitle"),
      },
      dark: {
        icon: Sun,
        label: t("toolbar.themeToSepia"),
        title: t("toolbar.themeToSepiaTitle"),
      },
      sepia: {
        icon: BookOpen,
        label: t("toolbar.themeToLight"),
        title: t("toolbar.themeToLightTitle"),
      },
    };

    const meta = themeMeta[settings.theme];
    const ThemeIcon = meta.icon;

    const openHit = (path: string) => {
      onOpenFile(path);
      setQuery("");
      setOpen(false);
    };

    const openHelp = () => {
      openDocs("", i18n.language);
    };

    return (
      <header className="flex h-11 w-full shrink-0 items-center gap-2 border-b bg-background px-2 [-webkit-app-region:no-drag]">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleLeft}
          aria-label={
            leftOpen ? t("toolbar.hideExplorer") : t("toolbar.showExplorer")
          }
          aria-pressed={leftOpen}
        >
          <PanelLeft />
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onNewFile}>
            <FilePlus data-icon="inline-start" />
            {t("toolbar.newFile")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onNewFolder}>
            <FolderPlus data-icon="inline-start" />
            {t("toolbar.newFolder")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onSave}>
            <Save data-icon="inline-start" />
            {t("toolbar.save")}
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div ref={containerRef} className="relative w-56 md:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              type="search"
              placeholder={t("toolbar.searchPlaceholder")}
              aria-label={t("toolbar.searchAria")}
              aria-expanded={open && query.trim().length > 0}
              aria-controls="toolbar-file-search-results"
              className="h-7 pl-8 text-sm select-text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                  inputRef.current?.blur();
                  return;
                }
                if (!hits.length) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((i) => (i + 1) % hits.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((i) => (i - 1 + hits.length) % hits.length);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const hit = hits[highlight] ?? hits[0];
                  if (hit) openHit(hit.path);
                }
              }}
            />
            {open && query.trim().length > 0 && (
              <div
                id="toolbar-file-search-results"
                role="listbox"
                className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
              >
                {hits.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    {t("toolbar.searchNoResults")}
                  </p>
                ) : (
                  hits.map((hit, index) => (
                    <button
                      key={hit.path}
                      type="button"
                      role="option"
                      aria-selected={index === highlight}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-3 py-1.5 text-left text-sm hover:bg-muted",
                        index === highlight && "bg-muted"
                      )}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => openHit(hit.path)}
                    >
                      <span className="truncate font-medium">{hit.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {hit.path}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCycleTheme}
            aria-label={meta.label}
            title={meta.title}
          >
            <ThemeIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("toolbar.settingsAria")}
            title={t("toolbar.settings")}
            onClick={() => onSettingsOpenChange(true)}
          >
            <Settings />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("toolbar.helpAria")}
            title={t("toolbar.help")}
            onClick={openHelp}
          >
            <HelpCircle />
          </Button>
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={onSettingsOpenChange}
            settings={settings}
            onSettingsChange={onSettingsChange}
          />
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleRight}
            aria-label={
              rightOpen ? t("toolbar.hideCodes") : t("toolbar.showCodes")
            }
            aria-pressed={rightOpen}
          >
            <PanelRight />
          </Button>
        </div>
      </header>
    );
  }
);
