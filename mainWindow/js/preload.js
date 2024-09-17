/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer } = require('electron');
const { readFile } = require('original-fs');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    openFolderDialog: async () => {
        const { filePaths } = await ipcRenderer.invoke('open-folder-dialog');
        return filePaths[0];
    },
    getDirTree: async (folderPath) => {
        const tree = await ipcRenderer.invoke('get-dir-tree', folderPath);
        return tree;
    },
    openNewWindow: async () => {
        await ipcRenderer.invoke('open-new-window');
    },
    closeProject: async () => {
        const result = await ipcRenderer.invoke('close-project');
        return result;
    },
    newProject: async () => {
        const result = await ipcRenderer.invoke('new-project');
        return result;
    },
    saveDialog: async (arg) => {
        const result = await ipcRenderer.invoke('save-dialog', arg);
        return result;
    },
    createFile: async (filePath) => {
        await ipcRenderer.invoke('create-file', filePath);
    },
    readFile: async (filePath) => {
        const content = await ipcRenderer.invoke('read-file', filePath);
        return content;
    },
    onWindowFocusChange: (callback) => ipcRenderer.on('window-focus', callback),
    saveCodesJSON: async (projectName, codesJSON) => {
        await ipcRenderer.invoke('save-codes', projectName, codesJSON);
    },
    loadCodesJSON: async (projectName) => {
        const codesJSON = await ipcRenderer.invoke('load-codes', projectName);
        return codesJSON;
    },
});