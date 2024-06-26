const logger = require("./logger");
const path = require('path');
const { Menu, app, shell, BrowserWindow } = require('electron');
const { appPath, OVOPTIONS } = require("./paths");
const RPC = require("./rpc");
const { existsSync } = require("fs");
const os = require('node:os');

/**
 * @param {BrowserWindow} win 
 */
function protocol(win, url, PROFILE) {
    let params = url.split('://')?.[1]?.split('/').filter(o => o.replace(/ /g, '') != '');

    logger.log('both', 'Opening app requested by browser. Params = ://' + params)
    if (win.isMinimized()) win.restore()
    win.focus()

    if (params.length > 0) {
        if (params[0] == 'game' && params[1]) {
            if (existsSync(path.join(appPath, 'games', params[1] + '.json'))) {
                win.loadFile('./main/home/index.ejs', { query: { game: params[1] } });
            };
        }

        else if (params[0]) {
            if (PROFILE && ['home', 'games', 'infos', 'settings'].includes(params[0])) win.loadFile('./main/' + encodeURI(params[0]) + '/index.ejs')
            else if (params[0] == 'login') win.loadFile('./main/login/index.ejs');
        }
    }
};

/**
 * @param {BrowserWindow} win 
 * @param {Boolean} full
 */
function setAppMenu(win, full = true) {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: 'OpenVoxel Launcher',
            submenu: [
                {
                    label: 'About OpenVoxel',
                    click() {
                        shell.openExternal('https://openvoxel.studio/')
                    },
                },
                { type: 'separator' },
                {
                    label: 'Hide',
                    accelerator: 'CmdOrCtrl+H',
                    click() { app.hide() },
                },
                {
                    type: 'checkbox',
                    checked: false,
                    label: 'CMANIF mode',
                    click() { app.emit('toggle-CMANIF-mode') },
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click() { app.emit('force-leave') },
                },
            ],
            commandId: 0,
        }].concat(full ? [{
            label: 'Pages',
            submenu: [
                {
                    label: 'Home',
                    click() { win.show(); win.loadFile('main/home/index.ejs') }
                },
                {
                    label: 'Games',
                    click() { win.show(); win.loadFile('main/games/index.ejs') }
                },
                {
                    label: 'Infos',
                    click() { win.show(); win.loadFile('main/infos/index.ejs') }
                },
                {
                    label: 'Settings',
                    click() { win.show(); win.loadFile('main/settings/index.ejs') }
                },
            ],
            commandId: 1,
        },
        {
            label: 'Games',
            submenu: [
                {
                    label: 'Vanilla',
                    click() { win.show(); win.loadFile('main/home/index.ejs') }
                },
                {
                    label: 'Oak House Murder',
                    click() { win.show(); win.loadFile('main/home/index.ejs', { query: { game: 'oak-house-murder' }})}
                },
                /*{
                    label: 'Block Hunt',
                    click() { win.show(); win.loadFile('main/home/index.ejs', { query: { game: 'block-hunt' }}) }
                },*/
                {
                    label: 'Lethal Budget',
                    click() { win.show(); win.loadFile('main/home/index.ejs', { query: { game: 'lethal-budget' }}) }
                },
                {
                    label: 'Yahiamice',
                    click() { win.show(); win.loadFile('main/home/index.ejs', { query: { game: 'yahiamice' }}) }
                },
            ],
            commandId: 2,
        }] : [])
    ));
};

var quitting = false;
/**
 * @param {BrowserWindow} win 
 */
async function quit(win) {
    if (quitting) return;
    quitting = true;
    logger.log('both', 'Closing everything...')
    try {
        await win.webContents.executeJavaScript("localStorage.removeItem('skin3D-moved');");
    } catch { };
    try {
        await win.webContents.executeJavaScript("localStorage.removeItem('lastpage');");
    } catch { };
    if (OVOPTIONS?.drpc) {
        logger.log('both', 'Stopping Discord RPC');
        await RPC.stop();
    };
    app.quit();
    process.exit(0);
};

var LicenseWindow = undefined;
function openLicense(license) {
    if (LicenseWindow && LicenseWindow?.isClosable()) LicenseWindow.close();

    if (!license) return;

    LicenseWindow = new BrowserWindow({
        width: 600,
        height: 720,
        fullscreenable: false,
        frame: true,
        maximizable: true,
        resizable: true,
        title: 'OpenVoxel Launcher',
        movable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: false,
        },
        icon: './assets/icon.png',
        backgroundColor: '#FFFFFF',
        hasShadow: true,
    });

    LicenseWindow.loadFile(path.join(appPath, 'assets/license/', license + '.html'));

    LicenseWindow.on('close', () => LicenseWindow = undefined);
    LicenseWindow.on('closed', () => LicenseWindow = undefined);
};

const computer = os.platform() == 'darwin' ? 'mac' : (os.platform() == 'win32' ? 'win' : 'linux');

module.exports = { protocol, setAppMenu, quit, openLicense, computer };