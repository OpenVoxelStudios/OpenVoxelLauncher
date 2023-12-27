const path = require('path');
const { existsSync, createWriteStream } = require('node:fs');
const { rootroot, appPath } = require('./paths');
const { mkdirSync } = require('fs');

const STARTTIME = new Date(Date.now());

mkdirSync(path.join(rootroot, 'logs'), { recursive: true });
var DEBUG = path.join(rootroot, 'logs', `${STARTTIME.getFullYear()}-${STARTTIME.getMonth() + 1}-${STARTTIME.getDate()}`) + '.log';
var EXISTS = existsSync(DEBUG);

const LOGGER = createWriteStream(DEBUG, { flags: 'a' });
if (EXISTS) LOGGER.write(`\n\n\n`);
LOGGER.write(`--- ${STARTTIME.toLocaleTimeString()} ---\n\n`)

function NOW() {
    return new Date(Date.now()).toLocaleString();
}

const logger = {
    file: DEBUG,
    /**
     * @param {"console" | "file" | "both"} mode 
     * @param  {...any} msgs 
     */
    log: (mode, ...msgs) => {
        for (let msg of msgs) {
            let tolog = `[${NOW()}] [OVL-LOG]: ${JSON.stringify(msg)}`;
            if (mode.includes('console') || mode.includes('both')) console.log(tolog)
            if (mode.includes('file') || mode.includes('both')) LOGGER.write(`${tolog}\n`)
        }
    },
    /**
     * @param {"console" | "file" | "both"} mode 
     * @param  {...any} msgs 
     */
    info: (mode, ...msgs) => {
        for (let msg of msgs) {
            let tolog = `[${NOW()}] [OVL-INFO]: ${JSON.stringify(msg)}`;
            if (mode.includes('console') || mode.includes('both')) console.log(tolog)
            if (mode.includes('file') || mode.includes('both')) LOGGER.write(`${tolog}\n`)
        }
    },
    /**
     * @param {"console" | "file" | "both"} mode 
     * @param  {...any} msgs 
     */
    warn: (mode, ...msgs) => {
        for (let msg of msgs) {
            let tolog = `[${NOW()}] [OVL-WARN]: ${JSON.stringify(msg)}`;
            if (mode.includes('console') || mode.includes('both')) console.log(tolog)
            if (mode.includes('file') || mode.includes('both')) LOGGER.write(`${tolog}\n`)
        }
    },
    /**
     * @param {"console" | "file" | "both"} mode 
     * @param  {...any} msgs 
     */
    error: (mode, ...msgs) => {
        for (let msg of msgs) {
            let tolog = `[${NOW()}] [OVL-ERR]: ${JSON.stringify(msg)}`;
            if (mode.includes('console') || mode.includes('both')) console.log(tolog)
            if (mode.includes('file') || mode.includes('both')) LOGGER.write(`${tolog}\n`)
        }
    },
    both: {
        /**
         * @param  {...any} msgs 
         */
        log: (...msgs) => {
            logger.log('both', ...msgs)
        },
        /**
         * @param  {...any} msgs 
         */
        info: (...msgs) => {
            logger.info('both', ...msgs)
        },
        /**
         * @param  {...any} msgs 
         */
        warn: (...msgs) => {
            logger.warn('both', ...msgs)
        },
        /**
         * @param  {...any} msgs 
         */
        error: (...msgs) => {
            logger.error('both', ...msgs)
        },
    }
};

logger.info('both', `Taking ${appPath} as the App Path`);

module.exports = logger;