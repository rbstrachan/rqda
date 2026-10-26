import type { TreeNode } from "@/lib/tree-utils";

export type FileSearchHit = {
  path: string;
  name: string;
  score: number;
};

function collectFiles(
  nodes: TreeNode[],
  out: { path: string; name: string }[] = []
): { path: string; name: string }[] {
  for (const node of nodes) {
    if (node.type === "file") {
      out.push({ path: node.path, name: node.name });
    } else if (node.children) {
      collectFiles(node.children, out);
    }
  }
  return out;
}

/** Rank file hits: name starts-with > name includes > path includes. */
export function searchProjectFiles(
  nodes: TreeNode[],
  query: string,
  limit = 40
): FileSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const files = collectFiles(nodes);
  const hits: FileSearchHit[] = [];

  for (const file of files) {
    const nameLower = file.name.toLowerCase();
    const pathLower = file.path.toLowerCase();
    let score = 0;
    if (nameLower.startsWith(q)) score = 300 - Math.min(nameLower.length, 100);
    else if (nameLower.includes(q)) score = 200 - Math.min(nameLower.length, 100);
    else if (pathLower.includes(q)) score = 100;
    else continue;
    hits.push({ ...file, score });
  }

  hits.sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name)
  );
  return hits.slice(0, limit);
}
