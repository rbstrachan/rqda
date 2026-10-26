import {
  createHash,
} from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { ProjectSession } from "../../shared/types";
import { getDotPath, setupApplicationDirs } from "./paths";

function sessionsDir(): string {
  return join(getDotPath(), "sessions");
}

function sessionKey(projectPath: string): string {
  return createHash("sha256").update(projectPath).digest("hex").slice(0, 16);
}

function sessionPath(projectPath: string): string {
  return join(sessionsDir(), `${sessionKey(projectPath)}.json`);
}

function ensureSessionsDir(): void {
  setupApplicationDirs();
  const dir = sessionsDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function loadProjectSession(
  projectPath: string
): ProjectSession | null {
  ensureSessionsDir();
  const path = sessionPath(projectPath);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as ProjectSession;
    return {
      openPaths: Array.isArray(parsed.openPaths) ? parsed.openPaths : [],
      activePath: parsed.activePath ?? null,
    };
  } catch {
    return null;
  }
}

export function saveProjectSession(
  projectPath: string,
  session: ProjectSession
): void {
  ensureSessionsDir();
  writeFileSync(
    sessionPath(projectPath),
    JSON.stringify(
      {
        openPaths: session.openPaths,
        activePath: session.activePath,
      },
      null,
      2
    )
  );
}
