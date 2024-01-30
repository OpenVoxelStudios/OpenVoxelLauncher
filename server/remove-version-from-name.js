const { readdirSync, renameSync, readFileSync, writeFileSync } = require("node:fs");
const path = require('node:path');
const VERSION = require('../package.json').version;

readdirSync('./dist', { recursive: false, withFileTypes: true }).filter(m => m.isFile()).forEach(f => {
    if (f.name.startsWith('latest')) {
        let content = readFileSync(path.join(f.path, f.name), { encoding: 'utf-8' });
        while (content.indexOf('-' + VERSION) != -1) content = content.replace(`-${VERSION}`, '')
        writeFileSync(path.join(f.path, f.name), content, { encoding: 'utf-8' });
    }
    else if (f.name.includes('-' + VERSION)) renameSync(path.join(f.path, f.name), path.join(f.path, f.name.replace(`-${VERSION}`, '')))
})