import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import type { EditorCursorPosition } from "./editor-canvas";

type StatusBarProps = {
  projectTitle: string | null;
  fileName: string;
  statusMessage?: string;
  cursor: EditorCursorPosition;
};

function isReadyStatus(message: string | undefined): boolean {
  if (!message) return true;
  return (
    message === i18n.t("status.ready", { lng: "fr" }) ||
    message === i18n.t("status.ready", { lng: "en" }) ||
    message === i18n.t("store.ready", { lng: "fr" }) ||
    message === i18n.t("store.ready", { lng: "en" })
  );
}

export function StatusBar({
  projectTitle,
  fileName,
  statusMessage,
  cursor,
}: StatusBarProps) {
  const { t } = useTranslation();
  const message = isReadyStatus(statusMessage)
    ? t("status.ready")
    : statusMessage;

  return (
    <footer
      role="status"
      className="flex h-6 shrink-0 items-center justify-between gap-4 border-t bg-muted/40 px-3 text-xs text-muted-foreground"
    >
      <div className="flex items-center gap-4">
        <span className="truncate font-medium text-foreground">
          {projectTitle ?? t("status.noProject")}
        </span>
        <span className="flex items-center gap-1">
          <CircleCheck className="size-3" aria-hidden="true" />
          {message}
        </span>
      </div>
      <div className="flex items-center gap-4 font-mono">
        <span className="truncate">{fileName || "—"}</span>
        <span>
          {cursor
            ? t("status.lineCol", { line: cursor.line, col: cursor.col })
            : "—"}
        </span>
        <span>UTF-8</span>
        <span>Markdown</span>
      </div>
    </footer>
  );
}
