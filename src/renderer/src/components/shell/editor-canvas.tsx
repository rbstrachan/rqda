import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { keymap } from "@codemirror/view";
import {
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  type DecorationSet,
} from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import {
  ArrowUpRight,
  Bold,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  ClipboardPaste,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Scissors,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  buildCodeDecorations,
  codeHighlightTheme,
} from "@/lib/code-highlights";
import {
  codeNameExists,
  denormalize,
  filterCodesByQuery,
  offsetToCm5Pos,
  remapExcerptsForDocChange,
} from "@/lib/coding";
import {
  createEditorThemeExtension,
  type EditorFontFamily,
} from "@/lib/editor-theme";
import { createLivePreviewExtension } from "@/lib/live-preview";
import { docsUrl } from "@/lib/docs";
import {
  copySelection,
  createMarkdownFormatKeymap,
  cutSelection,
  deselect,
  pasteClipboard,
  pastePlainClipboard,
  redo,
  selectAll,
  setHeading,
  toggleBold,
  toggleItalic,
  undo,
} from "@/lib/markdown-format";
import type { CodesDocument } from "@shared/types";
import type { EditorTab } from "@/store/project-store";

export type EditorCursorPosition = {
  line: number;
  col: number;
} | null;

export type EditorCanvasHandle = {
  undo: () => void;
  redo: () => void;
  bold: () => void;
  italic: () => void;
  selectAll: () => void;
  deselect: () => void;
  paste: () => void;
  pastePlain: () => void;
  heading: (level: 1 | 2 | 3) => void;
  getView: () => EditorView | null;
};

type EditorCanvasProps = {
  tabs: EditorTab[];
  activeTabId: string | null;
  codes: CodesDocument;
  fontFamily: EditorFontFamily;
  fontSize: number;
  livePreview: boolean;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onContentChange: (tabId: string, content: string) => void;
  onCursorChange: (pos: EditorCursorPosition) => void;
  onApplyCode: (
    codeName: string,
    selection: {
      start: { line: number; ch: number };
      end: { line: number; ch: number };
      extract: string;
    }
  ) => void;
  onCodesRemap: (codes: CodesDocument) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
};

const refreshCodesEffect = StateEffect.define<null>();

