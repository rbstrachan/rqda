import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Tree,
  type NodeRendererProps,
  type TreeApi,
} from "react-arborist";
import {
  FolderOpen,
  Palette,
  Pencil,
  Plus,
  Trash2,
  CornerDownRight,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  buildCodeTree,
  codeNameExists,
  denormalize,
  type CodeTreeNode,
} from "@/lib/coding";
import type { CodesDocument } from "@shared/types";

type ArboristCodeNode = {
  id: string;
  name: string;
  codeId: number;
  excerptCount: number;
  color: string | null;
  children?: ArboristCodeNode[];
};

const COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export type CodesPanelHandle = {
  startCreate: (parentId?: number | null) => void;
  startRename: (codeId?: number | null) => void;
  startDelete: (codeId?: number | null) => void;
};

type CodesPanelProps = {
  codes: CodesDocument;
  selectedCodeId: number | null;
  onSelect: (codeId: number) => void;
  onRenameCommit: (codeId: number, newName: string) => Promise<void>;
  onCreateEmpty: (
    name: string,
    parentId?: number | null
  ) => Promise<number | null>;
  onDiscardCreate: (codeId: number) => Promise<void>;
  onRequestDelete: (codeId: number) => void;
  onOpen: (codeId: number) => void;
  onReparent: (codeId: number, newParentId: number | null) => void;
  onSetColor: (codeId: number, color: string | null) => void;
};

function toArborist(nodes: CodeTreeNode[]): ArboristCodeNode[] {
  return nodes.map((node) => ({
    id: String(node.id),
    name: denormalize(node.name),
    codeId: node.id,
    excerptCount: node.codedExcerpts.length,
    color: node.color,
    children:
      node.children.length > 0 ? toArborist(node.children) : undefined,
  }));
}

function uniquePlaceholder(
  codes: CodesDocument,
  base: string
): string {
  if (!codeNameExists(codes, base)) return base;
  let i = 2;
  while (codeNameExists(codes, `${base} ${i}`)) i += 1;
  return `${base} ${i}`;
}

