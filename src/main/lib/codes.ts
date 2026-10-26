import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getCodesPath } from "./paths";
import type { CodesDocument } from "../../shared/types";

export function saveCodes(projectName: string, codesJSON: CodesDocument): void {
  writeFileSync(
    join(getCodesPath(), `${projectName}.json`),
    JSON.stringify(codesJSON)
  );
}

export function loadCodes(
  projectName: string
): CodesDocument | undefined {
  const filePath = join(getCodesPath(), `${projectName}.json`);
  if (existsSync(filePath)) {
    const data = readFileSync(filePath, "utf-8");
    return JSON.parse(data) as CodesDocument;
  }
  return undefined;
}
