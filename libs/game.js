const { mkdirSync, createWriteStream, existsSync, readFileSync, rmSync, cpSync, writeFileSync } = require('node:fs');
const path = require('path');
const { https } = require('follow-redirects');
const { root, rootroot, appPath, mcroot } = require('./paths');
const logger = require('./logger');
const fetch = require("node-fetch");
const AdmZip = require('adm-zip');
const { computeHash } = require('./hash');


function downloadGame(url, destination, endname) {
    mkdirSync(destination, { recursive: true });
    let dir = path.join(destination, endname);

    return new Promise(async (resolve) => {
        const file = createWriteStream(dir);
        https.get(url, function (response) {
            response.pipe(file);
            file.on("finish", () => resolve(file.close()));
        });
    });
};

function prepareFullGame(game, canReloop = true) {
    return new Promise(async (resolve) => {
        let selected = JSON.parse(readFileSync(path.join(appPath, `games/${game}.json`)));

        if (!existsSync(path.join(root, 'saves', game)) && !existsSync(path.join(rootroot, 'cache', 'games', game + '.zip'))) {
            logger.log('both', 'Downloading game "' + game + '" from ' + selected.url + '...');
            await downloadGame(selected.url, path.join(rootroot, 'cache', 'games'), game + '.zip');
            logger.log('both', 'Game Downloaded!');
        }
        if (!existsSync(path.join(root, 'saves', game)) && existsSync(path.join(rootroot, 'cache', 'games', game + '.zip'))) {
            let zippath = path.join(rootroot, 'cache', 'games', game + '.zip');

            try {
                logger.log('both', 'Checking sha256 checksum...');
                let hashResult = await computeHash(zippath);

                let getHash = await (await fetch(selected.url + '.sha256')).text();

                if (hashResult == getHash) {
                    // Everything fine, file downloaded sucessfully!
                    logger.log('both', 'Checksum sha256 matched! Launching the game!');

                    logger.log('both', 'Unzipping downloaded game "' + game + '"...')

                    new AdmZip(zippath).extractAllTo(path.join(root, 'saves'), true);

                    return resolve({ success: true });
                } else {
                    // Oh oh this isnt good
                    logger.error('both', 'Checksum sha256 doesn\'t match! Game downloaded unsucessfully or game cache too old.');
                    rmSync(zippath, { force: true });
                    logger.info('both', 'Deleted cached zip game "' + game + '" because not the most recent version of it.');

                    if (canReloop) {
                        logger.info('both', 'Downloading the game normally...');
                        return resolve(await prepareFullGame(game, false));
                    } else {
                        logger.error('both', 'Game not launching because "Can Reloop" is set to false.')
                        return resolve({ success: false, message: `An error occured while downloading the game.\nCheck your connection and try again.\n\nDETAILS: sha256 doesn't match.` });
                    }
                }
            }
            catch (err) {
                logger.error('both', 'Checksum sha256 failed.');
                logger.error('file', err?.stack || err);

                if (existsSync(zippath)) {
                    logger.info('both', 'Deleting cached zip game "' + game + '"...')
                    rmSync(zippath, { force: true });
                }

                return resolve({ success: false, message: `An error occured while downloading the game.\nCheck your connection and try again.\n\nDETAILS: sha256 error occured: ${err}` });
            };
        };

        if (existsSync(path.join(root, 'saves', game))) return resolve({ success: true, message: 'Game already in the saves.' });
        return resolve({ success: true, message: 'It worked?? Why?' });
    });
};


