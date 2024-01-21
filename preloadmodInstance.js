const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('openvoxeladdmod', {
    deleteMod: (mod) => ipcRenderer.invoke('addmodDelete', mod),
    close: (installList = []) => ipcRenderer.invoke('addmodClose', installList),
    search: async (query) => await ipcRenderer.invoke('addmodSearch', query),
});