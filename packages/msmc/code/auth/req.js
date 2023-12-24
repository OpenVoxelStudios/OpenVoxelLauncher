const fetch = require('node-fetch');

module.exports = async (body) => {
    return await fetch("https://login.live.com/oauth20_token.srf", {
        method: "POST",
        body: body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
}