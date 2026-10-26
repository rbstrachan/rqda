import {
  HighlightStyle,
  syntaxHighlighting,
  syntaxTree,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { RangeSetBuilder, type Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";

const hideMark = Decoration.replace({});

const MARKER_TYPES = new Set([
  "HeaderMark",
  "EmphasisMark",
  "StrongMark",
  "StrikethroughMark",
  "CodeMark",
  "QuoteMark",
  "ListMark",
  "LinkMark",
  "URL",
]);

function buildLivePreviewDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const selection = view.state.selection.main;
  const activeLine = view.state.doc.lineAt(selection.head);

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        if (!MARKER_TYPES.has(node.name)) return;
        // Keep markers visible on the active line and any selected range
        if (node.to > activeLine.from && node.from < activeLine.to) return;
        if (
          !selection.empty &&
          node.to > selection.from &&
          node.from < selection.to
        ) {
          return;
        }
        if (node.from >= node.to) return;
        builder.add(node.from, node.to, hideMark);
      },
    });
  }

  return builder.finish();
}

const livePreviewHighlight = HighlightStyle.define([
  { tag: t.heading1, fontWeight: "700", fontSize: "1.5em" },
  { tag: t.heading2, fontWeight: "700", fontSize: "1.3em" },
  { tag: t.heading3, fontWeight: "700", fontSize: "1.15em" },
  { tag: t.heading4, fontWeight: "700" },
  { tag: t.strong, fontWeight: "700" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  {
    tag: t.monospace,
    fontFamily: "var(--font-mono)",
    fontSize: "0.92em",
  },
]);

function createLivePreviewPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildLivePreviewDecorations(view);
      }

      update(update: ViewUpdate): void {
        if (
          update.docChanged ||
          update.selectionSet ||
          update.viewportChanged
        ) {
          this.decorations = buildLivePreviewDecorations(update.view);
        }
      }
    },
    { decorations: (v) => v.decorations }
  );
}

export function createLivePreviewExtension(enabled: boolean): Extension[] {
  if (!enabled) return [];
  return [
    syntaxHighlighting(livePreviewHighlight),
    createLivePreviewPlugin(),
  ];
}