export const CodesPanel = forwardRef<CodesPanelHandle, CodesPanelProps>(
  function CodesPanel(
    {
      codes,
      selectedCodeId,
      onSelect,
      onRenameCommit,
      onCreateEmpty,
      onDiscardCreate,
      onRequestDelete,
      onOpen,
      onReparent,
      onSetColor,
    },
    ref
  ) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const treeRef = useRef<TreeApi<ArboristCodeNode> | undefined>(undefined);
    const creatingIds = useRef(new Set<number>());
    const pendingEditId = useRef<number | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [contextCodeId, setContextCodeId] = useState<number | null>(null);

    const data = useMemo(
      () => toArborist(buildCodeTree(codes)),
      [codes]
    );

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    useEffect(() => {
      const id = pendingEditId.current;
      if (id == null || !treeRef.current) return;
      if (!codes.codes.some((c) => c.id === id)) return;
      pendingEditId.current = null;
      void treeRef.current.edit(String(id));
    }, [codes, data, size.height]);

    const beginCreate = useCallback(
      async (parentId: number | null = null) => {
        const base =
          parentId == null
            ? t("outline.defaultCodeName")
            : t("outline.defaultSubcodeName");
        const name = uniquePlaceholder(codes, base);
        const id = await onCreateEmpty(name, parentId);
        if (id == null) return;
        creatingIds.current.add(id);
        pendingEditId.current = id;
        onSelect(id);
        // Tree may already be mounted with the new node on next paint.
        requestAnimationFrame(() => {
          if (pendingEditId.current === id && treeRef.current) {
            pendingEditId.current = null;
            void treeRef.current.edit(String(id));
          }
        });
      },
      [codes, onCreateEmpty, onSelect, t]
    );

    const beginRename = useCallback(
      (codeId?: number | null) => {
        const id = codeId ?? selectedCodeId;
        if (id == null) return;
        onSelect(id);
        void treeRef.current?.edit(String(id));
      },
      [onSelect, selectedCodeId]
    );

    useImperativeHandle(
      ref,
      () => ({
        startCreate: (parentId) => {
          void beginCreate(parentId ?? null);
        },
        startRename: (codeId) => beginRename(codeId),
        startDelete: (codeId) => {
          const id = codeId ?? selectedCodeId;
          if (id != null) onRequestDelete(id);
        },
      }),
      [beginCreate, beginRename, onRequestDelete, selectedCodeId]
    );

    const handleRename = useCallback(
      async ({ id, name }: { id: string; name: string }) => {
        const codeId = Number(id);
        const wasCreate = creatingIds.current.has(codeId);
        if (wasCreate) creatingIds.current.delete(codeId);

        const trimmed = name.trim();
        if (!trimmed) {
          if (wasCreate) await onDiscardCreate(codeId);
          return;
        }

        await onRenameCommit(codeId, trimmed);
      },
      [onDiscardCreate, onRenameCommit]
    );

    const handleMove = useCallback(
      (args: {
        dragIds: string[];
        parentId: string | null;
        index: number;
      }) => {
        const parentId =
          args.parentId == null ? null : Number(args.parentId);
        for (const dragId of args.dragIds) {
          onReparent(
            Number(dragId),
            Number.isFinite(parentId) ? parentId : null
          );
        }
      },
      [onReparent]
    );

    return (
      <div className="flex h-full min-h-0 flex-col">
        <ContextMenu>
          <ContextMenuTrigger className="flex min-h-0 flex-1 flex-col outline-none">
            <div
              ref={containerRef}
              className="thin-scrollbar min-h-0 flex-1 overflow-x-hidden outline-none"
              aria-label={t("outline.aria")}
            >
              {data.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  {t("outline.empty")}
                </p>
              ) : (
                size.width > 0 &&
                size.height > 0 && (
                  <Tree<ArboristCodeNode>
                    ref={treeRef}
                    data={data}
                    width={size.width}
                    height={size.height}
                    indent={12}
                    rowHeight={28}
                    openByDefault
                    disableDrag
                    idAccessor="id"
                    childrenAccessor={(d) => d.children ?? null}
                    selection={
                      selectedCodeId != null
                        ? String(selectedCodeId)
                        : undefined
                    }
                    onSelect={(sel) => {
                      const id = sel[0]?.data.codeId;
                      if (id != null) onSelect(id);
                    }}
                    onActivate={(node) => onSelect(node.data.codeId)}
                    onRename={handleRename}
                    onMove={handleMove}
                    onContextMenu={(e) => {
                      const target = (e.target as HTMLElement).closest(
                        "[data-code-id]"
                      ) as HTMLElement | null;
                      const raw = target?.dataset.codeId;
                      const id = raw != null ? Number(raw) : null;
                      setContextCodeId(id);
                      if (id != null) onSelect(id);
                    }}
                  >
                    {(props) => (
                      <CodeNode
                        {...props}
                        creatingIds={creatingIds.current}
                        onDiscardCreate={onDiscardCreate}
                        onBeginRename={beginRename}
                        onRequestDelete={onRequestDelete}
                        onOpen={onOpen}
                        onSetColor={onSetColor}
                      />
                    )}
                  </Tree>
                )
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem
              disabled={contextCodeId == null}
              onClick={() => {
                if (contextCodeId != null) void beginCreate(contextCodeId);
              }}
            >
              <CornerDownRight />
              {t("outline.addChild")}
            </ContextMenuItem>
            <ContextMenuItem
              disabled={contextCodeId == null}
              onClick={() => {
                if (contextCodeId != null) beginRename(contextCodeId);
              }}
            >
              <Pencil />
              {t("outline.rename")}
            </ContextMenuItem>
            <ContextMenuItem
              disabled={contextCodeId == null}
              onClick={() => {
                if (contextCodeId != null) onOpen(contextCodeId);
              }}
            >
              <FolderOpen />
              {t("outline.open")}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              disabled={contextCodeId == null}
              onClick={() => {
                if (contextCodeId != null) onRequestDelete(contextCodeId);
              }}
            >
              <Trash2 />
              {t("outline.delete")}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <div className="shrink-0 border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => void beginCreate(null)}
          >
            <Plus className="size-4" />
            {t("outline.newCode")}
          </Button>
        </div>
      </div>
    );
  }
);

