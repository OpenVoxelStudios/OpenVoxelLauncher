const logger = require("./logger");
const path = require('path');
const { rootroot } = require("./paths");
const { existsSync, readFileSync, rmSync, writeFileSync } = require("fs");
const { mcTokenToolbox } = require("../packages/msmc/");
const { Auth } = require("../packages/msmc");
const RPC = require("./rpc");
const { safeStorage } = require("electron");
const authManager = new Auth("select_account");

function deleteLogin(PROFILE) {
    logger.log('both', 'Deleting login infos...');
    rmSync(path.join(rootroot, '.login'));

    if (PROFILE?.username) {
        logger.log('both', '[DRPC] Removing player name...');
        RPC.updatePlayer(false);
    }
}

function saveLogin(PROFILE) {
    logger.log('both', 'Saving login...');
    writeFileSync(path.join(rootroot, '.login'), JSON.stringify(PROFILE), { encoding: 'utf-8' });

    if (PROFILE?.username) {
        RPC.updatePlayer(PROFILE.username).then(v => {
            if (v != 'disabled') logger.log('both', '[DRPC] Updating player name to ' + PROFILE.username);
        })
    }
};

async function fromXboxManagerToSaveLogin(xboxManager) {
    //Generate the Minecraft login token
    const token = await xboxManager.getMinecraft();
    let toWriteToken = JSON.stringify(token.mclc(true));
    let toWriteRefresh = JSON.stringify(xboxManager.msToken);
    let crypted = false;

    if (safeStorage.isEncryptionAvailable()) {
        try {
            logger.info('both', 'Trying to use Secure Encryption')
            toWriteToken = safeStorage.encryptString(toWriteToken);
            toWriteRefresh = safeStorage.encryptString(toWriteRefresh);
            crypted = true;
        } catch (err) {
            logger.error('both', 'Secure Encryption Failed');
            logger.error('file', err?.stack || err);
            toWriteToken = JSON.stringify(token.mclc(true));
            toWriteRefresh = JSON.stringify(xboxManager.msToken);
        };
    };

    var PROFILE = { username: token.profile.name, token: toWriteToken, refresh: toWriteRefresh, crypted };
    saveLogin(PROFILE);
    return PROFILE;
};


async function getLogin() {
    logger.log('both', 'Loading login...');
    let loginPath = path.join(rootroot, '.login');

    return new Promise(async (resolve) => {
        if (existsSync(loginPath)) {
            try {
                let login = JSON.parse(readFileSync(loginPath, { encoding: 'utf-8' }));

                if (login.crypted == true) {
                    login.token = JSON.parse(safeStorage.decryptString(Buffer.from(login.token, 'utf-8')))
                    login.refresh = JSON.parse(safeStorage.decryptString(Buffer.from(login.refresh, 'utf-8')))
                }

                if (mcTokenToolbox.validate(login?.token)) resolve(login);

                let refreshToken = login?.refresh;
                if (refreshToken) {
                    logger.log('both', 'Trying to refresh login token...');

                    let xboxManager = await authManager.refresh(refreshToken);

                    resolve(await fromXboxManagerToSaveLogin(xboxManager));
                } else {
                    resolve(false);
                }
            } catch (err) {
                logger.error('both', '[OVL] Error while getting login occured');
                logger.error('file', err?.stack || err);

                rmSync(loginPath);
                resolve(false);
            }
        } else {
            resolve(false);
        }
    })
};


module.exports = { authManager, getLogin, fromXboxManagerToSaveLogin, saveLogin, deleteLogin };