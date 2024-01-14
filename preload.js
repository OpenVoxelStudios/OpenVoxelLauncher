const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('openvoxel', {
    openExternal: shell.openExternal,
    ongamelaunchdetails: (callback) => ipcRenderer.on('gamelaunchdetails', callback),
    defaultSettings: require('./config').defaultConfig,

    onCMANIFStuff: (callback) => ipcRenderer.on('set-CMANIF-mode', (_event, value) => callback(value)),
    getCMANIFStuff: () => ipcRenderer.invoke('get-CMANIF-mode'),

    // Instances stuff
    createInstance: () => ipcRenderer.invoke('createInstance'),
    renameInstance: (id, newName) => ipcRenderer.invoke('renameInstance', id, newName),
    runInstance: (id) => ipcRenderer.invoke('launchgame', id, true),
    oninstancedetails: (channel, callback) => ipcRenderer.addListener(channel, callback),
    removeinstancedetails: (channel) => ipcRenderer.removeAllListeners(channel),

    // Some caching stuff
    cacheNews: async (url, index, toOpen) => await ipcRenderer.invoke('cacheNews', url, index, toOpen),
    
    // Invoke stuff
    setSetting: (setting, newvalue) => ipcRenderer.invoke('setSetting', setting, newvalue),
    logout: () => ipcRenderer.invoke('logout'),
    openLicense: (license) => ipcRenderer.invoke('openlicense', license),
    isGameLaunched: async () => await ipcRenderer.invoke('launcher.isgamelaunched'),
    launcher_gameinfo: async (GAME) => await ipcRenderer.invoke('launcher.gameinfo', GAME),
    closeApp: async () => await ipcRenderer.invoke('closeApp'),
    login: async () => await ipcRenderer.invoke('login'),
    launchgame: async (gamename) => await ipcRenderer.invoke('launchgame', gamename),
    openLogs: () => ipcRenderer.invoke('openLogs'),
    openGameFolder: () => ipcRenderer.invoke('openGameFolder'),
});