export const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(
  function EditorCanvas(
    {
      tabs,
      activeTabId,
      codes,
      fontFamily,
      fontSize,
      livePreview,
      onSelectTab,
      onCloseTab,
      onContentChange,
      onCursorChange,
      onApplyCode,
      onCodesRemap,
      onNewFile,
      onNewFolder,
    },
    ref
  ) {
    const { t, i18n } = useTranslation();
    const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
    const viewRef = useRef<EditorView | null>(null);
    const tabsStripRef = useRef<HTMLDivElement>(null);
    const activeTabElRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const codingBarRef = useRef<HTMLDivElement | null>(null);
    const [codingBar, setCodingBar] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const [codeName, setCodeName] = useState("");
    const selectionRef = useRef<{
      start: { line: number; ch: number };
      end: { line: number; ch: number };
      extract: string;
    } | null>(null);
    const remapTimerRef = useRef<number | null>(null);
    const onCodesRemapRef = useRef(onCodesRemap);
    onCodesRemapRef.current = onCodesRemap;

    const codesRef = useRef(codes);
    const pathRef = useRef(activeTab?.path ?? null);
    pathRef.current = activeTab?.path ?? null;

    useEffect(() => {
      // Avoid clobbering in-flight remap positions with a stale prop snapshot.
      if (remapTimerRef.current == null) {
        codesRef.current = codes;
      }
    }, [codes]);

    const filteredCodes = useMemo(
      () => filterCodesByQuery(codes, codeName),
      [codes, codeName]
    );
    const canCreateFromQuery =
      codeName.trim().length > 0 && !codeNameExists(codes, codeName);

    const updateTabScrollState = useCallback(() => {
      const el = tabsStripRef.current;
      if (!el) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }
      const max = el.scrollWidth - el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(max > 1 && el.scrollLeft < max - 1);
    }, []);

    const scrollTabsBy = useCallback(
      (direction: -1 | 1) => {
        const el = tabsStripRef.current;
        if (!el) return;
        el.scrollBy({
          left: direction * Math.max(120, el.clientWidth * 0.8),
          behavior: "smooth",
        });
      },
      []
    );

    const runOnView = useCallback((fn: (view: EditorView) => boolean) => {
      const view = viewRef.current;
      if (!view) return;
      fn(view);
      view.focus();
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        undo: () => runOnView(undo),
        redo: () => runOnView(redo),
        bold: () => runOnView(toggleBold),
        italic: () => runOnView(toggleItalic),
        selectAll: () => runOnView(selectAll),
        deselect: () => runOnView(deselect),
        paste: () => {
          const view = viewRef.current;
          if (view) void pasteClipboard(view);
        },
        pastePlain: () => {
          const view = viewRef.current;
          if (view) void pastePlainClipboard(view);
        },
        heading: (level) => runOnView((v) => setHeading(v, level)),
        getView: () => viewRef.current,
      }),
      [runOnView]
    );

    const highlightPlugin = useMemo(() => {
      return ViewPlugin.fromClass(
        class {
          decorations: DecorationSet;

          constructor(view: EditorView) {
            this.decorations = buildCodeDecorations(
              view,
              codesRef.current,
              pathRef.current
            );
          }

          update(update: ViewUpdate): void {
            if (update.docChanged && pathRef.current) {
              const path = pathRef.current;
              const mapped = remapExcerptsForDocChange(
                codesRef.current,
                path,
                (pos, assoc) => update.changes.mapPos(pos, assoc ?? 1),
                update.state.doc
              );
              if (mapped !== codesRef.current) {
                codesRef.current = mapped;
                if (remapTimerRef.current != null) {
                  window.clearTimeout(remapTimerRef.current);
                }
                remapTimerRef.current = window.setTimeout(() => {
                  remapTimerRef.current = null;
                  onCodesRemapRef.current(mapped);
                }, 300);
              }
            }

            if (
              update.docChanged ||
              update.viewportChanged ||
              update.transactions.some((tr) =>
                tr.effects.some((e) => e.is(refreshCodesEffect))
              )
            ) {
              this.decorations = buildCodeDecorations(
                update.view,
                codesRef.current,
                pathRef.current
              );
            }
          }
        },
        {
          decorations: (value) => value.decorations,
        }
      );
    }, []);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({ effects: refreshCodesEffect.of(null) });
    }, [codes, activeTab?.path, activeTab?.id]);

    useEffect(() => {
      activeTabElRef.current?.scrollIntoView({
        inline: "nearest",
        block: "nearest",
      });
      updateTabScrollState();
    }, [activeTabId, tabs, updateTabScrollState]);

    useEffect(() => {
      const el = tabsStripRef.current;
      if (!el) return;
      updateTabScrollState();
      const onScroll = () => updateTabScrollState();
      el.addEventListener("scroll", onScroll, { passive: true });
      const ro = new ResizeObserver(() => updateTabScrollState());
      ro.observe(el);
      return () => {
        el.removeEventListener("scroll", onScroll);
        ro.disconnect();
      };
    }, [tabs.length, updateTabScrollState]);

    const reportCursor = useCallback(
      (view: EditorView) => {
        const head = view.state.selection.main.head;
        const pos = offsetToCm5Pos(view.state.doc, head);
        onCursorChange({ line: pos.line + 1, col: pos.ch + 1 });
      },
      [onCursorChange]
    );

    const extensions = useMemo(
      () => [
        markdown(),
        EditorView.lineWrapping,
        createEditorThemeExtension({ fontFamily, fontSize }),
        codeHighlightTheme,
        highlightPlugin,
        ...createLivePreviewExtension(livePreview),
        createMarkdownFormatKeymap(),
        keymap.of([
          {
            key: "Mod-w",
            run: () => {
              if (activeTabId) onCloseTab(activeTabId);
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.view) viewRef.current = update.view;
          if (update.selectionSet || update.docChanged) {
            reportCursor(update.view);
          }
        }),
      ],
      [
        fontFamily,
        fontSize,
        highlightPlugin,
        livePreview,
        activeTabId,
        onCloseTab,
        reportCursor,
      ]
    );

    useEffect(() => {
      return () => {
        if (remapTimerRef.current != null) {
          window.clearTimeout(remapTimerRef.current);
        }
      };
    }, []);

    const handleSelectionCode = useCallback(() => {
      const view = viewRef.current;
      if (!view || !activeTab?.path) return;

      const sel = view.state.selection.main;
      if (sel.empty) return;

      const extract = view.state.sliceDoc(sel.from, sel.to);
      const start = offsetToCm5Pos(view.state.doc, sel.from);
      const end = offsetToCm5Pos(view.state.doc, sel.to);
      selectionRef.current = { start, end, extract };

      const coords = view.coordsAtPos(sel.from);
      if (coords) {
        const parent = view.dom.getBoundingClientRect();
        setCodingBar({
          top: coords.bottom - parent.top + 8,
          left: Math.max(8, coords.left - parent.left),
        });
        setCodeName("");
      }
    }, [activeTab]);

    useEffect(() => {
      const onKey = (e: KeyboardEvent): void => {
        if (e.key === "Escape") setCodingBar(null);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
      if (!codingBar) return;
      const onPointerDown = (e: PointerEvent): void => {
        const target = e.target as Node | null;
        const bar = codingBarRef.current;
        if (bar && target && !bar.contains(target)) {
          setCodingBar(null);
        }
      };
      // Defer so the opening click / context-menu dismiss does not immediately close.
      const timer = window.setTimeout(() => {
        window.addEventListener("pointerdown", onPointerDown, true);
      }, 0);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("pointerdown", onPointerDown, true);
      };
    }, [codingBar]);

    useEffect(() => {
      if (!activeTab) {
        onCursorChange(null);
        return;
      }
      const view = viewRef.current;
      if (view) reportCursor(view);
    }, [activeTab?.id, onCursorChange, reportCursor, activeTab]);

    const submitCode = (name?: string): void => {
      const chosen = (name ?? codeName).trim();
      if (!selectionRef.current || !chosen) return;
      onApplyCode(chosen, selectionRef.current);
      setCodingBar(null);
      setCodeName("");
      selectionRef.current = null;
    };

    if (tabs.length === 0) {
      return (
        <section
          aria-label={t("editor.aria")}
          className="flex h-full flex-col items-center justify-center bg-background"
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>{t("editor.emptyTitle")}</EmptyTitle>
              <EmptyDescription>
                {t("editor.emptyDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button onClick={onNewFile}>{t("editor.newFile")}</Button>
              <Button variant="outline" onClick={onNewFolder}>
                {t("editor.newFolder")}
              </Button>
            </EmptyContent>
            <Button
              variant="link"
              size="sm"
              className="text-muted-foreground"
              nativeButton={false}
              render={
                <a
                  href={docsUrl("", i18n.language)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {t("editor.learnMore")}
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </Empty>
        </section>
      );
    }

    return (
      <section
        aria-label={t("editor.aria")}
        className="relative flex h-full flex-col bg-background"
      >
        <div className="flex h-9 shrink-0 items-stretch border-b bg-muted/40">
          {canScrollLeft && (
            <button
              type="button"
              aria-label={t("editor.scrollTabsLeft")}
              className="flex shrink-0 items-center justify-center px-1 text-muted-foreground hover:text-foreground"
              onClick={() => scrollTabsBy(-1)}
            >
              <ChevronLeft className="size-4 fill-current" aria-hidden="true" />
            </button>
          )}
          <div
            ref={tabsStripRef}
            className="flex min-w-0 flex-1 items-end overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {tabs.map((tab) => {
              const active = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  ref={active ? activeTabElRef : undefined}
                  className={cn(
                    "flex h-full shrink-0 items-center gap-2 whitespace-nowrap border-r px-3 text-sm",
                    active
                      ? "bg-background"
                      : "bg-transparent text-muted-foreground"
                  )}
                  onMouseDown={(e) => {
                    if (e.button === 1) {
                      e.preventDefault();
                      onCloseTab(tab.id);
                    }
                  }}
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 outline-none"
                    onClick={() => onSelectTab(tab.id)}
                  >
                    <FileText
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>
                      {tab.title}
                      {tab.dirty ? " *" : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={t("editor.closeTab", { title: tab.title })}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => onCloseTab(tab.id)}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
          {canScrollRight && (
            <button
              type="button"
              aria-label={t("editor.scrollTabsRight")}
              className="flex shrink-0 items-center justify-center px-1 text-muted-foreground hover:text-foreground"
              onClick={() => scrollTabsBy(1)}
            >
              <ChevronRight
                className="size-4 fill-current"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {activeTab && (
          <ContextMenu>
            <ContextMenuTrigger className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <CodeMirror
                  key={activeTab.id}
                  value={activeTab.content}
                  height="100%"
                  theme="none"
                  extensions={extensions}
                  editable={!activeTab.readOnly}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    highlightActiveLine: true,
                  }}
                  onChange={(value) => onContentChange(activeTab.id, value)}
                  onCreateEditor={(view) => {
                    viewRef.current = view;
                    reportCursor(view);
                  }}
                  className="h-full select-text [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
                />

                {codingBar && (
                  <div
                    ref={codingBarRef}
                    className="absolute z-20 flex w-64 flex-col gap-1 rounded-md border bg-background p-2 shadow-md"
                    style={{ top: codingBar.top, left: codingBar.left }}
                  >
                    <Input
                      value={codeName}
                      onChange={(e) => setCodeName(e.target.value)}
                      placeholder={t("editor.codeNamePlaceholder")}
                      className="h-8 select-text"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (filteredCodes.length === 1) {
                            submitCode(denormalize(filteredCodes[0].name));
                          } else if (canCreateFromQuery) {
                            submitCode();
                          } else if (filteredCodes.length > 0) {
                            submitCode(denormalize(filteredCodes[0].name));
                          }
                        }
                      }}
                    />
                    <ScrollArea className="max-h-40">
                      <ul className="flex flex-col py-0.5">
                        {filteredCodes.map((code) => (
                          <li key={code.id}>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
                              onClick={() =>
                                submitCode(denormalize(code.name))
                              }
                            >
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    code.color ??
                                    "var(--app-accent, var(--primary))",
                                }}
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {denormalize(code.name)}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {code.codedExcerpts.length}
                              </span>
                            </button>
                          </li>
                        ))}
                        {filteredCodes.length === 0 && (
                          <li className="px-2 py-1 text-xs text-muted-foreground">
                            {t("editor.noMatchingCodes")}
                          </li>
                        )}
                      </ul>
                    </ScrollArea>
                    <Button
                      size="sm"
                      variant={canCreateFromQuery ? "default" : "ghost"}
                      disabled={!canCreateFromQuery}
                      className="justify-start"
                      onClick={() => submitCode()}
                    >
                      {t("editor.createCode", { name: codeName.trim() || "…" })}
                    </Button>
                  </div>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-56">
              <ContextMenuItem
                onClick={() => runOnView(cutSelection)}
                disabled={activeTab.readOnly}
              >
                <Scissors />
                {t("editor.contextCut")}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => runOnView(copySelection)}>
                <Copy />
                {t("editor.contextCopy")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  const view = viewRef.current;
                  if (view) void pasteClipboard(view);
                }}
                disabled={activeTab.readOnly}
              >
                <ClipboardPaste />
                {t("editor.contextPaste")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => runOnView(toggleBold)}
                disabled={activeTab.readOnly}
              >
                <Bold />
                {t("editor.contextBold")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => runOnView(toggleItalic)}
                disabled={activeTab.readOnly}
              >
                <Italic />
                {t("editor.contextItalic")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => runOnView((v) => setHeading(v, 1))}
                disabled={activeTab.readOnly}
              >
                <Heading1 />
                {t("editor.contextHeading1")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => runOnView((v) => setHeading(v, 2))}
                disabled={activeTab.readOnly}
              >
                <Heading2 />
                {t("editor.contextHeading2")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => runOnView((v) => setHeading(v, 3))}
                disabled={activeTab.readOnly}
              >
                <Heading3 />
                {t("editor.contextHeading3")}
              </ContextMenuItem>
              {activeTab.path && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={handleSelectionCode}>
                    <Code2 />
                    {t("editor.contextCodeSelection")}
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        )}
      </section>
    );
  }
);
