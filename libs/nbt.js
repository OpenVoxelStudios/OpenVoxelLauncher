const { readFileSync, writeFileSync } = require('node:fs');
const nbt = require('nbt');

function parseNBT(file) {
    return new Promise((resolve) => {
        nbt.parse(readFileSync(file), function (error, data) {
            if (error) { throw error; }
            resolve(data);
        });
    })
};

function writeNBT(data, file) {
    return new Promise((resolve) => {
        let newData = nbt.writeUncompressed(data);
        writeFileSync(file, Buffer.from(newData));
        resolve(true);
    })
};

module.exports = { parseNBT, writeNBT };