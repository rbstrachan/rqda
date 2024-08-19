/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer } = require('electron');
// const path = require('path');
// const fs = require('fs');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    openFolderDialog: async () => {
        const { filePaths } = await ipcRenderer.invoke('open-folder-dialog');
        return filePaths[0];
    },
    getDirTree: async (folderPath) => {
        const tree = await ipcRenderer.invoke('get-dir-tree', folderPath);
        return tree;
    }
});