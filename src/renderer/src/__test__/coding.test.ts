import { describe, expect, test } from "vitest";
import {
  buildCodeTree,
  createCode,
  createEmptyCode,
  deleteCode,
  denormalize,
  emptyCodesDocument,
  normalize,
  normalizeCodesDocument,
  renameCode,
  reparentCode,
  remapExcerptFilePaths,
  setCodeColor,
  checkIfFileHasCodes,
  codeNameExists,
  remapExcerptsForDocChange,
} from "@/lib/coding";
import type { CodesDocument } from "@shared/types";

describe("coding domain", () => {
  test("normalize and denormalize", () => {
    expect(normalize("mon code")).toBe("mon-code");
    expect(denormalize("mon-code")).toBe("mon code");
  });

  test("normalizeCodesDocument fills parentId and color for legacy JSON", () => {
    const legacy = {
      codes: [
        {
          id: 1,
          name: "legacy",
          codedExcerpts: [],
        },
      ],
    } as unknown as CodesDocument;
    const doc = normalizeCodesDocument(legacy);
    expect(doc.codes[0].parentId).toBeNull();
    expect(doc.codes[0].color).toBeNull();
  });

  test("normalizeCodesDocument promotes orphan parentId to root", () => {
    const doc = normalizeCodesDocument({
      codes: [
        {
          id: 1,
          name: "a",
          codedExcerpts: [],
          parentId: 999,
          color: null,
        },
      ],
    });
    expect(doc.codes[0].parentId).toBeNull();
  });

  test("create, rename, delete code", () => {
    let doc = emptyCodesDocument();
    doc = createCode(
      doc,
      "Theme A",
      {
        start: { line: 0, ch: 0 },
        end: { line: 0, ch: 5 },
        extract: "hello",
      },
      "/tmp/proj/Documents/a.md"
    );
    expect(doc.codes).toHaveLength(1);
    expect(doc.codes[0].name).toBe("Theme-A");
    expect(doc.codes[0].parentId).toBeNull();
    expect(doc.codes[0].color).toBeNull();
    expect(
      checkIfFileHasCodes(doc, "/tmp/proj/Documents/a.md")
    ).toBe(true);

    const id = doc.codes[0].id;
    doc = renameCode(doc, id, "Theme B");
    expect(doc.codes[0].name).toBe("Theme-B");

    doc = deleteCode(doc, id);
    expect(doc.codes).toHaveLength(0);
  });

  test("createEmptyCode and hierarchy with promote on delete", () => {
    let doc = createEmptyCode(emptyCodesDocument(), "Parent");
    const parentId = doc.codes[0].id;
    doc = createEmptyCode(doc, "Child", parentId);
    doc = createEmptyCode(doc, "Grandchild", doc.codes[1].id);
    expect(buildCodeTree(doc)).toHaveLength(1);
    expect(buildCodeTree(doc)[0].children).toHaveLength(1);

    const childId = doc.codes.find((c) => c.name === "Child")!.id;
    doc = deleteCode(doc, childId);
    const grandchild = doc.codes.find((c) => c.name === "Grandchild")!;
    expect(grandchild.parentId).toBe(parentId);
    expect(doc.codes.find((c) => c.name === "Child")).toBeUndefined();
  });

  test("reparentCode rejects cycles", () => {
    let doc = createEmptyCode(emptyCodesDocument(), "Parent");
    const parentId = doc.codes[0].id;
    doc = createEmptyCode(doc, "Child", parentId);
    const childId = doc.codes.find((c) => c.name === "Child")!.id;
    const cycled = reparentCode(doc, parentId, childId);
    expect(cycled.codes.find((c) => c.id === parentId)!.parentId).toBeNull();
  });

  test("reparentCode moves under valid parent", () => {
    let doc = createEmptyCode(emptyCodesDocument(), "A");
    doc = createEmptyCode(doc, "B");
    const a = doc.codes.find((c) => c.name === "A")!.id;
    const b = doc.codes.find((c) => c.name === "B")!.id;
    doc = reparentCode(doc, b, a);
    expect(doc.codes.find((c) => c.id === b)!.parentId).toBe(a);
  });

  test("setCodeColor", () => {
    let doc = createEmptyCode(emptyCodesDocument(), "Tinted");
    const id = doc.codes[0].id;
    doc = setCodeColor(doc, id, "#ff0000");
    expect(doc.codes[0].color).toBe("#ff0000");
    doc = setCodeColor(doc, id, null);
    expect(doc.codes[0].color).toBeNull();
  });

  test("remapExcerptFilePaths on rename and folder move", () => {
    let doc = createCode(
      emptyCodesDocument(),
      "X",
      {
        start: { line: 0, ch: 0 },
        end: { line: 0, ch: 1 },
        extract: "a",
      },
      "/tmp/proj/Documents/a.md"
    );
    doc = createCode(
      doc,
      "Y",
      {
        start: { line: 1, ch: 0 },
        end: { line: 1, ch: 1 },
        extract: "b",
      },
      "/tmp/proj/Documents/sub/b.md"
    );

    doc = remapExcerptFilePaths(doc, [
      { from: "/tmp/proj/Documents/a.md", to: "/tmp/proj/Documents/renamed.md" },
    ]);
    expect(doc.codes[0].codedExcerpts[0].filePath).toBe(
      "/tmp/proj/Documents/renamed.md"
    );

    doc = remapExcerptFilePaths(doc, [
      {
        from: "/tmp/proj/Documents/sub",
        to: "/tmp/proj/Documents/moved",
      },
    ]);
    expect(doc.codes[1].codedExcerpts[0].filePath).toBe(
      "/tmp/proj/Documents/moved/b.md"
    );
  });

  test("codeNameExists", () => {
    const doc = createEmptyCode(emptyCodesDocument(), "My Code");
    expect(codeNameExists(doc, "My Code")).toBe(true);
    expect(codeNameExists(doc, "My  Code")).toBe(true);
    expect(codeNameExists(doc, "Other")).toBe(false);
  });

  test("remapExcerptsForDocChange maps and drops collapsed", () => {
    const file = "/tmp/a.md";
    let doc = createCode(
      emptyCodesDocument(),
      "Z",
      {
        start: { line: 0, ch: 2 },
        end: { line: 0, ch: 5 },
        extract: "cde",
      },
      file
    );

    // Fake doc: "abcdef" on one line
    const textDoc = {
      lines: 1,
      line: (_n: number) => ({ from: 0, length: 6 }),
      lineAt: (_pos: number) => ({ number: 1, from: 0 }),
    };

    // Insert 3 chars at start: mapPos adds 3 for positions >= 0 with assoc
    const mapped = remapExcerptsForDocChange(
      doc,
      file,
      (pos) => pos + 3,
      textDoc
    );
    expect(mapped.codes[0].codedExcerpts[0].start.ch).toBe(5);
    expect(mapped.codes[0].codedExcerpts[0].end.ch).toBe(8);

    const collapsed = remapExcerptsForDocChange(
      doc,
      file,
      () => 2,
      textDoc
    );
    expect(collapsed.codes[0].codedExcerpts).toHaveLength(0);
  });
});
