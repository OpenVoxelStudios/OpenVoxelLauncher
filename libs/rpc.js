const DRPC = require('discord-rpc');
const logger = require('./logger.js');

class RPC {
    constructor(disabled = false) {
        this.rpc = new DRPC.Client({ transport: 'ipc' });
        this.start = Date.now();
        this.status = {
            largeImageKey: 'openvoxel-logo',
            state: 'In the Launcher',
            smallImageKey: undefined,
            smallImageText: undefined,
            buttons: [
                {
                    label: 'Discord Server',
                    url: 'https://discord.gg/PZTx9Tt7De'
                },
                {
                    label: 'Website',
                    url: 'https://openvoxel.studio/'
                }
            ],
            startTimestamp: this.start,
        };
        this.disabled = disabled;
        this.hasLoggedIn = false;
    };

    login() {
        return new Promise((resolve) => {
            try {
                this.rpc.login({ clientId: require('../config.js').DiscordClientId });
                this.rpc.on('ready', () => resolve(true));
                this.hasLoggedIn = true;
            } catch (err) {
                resolve(err?.stack || err);
            }
        })
    };

    setPlayer(player, uuid) {
        if (this.disabled || !this.hasLoggedIn) return 'disabled';
        if (player == false) {
            this.status.smallImageText = null;
            this.status.smallImageKey = null;
        }
        else {
            this.status.smallImageText = `Logged in as ${player}`;
            this.status.smallImageKey = `https://minotar.net/avatar/${uuid}`;
        }
    };

    async updatePlayer(player, uuid) {
        if (this.disabled || !this.hasLoggedIn) return 'disabled';
        this.setPlayer(player, uuid);
        await this.setStatus();
    };

    async setStatus() {
        if (this.disabled || !this.hasLoggedIn) return 'disabled';
        await this.rpc.setActivity(this.status);
    };

    async stop() {
        logger.log('both', 'Stopping Discord RPC');
        this.disabled = true;
        try {
            await this.rpc.destroy()
        } catch { };
    }
};

module.exports = new RPC(false)