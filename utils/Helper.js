const { Mail } = require("./Mail");
const { OTP } = require("./Otp");
const { JWT } = require("./JWT");
const { Notify } = require("./Notify");

const { UserModel } = require("../models/User");
class Helper {
    static Registration = async (email) => {
        try {
            // console.log(email)
            const user = await UserModel.findOne({ email });
            const token = await JWT.generateToken(user, "15m", 900);
            const link = `http://localhost:8000/user/verify/${user._id}/${token}`;
            console.log(link);
            let otp = OTP.generateOTP();
            await OTP.saveOTP(user, otp);
            // console.log(user);
            await Mail.sendAccountVerification(email, user.name, otp, link);
        } catch (err) {
            if (err) throw new Error(`${err} at Helper.Registration`);
        }
    }
    static EmailVerificationByToken = async (user, token) => {
        try {
            const isValid = await JWT.verifyToken(user, token, 900);
            if (isValid) {
                //check if token expired or not
                const tok = user.tokens.filter(t => t.token === token);
                if (tok.length > 0) {
                    await UserModel.findByIdAndUpdate(user._id, {
                        isAccountVerified: true
                    })
                    await Notify.registration(user);
                    await Notify.emailVerification(user);
                    return true;
                } else {
                    res.status(403).json({ "status": "Forbidden", "message": "session expire" });
                }
            } else {
                res.status(401).json({ "status": "failed", "message": "authorization failed" });
            }
            return false;
        } catch (err) {
            if (err) throw new Error(`${err} at Helper.EmailVerificationByToken`);
        }

    }
    static Login = async (user) => {
        try {
            const token = await JWT.generateLoginToken(user, "1d", 86400);
            return token;

        } catch (err) {
            if (err) throw new Error(`${err} at Helper.Login`);
        }
    }
}
module.exports = { Helper };