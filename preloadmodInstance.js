const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('openvoxeladdmod', {
    close: (installList = []) => ipcRenderer.invoke('addmodClose', installList),
    search: async (query) => await ipcRenderer.invoke('addmodSearch', query),
});