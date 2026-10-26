import { dialog, shell } from "electron";
import { basename } from "path";
import type { OpenDialogResult, SaveDialogResult } from "../../shared/types";
import { t } from "./i18n";

export async function openFolderDialog(): Promise<OpenDialogResult> {
  return dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
}

export async function openFileDialog(): Promise<OpenDialogResult> {
  return dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: t("native.documentsFilter"), extensions: ["md", "pdf", "docx"] },
    ],
  });
}

export async function saveDialog(arg: {
  defaultPath?: string;
}): Promise<SaveDialogResult> {
  const result = await dialog.showSaveDialog({
    title: t("native.createFileTitle"),
    buttonLabel: t("native.createFileButton"),
    defaultPath: arg.defaultPath,
    filters: [{ name: t("native.markdownFilter"), extensions: ["md"] }],
  });

  let finalFilePath = result.filePath;
  if (result.filePath && !result.filePath.endsWith(".md")) {
    finalFilePath = `${result.filePath}.md`;
  }

  if (!result.canceled && finalFilePath) {
    return {
      filePath: finalFilePath,
      fileName: basename(finalFilePath),
    };
  }
  return null;
}

export function showItemInFolder(filePath: string): void {
  shell.showItemInFolder(filePath);
}

export async function openPath(targetPath: string): Promise<string> {
  return shell.openPath(targetPath);
}
