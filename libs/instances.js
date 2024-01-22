const version = require('../package.json').version;
const request = require('request');
const { instancesPath } = require('./paths');
const { readdirSync, existsSync, readFileSync, mkdirSync, writeFileSync, rmSync, createWriteStream } = require('fs');
const { BrowserWindow, ipcMain, dialog, app } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const logger = require('./logger');
const { https } = require('follow-redirects');
const ejse = require('ejs-electron');
const StreamZip = require('node-stream-zip');

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

    let modcount = existsSync(path.join(instancesPath, id, 'mods')) ? readdirSync(path.join(instancesPath, id, 'mods')).filter(m => m.endsWith('.jar')).length : undefined;
    let infos = JSON.parse(readFileSync(path.join(instancesPath, id, 'ovl.json'), { encoding: 'utf-8' }));

    return {
        id: id,
        name: infos.name,
        modcount,
        version: infos.version,
        issnapshot: infos.issnapshot,
        modloader: infos.modloader,
        icon: existsSync(path.join(instancesPath, id, 'icon.png')) ? `data:image/png;base64,${Buffer.from(readFileSync(path.join(instancesPath, id, 'icon.png'))).toString('base64')}` : '../global/img/default_instance.png',
    }
};

function makeDescription(instanceData) {
    return `${instanceData.issnapshot ? "Snapshot" : "Version"} ${instanceData.version}${instanceData.modloader ? ` ${instanceData.modloader}${instanceData.modcount != undefined ? ` - ${instanceData.modcount} Mods` : ""}` : ''}`;
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
                ismodded: (f.modcount != undefined)
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
 * @param {"fabric" | "nothing else"} modloader 
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


            logger.log('both', 'Modrinth Mod Search: ' + url.toString());
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
                            description: h.description
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


/**
 * @param {String} modID 
 * @param {String} instanceID 
 * @param {String} version 
 * @param {"modrinth" | "nothing else"} platform 
 * @param {"fabric" | "nothing else"} modloader 
 */
function downloadMod(modID, instanceID, version, platform = 'modrinth', modloader = 'fabric', ignoreIf = []) {
    return new Promise(async (resolve) => {
        if (ignoreIf.includes(modID)) return resolve([]);

        if (platform == 'modrinth') {
            let url = new URL(`${modrinth}/project/${modID}/version`);

            url.searchParams.append('loaders', [modloader]);
            url.searchParams.append('game_versions', [version]);

            logger.log('both', 'Modrinth Mod Downloading: ' + url.toString());
            fetchModrinth(url.toString(), (error, response, bodyRaw) => {
                if (error) {
                    resolve({ failed: true, error });
                } else {
                    let body = JSON.parse(bodyRaw).filter(m => m.game_versions.includes(version) && m.loaders.includes(modloader))[0];
                    let writePath = path.join(instancesPath, instanceID, 'mods', body.files[0].filename);

                    if (existsSync(writePath)) rmSync(writePath);
                    let write = createWriteStream(writePath);

                    https.get(body.files[0].url, function (response) {
                        response.pipe(write);

                        write.on('finish', async () => {
                            write.close();

                            await Promise.all(body.dependencies.map(dp => {
                                return new Promise(async (resolve) => {
                                    resolve(await downloadMod(dp.project_id, instanceID, version, platform, modloader, ignoreIf))
                                })
                            }))

                            resolve([modID].concat(body.dependencies.map(m => m.project_id)));
                        })
                    })

                }
            })
        }

        else {
            resolve({ failed: true, error: 'Invalid platform. Should be "modrinth".' });
        }
    })
};

function createInstanceWindow(parentWin, devMode) {
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
                })?.[0];

                if (!result) return resolve(undefined);
                else {
                    resolve(`data:image/png;base64,${readFileSync(result).toString('base64')}`);
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
                    modloader: data.modloader ? `${data.modloader} ${data.modloaderversion}` : undefined
                };

                writeFileSync(path.join(iPath, 'ovl.json'), JSON.stringify(ovl, undefined, 2), { encoding: 'utf-8' });
                if (data.icon.startsWith('data:image')) writeFileSync(path.join(iPath, 'icon.png'), decodeBase64Image(data.icon).data, { encoding: 'utf-8' });

                if (data.modloader == 'Fabric') {
                    mkdirSync(path.join(iPath, 'versions', 'default'), { recursive: true });
                    let got = JSON.stringify(await (await fetch(`https://meta.fabricmc.net/v2/versions/loader/${data.version}/${data.modloaderversion}/profile/json`)).json(), undefined, 2);
                    writeFileSync(path.join(iPath, 'versions', 'default', 'default.json'), got, { encoding: 'utf-8' });
                }


                resolve(true);
            })
        })
    })
}

