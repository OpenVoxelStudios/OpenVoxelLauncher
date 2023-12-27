const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const { Client } = require("./packages/minecraft-launcher-core/index");
const launcher = new Client();
const path = require('node:path');
const { mkdirSync, readFileSync, writeFileSync, existsSync } = require('node:fs');
const RPC = require('./libs/rpc.js');
const { defaultConfig } = require('./config.js');
const { parseNBT, writeNBT } = require('./libs/nbt.js');
const { prepareFullGame, importSettings } = require('./libs/game.js');
const logger = require('./libs/logger.js');
const { root, appPath, OVOPTIONS_origin, rootroot } = require('./libs/paths.js');
const { fromXboxManagerToSaveLogin, authManager, deleteLogin } = require('./libs/login.js');
const { protocol, setAppMenu, quit, openLicense } = require('./libs/launcher.js');
const ejse = require('ejs-electron');
const { spawn } = require('node:child_process');
const fetch = require('node-fetch');

var OVOPTIONS = OVOPTIONS_origin;

function editOptions(setting, newvalue) {
    let ovopt = OVOPTIONS;
    ovopt[setting] = newvalue;

    let OVOPTIONSPATH = path.join(rootroot, 'options.txt');
    if (!existsSync(OVOPTIONSPATH)) mkdirSync(rootroot, { recursive: true });

    writeFileSync(OVOPTIONSPATH, JSON.stringify(Object.assign(defaultConfig, ovopt), undefined, 2), { encoding: 'utf-8' });

    ejse.data('options', ovopt);
    return ovopt;
}

