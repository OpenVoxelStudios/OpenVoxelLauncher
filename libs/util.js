const { app } = require('electron');
const { writeFileSync } = require('fs');
const fetch = require('node-fetch');

function v1Bigger(v1, v2) {
    let v1parts = v1.split('.').map(Number),
        v2parts = v2.split('.').map(Number);

    for (let i = 0; i < v1parts.length; i++) {
        if (v2parts.length == i) return true;

        if (v1parts[i] == v2parts[i]) continue
        else if (v1parts[i] > v2parts[i]) return true
        else return false
    }

    if (v1parts.length != v2parts.length) return false;
    return false;
};

/**
 * Downloads an image and save it as a base64 image at the destination path
 * @param {String} url The URL of the image
 * @param {String} destination The PATH of the destination (with the file name at the end)
 * @returns base64 data of that image
 */
function downloadImage(url, destination) {
    return new Promise(async (resolve) => {
        let response = await fetch(url, {
            headers: {
                "User-Agent": `OpenVoxelLauncher/v${app.getVersion()} (+https://openvoxel.studio/; <contact@openvoxel.studio>)`
            }
        });

        let base64Data = `data:${response.headers.get('content-type')};base64,${(await response.buffer()).toString('base64')}`;

        writeFileSync(destination, base64Data, { encoding: 'utf-8' });
        resolve(base64Data);
    })
};

module.exports = { v1Bigger, downloadImage };