function importSettings(gameInfo) {
    // Check installation
    mkdirSync(path.join(root, 'versions', 'openvoxel'), { recursive: true });
    mkdirSync(path.join(root, 'custom_mods'), { recursive: true });

    cpSync(path.join(appPath, 'assets/mcversion.json'), path.join(root, 'versions', 'openvoxel', 'openvoxel.json'));

    rmSync(path.join(root, 'mods'), { force: true, recursive: true });
    cpSync(path.join(appPath, 'assets', 'mods', 'default'), path.join(root, 'mods'), { recursive: true });
    if (gameInfo?.appendMods) { for (let mP of gameInfo.appendMods) cpSync(path.join(appPath, 'assets', 'mods', mP), path.join(root, 'mods'), { recursive: true }); };

    cpSync(path.join(root, 'custom_mods'), path.join(root, 'mods'), { recursive: true });

    mkdirSync(path.join(root, 'config'), { recursive: true });
    writeFileSync(path.join(root, 'config', 'customwindowtitle-client.toml'), `title = 'OpenVoxel Launcher {mcversion}'\n`, { encoding: 'utf-8' });


    if (!existsSync(path.join(root, 'resourcepacks')) && existsSync(path.join(mcroot, 'resourcepacks'))) {
        logger.log('both', 'Importing ressource packs from Minecraft');
        cpSync(path.join(mcroot, 'resourcepacks'), path.join(root, 'resourcepacks'), { recursive: true, force: true });
    }

    if (!existsSync(path.join(root, 'shaderpacks')) && existsSync(path.join(mcroot, 'shaderpacks'))) {
        logger.log('both', 'Importing ressource packs from Minecraft');
        cpSync(path.join(mcroot, 'shaderpacks'), path.join(root, 'shaderpacks'), { recursive: true, force: true });
    }


    if (!existsSync(path.join(root, 'options.txt')) && existsSync(path.join(mcroot, 'options.txt'))) {
        logger.log('both', 'options.txt doesnt exist yet: copying the Minecraft config');
        cpSync(path.join(mcroot, 'options.txt'), path.join(root, 'options.txt'));
    }

    // Add ressource pack to options
    let getOpts = readFileSync(existsSync(path.join(root, 'options.txt')) ? path.join(root, 'options.txt') : path.join(appPath, 'assets', 'options.txt'), { encoding: 'utf-8' });

    let old = getOpts.split('resourcePacks:')?.[1]?.split('\n')?.[0];

    try {
        let old2 = JSON.parse(old);
        if (!old2.includes('file/OpenVoxel')) {
            old2.push("file/OpenVoxel");
            getOpts = getOpts.replace("resourcePacks:" + old, "resourcePacks:" + JSON.stringify(old2));

            writeFileSync(path.join(root, 'options.txt'), getOpts, { encoding: 'utf-8' });
        };
    } catch (err) {
        logger.error('both', err);

        writeFileSync(path.join(root, 'options.txt'), getOpts + '\nresourcePacks:["vanilla","file/OpenVoxel","fabric"]', { encoding: 'utf-8' });
    };


    if (!existsSync(path.join(root, 'config', 'sodium-options.json')) && existsSync(path.join(mcroot, 'config', 'sodium-options.json'))) {
        logger.log('both', 'sodium-options.json doesnt exist yet: copying the Minecraft config');
        cpSync(path.join(mcroot, 'sodium-options.json'), path.join(root, 'sodium-options.json'));
    }

    let read = {
        "quality": {
            "weather_quality": "DEFAULT",
            "leaves_quality": "DEFAULT",
            "enable_vignette": true
        },
        "advanced": {
            "enable_memory_tracing": false,
            "use_advanced_staging_buffers": true,
            "cpu_render_ahead_limit": 3
        },
        "performance": {
            "chunk_builder_threads": 0,
            "always_defer_chunk_updates_v2": true,
            "animate_only_visible_textures": true,
            "use_entity_culling": true,
            "use_fog_occlusion": true,
            "use_block_face_culling": true,
            "use_no_error_g_l_context": true
        },
        "notifications": {
            "hide_donation_button": true
        }
    };

    if (existsSync(path.join(root, 'config', 'sodium-options.json'))) read = JSON.parse(readFileSync(path.join(root, 'config', 'sodium-options.json'), { encoding: 'utf-8' }));
    read.notifications = {};
    read.notifications.hide_donation_button = true;

    writeFileSync(path.join(root, 'config', 'sodium-options.json'), JSON.stringify(read, null, 4), { encoding: 'utf-8' });


    if (!existsSync(path.join(root, 'servers.dat')) && existsSync(path.join(mcroot, 'servers.dat'))) {
        logger.log('both', 'servers.dat doesnt exist yet: copying the Minecraft config');
        cpSync(path.join(mcroot, 'servers.dat'), path.join(root, 'servers.dat'))
    }
    if (!existsSync(path.join(root, 'servers.dat')) && !existsSync(path.join(mcroot, 'servers.dat'))) {
        logger.log('both', 'servers.dat doesnt exist yet: using default');
        cpSync(path.join(appPath, 'assets', 'servers.dat'), path.join(root, 'servers.dat'))
    }

    // Import texture pack
    if (!existsSync(path.join(root, 'resourcepacks', 'OpenVoxel'))) new AdmZip(path.join(appPath, 'assets', 'OpenVoxelTexturePack.zip')).extractAllTo(path.join(root, 'resourcepacks'), true);
}


module.exports = { downloadGame, prepareFullGame, importSettings };