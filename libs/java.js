const fetch = require('node-fetch');
const logger = require('./logger');
const os = require('node:os');
const path = require('node:path');
const { JVMPath } = require('./paths');
const { existsSync, mkdirSync, createWriteStream, rmSync, renameSync, rmdirSync, readFileSync, writeFileSync } = require('node:fs');
const { https } = require('follow-redirects');
const { computeHash } = require('./hash');
const targz = require('targz');


/**
 * @param {"java21" | "java16" | "java8"} javaV 
 * @returns {{ sha: String, link: String, filename: String, unzipname: String }}
 */
function getJavaDownload(javaV, arch = os.arch()) {
    let computer = os.platform() == 'darwin' ? 'mac' : 'windows';

    return {
        java17: {
            mac: {
                link: `https://openvoxel.studio/launcher/java/java17/jdk-17_macos-${arch == 'x64' ? 'x64' : 'aarch64'}_bin.tar.gz`,
                filename: `jdk-17_macos-${arch == 'x64' ? 'x64' : 'aarch64'}_bin.tar.gz`,
                unzipname: 'jdk-17.0.10.jdk',
            },
            windows: {
                link: 'https://openvoxel.studio/launcher/java/java17/jdk-17_windows-x64_bin.tar.gz',
                filename: 'jdk-17_windows-x64_bin.tar.gz',
                unzipname: 'jdk-17.0.10',
            },
        },

        java8: {
            mac: {
                link: `https://openvoxel.studio/launcher/java/java8/jre-macosx-x64.tar.gz`,
                filename: `jre-8-macosx-x64.tar.gz`,
                unzipname: 'jre1.8.0_381.jre',
            },
            windows: {
                link: 'https://openvoxel.studio/launcher/java/java8/jre-windows-x64.tar.gz',
                filename: 'jre-8-windows-x64_bin.zip',
                unzipname: 'jre1.8.0_381',
            },
        }
    }[javaV][computer];
};

var MCVERSIONS = null;
async function minecraftToJava(mcversion) {
    let version = MCVERSIONS;

    if (!version) {
        MCVERSIONS = (await (await fetch('https://piston-meta.mojang.com/mc/game/version_manifest.json')).json());
        version = MCVERSIONS;
    }

    version = version.versions.map(v => v.id);
    logger.info('both', 'Fetched MC versions');

    let mcindex = version.indexOf(mcversion);

    if (version.indexOf('1.16.5') <= mcindex) return { version: 'java8', arch: 'x64' }
    else if (version.indexOf('1.20') < mcindex) return { version: 'java17', arch: 'x64' }
    else return { version: 'java17', arch: os.arch().startsWith('arm') ? 'arm64' : 'x64' }
};

function downloadJava(javaFull) {
    let javaV = javaFull.version;

    return new Promise(async (resolve, reject) => {
        logger.info('both', `Downloading ${javaV}`)
        let jpath = path.join(JVMPath, `${javaV}_${javaFull.arch}`);

        let links = getJavaDownload(javaV, javaFull.arch);

        let shouldBeHash = (await (await fetch(links.link + '.sha256')).text());

        if (existsSync(path.join(jpath))) {
            let hasSHA256 = readFileSync(path.join(jpath, 'version.sha256'), { encoding: 'utf-8' });
            if (hasSHA256 == shouldBeHash) return resolve('Java was already installed!');
            else rmSync(jpath, { force: true, recursive: true });
        }

        if (!existsSync(jpath)) mkdirSync(jpath, { recursive: true });

        let zippedPath = path.join(jpath, '../', links.filename);

        if (existsSync(zippedPath)) rmSync(zippedPath, { force: true });

        const file = createWriteStream(zippedPath);

        https.get(links.link, function (response) {
            response.pipe(file);
            file.on("finish", async () => {
                file.close();
                let filePath = file.path;
                let isHash = await computeHash(filePath, 'sha256');

                if (shouldBeHash != isHash) return reject(`The SHA256 is not matching. Please check your connection and try again.\nExpected ${shouldBeHash}, got ${isHash}`);

                let err = await (new Promise(resolve2 => {
                    targz.decompress({
                        dest: jpath,
                        src: file.path
                    }, (err) => resolve2(err));
                }));

                if (err) {
                    logger.error('both', 'Got error while unzipping java: ' + javaV);
                    logger.error('file', err);
                    return reject(err);
                };
                renameSync(path.join(jpath, links.unzipname, 'Contents'), path.join(jpath, 'Contents'));
                rmdirSync(path.join(jpath, links.unzipname));

                rmSync(file.path, { force: true });

                writeFileSync(path.join(jpath, 'version.sha256'), isHash, { encoding: 'utf-8' });

                resolve(`${javaV} got installed!`)
            });
        });
    })
};

function getJavaPath(javaV, arch) {
    return path.join(JVMPath, `${javaV}_${arch}`, os.platform() == 'win32' ? `bin/javaw.exe` : `Contents/Home/bin/java`)
};

module.exports = { minecraftToJava, getJavaDownload, downloadJava, getJavaPath };