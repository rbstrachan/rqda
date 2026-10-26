import { electronAPI } from "@electron-toolkit/preload";
import { GetVersionsFn } from "../../shared/types";

export { setupApplicationDirs } from "./paths";
export { registerIpcHandlers } from "./ipc";
export type { WindowRefs } from "./ipc";
export { projectTitleFromPath } from "./projects";
export { loadSettings, saveSettings } from "./settings";
export {
  attachWindowStatePersistence,
  getDefaultWindowSize,
  getMinWindowSize,
  loadWindowBounds,
} from "./window-state";
export { loadProjectSession, saveProjectSession } from "./sessions";

export const getVersions: GetVersionsFn = async () => {
  const versions = electronAPI.process.versions;
  return versions;
};

export const triggerIPC = () => {
  console.log("IPC invoked in console");
};
