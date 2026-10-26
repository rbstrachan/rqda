import type {
  CmPosition,
  Code,
  CodedExcerpt,
  CodesDocument,
} from "@shared/types";
import { remapPath } from "./path-utils";

export type CodeTreeNode = Code & { children: CodeTreeNode[] };

let idSeq = 0;
/** Unique numeric id compatible with legacy Date.now()-style ids. */
export function nextCodeId(): number {
  idSeq += 1;
  return Date.now() + idSeq;
}

export function normalize(text: string): string {
  return text.replace(/\s+/g, "-");
}

export function denormalize(text: string): string {
  return text.replace(/-/g, " ");
}

export function emptyCodesDocument(): CodesDocument {
  return { codes: [] };
}

/** Fill defaults for old JSON; fix orphan parentIds. */
export function normalizeCodesDocument(
  doc: CodesDocument | null | undefined
): CodesDocument {
  if (!doc || !Array.isArray(doc.codes)) {
    return emptyCodesDocument();
  }

  const ids = new Set(
    doc.codes
      .map((c) => c?.id)
      .filter((id): id is number => typeof id === "number")
  );

  return {
    codes: doc.codes
      .filter((c): c is Code => c != null && typeof c.id === "number")
      .map((c) => {
        const rawParent = (c as Code).parentId;
        const parentId =
          rawParent == null || !ids.has(rawParent) || rawParent === c.id
            ? null
            : rawParent;
        const color =
          typeof (c as Code).color === "string" && (c as Code).color
            ? (c as Code).color
            : null;
        return {
          id: c.id,
          name: typeof c.name === "string" ? c.name : String(c.id),
          codedExcerpts: Array.isArray(c.codedExcerpts)
            ? c.codedExcerpts.map((e) => ({ ...e }))
            : [],
          parentId,
          color,
        };
      }),
  };
}

export function checkIfFileHasCodes(
  codes: CodesDocument,
  filePath: string | null | undefined
): boolean {
  if (!filePath) return false;
  return codes.codes.some((code) =>
    code.codedExcerpts.some((excerpt) => excerpt.filePath === filePath)
  );
}

function cloneCodes(codes: CodesDocument): CodesDocument {
  return {
    codes: codes.codes.map((c) => ({
      ...c,
      codedExcerpts: [...c.codedExcerpts],
    })),
  };
}

function isDescendantOf(
  codes: CodesDocument,
  codeId: number,
  ancestorId: number
): boolean {
  let current = codes.codes.find((c) => c.id === codeId);
  const seen = new Set<number>();
  while (current?.parentId != null) {
    if (current.parentId === ancestorId) return true;
    if (seen.has(current.parentId)) break;
    seen.add(current.parentId);
    current = codes.codes.find((c) => c.id === current!.parentId);
  }
  return false;
}

export function createCode(
  codes: CodesDocument,
  codeName: string,
  excerpt: { start: CmPosition; end: CmPosition; extract: string },
  filePath: string,
  options?: { parentId?: number | null; color?: string | null }
): CodesDocument {
  const normalisedCodeName = normalize(codeName);
  if (!normalisedCodeName) return codes;

  const next = cloneCodes(codes);

  let code = next.codes.find((c) => c.name === normalisedCodeName);
  if (!code) {
    const parentId = options?.parentId ?? null;
    const parentOk =
      parentId == null || next.codes.some((c) => c.id === parentId);
    code = {
      id: nextCodeId(),
      name: normalisedCodeName,
      codedExcerpts: [],
      parentId: parentOk ? parentId : null,
      color: options?.color ?? null,
    };
    next.codes.push(code);
  }

  code.codedExcerpts.push({
    id: nextCodeId(),
    start: excerpt.start,
    end: excerpt.end,
    extract: excerpt.extract,
    filePath,
  });

  return next;
}

export function createEmptyCode(
  codes: CodesDocument,
  codeName: string,
  parentId: number | null = null
): CodesDocument {
  const normalisedCodeName = normalize(codeName.trim());
  if (!normalisedCodeName) return codes;
  if (codes.codes.some((c) => c.name === normalisedCodeName)) return codes;

  const parentOk =
    parentId == null || codes.codes.some((c) => c.id === parentId);

  return {
    codes: [
      ...codes.codes.map((c) => ({
        ...c,
        codedExcerpts: [...c.codedExcerpts],
      })),
      {
        id: nextCodeId(),
        name: normalisedCodeName,
        codedExcerpts: [],
        parentId: parentOk ? parentId : null,
        color: null,
      },
    ],
  };
}

