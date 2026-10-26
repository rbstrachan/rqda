import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

export type EditorFontFamily = "serif" | "sans" | "mono";

export const EDITOR_FONT_STACKS: Record<EditorFontFamily, string> = {
  serif:
    'Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, "Times New Roman", serif',
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
};

export const DEFAULT_EDITOR_FONT_FAMILY: EditorFontFamily = "serif";
export const DEFAULT_EDITOR_FONT_SIZE = 16;
export const MIN_EDITOR_FONT_SIZE = 12;
export const MAX_EDITOR_FONT_SIZE = 22;

export function clampEditorFontSize(size: number): number {
  if (!Number.isFinite(size)) return DEFAULT_EDITOR_FONT_SIZE;
  return Math.min(
    MAX_EDITOR_FONT_SIZE,
    Math.max(MIN_EDITOR_FONT_SIZE, Math.round(size))
  );
}

export function normalizeEditorFontFamily(
  value: unknown
): EditorFontFamily {
  if (value === "serif" || value === "sans" || value === "mono") return value;
  return DEFAULT_EDITOR_FONT_FAMILY;
}

const accentMix =
  "color-mix(in oklch, var(--app-accent, var(--primary)) 35%, transparent)";

/**
 * App-themed CodeMirror chrome: fonts, gutters, selection, thin scrollbars.
 * Relies on CSS variables from the shell theme / accent.
 */
export function createEditorThemeExtension(options: {
  fontFamily: EditorFontFamily;
  fontSize: number;
}): Extension {
  const fontFamily = EDITOR_FONT_STACKS[options.fontFamily];
  const fontSize = `${clampEditorFontSize(options.fontSize)}px`;

  return EditorView.theme({
    "&": {
      height: "100%",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
    },
    ".cm-scroller": {
      fontFamily,
      fontSize,
      lineHeight: "1.6",
      scrollbarWidth: "thin",
      scrollbarColor:
        "color-mix(in oklch, var(--muted-foreground) 45%, transparent) transparent",
    },
    ".cm-scroller::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    ".cm-scroller::-webkit-scrollbar-button": {
      display: "none",
      width: "0",
      height: "0",
    },
    ".cm-scroller::-webkit-scrollbar-track": {
      background: "transparent",
    },
    ".cm-scroller::-webkit-scrollbar-thumb": {
      borderRadius: "999px",
      background:
        "color-mix(in oklch, var(--muted-foreground) 45%, transparent)",
    },
    ".cm-scroller::-webkit-scrollbar-thumb:hover": {
      background:
        "color-mix(in oklch, var(--muted-foreground) 65%, transparent)",
    },
    ".cm-content": {
      fontFamily,
      fontSize,
      caretColor: "var(--foreground)",
      paddingTop: "8px",
      paddingBottom: "24px",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--foreground)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: accentMix,
      },
    ".cm-activeLine": {
      backgroundColor:
        "color-mix(in oklch, var(--muted) 55%, transparent)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--background)",
      color: "var(--muted-foreground)",
      borderRight: "1px solid var(--border)",
      fontFamily,
      fontSize,
    },
    ".cm-activeLineGutter": {
      backgroundColor:
        "color-mix(in oklch, var(--muted) 55%, transparent)",
      color: "var(--foreground)",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 12px",
      minWidth: "2.5rem",
    },
  });
}
