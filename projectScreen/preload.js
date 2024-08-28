const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('projectAPI', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    newProject: (projectName) => {
        ipcRenderer.send('create-new-project', projectName);
    },
    getListOfProjects: async () => {
        const projects = await ipcRenderer.invoke('get-list-of-projects');
        return projects;
    }
});