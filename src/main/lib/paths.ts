import { app } from "electron";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

export function getAppDataPath(): string {
  return join(app.getPath("documents"), "QADDOE");
}

export function getProjectsPath(): string {
  return join(getAppDataPath(), "projets");
}

export function getCodesPath(): string {
  return join(getAppDataPath(), "codes");
}

export function getDotPath(): string {
  return join(getAppDataPath(), ".qaddoe");
}

export function setupApplicationDirs(): void {
  const appDataPath = getAppDataPath();
  if (!existsSync(appDataPath)) {
    mkdirSync(getProjectsPath(), { recursive: true });
    mkdirSync(getCodesPath(), { recursive: true });
    mkdirSync(getDotPath(), { recursive: true });
    writeFileSync(join(getDotPath(), "config.json"), JSON.stringify({}));
    writeFileSync(join(getDotPath(), "settings.json"), JSON.stringify({}));
  } else {
    if (!existsSync(getProjectsPath())) mkdirSync(getProjectsPath(), { recursive: true });
    if (!existsSync(getCodesPath())) mkdirSync(getCodesPath(), { recursive: true });
    if (!existsSync(getDotPath())) mkdirSync(getDotPath(), { recursive: true });
  }

  const settingsFile = join(getDotPath(), "settings.json");
  if (!existsSync(settingsFile)) {
    writeFileSync(settingsFile, JSON.stringify({}));
  }
  const configFile = join(getDotPath(), "config.json");
  if (!existsSync(configFile)) {
    writeFileSync(configFile, JSON.stringify({}));
  }

  const sessionsDir = join(getDotPath(), "sessions");
  if (!existsSync(sessionsDir)) {
    mkdirSync(sessionsDir, { recursive: true });
  }
}
