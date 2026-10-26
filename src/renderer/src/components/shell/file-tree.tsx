import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
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
  ChevronRight,
  Clipboard,
  ClipboardPaste,
  Copy,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Scissors,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { ancestorPaths, type TreeNode } from "@/lib/tree-utils";
import type { FileClipboard, InlineCreateKind } from "@/store/project-store";

export type ArboristNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: ArboristNode[];
};

export type FileTreeHandle = {
  create: (kind: InlineCreateKind, parentPath: string) => void;
  edit: (path: string) => void;
  focus: () => void;
  expandAll: () => void;
  collapseAll: () => void;
};

type FileTreeProps = {
  nodes: TreeNode[];
  projectPath: string | null;
  selectedPaths: string[];
  filter?: string;
  inlineCreate: {
    id: number;
    kind: InlineCreateKind;
    parentPath: string;
  } | null;
  renamePath: string | null;
  fileClipboard: FileClipboard | null;
  onSelectionChange: (paths: string[]) => void;
  onActivateFile: (path: string) => void;
  onMove: (sources: string[], destDir: string) => void;
  onRename: (oldPath: string, newName: string) => Promise<void>;
  onCommitCreate: (
    parentPath: string,
    kind: InlineCreateKind,
    name: string
  ) => Promise<string | null>;
  onCancelCreate: () => void;
  onDiscardCreate: (path: string) => void;
  onClearRename: () => void;
  onDelete: (paths: string[]) => void;
  onCreateIn: (kind: InlineCreateKind, parentPath: string) => void;
  onReveal: (path: string) => void;
  onRequestRename: (path: string) => void;
  onDuplicate: (paths: string[]) => void;
  onCopyPath: (path: string) => void;
  onCut: (paths: string[]) => void;
  onCopy: (paths: string[]) => void;
  onPaste: (destDir?: string) => void;
};

function toArborist(nodes: TreeNode[]): ArboristNode[] {
  return nodes.map((node) =>
    node.type === "folder"
      ? {
          id: node.path,
          name: node.name,
          type: "folder" as const,
          children: toArborist(node.children),
        }
      : { id: node.path, name: node.name, type: "file" as const }
  );
}

function isDescendantPath(ancestor: string, candidate: string): boolean {
  return (
    candidate === ancestor ||
    candidate.startsWith(ancestor + "/") ||
    candidate.startsWith(ancestor + "\\")
  );
}

/** UI label only — disk paths stay *.md; store re-applies extension on rename. */
function displayName(name: string, type: "file" | "folder"): string {
  if (type !== "file") return name;
  return name.replace(/\.md$/i, "");
}

type NodeExtras = {
  creatingIds: Set<string>;
  onDiscardCreate: (path: string) => void;
};

const NodeExtrasContext = createContext<NodeExtras>({
  creatingIds: new Set(),
  onDiscardCreate: () => {},
});

