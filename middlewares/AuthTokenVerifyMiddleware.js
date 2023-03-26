const { UserModel } = require("../models/User");
class Auth {
    static verifyFirebaseToken = async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            res.status(401).json({ "status": "failed", "message": "Authorization Token is missing" });
        } else if (!authorization.startsWith("Bearer")) {
            res.status(401).json({ "status": "failed", "message": "token must start with Bearer" });
        } else {
            const token = authorization.split(' ')[1];
            if (!token) {
                res.status(401).json({ "status": "failed", "message": "token is missing" });
            } else {
                const { getAuth } = require("firebase-admin/auth");
                getAuth()
                    .verifyIdToken(token)
                    .then((decodedToken) => {
                        req.firebaseUser = decodedToken
                        next();
                    })
                    .catch((error) => {
                        res.status(401).json({ "status": "failed", "message": "Unauthorized Access" })
                    });
            }
        }
    }
    static isAccountVerified = async (req, res, next) => {
        req.user = await UserModel.findOne({ uid: req.firebaseUser.uid });
        if(req.user){
            // console.log(req.user)
             req.user.isAccountVerified ? next() : res.status(403).json([{ "status": "failed", "message": "You have not verified your email. Please verify your email to login." }]);
        }else{
            res.status(404).json([{ "status": "failed", "message": "User not found" }]);
        }
    }
}

module.exports = { Auth };