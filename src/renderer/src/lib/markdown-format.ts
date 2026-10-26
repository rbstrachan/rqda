import { undo, redo, selectAll as cmSelectAll } from "@codemirror/commands";
import {
  EditorSelection,
  Prec,
  type ChangeSpec,
  type Extension,
  type TransactionSpec,
} from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

export { undo, redo };

function wrapSelection(
  view: EditorView,
  before: string,
  after: string = before
): boolean {
  if (view.state.readOnly) return false;

  const changes: ChangeSpec[] = [];
  const newSelections: { anchor: number; head: number }[] = [];

  for (const range of view.state.selection.ranges) {
    const selected = view.state.sliceDoc(range.from, range.to);
    const wrappedBefore = selected.startsWith(before);
    const wrappedAfter = selected.endsWith(after);
    const fullyWrapped =
      wrappedBefore &&
      wrappedAfter &&
      selected.length >= before.length + after.length;

    if (fullyWrapped) {
      const inner = selected.slice(
        before.length,
        selected.length - after.length
      );
      changes.push({ from: range.from, to: range.to, insert: inner });
      newSelections.push({
        anchor: range.from,
        head: range.from + inner.length,
      });
    } else if (range.empty) {
      const placeholder = before === "**" ? "bold" : "italic";
      const insert = `${before}${placeholder}${after}`;
      changes.push({ from: range.from, to: range.to, insert });
      newSelections.push({
        anchor: range.from + before.length,
        head: range.from + before.length + placeholder.length,
      });
    } else {
      const insert = `${before}${selected}${after}`;
      changes.push({ from: range.from, to: range.to, insert });
      newSelections.push({
        anchor: range.from + before.length,
        head: range.from + before.length + selected.length,
      });
    }
  }

  const spec: TransactionSpec = {
    changes,
    selection: EditorSelection.create(
      newSelections.map((s) => EditorSelection.range(s.anchor, s.head)),
      view.state.selection.mainIndex
    ),
    userEvent: "input",
  };
  view.dispatch(spec);
  return true;
}

export function toggleBold(view: EditorView): boolean {
  return wrapSelection(view, "**");
}

export function toggleItalic(view: EditorView): boolean {
  return wrapSelection(view, "*");
}

export function setHeading(view: EditorView, level: 1 | 2 | 3): boolean {
  if (view.state.readOnly) return false;
  const prefix = `${"#".repeat(level)} `;
  const changes: ChangeSpec[] = [];

  for (const range of view.state.selection.ranges) {
    const line = view.state.doc.lineAt(range.from);
    const text = line.text.replace(/^#{1,6}\s+/, "");
    changes.push({ from: line.from, to: line.to, insert: prefix + text });
  }

  view.dispatch({ changes, userEvent: "input" });
  return true;
}

export function selectAll(view: EditorView): boolean {
  return cmSelectAll(view);
}

export function deselect(view: EditorView): boolean {
  const head = view.state.selection.main.head;
  view.dispatch({
    selection: EditorSelection.cursor(head),
    userEvent: "select",
  });
  return true;
}

export function cutSelection(view: EditorView): boolean {
  const { from, to } = view.state.selection.main;
  if (from === to) return false;
  const text = view.state.sliceDoc(from, to);
  void navigator.clipboard.writeText(text);
  if (!view.state.readOnly) {
    view.dispatch({
      changes: { from, to, insert: "" },
      userEvent: "delete.cut",
    });
  }
  return true;
}

export function copySelection(view: EditorView): boolean {
  const { from, to } = view.state.selection.main;
  if (from === to) return false;
  void navigator.clipboard.writeText(view.state.sliceDoc(from, to));
  return true;
}

export async function pasteClipboard(view: EditorView): Promise<boolean> {
  if (view.state.readOnly) return false;
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return false;
    view.dispatch(view.state.replaceSelection(text));
    return true;
  } catch {
    return false;
  }
}

/** Plain-text paste (same as pasteClipboard today; separate entry for menu/keymap). */
export async function pastePlainClipboard(view: EditorView): Promise<boolean> {
  return pasteClipboard(view);
}

export function createMarkdownFormatKeymap(): Extension {
  return Prec.high(
    keymap.of([
      { key: "Mod-b", run: toggleBold },
      { key: "Mod-i", run: toggleItalic },
      { key: "Mod-z", run: undo },
      { key: "Mod-Shift-z", run: redo },
      { key: "Mod-y", run: redo },
      { key: "Mod-a", run: selectAll },
      {
        key: "Mod-Shift-v",
        run: (view) => {
          void pastePlainClipboard(view);
          return true;
        },
      },
    ])
  );
}
