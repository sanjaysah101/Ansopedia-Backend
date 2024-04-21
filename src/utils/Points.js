const { UserModel } = require("../models/User");

// const REGISTRATION_POINT = 100;
const EMAIL_VERIFICATION_POINT = 400;
const SET_USERNAME_POINT = 100;
const UPDATE_AVATAR_POINT = 100;
const COMPLETE_PROFILE_POINT = 500;
const REFER_POINT = 100;


class Points {
    // static getRegistrationCoin = () => { return REGISTRATION_POINT };
    static getEmailVerificationCoin = () => { return EMAIL_VERIFICATION_POINT };
    static getUsernameCoin = () => { return SET_USERNAME_POINT };
    static getUpdateAvatarCoin = () => { return UPDATE_AVATAR_POINT };
    static getCompleteProfileCoin = () => { return COMPLETE_PROFILE_POINT };
    static getReferCoin = () => { return REFER_POINT };

    // static registration = async (user) => {
    //     await savePoint(user, REGISTRATION_POINT);
    //     return REGISTRATION_POINT;
    // }
    static emailVerification = async (user) => {
        await savePoint(user, EMAIL_VERIFICATION_POINT);
        return EMAIL_VERIFICATION_POINT;
    }
    static username = async (user) => {
        await savePoint(user, SET_USERNAME_POINT);
        return SET_USERNAME_POINT;
    }
    static updateAvatar = async (user) => {
        await savePoint(user, UPDATE_AVATAR_POINT);
        return UPDATE_AVATAR_POINT;
    }
    static completeProfile = async (user) => {
        await savePoint(user, COMPLETE_PROFILE_POINT);
        return COMPLETE_PROFILE_POINT;
    }
    static refer = async (user) => {
        await savePoint(user, REFER_POINT);
        return REFER_POINT;
    }
}

const savePoint = async (user, point) => {
    let coins = user.coins?.totalCoins + point;    
    await UserModel.findByIdAndUpdate(user._id, {
        $set: {
            coins: {
                totalCoins: coins
            }
        }
    })
}

module.exports = { Points };