import { readdirSync, statSync, mkdirSync } from "fs";
import { join } from "path";
import { basename } from "path";
import { getProjectsPath } from "./paths";
import type { ProjectInfo } from "../../shared/types";

export function listProjects(): ProjectInfo[] {
  const projectsDir = getProjectsPath();
  try {
    return readdirSync(projectsDir).map((project) => {
      const projectPath = join(projectsDir, project);
      const stats = statSync(projectPath);
      return {
        name: project,
        path: projectPath,
        creationDate: stats.birthtime,
      };
    });
  } catch {
    return [];
  }
}

export function createProject(projectName: string): string {
  const projectPath = join(getProjectsPath(), projectName);
  mkdirSync(join(projectPath, "Documents"), { recursive: true });
  mkdirSync(join(projectPath, "Memos"), { recursive: true });
  mkdirSync(join(projectPath, "Notes"), { recursive: true });
  return projectPath;
}

export function projectTitleFromPath(projectPath: string): string {
  return basename(projectPath);
}
