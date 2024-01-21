const { dialog, app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const logger = require('./logger');
const { v1Bigger } = require('./util');
const { getLogin } = require('./login');
const { setAppMenu, protocol } = require('./launcher');
const { OVOPTIONS_origin, appPath, OVOPTIONSPATH } = require('./paths');
const path = require('path');
const { defaultConfig } = require('../config');
const { writeFileSync } = require('node:fs');

autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'OpenVoxelLauncher',
    owner: 'OpenVoxelStudios',
    vPrefixedTagName: true,
    private: false,
    releaseType: 'release',
});

module.exports = () => {
    logger.info('both', 'Starting with version v' + app.getVersion());

    function handleProtocol(url) {
        app.removeAllListeners('protocol-apploaded');
        app.addListener('protocol-apploaded', (win, PROFILE) => {
            app.removeAllListeners('protocol-apploaded');
            protocol(win, url, PROFILE);
        });
    };

    app.on('open-url', (event, url) => { handleProtocol(url) });
    app.on('second-instance', (event, commandLine, workingDirectory) => { handleProtocol(commandLine.pop()) });
    logger.info('both', 'Started protocols handlers');

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

            setAppMenu(win, false);

            if (OVOPTIONS_origin?.tos !== true) {
                let answ = dialog.showMessageBoxSync(win, {
                    title: 'Terms of Service',
                    message: 'Welcome To OpenVoxel Launcher! Please agree to our Terms of Service in order to continue.\n\nYou can find our ToS here: https://launcher.openvoxel.studio/stuff/terms-of-service',
                    type: 'question',
                    buttons: ['Don\'t Agree (close the launcher)', 'Agree'],
                    cancelId: 0,
                    defaultId: 0,
                    icon: path.join(appPath, 'icons', 'icon.png')
                });

                if (answ == 0) {
                    logger.error('both', 'ToS not agreed, closing the Launcher');
                    app.quit();
                    process.exit(0);
                    return;
                }
                else {
                    logger.info('both', 'ToS agreed! Opening the Launcher');
                    OVOPTIONS_origin.tos = true;
                    writeFileSync(OVOPTIONSPATH, JSON.stringify(Object.assign(defaultConfig, OVOPTIONS_origin), undefined, 2), { encoding: 'utf-8' });
                }
            }


            win.once('ready-to-show', async () => {
                win.webContents.send('statusUpdate', `Checking for updates...`);
                let update = await autoUpdater.checkForUpdates();

                logger.info('both', 'Got latest update')
                if (update) logger.info('both', update)

                if (update && v1Bigger(update.updateInfo.version, app.getVersion())) {
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
                dialog.showErrorBox('An error occured...', `The app will still try to launch. If this error still occur, please report the potential bug.\n\nFULL ERROR: ${err}`);
                win.setProgressBar(-1, { mode: 'none' });
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