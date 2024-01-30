const { https } = require('follow-redirects');
const { readdirSync, existsSync, rmSync, createWriteStream } = require('fs');
const path = require('path');
const request = require('request');

const modList = require('../package.json').launcher.mods;
const modFolder = path.join(process.cwd(), 'assets', 'mods');


Promise.all(Object.keys(modList).map(channel => {
    let fileList = readdirSync(path.join(modFolder, channel)).filter(f => f.endsWith('.jar'));

    return Promise.all(Object.keys(modList[channel]).map(mod => {
        return new Promise(async (resolve) => {
            let url = new URL(`https://api.modrinth.com/v2/project/${modList[channel][mod]}/version`);

            url.searchParams.append('loaders', ['fabric']);
            url.searchParams.append('game_versions', ['1.20.4']);

            request.get(url.toString(), {
                method: 'GET',
                headers: {
                    "User-Agent": `OpenVoxelStudios/OpenVoxelLauncher/v${require('../package.json').version} (contact@openvoxel.studio)`
                }
            }, (error, response, bodyRaw) => {
                let body = JSON.parse(bodyRaw).filter(m => m.game_versions.includes("1.20.4") && m.loaders.includes('fabric'))[0];
                if (!body?.files?.[0]?.url) return resolve(console.log(`❌ Mod ${mod} could not be found on modrinth`));

                let writePath = path.join(modFolder, channel, `${mod}__${body.id}.jar`);

                if (existsSync(writePath)) return resolve(console.log(`⚠️ Mod ${mod} already up to date`));
                rmSync(path.join(modFolder, channel, fileList.filter(f => f.startsWith(mod))[0]));
                let write = createWriteStream(writePath);

                https.get(body.files[0].url, function (response) {
                    response.pipe(write);

                    write.on('finish', async () => resolve([write.close(), console.log(`✅ Mod ${mod} updated`)]))
                })
            })
        })
    }))
}))