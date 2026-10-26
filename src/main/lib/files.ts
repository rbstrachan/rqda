import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  cpSync,
  mkdirSync,
  existsSync,
  renameSync,
  readdirSync,
  statSync,
} from "fs";
import { basename, dirname, extname, join, resolve, sep } from "path";
import dirTree from "directory-tree";
import mammoth from "mammoth";
import type { DirTreeResult } from "../../shared/types";

type MammothMarkdown = {
  convertToMarkdown: (input: {
    path: string;
  }) => Promise<{ value: string }>;
};
const mammothMd = mammoth as unknown as MammothMarkdown;

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Import lib entry directly — package root runs a debug harness when
  // `module.parent` is unset (common under Electron dynamic import).
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse =
    (pdfParseModule as { default?: (data: Buffer) => Promise<{ text: string }> })
      .default ??
    (pdfParseModule as unknown as (data: Buffer) => Promise<{ text: string }>);
  const data = await pdfParse(buffer);
  return data.text.trim();
}

export function getDirTree(folderPath: string): DirTreeResult {
  if (!folderPath) {
    return { directoryTree: null, projectTitle: "" };
  }
  const directoryTree = dirTree(folderPath);
  const projectTitle = basename(folderPath);
  return { directoryTree, projectTitle };
}

export function readFile(filePath: string): string {
  return readFileSync(filePath, "utf-8");
}

export function saveFile(filePath: string, content: string): void {
  writeFileSync(filePath, content, "utf-8");
}

export function createFile(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (existsSync(filePath)) {
    throw new Error(`Le fichier existe déjà : ${filePath}`);
  }
  writeFileSync(filePath, "", "utf-8");
}

export function createFolder(folderPath: string): void {
  if (existsSync(folderPath)) {
    throw new Error(`Le dossier existe déjà : ${folderPath}`);
  }
  mkdirSync(folderPath, { recursive: true });
}

export async function deleteFile(filePath: string): Promise<void> {
  await deletePaths([filePath]);
}

export async function deletePaths(paths: string[]): Promise<void> {
  const existing = paths.filter((p) => existsSync(p));
  if (existing.length === 0) return;
  // One batch + glob:false avoids Windows ENOENT from per-path loops /
  // backslash glob interpretation. Nested paths are pruned inside trash.
  const trash = await import("trash");
  await trash.default(existing, { glob: false });
}

export function renamePath(fromPath: string, toPath: string): void {
  if (!existsSync(fromPath)) {
    throw new Error(`Introuvable : ${fromPath}`);
  }
  if (existsSync(toPath)) {
    throw new Error(`La destination existe déjà : ${toPath}`);
  }
  const parent = dirname(toPath);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }
  renameSync(fromPath, toPath);
}

function isDescendantOrSelf(candidate: string, ancestor: string): boolean {
  const a = resolve(ancestor);
  const c = resolve(candidate);
  return c === a || c.startsWith(a + sep);
}

function uniqueDestPath(destDir: string, name: string): string {
  let dest = join(destDir, name);
  if (!existsSync(dest)) return dest;
  const ext = extname(name);
  const base = basename(name, ext);
  let i = 1;
  while (existsSync(dest)) {
    dest = join(destDir, `${base} (${i})${ext}`);
    i += 1;
  }
  return dest;
}

export function movePaths(
  sources: string[],
  destDir: string
): { from: string; to: string }[] {
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  const results: { from: string; to: string }[] = [];

  for (const source of sources) {
    if (!existsSync(source)) continue;
    const resolvedDest = resolve(destDir);
    const resolvedSource = resolve(source);
    if (resolvedDest === dirname(resolvedSource)) continue;
    if (isDescendantOrSelf(resolvedDest, resolvedSource)) continue;

    const name = basename(source);
    const to = uniqueDestPath(destDir, name);
    renameSync(source, to);
    results.push({ from: source, to });
  }

  return results;
}

export function copyPaths(
  sources: string[],
  destDir: string
): { from: string; to: string }[] {
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  const results: { from: string; to: string }[] = [];

  for (const source of sources) {
    if (!existsSync(source)) continue;
    const resolvedDest = resolve(destDir);
    const resolvedSource = resolve(source);
    if (isDescendantOrSelf(resolvedDest, resolvedSource)) continue;

    const name = basename(source);
    const to = uniqueDestPath(destDir, name);
    const isDir = statSync(source).isDirectory();
    cpSync(source, to, { recursive: isDir });
    results.push({ from: source, to });
  }

  return results;
}

async function importSingleFile(
  file: string,
  destDir: string
): Promise<string | null> {
  const fileName = basename(file);
  const ext = extname(file).toLowerCase();
  const baseName = basename(fileName, ext);

  if (ext === ".docx") {
    try {
      const result = await mammothMd.convertToMarkdown({ path: file });
      const markdown = result.value
        .replace(/\\([*_`\-.()])/g, "$1")
        .replace(/__/g, "**")
        .replace(/<a\s+id="[^"]*"><\/a>/g, "")
        .replace(/!\[[\s\S]*?\]\(data:image\/[^\)]+\)/g, "")
        .trim();
      const dest = uniqueDestPath(destDir, `${baseName}.md`);
      writeFileSync(dest, markdown, "utf8");
      return dest;
    } catch (error) {
      console.error(`Failed to convert ${fileName} to Markdown:`, error);
      return null;
    }
  }

  if (ext === ".pdf") {
    try {
      const dataBuffer = readFileSync(file);
      const text = await extractPdfText(dataBuffer);
      const dest = uniqueDestPath(destDir, `${baseName}.md`);
      writeFileSync(dest, text, "utf8");
      return dest;
    } catch (error) {
      console.error(`Failed to extract text from ${fileName}:`, error);
      return null;
    }
  }

  try {
    const dest = uniqueDestPath(destDir, fileName);
    copyFileSync(file, dest);
    return dest;
  } catch (error) {
    console.error(`Failed to copy ${fileName}:`, error);
    return null;
  }
}

export async function copyFilesToProject(
  files: string[],
  projectPath: string,
  destDir?: string
): Promise<void> {
  const targetDir = destDir ?? projectPath;
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  for (const file of files) {
    await importSingleFile(file, targetDir);
  }
}

export async function importFolderToProject(
  sourceFolder: string,
  projectPath: string
): Promise<void> {
  if (!existsSync(sourceFolder) || !statSync(sourceFolder).isDirectory()) {
    throw new Error(`Dossier source invalide : ${sourceFolder}`);
  }

  const folderName = basename(sourceFolder);
  const destRoot = uniqueDestPath(projectPath, folderName);
  mkdirSync(destRoot, { recursive: true });

  async function walk(src: string, dest: string): Promise<void> {
    const entries = readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      if (entry.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
        await walk(srcPath, destPath);
      } else if (entry.isFile()) {
        await importSingleFile(srcPath, dest);
      }
    }
  }

  await walk(sourceFolder, destRoot);
}

/** Fallback recursive copy without conversion (unused helper for plain trees). */
export function copyFolderSync(source: string, dest: string): void {
  cpSync(source, dest, { recursive: true });
}
