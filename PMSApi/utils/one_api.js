const axios = require("axios");
const client_id = `${process.env.ONEID_CLIENT_ID}`;
const client_secret = `${process.env.ONEID_CLIENT_SECRET}`;
const refcode = `${process.env.ONEID_REFCODE}`;

// Login one with username and password
const loginWithUsername = async (username, password, callback) => {
    let tag = "login_one_with_username: ";
    let req_body = {
        "grant_type": "password",
        "client_id": client_id,
        "client_secret": client_secret,
        "username": username,
        "password": password
    }

    await axios({
        method: "post",
        url: 'https://one.th/api/oauth/getpwd',
        data: req_body
    }).then(response => {
        console.log(tag, "login with username and password success");
        callback(null, response)
        // return response
    }).catch(error => {
        console.log(tag, "err on login");
        console.log(tag, error.message);
        callback(error, null);
    })
}

const loginWithShareToken = async (shared_token, callback) => {
    let tag = "login_with_share_token:"
    let req_body = {
        "client_id": client_id,
        "client_secret": client_secret,
        "shared_token": shared_token,
        "refcode": refcode
    }
    await axios({
        method: "post",
        url: "https://one.th/api/oauth/shared-token",
        data: req_body
    }).then(response => {
        callback(null, response.data);
    }).catch(error => {
        console.error(tag, "error.message=", error.message);
        callback(error, null)
    });

}

// ใข้สำหรับดึง shared_token
const getShareToken = async () => {
    let tag = "get_shared_token : "

    await axios({
        method: "get",
        url: 'https://one.th/api/v2/service/shared_token',
    }).then(response => {
        return response
    }).catch(error => {
        return error
    })
}

// ใช้สำหรับดึง username จาก access_token
const checkUsername = async (access_token, callback) => {
    let tag = "check_username : "
    await axios({
        method: "get",
        headers: {
            "Authorization": `Bearer ${access_token}`
        },
        url: 'https://one.th/api/v2/service/citizen/username',
    }).then(response => {
        callback(null, response)
    }).catch(error => {
        callback(error, null)
    })
}

const getProfileWithShareToken = async (access_token, callback) => {
    let tag = "get_profile_with_shared_token:";
    
    let this_access_token = "Bearer " + `${access_token}`; 

    await axios({
        method: "get",
        url: "https://one.th/api/account",
        headers: {
            "Authorization": this_access_token
        }
    }).then(response => {
        callback(null, response.data);
    }).catch(error => {
        console.log(tag, error.message);
        callback(error, null);
    })
}

module.exports = {
    loginWithUsername,
    loginWithShareToken,
    getShareToken,
    checkUsername,
    getProfileWithShareToken
}