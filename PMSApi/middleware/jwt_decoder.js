const { jwtDecode } = require('jwt-decode');

async function decodeJWT(token) {
    try {
        const decoded =  await jwtDecode(token);
        return decoded;
    } catch (error) {
        console.log(`Cannot decode access token`);
        return null;
    }
}

module.exports = decodeJWT;