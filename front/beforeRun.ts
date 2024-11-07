import { existsSync, mkdirSync, rmSync } from 'fs';
import { CreatorDetailList } from './data.ts';
import { resolve } from 'path';
import sharp from 'sharp';
import chalk from 'chalk';

let headUpdateTimer = `${chalk.green(Object.keys(CreatorDetailList).length)} heads updated.`;
console.time(headUpdateTimer);
process.stdout.write(`[🗿] Updating heads...`);

async function updateHeads() {
    const headsFolder = resolve(__dirname, 'src', 'assets', 'heads');
    mkdirSync(headsFolder, { recursive: true });
    await Promise.all(Object.values(CreatorDetailList).map((v) => {
        return new Promise(async (prResolve) => {
            let outName = resolve(headsFolder, `${v.minecraft}.png`);
            if (existsSync(outName)) rmSync(outName);
            let first = await (await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${v.minecraft}`)).json();
            let second = JSON.parse(atob(first.properties.find(v => v.name == "textures").value));

            let imageurl = await (await fetch(second.textures.SKIN.url)).arrayBuffer();

            sharp(imageurl)
                .extract({ left: 8, top: 8, width: 8, height: 8 })
                .composite([{
                    input: await sharp(imageurl).extract({ left: 40, top: 8, width: 8, height: 8 }).toBuffer()
                }])
                .toFile(outName, function (err) {
                    if (err) console.error(`\nError while getting "${v.minecraft}"'s head`, err, "\n\n");
                    prResolve(true);
                })
        })
    }));
}

await updateHeads();
process.stdout.write('\r');
console.timeEnd(headUpdateTimer);