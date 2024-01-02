const crypto = require('crypto');
const { createReadStream } = require('node:fs');
const stream = require('stream/promises');

async function computeHash(filepath, hashing='sha256') {
    const input = createReadStream(filepath);
    const hash = crypto.createHash(hashing);

    await stream.pipeline(input, hash);

    return hash.digest('hex');
};


module.exports = { computeHash };