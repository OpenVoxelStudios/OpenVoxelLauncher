const path = require('path');
const ospath = require('ospath');
const os = require('node:os');
const { app } = require('electron');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const { defaultConfig } = require('../config');


let mcroot = path.join(ospath.data(), (os.platform() == 'darwin') ? 'minecraft' : '.minecraft');
let rootroot = path.join(ospath.data(), 'OpenVoxel');
let root = path.join(rootroot, 'launcher');
const appPath = app.getAppPath().replace('app.asar', '');

let OVOPTIONSPATH = path.join(rootroot, 'options.txt');
if (!existsSync(OVOPTIONSPATH)) {
    mkdirSync(path.join(rootroot), { recursive: true });
    writeFileSync(OVOPTIONSPATH, JSON.stringify(defaultConfig, undefined, 2), { encoding: 'utf-8' });
};
let OVOPTIONS_origin = JSON.parse(readFileSync(OVOPTIONSPATH, { encoding: 'utf-8' }));

module.exports = { mcroot, rootroot, root, appPath, OVOPTIONS_origin, OVOPTIONSPATH };