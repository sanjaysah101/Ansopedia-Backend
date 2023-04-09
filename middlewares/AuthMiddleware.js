const { Logs } = require("./Logs");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/User.js");
const { JWT } = require("../utils/JWT");
const ApiModel = require("../models/ApiModel");
const Enum = require("../utils/Enum");

class Auth {
    static authUser = async (req, res, next) => {
        try {
            let isValidUser = false;
            isValidUser = await auth(req, res, next);
            if (isValidUser) {
                next();
            } else {
                console.log("req.statu");
                // res.end({ "status": "failed", "message": "something went wrong" })
            }

        } catch (err) {
            // Logs.errorHandler(err, req, res);
            console.log(err.message)
            res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, err.message ))

        }
    }
}

const auth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        console.log(authorization)
        if (authorization && authorization.startsWith("Bearer")) {
            const token = authorization.split(' ')[1];
            const { message, userId, isValid } = await JWT.verifyAuthToken(token);
            if (isValid) {
                const user = await UserModel.findById(userId).select(["-password", "-__v", "-tc"]);
                // Check is Token expired;
                const tok = user.tokens.filter(t => t.token === token);
                if (tok.length > 0) {
                    req.user = user;
                    req.token = token;
                    req.status = "Success";
                    return true;
                } else {
                    res.status(403).json(ApiModel.getApiModel("Forbidden", "session expire"));
                }
            } else {
                // if (err) Logs.errorHandler(err, req, res);
                res.status(404).json(ApiModel.getApiModel(Enum.status.FAILED, message));
            }
        } else {
            res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "token must start with Bearer"));
        }
    } catch (err) {
        if (err) throw new Error(`Invalid token`);
        // if (err) res.end({ "status": "failed", "message": "User not found" });
    }


}

module.exports = { Auth }