function installModsInstanceWindow(parentWin, id, devMode) {
    return new Promise(async (resolve) => {
        const win = new BrowserWindow({
            width: 800,
            height: 720,
            fullscreenable: false,
            frame: false,
            maximizable: false,
            resizable: false,
            title: 'Install Mods to this Instance',
            movable: false,
            titleBarOverlay: true,
            webPreferences: {
                preload: path.join(__dirname, '../preloadmodInstance.js'),
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

        ipcMain.removeHandler('addmodClose');
        ipcMain.removeHandler('addmodDelete');
        ipcMain.removeHandler('addmodSearch');

        const INSTANCEINFOS = JSON.parse(readFileSync(path.join(instancesPath, id, 'ovl.json'), { encoding: 'utf-8' }));
        let InstalledModsList = [];

        if (INSTANCEINFOS.modloader) {
            for (let mod of readdirSync(path.join(instancesPath, id, 'mods'), { withFileTypes: true }).filter(i => i.isFile() && i.name.endsWith('.jar')).map(f => path.join(f.path, f.name))) {
                try {
                    const zip = new StreamZip.async({ file: mod });
                    let modinfo = JSON.parse((await zip.entryData('fabric.mod.json')).toString('utf-8'));

                    let icon = '../global/img/icons/question-full.png';
                    try {
                        icon = 'data:image/png;base64,' + (await zip.entryData(modinfo.icon)).toString('base64');
                    } catch (err) {
                        logger.error('both', `Failed to parse mod icon "${path.basename(mod)}"`);
                    };

                    await zip.close();

                    InstalledModsList.push({
                        name: modinfo.name,
                        description: modinfo.description,
                        icon: icon,
                        id: path.basename(mod)
                    });
                } catch (err) {
                    logger.error('both', `Failed to parse mod "${path.basename(mod)}"`)
                }
            }
        }

        ejse.data('modList', InstalledModsList);

        win.loadFile('./main/addmodinstance/index.ejs');


        win.once('ready-to-show', () => {
            win.show();

            if (devMode) win.webContents.openDevTools({ mode: 'detach' });
        });

        ipcMain.handle('addmodDelete', (_e, file) => {
            return rmSync(path.join(instancesPath, id, 'mods', file), { force: true });
        })

        ipcMain.handle('addmodSearch', (_e, query) => {
            return search(query, INSTANCEINFOS.version, 'modrinth', 'fabric')
        })

        ipcMain.handleOnce('addmodClose', async (_e, modlist = []) => {
            win.close();
            resolve(true);

            app.emit('set-progress-bar', 0);
            let ignoreIf = [];
            let done = 0;

            for (let modID of modlist) {
                ignoreIf.push(...(await downloadMod(modID, id, INSTANCEINFOS.version, 'modrinth', 'fabric', ignoreIf)));
                app.emit('set-progress-bar', done++ / modlist.length);
                resolve(true)
            };

            app.emit('set-progress-bar', -1);
            app.emit('addmode-refresh');
        });
    })
}

function deleteInstance(win, id) {
    let confirmation = dialog.showMessageBoxSync(win, {
        cancelId: 1,
        defaultId: 1,
        message: 'Are you sure you want to delete this instance?\nThis will delete the entire instance INCLUDING WORLDS, RESOURCE PACKS AND MODS OF THIS INSTANCE.',
        title: 'Delete an Instance',
        type: 'question',
        buttons: ['DELETE', 'Cancel'],
    }) == 0;

    if (confirmation) {
        logger.info('both', `Deleting instance "${id}".`);
        rmSync(path.join(instancesPath, id), { recursive: true, force: true });
    }

    return confirmation;
};

module.exports = { search, loadInstances, parseInstance, makeDescription, createInstanceWindow, renameInstance, deleteInstance, installModsInstanceWindow };