export function renameCode(
  codes: CodesDocument,
  codeId: number,
  newName: string
): CodesDocument {
  const normalised = normalize(newName.trim());
  const duplicate = codes.codes.find(
    (c) => c.name === normalised && c.id !== codeId
  );
  if (duplicate || !normalised) return codes;

  return {
    codes: codes.codes.map((c) =>
      c.id === codeId ? { ...c, name: normalised } : c
    ),
  };
}

/** Remove code; promote its children to the deleted node's parent (or root). */
export function deleteCode(
  codes: CodesDocument,
  codeId: number
): CodesDocument {
  const target = codes.codes.find((c) => c.id === codeId);
  if (!target) return codes;
  const newParent = target.parentId;

  return {
    codes: codes.codes
      .filter((c) => c.id !== codeId)
      .map((c) =>
        c.parentId === codeId
          ? { ...c, parentId: newParent, codedExcerpts: [...c.codedExcerpts] }
          : { ...c, codedExcerpts: [...c.codedExcerpts] }
      ),
  };
}

export function reparentCode(
  codes: CodesDocument,
  codeId: number,
  newParentId: number | null
): CodesDocument {
  const target = codes.codes.find((c) => c.id === codeId);
  if (!target) return codes;
  if (target.parentId === newParentId) return codes;
  if (newParentId === codeId) return codes;
  if (
    newParentId != null &&
    !codes.codes.some((c) => c.id === newParentId)
  ) {
    return codes;
  }
  if (
    newParentId != null &&
    isDescendantOf(codes, newParentId, codeId)
  ) {
    return codes;
  }

  return {
    codes: codes.codes.map((c) =>
      c.id === codeId
        ? { ...c, parentId: newParentId, codedExcerpts: [...c.codedExcerpts] }
        : { ...c, codedExcerpts: [...c.codedExcerpts] }
    ),
  };
}

export function setCodeColor(
  codes: CodesDocument,
  codeId: number,
  color: string | null
): CodesDocument {
  return {
    codes: codes.codes.map((c) =>
      c.id === codeId
        ? { ...c, color, codedExcerpts: [...c.codedExcerpts] }
        : { ...c, codedExcerpts: [...c.codedExcerpts] }
    ),
  };
}

export function remapExcerptFilePaths(
  codes: CodesDocument,
  mappings: { from: string; to: string }[]
): CodesDocument {
  if (!mappings.length) return codes;

  let changed = false;
  const next: CodesDocument = {
    codes: codes.codes.map((code) => ({
      ...code,
      codedExcerpts: code.codedExcerpts.map((excerpt) => {
        for (const { from, to } of mappings) {
          const remapped = remapPath(excerpt.filePath, from, to);
          if (remapped) {
            changed = true;
            return { ...excerpt, filePath: remapped };
          }
        }
        return excerpt;
      }),
    })),
  };
  return changed ? next : codes;
}

export type ExcerptWithCode = CodedExcerpt & {
  codeId: number;
  codeName: string;
  codeColor: string | null;
};

export function excerptsForFile(
  codes: CodesDocument,
  filePath: string
): CodedExcerpt[] {
  return excerptsWithCodeForFile(codes, filePath);
}

export function excerptsWithCodeForFile(
  codes: CodesDocument,
  filePath: string
): ExcerptWithCode[] {
  const result: ExcerptWithCode[] = [];
  for (const code of codes.codes) {
    for (const excerpt of code.codedExcerpts) {
      if (excerpt.filePath === filePath) {
        result.push({
          ...excerpt,
          codeId: code.id,
          codeName: code.name,
          codeColor: code.color,
        });
      }
    }
  }
  return result;
}

