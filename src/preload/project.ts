import { contextBridge, ipcRenderer } from "electron";

if (!process.contextIsolated) {
  throw new Error("Context isolation must be enabled in the Browser window");
}

try {
  contextBridge.exposeInMainWorld("projectAPI", {
    send: (channel: string, data?: unknown) => {
      ipcRenderer.send(channel, data);
    },
    newProject: (projectName: string) => {
      ipcRenderer.send("create-new-project", projectName);
    },
    getListOfProjects: async () => {
      return await ipcRenderer.invoke("get-list-of-projects");
    },
    getSettings: () => ipcRenderer.invoke("get-settings"),
    getChooserStrings: () => ipcRenderer.invoke("get-chooser-strings"),
  });
} catch (error) {
  console.error("Error establishing project context bridge:", error);
}
