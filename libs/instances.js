const version = require('../package.json').version;
const request = require('request');
const { instancesPath } = require('./paths');
const { readdirSync, existsSync, readFileSync } = require('fs');
const path = require('path');

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
        name: infos.name,
        modcount,
        version: infos.version,
        issnapshot: infos.issnapshot,
        platform: infos.platform,
        icon: existsSync(path.join(instancesPath, id, 'icon.png')) ? `data:image/png;base64,${Buffer.from(readFileSync(path.join(instancesPath, id, 'icon.png'))).toString('base64')}` : '../global/img/default_instance.png',
    }
};

function makeDescription(instanceData) {
    return `${instanceData.issnapshot ? "Snapshot": "Version"} ${instanceData.version} ${instanceData.platform}${instanceData.modcount ? ` - ${instanceData.modcount} Mods` : ""}`;
};

function loadInstances() {
    return readdirSync(instancesPath, { withFileTypes: true, recursive: false })
        .filter(f => f.isDirectory())
        .map(f => parseInstance(f.name))
        .filter(f => f)
        .map(f => {
            return {
                name: f.name,
                description: makeDescription(f),
                icon: f.icon,
            }
        });
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

module.exports = { search, loadInstances, parseInstance, makeDescription };