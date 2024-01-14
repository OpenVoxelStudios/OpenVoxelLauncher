const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('openvoxelinstance', {
    close: () => ipcRenderer.invoke('instanceClose'),
    setIcon: async () => await ipcRenderer.invoke('instanceSetIcon'),
    create: async (data) => await ipcRenderer.invoke('instanceCreate', data),
    forceRefresh: async () => await ipcRenderer.invoke('forceReloadInstances'),
});