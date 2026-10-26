import type { DirTreeNode } from "@shared/types";

export type TreeNode =
  | { type: "folder"; name: string; path: string; children: TreeNode[] }
  | { type: "file"; name: string; path: string };

export function dirTreeToNodes(node: DirTreeNode | null): TreeNode[] {
  if (!node) return [];

  // directory-tree root is the project folder; expose its children
  if (node.children && node.children.length > 0) {
    return node.children
      .map(convertNode)
      .filter((n): n is TreeNode => n !== null)
      .sort(compareNodes);
  }

  const single = convertNode(node);
  return single ? [single] : [];
}

function convertNode(node: DirTreeNode): TreeNode | null {
  if (!node?.name) return null;

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isDirectory =
    hasChildren ||
    node.type === "directory" ||
    (!node.type && Array.isArray(node.children));

  if (isDirectory) {
    const children = (node.children ?? [])
      .map(convertNode)
      .filter((n): n is TreeNode => n !== null)
      .sort(compareNodes);
    return {
      type: "folder",
      name: node.name,
      path: node.path,
      children,
    };
  }

  return {
    type: "file",
    name: node.name,
    path: node.path,
  };
}

function compareNodes(a: TreeNode, b: TreeNode): number {
  if (a.type === "folder" && b.type !== "folder") return -1;
  if (a.type !== "folder" && b.type === "folder") return 1;
  return a.name.localeCompare(b.name);
}

export function findNodeByPath(
  nodes: TreeNode[],
  path: string
): TreeNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.type === "folder") {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function ancestorPaths(
  path: string,
  projectPath: string | null
): string[] {
  if (!projectPath) return [];
  const sep = path.includes("\\") ? "\\" : "/";
  const rel = path.startsWith(projectPath + sep)
    ? path.slice(projectPath.length + 1)
    : path;
  const parts = rel.split(/[/\\]/).filter(Boolean);
  const result: string[] = [];
  let current = projectPath;
  for (let i = 0; i < parts.length - 1; i++) {
    current = `${current}${sep}${parts[i]}`;
    result.push(current);
  }
  return result;
}
