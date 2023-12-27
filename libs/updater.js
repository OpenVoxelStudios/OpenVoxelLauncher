const { dialog, app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const logger = require('./logger');
const { v1Bigger } = require('./util');
const { getLogin } = require('./login');

autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'OpenVoxelLauncher',
    owner: 'OpenVoxelStudios',
    vPrefixedTagName: true,
    private: true,
    releaseType: 'release',
    token: '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',
});

module.exports = () => {
    return new Promise((resolve) => {
        logger.log('both', 'Launching updater...');
        autoUpdater.logger = logger.both;
        autoUpdater.autoInstallOnAppQuit = true;

        app.setAsDefaultProtocolClient('openvoxel');

        app.whenReady().then(async () => {
            var win = new BrowserWindow({
                width: 500,
                height: 528,
                fullscreenable: false,
                frame: true,
                maximizable: false,
                resizable: false,
                title: 'OpenVoxel Launcher Updater',
                movable: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    devTools: false,
                },
                icon: './assets/icon.png',
                backgroundColor: '#252525',
            });

            win.loadFile(`main/updater/index.ejs`);


            win.once('ready-to-show', async () => {
                win.webContents.send('statusUpdate', `Checking for updates...`);
                let update = await autoUpdater.checkForUpdates();

                logger.info('both', 'Got latest update')
                if (update) logger.info('both', update)

                if (update && v1Bigger(update.updateInfo.version, require('./package.json').version)) {
                    win.webContents.send('progressUpdate', 0);
                    win.webContents.send('statusUpdate', `Downloading update...`);
                    await autoUpdater.downloadUpdate();
                    win.webContents.send('statusUpdate', `Update downloaded!`);
                }
                else {
                    if (win) autoUpdater.emit('update-not-available');
                }
            });

            autoUpdater.on('update-not-available', async () => {
                win.webContents.send('statusUpdate', `Logging in...`);

                var PROFILE = await getLogin();
                
                // Some timeout for avoiding being flashbanged by a window opening and instant closing
                setTimeout(() => {
                    win.close();
                    delete win;
                    return resolve(PROFILE);
                }, 250);
            })

            autoUpdater.on('error', (err) => {
                win.setProgressBar(1, { mode: 'error' });
                win.webContents.send('statusUpdate', `Something went wrong...`);
                dialog.showErrorBox('An error occured...', `This shouldn't happend. Check your internet connection, restart the app and try again.\n\nFULL ERROR: ${err}`);
                autoUpdater.emit('update-not-available');
            });

            autoUpdater.on('download-progress', (progressObj) => {
                win.setProgressBar(progressObj.transferred / progressObj.total);
                win.webContents.send('progressUpdate', progressObj.percent);
            });

            autoUpdater.on('update-downloaded', () => {
                win.setProgressBar(5, { mode: 'indeterminate' });
                win.webContents.send('statusUpdate', `Installing update...`);

                autoUpdater.quitAndInstall();
            })
        });
    });
};