export function buildCodeRetrievalContent(
  code: Code,
  projectDirectory: string
): string {
  const excerptsList = code.codedExcerpts.map((excerpt) => {
    const relPath = excerpt.filePath.startsWith(projectDirectory)
      ? excerpt.filePath.slice(projectDirectory.length).replace(/^[\\/]/, "")
      : excerpt.filePath;

    return {
      extract: excerpt.extract,
      filePath: relPath,
      timeCoded: new Date(excerpt.id).toLocaleString(),
    };
  });

  let content = `# EXTRAITS CODÉS AVEC "${denormalize(code.name).toUpperCase()}"`;
  for (const data of excerptsList) {
    content += `\n\n**${data.filePath}**\t(${data.timeCoded})\n\n`;
    content += `${data.extract}\n\nーーー`;
  }
  return content;
}

/** Convert CM5 {line, ch} to absolute offset for CodeMirror 6 */
export function cm5PosToOffset(
  doc: { line: (n: number) => { from: number; length: number }; lines: number },
  pos: CmPosition
): number {
  const lineNumber = pos.line + 1; // CM5 is 0-based lines
  if (lineNumber < 1 || lineNumber > doc.lines) {
    return 0;
  }
  const line = doc.line(lineNumber);
  return Math.min(line.from + pos.ch, line.from + line.length);
}

export function offsetToCm5Pos(
  doc: {
    lineAt: (pos: number) => { number: number; from: number };
  },
  offset: number
): CmPosition {
  const line = doc.lineAt(offset);
  return {
    line: line.number - 1,
    ch: offset - line.from,
  };
}

export function sortedCodes(codes: CodesDocument): Code[] {
  return [...codes.codes].sort((a, b) =>
    denormalize(a.name)
      .toLowerCase()
      .localeCompare(denormalize(b.name).toLowerCase())
  );
}

export function buildCodeTree(codes: CodesDocument): CodeTreeNode[] {
  const byParent = new Map<number | null, Code[]>();
  for (const code of codes.codes) {
    const key = code.parentId;
    const list = byParent.get(key) ?? [];
    list.push(code);
    byParent.set(key, list);
  }

  const sortFn = (a: Code, b: Code) =>
    denormalize(a.name)
      .toLowerCase()
      .localeCompare(denormalize(b.name).toLowerCase());

  function build(parentId: number | null): CodeTreeNode[] {
    const children = [...(byParent.get(parentId) ?? [])].sort(sortFn);
    return children.map((c) => ({
      ...c,
      codedExcerpts: [...c.codedExcerpts],
      children: build(c.id),
    }));
  }

  return build(null);
}

export function filterCodesByQuery(
  codes: CodesDocument,
  query: string
): Code[] {
  const q = query.trim().toLowerCase();
  const list = sortedCodes(codes);
  if (!q) return list;
  return list.filter((c) =>
    denormalize(c.name).toLowerCase().includes(q)
  );
}

export function codeNameExists(codes: CodesDocument, name: string): boolean {
  const normalised = normalize(name.trim());
  if (!normalised) return false;
  return codes.codes.some((c) => c.name === normalised);
}

/**
 * Remap excerpt positions after a document edit.
 * Drops excerpts that collapse to empty ranges.
 */
export function remapExcerptsForDocChange(
  codes: CodesDocument,
  filePath: string,
  mapPos: (pos: number, assoc?: number) => number,
  doc: {
    line: (n: number) => { from: number; length: number };
    lines: number;
    lineAt: (pos: number) => { number: number; from: number };
  }
): CodesDocument {
  let changed = false;
  const next: CodesDocument = {
    codes: codes.codes.map((code) => {
      const excerpts: CodedExcerpt[] = [];
      for (const excerpt of code.codedExcerpts) {
        if (excerpt.filePath !== filePath) {
          excerpts.push(excerpt);
          continue;
        }
        const from = mapPos(cm5PosToOffset(doc, excerpt.start), 1);
        const to = mapPos(cm5PosToOffset(doc, excerpt.end), -1);
        if (from >= to) {
          changed = true;
          continue;
        }
        const start = offsetToCm5Pos(doc, from);
        const end = offsetToCm5Pos(doc, to);
        if (
          start.line !== excerpt.start.line ||
          start.ch !== excerpt.start.ch ||
          end.line !== excerpt.end.line ||
          end.ch !== excerpt.end.ch
        ) {
          changed = true;
        }
        excerpts.push({ ...excerpt, start, end });
      }
      if (excerpts.length !== code.codedExcerpts.length) changed = true;
      return { ...code, codedExcerpts: excerpts };
    }),
  };
  return changed ? next : codes;
}
