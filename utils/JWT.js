const { UserModel } = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

class JWT {
    static generateToken = async (user, expiryTime, time) => {
        try {
            const SECRET = user._id + process.env.ACCESS_TOKEN_SECRET;
            const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: expiryTime });
            const link = `http://localhost:8000/user/verify/${user._id}/${token}`;
            // console.log(link)
            // console.log(token)
            await updateToken(user, token, time);
            return token;
        } catch (err) {
            if (err) throw new Error(`${err} at JWT.generateToken`);
        }
    }
    static generateLoginToken = async (user, expiryTime, time) => {
        try {
            const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
            await updateToken(user, token, time);
            return token;
        } catch (err) {
            if (err) throw new Error(`${err} at JWT.generateToken`);
        }
    }
    static verifyToken = async (user, token, time) => {
        try {
            // console.log(user._id);
            const SECRET = user._id + process.env.ACCESS_TOKEN_SECRET;
            const { userId } = jwt.verify(token, SECRET);
            if (userId === user.id) {
                await updateToken(user, token, time)
                return true;
            }
            return false;
        } catch (err) {
            if (err) throw new Error(`${err} at JWT.verifyToken`);
        }
    }
}

const updateToken = async (user, token, TOKEN_EXPIRY_TIME) => {
    try {
        //Remove all expire Token
        let oldTokens = user.tokens || [];
        if (oldTokens.length) {
            oldTokens = oldTokens.filter(token => {
                const timeDiff = (Date.now() - parseInt(token.signedAt)) / 1000; //This will return remaining time in second
                if (timeDiff < TOKEN_EXPIRY_TIME) return token; // Token expire in 15 minutes
            })
        }
        //update token field
        await UserModel.findByIdAndUpdate(user._id, {
            tokens: [...oldTokens, {
                token,
                signedAt: Date.now().toString()
            }]
        })
    } catch (err) {
        if (err) throw new Error(`${err} at JWT.updateToken`);
    }
}
module.exports = { JWT };