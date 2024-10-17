const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

exports.tokenValidator = (req, res, next) => {
    let token;
    let session_token = req.session.token;
    let bearer_token = req.headers['authorization'];

    if (!session_token && !bearer_token) {
        res.status(403).send({
            ok: false,
            message: "No token provided!",
        });
        return;
    } else if (session_token && !bearer_token) {
        token = session_token;
    } else {
        token = bearer_token.split(' ')[1];
    }

    try {
        const payload = jwt.verify(token, config.secret);
        if (!payload) {
            res.status(401).json({
                ok: false,
                message: "Failed to get authorization data",
            });
            return;
        }

        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({
            ok: false,
            message: String(error),
        });
    }
};

exports.adminChecker = async (req, res, next) => {
    const isAdminTrue = req.user.roleName === "admin" ? true : false;

    try {
        if (!isAdminTrue) {
            return res.status(401).json({
                error: false, 
                message: "Require Admin Role." 
            });
        } 

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


exports.leadChecker = async (req, res, next) => {
    const isUserTrue = req.user.roleName === "lead" ? true : false;

    try {
        if (!isUserTrue) {
            return res.status(401).json({
                error: false, 
                message: "Require Lead Role." 
            });
        } 

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.userChecker = async (req, res, next) => {
    const isUserTrue = req.user.roleName === "user" ? true : false;

    try {
        if (!isUserTrue) {
            return res.status(401).json({
                error: false, 
                message: "Require User Role." 
            });
        } 

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