async function OpenVoxelLauncher(PROFILE) {
    var gameLaunched = { is: false };

    if (PROFILE?.username) {
        ejse.data('playerName', PROFILE?.username);
        ejse.data('playerSkin', `https://visage.surgeplay.com/bust/320/${PROFILE?.token?.uuid || PROFILE?.username}`);
    }
    ejse.data('version', 'v' + require('./package.json').version || 'v0.0.0');
    ejse.data('options', OVOPTIONS);
    ejse.data('defaultSettings', defaultConfig);

    logger.log('both', 'Creating Window...');
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        fullscreenable: false,
        frame: false,
        maximizable: false,
        resizable: false,
        title: 'OpenVoxel Launcher',
        movable: true,
        titleBarOverlay: true,
        titleBarStyle: 'customButtonsOnHover',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
            // devTools: false,
        },
        icon: './assets/icon.png',
        backgroundColor: '#252525',
        disableAutoHideCursor: true,
        hasShadow: true,
    });

    // Caching assets yay
    let assetCachingPath = path.join(rootroot, 'cache', 'assets');
    mkdirSync(assetCachingPath, { recursive: true });

    app.on('open-url', (event, url) => { protocol(win, url, PROFILE) });
    app.on('second-instance', (event, commandLine, workingDirectory) => { protocol(win, commandLine.pop(), PROFILE) });

    logger.log('both', 'Creating app menu...');
    setAppMenu(win);

    if (PROFILE === false) win.loadFile('./main/login/index.ejs')
    else win.loadFile('./main/home/index.ejs');

    // win.webContents.openDevTools({ mode: 'detach' });

    if (OVOPTIONS?.drpc) {
        logger.log('both', '[DRPC] Logging in to Discord RPC');
        RPC.login().then(async () => {
            logger.log('both', '[DRPC] Discord RPC Started');
            if (PROFILE?.username) {
                await RPC.updatePlayer(PROFILE.username);
                logger.log('both', '[DRPC] Player name was set to ' + PROFILE.username);
            };
        })
    };

    win.webContents.on("before-input-event", (event, input) => {
        let cntrl = input.control || input.meta;

        if (cntrl && input.key == 'h') { app.hide() }
        else if (cntrl && input.key == 'q') { app.emit('force-leave') }
        else if (cntrl && ['c', 'v', 'x'].includes(input.key)) { }

        // Disable everything starting with control/cmd like control+?
        else if (cntrl) return event.preventDefault();
    });

    let CMANIFMode = false;
    app.on('toggle-CMANIF-mode', () => {
        CMANIFMode = !CMANIFMode;
        win.webContents.send('set-CMANIF-mode', CMANIFMode);
    })
    ipcMain.handle('get-CMANIF-mode', () => CMANIFMode);

    ipcMain.handle('cacheNews', (_, url, index, toOpen) => {
        return new Promise(async (resolve) => {
            let thatPath = path.join(assetCachingPath, `news${index}.json`);
            let read = existsSync(thatPath) ? JSON.parse(readFileSync(thatPath, { encoding: 'utf-8' })) : undefined;

            // Maybe check other files? (TODO)

            if (!read || read?.version != 1 || read?.url != url || read?.lastUpdate + 60 * 60 * 1000 < Date.now()) {
                let response = await fetch(url);
                let base64Data = `data:${response.headers.get('content-type')};base64,${(await response.buffer()).toString('base64')}`;
                resolve(base64Data);

                writeFileSync(thatPath, JSON.stringify({
                    url,
                    toOpen,
                    lastUpdate: Date.now(),
                    version: 1,
                }), { encoding: 'utf-8' });

                writeFileSync(thatPath + '.image', base64Data, { encoding: 'utf-8' });
            }

            else resolve(readFileSync(thatPath + '.image', { encoding: 'utf-8' }));
        })
    })

    app.on('window-all-closed', () => quit(win));
    app.on('before-quit', () => quit(win));
    app.on('force-leave', () => quit(win));
    app.on('set-progress-bar', (value) => win.setProgressBar(value))
    app.on('remove-progress-bar', () => win.setProgressBar(-1))
    app.on('send-to-window', (channel, ...args) => win.webContents.send(channel, ...args));
    app.on('focus', () => win.show())
    app.on('run-if-notfocused', (func) => { if (!win.isFocused()) func() });
    app.on('goto-view', (view) => {
        logger.log('both', `Going to view "${view}"`)
        win.loadFile(`./main/${view}/index.ejs`)
    });

    ipcMain.handle('openLogs', () => { spawn('open', [logger.file]) });
    ipcMain.handle('openGameFolder', () => { spawn('open', [root]) });

    ipcMain.handle('closeApp', () => app.emit('force-leave'));

    ipcMain.handle('login', () => {
        logger.log('both', 'Received Login signal. Opening auth window');
        return new Promise((resolve) => {
            authManager.launch("electron", { resizable: true, width: 500, height: 750 }).then(async xboxManager => {
                PROFILE = await fromXboxManagerToSaveLogin(xboxManager);
                ejse.data('playerName', PROFILE?.username);
                ejse.data('playerSkin', `https://visage.surgeplay.com/bust/320/${PROFILE?.username}`);
                resolve(true);
            })
                .catch((err) => {
                    logger.error('both', `[OVL] Error while logging in...`);
                    logger.error('file', err?.stack || err);
                    resolve(false);
                })
        });
    });

    ipcMain.handle('logout', () => {
        logger.log('both', 'Received Logout signal');
        deleteLogin(PROFILE);
        app.emit('goto-view', 'login');
        return true;
    });

    ipcMain.handle('setSetting', (_event, setting, newvalue) => {
        // VALIDATE
        if (["fullscreen", "drpc", "closeOnLaunch"].includes(setting)) {
            if (typeof newvalue != "boolean") return "This setting should be a boolean value!";
        }
        else if (["minRam", "maxRam", "height", "width"].includes(setting)) {
            if (typeof newvalue != "number") return "This setting should be a number!"
        }
        else return "This setting could not be found!";


        logger.log('both', 'Changing settings "' + setting + '" to value "' + newvalue + '"...');

        OVOPTIONS = editOptions(setting, newvalue);
        if (setting == 'drpc' && newvalue == false) RPC.stop();

        return true;
    });

    ipcMain.handle('profile.username', () => PROFILE?.username);

    ipcMain.handle('launcher.gameinfo', (_event, id) => JSON.parse(readFileSync(path.join(appPath, `games/${id}.json`))).name || 'Minecraft');
    ipcMain.handle('launcher.isgamelaunched', () => gameLaunched);
    ipcMain.handle('openlicense', (_event, license) => openLicense(license));

    ipcMain.handle('launchgame', (_event, game) => {
        logger.log('both', 'Received Launchgame signal. Starting Minecraft with game "' + (game || "no game selected") + '"');
        let gameInfo = (game) ? JSON.parse(readFileSync(path.join(appPath, 'games', game + '.json'))) : {};
        return new Promise(async (gameExit) => {
            let started = Date.now();
            if (!PROFILE.token) return gameExit('You are not logged in!');

            gameLaunched = { is: true, game: game };
            app.emit('send-to-window', 'gamelaunchdetails', 'Checking installation...');

            importSettings(gameInfo);

            // Adding our server at the top
            let ourServer = { ip: { type: 'string', value: 'mc.openvoxel.studio' }, name: { type: 'string', value: '⭐ §6OpenVoxel Studios§r' }, acceptTextures: { type: 'byte', value: 1 }, icon: { type: 'string', value: readFileSync(path.join(appPath, 'assets/servericon.txt'), { encoding: 'utf-8' }) } };
            let dat = await parseNBT(path.join(root, 'servers.dat'));
            let values = dat.value.servers.value.value;

            if (values[0] != ourServer) {
                if (values[0].ip.value == ourServer.ip.value) values.shift();
                values.unshift(ourServer);
                dat.value.servers.value.value = values;
                writeNBT(dat, path.join(root, 'servers.dat'));
            };

            if (game && game != 'vanilla') {
                app.emit('send-to-window', 'gamelaunchdetails', 'Downloading the Game...');
                await prepareFullGame(game)
            };

            app.emit('send-to-window', 'gamelaunchdetails', 'Starting Minecraft...');
            logger.log('both', "Everything ready, starting the game!");

            launcher.on('debug', (e) => logger.log('file', e));
            launcher.on('data', (e) => logger.log('file', e));
            launcher.on('close', (code, err) => {
                gameLaunched = { is: false };
                app.emit('send-to-window', 'gamelaunchdetails', 'Click to play!');

                if (err) {
                    gameExit(err);
                    logger.log('both', `Error occured while launching Minecraft. ${err}`)
                } else gameExit(true);
                logger.log('both', "Minecraft closed!");
                app.emit('focus');
            });


            launcher.prepare({
                clientPackage: null,
                authorization: PROFILE.token,
                root: root,
                version: {
                    number: "1.20.4",
                    type: "release",
                    custom: 'openvoxel'
                },
                quickPlay: (game && game != 'vanilla') ? {
                    type: 'singleplayer',
                    identifier: game
                } : undefined,
                memory: {
                    min: ((OVOPTIONS?.minRam !== undefined) ? OVOPTIONS?.minRam : defaultConfig.minRam) + "M",
                    max: ((OVOPTIONS?.maxRam !== undefined) ? OVOPTIONS?.maxRam : defaultConfig.maxRam) + "M"
                },
                window: {
                    width: (OVOPTIONS?.width !== undefined) ? OVOPTIONS?.width : defaultConfig.width,
                    height: (OVOPTIONS?.height !== undefined) ? OVOPTIONS?.height : defaultConfig.height,
                    fullscreen: (OVOPTIONS?.fullscreen !== undefined) ? OVOPTIONS?.fullscreen : defaultConfig.fullscreen,
                },
            });

            launcher.handler.client.on('progress', (data) => {
                if (data?.type == 'assets') {
                    /* data = {
                        type: 'assets',
                        task: number,
                        total: max number
                    } */
                    app.emit('send-to-window', 'gamelaunchdetails', `Downloading ${Math.floor(data.task / data.total * 1000) / 10}%`);
                    app.emit('set-progress-bar', data.task / data.total);
                }
            });

            await launcher.launch()
            app.emit('remove-progress-bar');
            app.emit('send-to-window', 'gamelaunchdetails', 'Game Launched!');

            app.emit('run-if-notfocused', () => {

                if (Date.now() - started > 60 * 1000) new Notification({
                    title: 'Game Downloaded',
                    body: 'The game was downloaded successfully. Minecraft is opening...',
                }).show();
            });

            if (OVOPTIONS['closeOnLaunch']) app.hide();
        });
    });
};

require('./libs/updater.js')().then((PROFILE) => OpenVoxelLauncher(PROFILE));

process.on('uncaughtException', (err, origin) => {
    logger.error('both', err?.stack || err);
    logger.error('both', origin);
});
process.on('unhandledRejection', (err) => {
    logger.error('both', err?.stack || err);
});