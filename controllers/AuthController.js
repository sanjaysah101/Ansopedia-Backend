const { Utils } = require("../utils/Utils");
const { Logs } = require("../middlewares/Logs");
const { RoleModel } = require("../models/Roles");
const { UserModel } = require("../models/User.js");
const { Helper } = require("../utils/Helper");
const IMAGE_URI = "https://api.ansopedia.com/images/"

// ########################### Error #########################
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateCurrentUser, updatePassword } = require("firebase/auth");
const { FirebaseAdminApp } = require("../config/Firebase-admin");
const credentials = require("../config/firebase-adminsdk.json");
const { async } = require("@firebase/util");
const ApiModel = require("../models/ApiModel");
const Enum = require("../utils/Enum");
let firebaseAdminApp = FirebaseAdminApp.getInstance(credentials).firebaseAdminApp;


class AuthController {

    static sign_in_with_google = async (req, res) => {
        const isUserExist = await UserModel.findOne({ "uid": req.firebaseUser.uid }).select("_id");
        if (!isUserExist) {
            try {
                const { uid, name, picture, email, email_verified } = req.firebaseUser;
                // console.log("saving user...")
                // console.log(uid, name, picture, email, email_verified)
                const user = await RoleModel.findOne({ "title": "user" }).select("_id");
                const newUser = new UserModel({ uid: req.firebaseUser.uid, name, email, "roles": [user], username: email, password: email, avatar: { isCreatedwithGoogle: true, picture }, isAccountVerified: email_verified, tc: true });
                await newUser.save();
                const savedUser = await UserModel.findOne({ "uid": req.firebaseUser.uid });
                if (Helper.VerifyEmailByFirebase(savedUser)) {
                    res.render('congratulation', {
                        name: user.name,
                        message: "Congratulation on Account Verification"
                    });
                }
                res.status(200).json(ApiModel.getApiModel(Enum.status.SUCCESS, "User updated successfully"));
            } catch (error) {
                res.status(500).json(ApiModel.getApiModel(Enum.status.FAILED, error))
            }
        } else {
            res.status(200).json(ApiModel.getApiModel(Enum.status.SUCCESS, "ok"))
        }
    }
    static createUserWithEmailAndPassword = async (req, res) => {
        // const { getAuth } = require("firebase-admin/auth");
        const { name, email, password, password_confirmation, tc, username } = req.body;
        if (name && email && password && password_confirmation && username) {
            if (!Utils.ValidateEmail(email)) {
                res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "You have entered an invalid email address!"));
            } else if (!Utils.isAllLetter(name)) {
                res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "Name must only contain alphabets"));
            } else if (name.length < 3) {
                res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "Name must be greater than 2 letter"));
            } else if (password !== password_confirmation) {
                res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "password & confirm password doesn't match"));
            } else if (!tc) {
                res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "You must agree terms & condition to login"));
            } else {
                const { isStrong, response } = Utils.checkPasswordValidation(password);
                if (!isStrong) {
                    res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, response));
                } else {
                    try {
                        const isUsernameExist = await UserModel.findOne({ username });
                        if (isUsernameExist) {
                            res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "username already exist"));
                        }
                        else {
                            const createdUser = await createUserWithEmailAndPassword(getAuth(), email, password);
                            // console.log(createdUser.user.uid)
                            const hashPassword = await Utils.hashPassword(password);
                            // const superadmin = await RoleModel.findOne({ "title": "superadmin" }).select("_id");
                            const user = await RoleModel.findOne({ "title": "user" }).select("_id");
                            const newUser = new UserModel({ uid: createdUser.user.uid, name, email, "roles": [user], username, password: hashPassword, isAccountVerified: false, tc });
                            await newUser.save();
                            await Helper.Registration(email);
                            res.status(201).json(ApiModel.getApiModel(Enum.status.SUCCESS, "Account Verification Email Sent... Please Check Your Email"));
                            // firebaseAdminApp.auth().generateEmailVerificationLink(email)
                            //     .then(async (emailLink) => {
                            //         console.log(emailLink)
                            //         // await Helper.Registration(email, emailLink);

                            //     }).catch(error => {
                            //         return res.json(error)
                            //     })


                            // await sendEmailVerification(getAuth(), email);
                            // createdUser.sendEmailVerification().then(()=>{
                            // }).catch(error=>{
                            //     console.log(error);
                            //     res.status(500).send(error);
                            // })

                            // firebaseAdminApp.auth().generateEmailVerificationLink(email)
                            // .then(async (emailLink) => {
                            //     console.log(emailLink)
                            //     await Helper.Registration(email, emailLink);
                            //     res.status(201).json({ status: "success", message: "Account Verification Email Sent... Please Check Your Email" });

                            // }).catch(error => {
                            //     return res.json(error)
                            // })
                        }
                    } catch (err) {
                        if (err.code == "auth/email-already-in-use") {
                            res.status(403).json(ApiModel.getApiModel(Enum.status.FAILED, "Email already exists"));
                        } else {
                            res.status(400).json(ApiModel.getApiModel(Enum.status.FAILED, err.message));
                        }
                    }
                }
            }
        }
        else {
            res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "All fields are required"));
        }
    }

    static signInWithEmailAndPassword = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "All fields are required"));
        } else {
            try {
                const foundUser = await UserModel.findOne({ email }).select("isAccountVerified");
                if (!foundUser) {
                    res.status(404).json(ApiModel.getApiModel(Enum.status.FAILED, "User not found"));
                } else {
                    if (!foundUser.isAccountVerified) {
                        res.status(403).json(ApiModel.getApiModel(Enum.status.FAILED, "You have not verified your email. Please Verify your email to login."));
                    } else {
                        await signInWithEmailAndPassword(getAuth(), email, password)
                            .then((user) => {
                                res.status(200).json(ApiModel.getApiModel(Enum.status.SUCCESS, "Login Success", { token: user._tokenResponse.idToken }));
                            }).catch((e) => {
                                if (e.code == "auth/user-not-found")
                                    res.status(404).json(ApiModel.getApiModel(Enum.status.FAILED, "User not found"));
                                else if (e.code == "auth/wrong-password")
                                    res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "Email or Password is not valid"));
                                else if (e.code == 'auth/too-many-requests')
                                    res.status(429).json(ApiModel.getApiModel(Enum.status.FAILED, "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later."));
                                else
                                    res.status(500).json(ApiModel.getApiModel(Enum.status.FAILED, e.message));
                            })
                    }
                }
            } catch (error) {
                res.status(500).json(ApiModel.getApiModel(Enum.status.FAILED, error?.message));
            }
        }
    }

    static getUser = async (req, res) => {
        const { _id, name, email, username, avatar, isAccountVerified, mobile, designation, socialProfiles, coins } = req.user;
        let userProfile = ""
        if(avatar?.isCreatedwithGoogle){
            userProfile = avatar?.picture;
        }else{
            userProfile = IMAGE_URI + avatar?.picture;
        }
        res.status(200).json(ApiModel.getApiModel(Enum.status.SUCCESS, "Data found", {
            _id, name, email, username, "avatar": userProfile, isAccountVerified, mobile, designation, socialProfiles, "coins": coins.totalCoins
        }));
    }
    static UpdateAvatar = async (req, res) => {
        try {
            await UserModel.findByIdAndUpdate(req.user._id, {
                $set: { avatar: { isCreatedwithGoogle: false, picture :req.filePath }}
            })
            await Helper.Update(req.user._id);
            res.status(200).json(ApiModel.getApiModel(Enum.status.SUCCESS, "Profile uploaded successfully"));
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }
    static updateUser = async (req, res) => {
        const { name, designation, mobile, socialProfiles, username } = req.body;
        let status_code = 304, message = "There is nothing to update", isUpdated = false;
        try {
            if (name) {
                if (Utils.isAllLetter(name)) {
                    if ((req.user.name).toLowerCase() !== name.toLowerCase()) {
                        await UserModel.findByIdAndUpdate(req.user._id, { name })
                        isUpdated = true;
                    }
                } else {
                    status_code = 422;
                    message = "Invalid name";
                }
            }
            if (designation) {
                let tempDesignation = (req.user.designation) ? (req.user.designation).toLowerCase() : "";
                if (tempDesignation.toLowerCase() !== designation.toLowerCase()) {
                    await UserModel.findByIdAndUpdate(req.user._id, { designation });
                    isUpdated = true;
                }
            }
            if (mobile) {
                if (Utils.isAllNumber(mobile)) {
                    if ((req.user.mobile) !== mobile) {
                        await UserModel.findByIdAndUpdate(req.user._id, { mobile })
                        isUpdated = true;
                    }
                }
                else {
                    isUpdated = false;
                    status_code = 422;
                    message = "Invalid number";
                }
            }
            if (isUpdated) {
                await Helper.Update(req.user._id);
                res.status(200).json(ApiModel.getApiModel(Enum.status.SUCCESS, "Updated successfully"))
            } else {
                res.status(status_code).json(ApiModel.getApiModel(Enum.status.FAILED, message))
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }

    }
    static changeUserPassword = async (req, res) => {
        const { password, password_confirmation } = req.body;
        if (password && password_confirmation) {
            if (password !== password_confirmation) {
                res.status(400).json(ApiModel.getApiModel(Enum.status.FAILED, "New Password & confirm new password doesn't match"))
            } else {
                const { isStrong, response } = Utils.checkPasswordValidation(password);
                if (!isStrong) {
                    res.status(400).json(ApiModel.getApiModel(Enum.status.FAILED, response))
                } else {
                    try {
                        let isOldAndNewPasswordMatch = await Utils.matchPassword(password, req.user.password);
                        // if isOldAndNewPasswordMatch is false then only update password
                        if (isOldAndNewPasswordMatch) {
                            res.status(409).json(ApiModel.getApiModel(Enum.status.FAILED, "New password and old password cannot be same"))
                        } else {
                            const uid = req.user.uid;
                            console.log(uid)
                            // If old and new password did not match then update password
                            await firebaseAdminApp.auth().updateUser(uid, { password });
                            const hashPassword = await Utils.hashPassword(password);
                            await UserModel.findByIdAndUpdate(req.user._id, {
                                $set: { password: hashPassword }
                            });
                            res.status(200).json(ApiModel.getApiModel(Enum.status.SUCCESS, "Password changed successfully"))

                        }
                    } catch (error) {
                        console.log(error)
                        res.status(500).json(ApiModel.getApiModel(Enum.status.ERROR, "Something went wrong"));
                    }
                }
            }
        } else {
            res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "All fields are required"));
        }
    }
    static sendResetPasswordEmail = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "Email is required"));
            } else if (!Utils.ValidateEmail(email)) {
                res.status(422).json(ApiModel.getApiModel(Enum.status.FAILED, "You have entered an invalid email address!"));
            } else {
                const user = await UserModel.findOne({ email });
                if (!user) {
                    res.status(404).json(ApiModel.getApiModel(Enum.status.FAILED, "User doesn't exists"));
                } else {
                    await Helper.ForgetPassword(user, req, res);
                }
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }

    static verifyOTP = async (req, res) => {
        const { email, otp } = req.body;
        if (!otp && !email) {
            res.status(401).json(ApiModel.getApiModel(Enum.status.FAILED, "All field is required"));
        } else {
            try {
                const user = await UserModel.findOne({ email });
                if (!user) {
                    res.status(404).json(ApiModel.getApiModel(Enum.status.FAILED, "User doesn't exists"));
                } else {
                    await Helper.VerifyOTP(user, otp, req, res);
                }
            } catch (err) {
                res.status(500).json(ApiModel.getApiModel(Enum.status.FAILED, "Something went wrong!!!"));
            }
        }
    }
}

module.exports = { AuthController };