function CodeNode({
  node,
  style,
  dragHandle,
  creatingIds,
  onDiscardCreate,
  onBeginRename,
  onRequestDelete,
  onOpen,
  onSetColor,
}: NodeRendererProps<ArboristCodeNode> & {
  creatingIds: Set<number>;
  onDiscardCreate: (codeId: number) => Promise<void>;
  onBeginRename: (codeId: number) => void;
  onRequestDelete: (codeId: number) => void;
  onOpen: (codeId: number) => void;
  onSetColor: (codeId: number, color: string | null) => void;
}) {
  const { t } = useTranslation();
  const selected = node.state.isSelected;
  const swatch = node.data.color;
  const submittedRef = useRef(false);

  useEffect(() => {
    submittedRef.current = false;
  }, [node.isEditing]);

  return (
    <div
      ref={dragHandle}
      style={{
        ...style,
        paddingLeft:
          (typeof style?.paddingLeft === "number" ? style.paddingLeft : 0) + 4,
      }}
      data-code-id={node.data.codeId}
      className={cn(
        "group flex h-7 w-full max-w-full min-w-0 items-center gap-1 overflow-hidden pr-2 text-sm outline-none",
        selected
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <button
        type="button"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center",
          !selected && "text-muted-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
        aria-label={node.isOpen ? t("outline.collapse") : t("outline.expand")}
      >
        {node.isInternal ? (
          <span
            className={cn(
              "inline-block transition-transform",
              node.isOpen && "rotate-90"
            )}
          >
            ▸
          </span>
        ) : (
          <span className="size-1.5 rounded-full bg-current opacity-40" />
        )}
      </button>

      <span
        className="size-2.5 shrink-0 rounded-full border border-border"
        style={{
          backgroundColor:
            swatch ?? "color-mix(in oklch, var(--app-accent) 70%, transparent)",
        }}
        aria-hidden
      />

      {node.isEditing ? (
        <input
          autoFocus
          defaultValue={node.data.name}
          className="h-5 min-w-0 flex-1 rounded-sm border bg-background px-1 text-foreground outline-none select-text focus-visible:ring-1 focus-visible:ring-ring"
          onBlur={(e) => {
            if (submittedRef.current) return;
            submittedRef.current = true;
            const value = e.currentTarget.value.trim();
            const wasCreate = creatingIds.has(node.data.codeId);
            if (wasCreate && !value) {
              creatingIds.delete(node.data.codeId);
              void onDiscardCreate(node.data.codeId);
              node.reset();
              return;
            }
            if (wasCreate) creatingIds.delete(node.data.codeId);
            void node.submit(value || node.data.name);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              submittedRef.current = true;
              if (creatingIds.has(node.data.codeId)) {
                creatingIds.delete(node.data.codeId);
                void onDiscardCreate(node.data.codeId);
              }
              node.reset();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (submittedRef.current) return;
              submittedRef.current = true;
              const value = e.currentTarget.value.trim();
              const wasCreate = creatingIds.has(node.data.codeId);
              if (wasCreate && !value) {
                creatingIds.delete(node.data.codeId);
                void onDiscardCreate(node.data.codeId);
                node.reset();
                return;
              }
              if (wasCreate) creatingIds.delete(node.data.codeId);
              void node.submit(value || node.data.name);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => node.activate()}
            className="min-w-0 flex-1 truncate text-left font-medium outline-none"
          >
            {node.data.name}
          </button>

          <span
            className={cn(
              "shrink-0 font-mono text-xs",
              selected ? "opacity-70" : "text-muted-foreground/60"
            )}
          >
            {node.data.excerptCount}
          </span>

          <div className="flex shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger
                title={t("outline.color")}
                aria-label={t("outline.color")}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-md hover:bg-muted hover:text-foreground",
                  !selected && "text-muted-foreground"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Palette className="size-3.5" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem
                  onClick={() => onSetColor(node.data.codeId, null)}
                >
                  {t("outline.useAccent")}
                </DropdownMenuItem>
                <div className="grid grid-cols-4 gap-1 p-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="size-6 rounded-md border border-border"
                      style={{ backgroundColor: color }}
                      aria-label={color}
                      onClick={() => onSetColor(node.data.codeId, color)}
                    />
                  ))}
                </div>
                <div className="px-2 pb-2">
                  <input
                    type="color"
                    className="h-7 w-full cursor-pointer rounded border border-border bg-transparent"
                    value={swatch && /^#/.test(swatch) ? swatch : "#22c55e"}
                    onChange={(e) =>
                      onSetColor(node.data.codeId, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              title={t("outline.rename")}
              aria-label={t("outline.rename")}
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-md hover:bg-muted hover:text-foreground",
                !selected && "text-muted-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onBeginRename(node.data.codeId);
              }}
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              title={t("outline.open")}
              aria-label={t("outline.open")}
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-md hover:bg-muted hover:text-foreground",
                !selected && "text-muted-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(node.data.codeId);
              }}
            >
              <FolderOpen className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              title={t("outline.delete")}
              aria-label={t("outline.delete")}
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-md hover:bg-muted hover:text-foreground",
                !selected && "text-muted-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(node.data.codeId);
              }}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
