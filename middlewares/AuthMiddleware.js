const { Logs } = require("./Logs");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/User.js");

class Auth {
    static auth = async (req, res, next) => {
        const { authorization } = req.headers;
        if (authorization && authorization.startsWith("Bearer")) {
            try {
                const token = authorization.split(' ')[1];
                const { userId } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                const foundUser = await UserModel.findById(userId).select(["-password", "-__v", "-tc"]);
                if(foundUser){
                    const tok = foundUser.tokens.filter(t => t.token === token);
                    if (tok.length > 0) {
                        req.user = foundUser;
                        req.token = token;
                        req.status = "Success";
                        next();
                    } else {
                        res.status(403).json({ "status": "Forbidden", "message": "session expire" });
                    }
                }else{
                    res.status(404).json({ "status": "failed", "message": "User not found" });                    
                }
            } catch (err) {
                if (err) Logs.errorHandler(err, req, res);
            }
        } else {
            res.status(401).json({ "status": "failed", "message": "token must start with Bearer" });
        }
    }
}

module.exports = { Auth }