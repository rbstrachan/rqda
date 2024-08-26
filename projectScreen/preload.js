const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('projectAPI', {
    newProject: () => {
        ipcRenderer.send('create-new-project');
    }
});