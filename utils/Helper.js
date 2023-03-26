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
            const link = `https://api.ansopedia.com/user/verify/${user._id}/${token}`;
            // console.log(link);
            let otp = OTP.generateOTP();
            await OTP.saveOTP(user, otp);
            // console.log(user);
            await Mail.sendAccountVerificationEmail(email, user.name, otp, link);
        } catch (err) {
            if (err) throw new Error(`${err} at Helper.Registration`);
        }
    }
    static EmailVerificationByToken = async (user, token, req, res) => {
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
                    await Mail.sendAccountVerificationConfirmationEmail(user.email, user.name);
                    return true;
                } else {
                    res.status(403).json({ "status": "Forbidden", "message": "session expire" });
                }
            } else {
                await UserModel.findByIdAndDelete(user._id);
                res.status(401).json({ "status": "failed", "message": "link expired" });
            }
            return false;
        } catch (err) {
            console.log(err.message)
            return false;
            // if (err) throw new Error(`${err} at Helper.EmailVerificationByToken`);
        }

    }
    static VerifyEmailByFirebase = async (user) => {
        await Notify.registration(user);
        await Notify.emailVerification(user);
        await Mail.sendAccountVerificationConfirmationEmail(user.email, user.name);
        return true;
    }
    static Login = async (user) => {
        try {
            const token = await JWT.generateLoginToken(user, "1d", 86400);
            return token;

        } catch (err) {
            if (err) throw new Error(`${err} at Helper.Login`);
        }
    }

    static ForgetPassword = async (user, req, res) => {
        try {
            // console.log(email)
            // const user = await UserModel.findOne({ email });
            // const token = await JWT.generateToken(user, "15m", 900);
            // const link = `http://localhost:8000/user/verify/${user._id}/${token}`;
            // console.log(link);
            let otp = OTP.generateOTP();
            let { isSaved, message, status_code } = await OTP.saveOTP(user, otp)

            if (isSaved) {
                await Mail.sendForgetPasswordEmail(user.email, user.name, otp);
                res.json([{ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" }])
            } else {
                res.status(status_code).json([{ "status": "failed", message }]);
            }
            // console.log(user);
        } catch (err) {
            if (err) throw new Error(`${err} at Helper.ForgetPassword`);
        }
    }

    static VerifyOTP = async (user, otp, req, res) => {
        try {
            const { isVerified, message, status_code } = await OTP.matchOTP(user, otp);
            if (isVerified) {
                res.status(status_code).json([{ "status": "success", message }])
            } else {
                res.status(status_code).json([{ "status": "failed", message }])
            }
        } catch (err) {
            if (err) throw new Error(`${err} at Helper.VerifyOTP`);
        }
    }

    static Update = async (id) => {
        const user = await UserModel.findById(id);
        if (!user.isProfileComplete) {
            if (user.mobile && user.designation && user.avatar && user.isAccountVerified) {
                await UserModel.findByIdAndUpdate(id, {
                    $set: { isProfileComplete: true }
                });
                Notify.completeProfile(user);
                console.log(user.mobile, user.designation, user.avatar, user.isAccountVerified);
            }
        }
    }
}
module.exports = { Helper };