const fetch = require('node-fetch');
const logger = require('./logger');
const os = require('node:os');
const path = require('node:path');
const { JVMPath } = require('./paths');
const { existsSync, mkdirSync, createWriteStream, rmSync, renameSync, rmdirSync } = require('node:fs');
const { https } = require('follow-redirects');
const { computeHash } = require('./hash');
const targz = require('targz');
const AdmZip = require('adm-zip');


/**
 * @param {"java21" | "java16" | "java8"} javaV 
 * @returns {{ sha: String, link: String, filename: String, unzipname: String }}
 */
function getJavaDownload(javaV) {
    let computer = os.platform() == 'darwin' ? 'mac' : 'windows';

    return {
        java17: {
            mac: {
                sha: `https://download.oracle.com/java/17/latest/jdk-17_macos-${os.arch() == 'x64' ? 'x64' : 'aarch64'}_bin.tar.gz.sha256`,
                link: `https://download.oracle.com/java/17/latest/jdk-17_macos-${os.arch() == 'x64' ? 'x64' : 'aarch64'}_bin.tar.gz`,
                filename: `jdk-17_macos-${os.arch() == 'x64' ? 'x64' : 'aarch64'}_bin.tar.gz`,
                unzipname: 'jdk-17.0.9.jdk',
            },
            windows: {
                sha: 'https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.zip.sha256',
                link: 'https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.zip',
                filename: 'jdk-17_windows-x64_bin.zip',
                unzipname: 'jdk-17.0.9',
            },
        },

        java8: {
            mac: {
                sha: os.arch() == 'x64' ? '0bd01a0c11c98761153fc6dceac7725cea5607e7ff3565edfcad6f427cb9b76c' : 'ab495525c4923400e984cf405ccfe0aec02f96d3dfa869bca259030e5a9627be',
                link: `https://openvoxel.studio/launcher/java/java8/${os.arch() == 'x64' ? 'jre-macosx-x64' : 'jdk-macosx-aarch64'}.tar.gz`,
                filename: `${os.arch() ? 'jre' : 'jdk'}-8-macosx-${os.arch() == 'x64' ? 'x64' : 'aarch64'}.tar.gz`,
                unzipname: os.arch() == 'x64' ? 'jre1.8.0_381.jre' : 'jdk1.8.0_381.jdk',
            },
            windows: {
                sha: '09737832ce72298716d7d08425e4414517aea09302aba09a356506db1c78a2bc',
                link: 'https://openvoxel.studio/launcher/java/java8/jre-windows-x64.tar.gz',
                filename: 'jre-8-windows-x64_bin.zip',
                unzipname: 'jre1.8.0_381',
            },
        }
    }[javaV][computer];
};

async function minecraftToJava(mcversion) {
    let version = (await (await fetch('https://piston-meta.mojang.com/mc/game/version_manifest.json')).json()).versions.map(v => v.id);
    logger.info('both', 'Fetched MC versions');

    let mcindex = version.indexOf(mcversion);

    if (version.indexOf('1.16.5') <= mcindex) return 'java8'
    else if (version.indexOf('1.19-pre1') < mcindex) return 'java8'
    else return 'java17';
};

function downloadJava(javaV) {
    return new Promise(async (resolve, reject) => {
        logger.info('both', `Downloading ${javaV}`)
        let jpath = path.join(JVMPath, javaV);
        if (existsSync(getJavaPath(javaV))) return resolve('Already exists!');
        mkdirSync(jpath, { recursive: true });

        let links = getJavaDownload(javaV);

        let zippedPath = path.join(jpath, '../', links.filename);

        if (existsSync(zippedPath)) rmSync(zippedPath, { force: true });

        const file = createWriteStream(zippedPath);

        https.get(links.link, function (response) {
            response.pipe(file);
            file.on("finish", async () => {
                file.close();
                let filePath = file.path;
                let shouldBeHash = links.sha.startsWith('http') ? (await (await fetch(links.sha)).text()) : links.sha;
                let isHash = await computeHash(filePath, 'sha256');

                if (shouldBeHash != isHash) return reject(`The SHA256 is not matching. Please check your connection and try again.\nExpected ${shouldBeHash}, got ${isHash}`);

                if (filePath.endsWith('.tar.gz')) {
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
                }
                else {
                    new AdmZip(file.path).extractAllTo(jpath, true)
                }

                rmSync(file.path, { force: true });

                resolve(`${javaV} got installed!`)
            });
        });
    })
};

function getJavaPath(javaV) {
    return path.join(JVMPath, javaV, os.platform() == 'win32' ? `bin/javaw.exe` : `Contents/Home/bin/java`)
};

module.exports = { minecraftToJava, getJavaDownload, downloadJava, getJavaPath };