export const FileTree = forwardRef<FileTreeHandle, FileTreeProps>(
  function FileTree(
    {
      nodes,
      projectPath,
      selectedPaths,
      filter = "",
      inlineCreate,
      renamePath,
      fileClipboard,
      onSelectionChange,
      onActivateFile,
      onMove,
      onRename,
      onCommitCreate,
      onCancelCreate,
      onDiscardCreate,
      onClearRename,
      onDelete,
      onCreateIn,
      onReveal,
      onRequestRename,
      onDuplicate,
      onCopyPath,
      onCut,
      onCopy,
      onPaste,
    },
    ref
  ) {
    const { t } = useTranslation();
    const treeRef = useRef<TreeApi<ArboristNode> | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [contextTarget, setContextTarget] = useState<string | null>(null);
    const pendingCreateRef = useRef<InlineCreateKind | null>(null);
    const lastCreateId = useRef<number | null>(null);
    const creatingIds = useRef(new Set<string>());
    const lastSyncedPath = useRef<string | null>(null);
    /** Survives Tree unmount when the sidebar collapses to zero size. */
    const openStateRef = useRef<Record<string, boolean>>({});
    const lastProjectPath = useRef(projectPath);

    if (lastProjectPath.current !== projectPath) {
      lastProjectPath.current = projectPath;
      openStateRef.current = {};
    }

    const data = useMemo(() => toArborist(nodes), [nodes]);

    const captureOpenState = useCallback(() => {
      const tree = treeRef.current;
      if (tree) openStateRef.current = { ...tree.openState };
    }, []);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        setSize({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const startCreate = useCallback(
      (kind: InlineCreateKind, parentPath: string) => {
        const tree = treeRef.current;
        if (!tree || !projectPath) return;
        pendingCreateRef.current = kind;
        const parentId = parentPath === projectPath ? null : parentPath;
        if (parentId) tree.get(parentId)?.open();
        void tree.create({
          type: kind === "folder" ? "internal" : "leaf",
          parentId,
        });
      },
      [projectPath]
    );

    useImperativeHandle(ref, () => ({
      create: startCreate,
      edit: (path) => {
        void treeRef.current?.edit(path);
      },
      focus: () => {
        containerRef.current?.focus();
      },
      expandAll: () => {
        treeRef.current?.openAll();
        captureOpenState();
      },
      collapseAll: () => {
        treeRef.current?.closeAll();
        captureOpenState();
      },
    }));

    useEffect(() => {
      if (!inlineCreate) return;
      if (lastCreateId.current === inlineCreate.id) return;
      lastCreateId.current = inlineCreate.id;
      startCreate(inlineCreate.kind, inlineCreate.parentPath);
    }, [inlineCreate, startCreate]);

    useEffect(() => {
      if (!renamePath) return;
      void treeRef.current?.edit(renamePath).then(() => onClearRename());
    }, [renamePath, onClearRename]);

    // Sync arborist selection + expand ancestors when active tab path changes
    useEffect(() => {
      if (selectedPaths.length !== 1) return;
      const path = selectedPaths[0];
      if (!path || path === lastSyncedPath.current) return;
      lastSyncedPath.current = path;
      const tree = treeRef.current;
      if (!tree) return;
      for (const ancestor of ancestorPaths(path, projectPath)) {
        tree.open(ancestor);
      }
      tree.select(path);
      tree.scrollTo(path);
    }, [selectedPaths, projectPath, data]);

    const handleCreate = useCallback(
      async (args: {
        parentId: string | null;
        type: "internal" | "leaf";
      }) => {
        const kind: InlineCreateKind =
          pendingCreateRef.current ??
          (args.type === "internal" ? "folder" : "file");
        pendingCreateRef.current = null;
        const parent = args.parentId ?? projectPath;
        if (!parent) {
          onCancelCreate();
          return null;
        }
        const placeholderName =
          kind === "folder"
            ? t("fileTree.defaultFolderName")
            : t("fileTree.defaultFileName");
        const created = await onCommitCreate(parent, kind, placeholderName);
        if (created) creatingIds.current.add(created);
        else onCancelCreate();
        return created
          ? ({ id: created, name: placeholderName, type: kind } as ArboristNode)
          : null;
      },
      [onCancelCreate, onCommitCreate, projectPath, t]
    );

    const handleRename = useCallback(
      async ({ id, name }: { id: string; name: string }) => {
        const wasCreate = creatingIds.current.has(id);
        if (wasCreate) creatingIds.current.delete(id);

        const trimmed = name.trim();
        if (!trimmed) {
          if (wasCreate) onDiscardCreate(id);
          return;
        }

        await onRename(id, trimmed);
      },
      [onDiscardCreate, onRename]
    );

    const handleMove = useCallback(
      async ({
        dragIds,
        parentId,
      }: {
        dragIds: string[];
        parentId: string | null;
      }) => {
        const dest = parentId ?? projectPath;
        if (!dest) return;
        await onMove(dragIds, dest);
      },
      [onMove, projectPath]
    );

    const handleDelete = useCallback(
      async ({ ids }: { ids: string[] }) => {
        await onDelete(ids);
      },
      [onDelete]
    );

    const pasteDestForSelection = useCallback(() => {
      const primary = selectedPaths[0];
      if (!primary) return projectPath ?? undefined;
      const node = findType(data, primary);
      if (node?.type === "folder") return primary;
      const parent = primary.replace(/[/\\][^/\\]+$/, "");
      return parent || projectPath || undefined;
    }, [data, projectPath, selectedPaths]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const onKeyDown = (e: KeyboardEvent) => {
        const active = document.activeElement;
        if (active !== el && !el.contains(active)) return;
        if ((active as HTMLElement)?.tagName === "INPUT") return;

        const mod = e.metaKey || e.ctrlKey;
        if (e.key === "F2") {
          e.preventDefault();
          const path = selectedPaths[0];
          if (path) onRequestRename(path);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const path = selectedPaths[0];
          if (!path) return;
          const node = findType(data, path);
          if (node?.type === "folder") {
            treeRef.current?.get(path)?.toggle();
          } else if (node?.type === "file") {
            onActivateFile(path);
          }
        } else if (e.key === "Delete" || (e.key === "Backspace" && mod)) {
          e.preventDefault();
          if (selectedPaths.length) onDelete(selectedPaths);
        } else if (mod && e.key.toLowerCase() === "x") {
          e.preventDefault();
          if (selectedPaths.length) onCut(selectedPaths);
        } else if (mod && e.key.toLowerCase() === "c") {
          e.preventDefault();
          if (selectedPaths.length) onCopy(selectedPaths);
        } else if (mod && e.key.toLowerCase() === "v") {
          e.preventDefault();
          onPaste(pasteDestForSelection());
        } else if (mod && e.key.toLowerCase() === "d") {
          e.preventDefault();
          if (selectedPaths.length) onDuplicate(selectedPaths);
        } else if (mod && e.key.toLowerCase() === "n" && e.shiftKey) {
          e.preventDefault();
          if (projectPath) {
            onCreateIn("folder", selectedPaths[0] ?? projectPath);
          }
        } else if (mod && e.key.toLowerCase() === "n") {
          e.preventDefault();
          if (projectPath) {
            onCreateIn("file", selectedPaths[0] ?? projectPath);
          }
        }
      };

      el.addEventListener("keydown", onKeyDown);
      return () => el.removeEventListener("keydown", onKeyDown);
    }, [
      selectedPaths,
      onRequestRename,
      onDelete,
      onCreateIn,
      projectPath,
      data,
      onActivateFile,
      onCut,
      onCopy,
      onPaste,
      onDuplicate,
      pasteDestForSelection,
    ]);

    const contextPaths = useMemo(() => {
      if (!contextTarget) return selectedPaths;
      if (selectedPaths.includes(contextTarget)) return selectedPaths;
      return [contextTarget];
    }, [contextTarget, selectedPaths]);

    const contextNode = useMemo(() => {
      if (!contextTarget) return null;
      return findType(data, contextTarget);
    }, [contextTarget, data]);

    const multi = contextPaths.length > 1;
    const canPaste = Boolean(fileClipboard?.paths.length);

    const nodeExtras = useMemo(
      () => ({
        creatingIds: creatingIds.current,
        onDiscardCreate,
      }),
      [onDiscardCreate]
    );

    const pasteIntoContext = () => {
      if (contextNode?.type === "folder" && contextTarget) {
        onPaste(contextTarget);
      } else if (contextTarget) {
        const parent = contextTarget.replace(/[/\\][^/\\]+$/, "");
        onPaste(parent || projectPath || undefined);
      } else {
        onPaste(projectPath ?? undefined);
      }
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-full w-full flex-col outline-none">
          <div
            ref={containerRef}
            tabIndex={0}
            className="thin-scrollbar min-h-0 flex-1 overflow-x-hidden outline-none"
            aria-label={t("fileTree.aria")}
          >
            {size.width > 0 && size.height > 0 && (
              <NodeExtrasContext.Provider value={nodeExtras}>
                <Tree<ArboristNode>
                  ref={treeRef}
                  data={data}
                  width={size.width}
                  height={size.height}
                  indent={12}
                  rowHeight={28}
                  openByDefault={false}
                  initialOpenState={openStateRef.current}
                  idAccessor="id"
                  childrenAccessor={(d) =>
                    d.type === "folder" ? (d.children ?? []) : null
                  }
                  searchTerm={filter}
                  searchMatch={(node, term) => {
                    const q = term.toLowerCase();
                    const full = node.data.name.toLowerCase();
                    const stem = displayName(
                      node.data.name,
                      node.data.type
                    ).toLowerCase();
                    return full.includes(q) || stem.includes(q);
                  }}
                  selection={
                    selectedPaths.length === 1 ? selectedPaths[0] : undefined
                  }
                  onSelect={(sel) => onSelectionChange(sel.map((n) => n.id))}
                  onActivate={(node) => {
                    if (node.data.type === "file") onActivateFile(node.id);
                  }}
                  onToggle={captureOpenState}
                  onCreate={handleCreate}
                  onRename={handleRename}
                  onMove={handleMove}
                  onDelete={handleDelete}
                  disableDrop={({ parentNode, dragNodes }) => {
                    if (!parentNode) return false;
                    return dragNodes.some(
                      (n) =>
                        n.data.type === "folder" &&
                        isDescendantPath(n.id, parentNode.id)
                    );
                  }}
                  onContextMenu={(e) => {
                    const target = (e.target as HTMLElement).closest(
                      "[data-arborist-path]"
                    ) as HTMLElement | null;
                    const path = target?.dataset.arboristPath ?? null;
                    setContextTarget(path);
                    if (path && !selectedPaths.includes(path)) {
                      onSelectionChange([path]);
                    }
                  }}
                >
                  {Node}
                </Tree>
              </NodeExtrasContext.Provider>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {multi ? (
            <>
              <ContextMenuItem onClick={() => onCut(contextPaths)}>
                <Scissors />
                {t("fileTree.cut")}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onCopy(contextPaths)}>
                <Copy />
                {t("fileTree.copy")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!canPaste}
                onClick={() => pasteIntoContext()}
              >
                <ClipboardPaste />
                {t("fileTree.paste")}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onDuplicate(contextPaths)}>
                <Copy />
                {t("fileTree.duplicate")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onClick={() => onDelete(contextPaths)}
              >
                <Trash2 />
                {t("fileTree.deleteSelection")}
              </ContextMenuItem>
            </>
          ) : contextNode?.type === "folder" ? (
            <>
              <ContextMenuItem
                onClick={() =>
                  contextTarget && onCreateIn("file", contextTarget)
                }
              >
                <FilePlus />
                {t("fileTree.newFile")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  contextTarget && onCreateIn("folder", contextTarget)
                }
              >
                <FolderPlus />
                {t("fileTree.newFolder")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => contextTarget && onCut([contextTarget])}
              >
                <Scissors />
                {t("fileTree.cut")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onCopy([contextTarget])}
              >
                <Copy />
                {t("fileTree.copy")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!canPaste}
                onClick={() => pasteIntoContext()}
              >
                <ClipboardPaste />
                {t("fileTree.paste")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onDuplicate([contextTarget])}
              >
                <Copy />
                {t("fileTree.duplicate")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onCopyPath(contextTarget)}
              >
                <Clipboard />
                {t("fileTree.copyPath")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => contextTarget && onRequestRename(contextTarget)}
              >
                <Pencil />
                {t("fileTree.rename")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onReveal(contextTarget)}
              >
                <FolderOpen />
                {t("fileTree.reveal")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onClick={() => contextTarget && onDelete([contextTarget])}
              >
                <Trash2 />
                {t("fileTree.delete")}
              </ContextMenuItem>
            </>
          ) : contextNode?.type === "file" ? (
            <>
              <ContextMenuItem
                onClick={() => contextTarget && onActivateFile(contextTarget)}
              >
                <FileText />
                {t("fileTree.open")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => contextTarget && onCut([contextTarget])}
              >
                <Scissors />
                {t("fileTree.cut")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onCopy([contextTarget])}
              >
                <Copy />
                {t("fileTree.copy")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!canPaste}
                onClick={() => pasteIntoContext()}
              >
                <ClipboardPaste />
                {t("fileTree.paste")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onDuplicate([contextTarget])}
              >
                <Copy />
                {t("fileTree.duplicate")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onCopyPath(contextTarget)}
              >
                <Clipboard />
                {t("fileTree.copyPath")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => contextTarget && onRequestRename(contextTarget)}
              >
                <Pencil />
                {t("fileTree.rename")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => contextTarget && onReveal(contextTarget)}
              >
                <FolderOpen />
                {t("fileTree.reveal")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onClick={() => contextTarget && onDelete([contextTarget])}
              >
                <Trash2 />
                {t("fileTree.delete")}
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem
                onClick={() => projectPath && onCreateIn("file", projectPath)}
              >
                <FilePlus />
                {t("fileTree.newFile")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => projectPath && onCreateIn("folder", projectPath)}
              >
                <FolderPlus />
                {t("fileTree.newFolder")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!canPaste}
                onClick={() => onPaste(projectPath ?? undefined)}
              >
                <ClipboardPaste />
                {t("fileTree.paste")}
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }
);

function findType(list: ArboristNode[], id: string): ArboristNode | null {
  for (const n of list) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findType(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function Node({ node, style, dragHandle }: NodeRendererProps<ArboristNode>) {
  const { t } = useTranslation();
  const { creatingIds, onDiscardCreate } = useContext(NodeExtrasContext);
  const isFolder = node.data.type === "folder";
  const FolderIcon = node.isOpen ? FolderOpen : Folder;
  const submittedRef = useRef(false);

  return (
    <div
      ref={dragHandle}
      style={{
        ...style,
        paddingLeft:
          (typeof style?.paddingLeft === "number" ? style.paddingLeft : 0) + 4,
      }}
      data-arborist-path={node.id}
      className={cn(
        "flex h-7 items-center gap-1.5 pr-2 text-sm outline-none",
        node.state.isSelected
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        isFolder && !node.state.isSelected && "text-foreground"
      )}
      onClick={(e) => {
        node.handleClick(e);
        if (isFolder && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
          node.toggle();
        }
      }}
    >
      {isFolder ? (
        <button
          type="button"
          className="inline-flex size-3.5 shrink-0 items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            node.toggle();
          }}
          aria-label={node.isOpen ? t("fileTree.collapse") : t("fileTree.expand")}
        >
          <ChevronRight
            className={cn(
              "size-3.5 transition-transform duration-200",
              node.isOpen && "rotate-90"
            )}
          />
        </button>
      ) : (
        <span className="size-3.5 shrink-0" aria-hidden="true" />
      )}
      {isFolder ? (
        <FolderIcon className="size-4 shrink-0" />
      ) : (
        <FileText className="size-4 shrink-0" />
      )}
      {node.isEditing ? (
        <input
          autoFocus
          defaultValue={displayName(node.data.name, node.data.type)}
          className="h-5 min-w-0 flex-1 rounded-sm border bg-background px-1 text-foreground outline-none select-text focus-visible:ring-1 focus-visible:ring-ring"
          onBlur={(e) => {
            if (submittedRef.current) return;
            submittedRef.current = true;
            const value = e.currentTarget.value.trim();
            if (creatingIds.has(node.id)) {
              if (!value) {
                onDiscardCreate(node.id);
                creatingIds.delete(node.id);
                node.reset();
                return;
              }
              creatingIds.delete(node.id);
            }
            void node.submit(
              value || displayName(node.data.name, node.data.type)
            );
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              submittedRef.current = true;
              if (creatingIds.has(node.id)) {
                onDiscardCreate(node.id);
                creatingIds.delete(node.id);
              }
              node.reset();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (submittedRef.current) return;
              submittedRef.current = true;
              const value = e.currentTarget.value.trim();
              if (creatingIds.has(node.id)) {
                if (!value) {
                  onDiscardCreate(node.id);
                  creatingIds.delete(node.id);
                  node.reset();
                  return;
                }
                creatingIds.delete(node.id);
              }
              void node.submit(
                value || displayName(node.data.name, node.data.type)
              );
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={cn("truncate", isFolder && "font-medium")}>
          {displayName(node.data.name, node.data.type)}
        </span>
      )}
    </div>
  );
}
