export function pathSep(sample: string): string {
  return sample.includes("\\") ? "\\" : "/";
}

export function joinPath(parent: string, name: string): string {
  const sep = pathSep(parent);
  return `${parent.replace(/[/\\]$/, "")}${sep}${name}`;
}

export function dirnamePath(filePath: string): string {
  const sep = pathSep(filePath);
  const parts = filePath.split(/[/\\]/);
  parts.pop();
  return parts.join(sep) || filePath;
}

export function basenamePath(filePath: string): string {
  return filePath.split(/[/\\]/).pop() ?? filePath;
}

export function ensureMdExtension(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "nouveau-fichier.md";
  if (trimmed.includes(".")) return trimmed;
  return `${trimmed}.md`;
}

export function remapPath(
  path: string,
  from: string,
  to: string
): string | null {
  if (path === from) return to;
  const sep = pathSep(from);
  if (path.startsWith(from + sep)) {
    return to + path.slice(from.length);
  }
  return null;
}
