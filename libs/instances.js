const version = require('../package.json').version;
const request = require('request');
const { instancesPath } = require('./paths');
const { readdirSync, existsSync, readFileSync, mkdirSync, writeFileSync } = require('fs');
const { BrowserWindow, ipcMain, dialog, app } = require('electron');
const sharp = require('sharp');
const path = require('path');
const fetch = require('node-fetch');

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    return {
        type: matches[1],
        data: Buffer.from(matches[2], 'base64')
    };
};


const fetchModrinth = request.defaults({
    method: 'get',
    headers: {
        "User-Agent": `OpenVoxelStudios/OpenVoxelLauncher/${version} (contact@openvoxel.studio)`
    }
});
const modrinth = 'https://api.modrinth.com/v2';


function parseInstance(id) {
    if (!existsSync(path.join(instancesPath, id, 'ovl.json'))) return undefined;

    let modcount = existsSync(path.join(instancesPath, id, 'mods')) ? readdirSync(path.join(instancesPath, id, 'mods')).length : undefined;
    let infos = JSON.parse(readFileSync(path.join(instancesPath, id, 'ovl.json'), { encoding: 'utf-8' }));

    return {
        id: id,
        name: infos.name,
        modcount,
        version: infos.version,
        issnapshot: infos.issnapshot,
        platform: infos.platform,
        icon: existsSync(path.join(instancesPath, id, 'icon.png')) ? `data:image/png;base64,${Buffer.from(readFileSync(path.join(instancesPath, id, 'icon.png'))).toString('base64')}` : '../global/img/default_instance.png',
    }
};

function makeDescription(instanceData) {
    return `${instanceData.issnapshot ? "Snapshot" : "Version"} ${instanceData.version}${instanceData.platform ? ` ${instanceData.platform}${instanceData.modcount ? ` - ${instanceData.modcount} Mods` : ""}` : ''}`;
};

function loadInstances() {
    return readdirSync(instancesPath, { withFileTypes: true, recursive: false })
        .filter(f => f.isDirectory())
        .map(f => parseInstance(f.name))
        .filter(f => f)
        .map(f => {
            return {
                id: f.id,
                name: f.name,
                description: makeDescription(f),
                icon: f.icon,
            }
        });
};

function renameInstance(id, name) {
    let pth = path.join(instancesPath, id, 'ovl.json');

    let json = JSON.parse(readFileSync(pth, { encoding: 'utf-8' }));
    json.name = name;
    writeFileSync(pth, JSON.stringify(json, undefined, 2), { encoding: 'utf-8' });
};


/**
 * @param {String} query
 * @param {String} version
 * @param {"modrinth" | "nothing else"} platform
 * @param {"fabric" | "forge" | undefined} modloader
 * @param {Number} limit
 * @returns {Promise<{
 *   id: String,
 *   name: String,
 *   icon: String,
 *   description: String,
 *   platform: 'modrinth' | 'nothing else',
 * }[]>}
 */
function search(query, version, platform = 'modrinth', modloader = 'fabric', limit) {
    return new Promise(async (resolve) => {
        if (platform == 'modrinth') {
            let url = new URL(`${modrinth}/search`);

            url.searchParams.append('query', query || '');
            url.searchParams.append('limit', limit || 10);

            let facets = [["project_type:mod"], [`versions:${version}`]]
            if (modloader) facets.push([`categories:${modloader}`]);

            url.searchParams.append('facets', JSON.stringify(facets));


            console.log('Hitting /search with params ' + url.toString())
            fetchModrinth(url.toString(), (error, response, body) => {
                if (error) {
                    resolve({ failed: true, error });
                } else {
                    resolve(JSON.parse(body).hits.map(h => {
                        return {
                            id: h.project_id,
                            platform: 'modrinth',
                            name: h.title,
                            icon: h.icon_url,
                            description: h.description.slice(0, 64)
                        }
                    }));
                }
            })
        }

        else {
            resolve({ failed: true, error: 'Invalid platform. Should be "modrinth".' });
        }
    })
};

function createInstanceWindow(parentWin, ejse, devMode) {
    return new Promise(async (resolve) => {
        const win = new BrowserWindow({
            width: 600,
            height: 720,
            fullscreenable: false,
            frame: false,
            maximizable: false,
            resizable: false,
            title: 'Create Instance',
            movable: false,
            titleBarOverlay: true,
            webPreferences: {
                preload: path.join(__dirname, '../preloadInstance.js'),
                nodeIntegration: true,
                contextIsolation: true,
                devTools: devMode || false,
            },
            icon: '../assets/icon.png',
            backgroundColor: '#252525',

            parent: parentWin,
            modal: true,
            show: false
        });

        ipcMain.removeHandler('instanceSetIcon');
        ipcMain.removeHandler('instanceCreate');
        ipcMain.removeHandler('instanceClose');

        win.loadFile('./main/createinstance/index.ejs');

        win.once('ready-to-show', () => {
            win.show();

            if (devMode) win.webContents.openDevTools({ mode: 'detach' });
        });

        ipcMain.handleOnce('instanceClose', () => {
            win.close();
            resolve(true);
        });

        ipcMain.handle('instanceSetIcon', () => {
            return new Promise((resolve) => {
                const result = dialog.showOpenDialogSync({
                    properties: ["openFile"],
                    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
                    title: 'Select Instance Icon'
                })[0];

                if (!result) return resolve(undefined);
                else {
                    sharp(result)
                        .resize(128, 128)
                        .toFormat('png')
                        .toBuffer()
                        .then((buffer) => {
                            resolve(`data:image/png;base64,${buffer.toString('base64')}`);
                        })
                }
            })
        });

        ipcMain.handleOnce('instanceCreate', (_, data) => {
            return new Promise(async (resolve) => {
                let iPath = path.join(instancesPath, data.id);
                mkdirSync(iPath, { recursive: true });
                if (data.modloader) mkdirSync(path.join(iPath, 'mods'));

                let ovl = {
                    name: data.name,
                    version: data.version,
                    issnapshot: data.issnapshot,
                    platform: data.modloader ? `${data.modloader} ${data.modloaderversion}` : undefined
                };

                writeFileSync(path.join(iPath, 'ovl.json'), JSON.stringify(ovl, undefined, 2), { encoding: 'utf-8' });
                if (data.icon.startsWith('data:image')) writeFileSync(path.join(iPath, 'icon.png'), decodeBase64Image(data.icon).data, { encoding: 'utf-8' });

                if (data.modloader == 'Fabric') {
                    mkdirSync(path.join(iPath, 'versions', 'default'), { recursive: true });
                    let got = JSON.stringify(await (await fetch(`https://meta.fabricmc.net/v2/versions/loader/1.20.4/0.15.3/profile/json`)).json(), undefined, 2);
                    writeFileSync(path.join(iPath, 'versions', 'default', 'default.json'), got, { encoding: 'utf-8' });
                }


                resolve(true);
            })
        })
    })
}

module.exports = { search, loadInstances, parseInstance, makeDescription, createInstanceWindow, renameInstance };