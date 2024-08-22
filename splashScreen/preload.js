const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apis', {
    newProject: () => {
        ipcRenderer.send('new-project');
    }
});