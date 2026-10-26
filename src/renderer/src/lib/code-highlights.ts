import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  type DecorationSet,
} from "@codemirror/view";
import type { CodesDocument } from "@shared/types";
import { cm5PosToOffset, excerptsWithCodeForFile } from "./coding";

function highlightMarkForColor(color: string | null) {
  const bg =
    color != null && color !== ""
      ? `color-mix(in oklch, ${color} 32%, transparent)`
      : "color-mix(in oklch, var(--app-accent, var(--primary)) 28%, transparent)";
  return Decoration.mark({
    attributes: {
      style: `background-color: ${bg}`,
      class: "cm-code-highlight",
    },
  });
}

export function buildCodeDecorations(
  view: EditorView,
  codes: CodesDocument,
  filePath: string | null
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  if (!filePath) {
    return Decoration.none;
  }

  const excerpts = excerptsWithCodeForFile(codes, filePath);
  const ranges = excerpts
    .map((excerpt) => {
      const from = cm5PosToOffset(view.state.doc, excerpt.start);
      const to = cm5PosToOffset(view.state.doc, excerpt.end);
      return from <= to
        ? { from, to, color: excerpt.codeColor }
        : { from: to, to: from, color: excerpt.codeColor };
    })
    .sort((a, b) => a.from - b.from || a.to - b.to);

  for (const range of ranges) {
    if (range.from === range.to) continue;
    builder.add(range.from, range.to, highlightMarkForColor(range.color));
  }
  return builder.finish();
}

export const codeHighlightTheme = EditorView.baseTheme({
  ".cm-code-highlight": {
    borderRadius: "2px",
  },
});
