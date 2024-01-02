const { readFileSync, rmSync, renameSync } = require("fs");

/**
 * @warning Dependency "osslsigncode" needs to be installed. 
 * You can do it with homebrew "brew install osslsigncode"
 */
exports.default = async function (configuration) {
    const TOKEN_PASSWORD = readFileSync('./certificates/password.txt', { encoding: 'utf-8' });

    require("child_process").execSync(
        `osslsigncode sign -pkcs12 ./certificates/certificate.pfx -n "OpenVoxel Launcher" -in "${configuration.path}" -out "${configuration.path}-SIGNED.exe" -pass "${TOKEN_PASSWORD}"`,
        {
            stdio: ["ignore", "ignore", "inherit"]
        }
    );

    rmSync(configuration.path, { force: true });
    renameSync(`${configuration.path}-SIGNED.exe`, configuration.path);
};