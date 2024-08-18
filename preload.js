/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

// I have no idea what this does but it works...
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileOrFolder: async (isFolder) => {
        const filePaths = await ipcRenderer.invoke('dialog:openFileOrFolder', isFolder);
        return filePaths;
    },
    getFilesInDirectory: (dirPath) => {
        const fileNames = fs.readdirSync(dirPath).map(fileName => {
            const fullPath = path.join(dirPath, fileName);
            return {
                name: fileName,
                path: fullPath,
                isDirectory: fs.lstatSync(fullPath).isDirectory()
            };
        });
        return fileNames;
    }
});

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
});