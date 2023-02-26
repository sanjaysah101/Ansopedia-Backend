const { NotificationModel } = require("../models/Notification");
const { UserModel } = require("../models/User");
const { Points } = require("./Points");

class Notify {
    static registration = async (user) => {
        try {
            const title = ` Welcome to <strong>Ansopedia</strong>`;
            const message = `Hi <strong>${user.name}!!!</strong>
                <p>You have earned ${user.coins?.totalCoins} coins on account creation</p>
                <p>Please confirm your email address to help us ensure your account is always protected.</p>
                <p>Verify Email to earn ${Points.getEmailVerificationCoin()} coins</p>            `
            await saveNotififcation(user, title, message);
        } catch (err) {
            if (err) throw new Error(`${err} at Notify.RegistrationNotification`);
        }
    }
    static emailVerification = async (user) => {
        try {
            let earnedCoins = await Points.emailVerification(user);
            const title = `Congratulation on Account Verification`;
            const message = `Hi <strong>${user.name}!!!</strong>. You have earned ${earnedCoins} coins on Account Verification.`
            await saveNotififcation(user, title, message);
        } catch (err) {
            if (err) throw new Error(`${err} at Notify.AccountVerificationNotification`);
        }
    }
    static username = async (user) => {
        try {
            let earnedCoins = await Points.username(user);
            const title = `Username updated successfully!!!`;
            const message = `Hi ${user.username}. You have earned ${earnedCoins} coins on updating your username.`
            await saveNotififcation(user, title, message);
        } catch (err) {
            if (err) throw new Error(`${err} at Notify.Notification.username`);
        }
    }
    static updateAvatar = async (user) => {
        try {
            if (user.avatar) {

            } else {
                let earnedCoins = await Points.updateAvatar(user);
                const title = `Profile Picture updated successfully!!!`;
                const message = `You have earned ${earnedCoins} coins on updating your profile Picture.`
                await saveNotififcation(user, title, message);
            }
        } catch (err) {
            if (err) throw new Error(`${err} at Notify.AccountVerificationNotification`);
        }
    }
    static completeProfile = async (user) => {
        try {
            let earnedCoins = await Points.completeProfile(user);
            const title = `Congratulation on completing your profile!!!`;
            const message = `Hi <strong>${user.name}!!!</strong>. You have earned ${earnedCoins} coins on completing your profile.`
            await saveNotififcation(user, title, message);
        } catch (err) {
            if (err) throw new Error(`${err} at Notify.AccountVerificationNotification`);
        }
    }
}
const saveNotififcation = async (user, title, message,) => {
    const notification = new NotificationModel({ title, message });
    const result = await notification.save();
    await UserModel.findByIdAndUpdate(user._id, {
        $push: { notifications: result._id }
    })
}

module.exports = { Notify };