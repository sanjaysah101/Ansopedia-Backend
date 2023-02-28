const bcrypt = require("bcrypt");

const { UserModel } = require("../models/User.js");
const { Utils } = require("../utils/Utils")
const { Logs } = require("../middlewares/Logs");
const { RoleModel } = require("../models/Roles");
const { Helper } = require("../utils/Helper");

const IMAGE_URI = "https://api.ansopedia.com/images/"

class UserController {
    static registration = async (req, res) => {
        let message, isRegistered = false, statusCode, status = "failed";
        const { name, email, password, password_confirmation, tc } = req.body;
        if (name && email && password && password_confirmation && tc) {
            if (Utils.ValidateEmail(email)) {
                if (Utils.isAllLetter(name)) {
                    if (password === password_confirmation) {
                        const { isStrong, response } = Utils.checkPasswordValidation(password);
                        if (isStrong) {
                            try {
                                const isUserExist = await UserModel.findOne({ email });
                                if (isUserExist) {
                                    statusCode = 403;
                                    message = "Email already exists";
                                } else {
                                    const hashPassword = await Utils.hashPassword(password);
                                    // const userRole = await roleModel.findOne({ "title": "superadmin" }).select("_id");
                                    const user = await RoleModel.findOne({ "title": "user" }).select("_id");
                                    const username = email.split("@")[0];
                                    const newUser = new UserModel({ name, email, "roles": { user }, password: hashPassword, isAccountVerified: false, tc, username });
                                    await newUser.save();
                                    await Helper.Registration(email);
                                    isRegistered = true;
                                }
                            } catch (err) {
                                if (err) {
                                    Logs.errorHandler(err, req, res);
                                    statusCode = 500;
                                    message = "something went wrong";
                                }
                            }
                        } else {
                            statusCode = 400;
                            message = response
                        }
                    } else {
                        statusCode = 400;
                        message = "password & confirm password doesn't match";
                    }
                } else {
                    statusCode = 422;
                    message = "Name must only contain alphabets";
                }
            } else {
                statusCode = 422;
                message = "You have entered an invalid email address!";
            }
        } else {
            statusCode = 401;
            message = "All fields are required";
        }
        if (!isRegistered) {
            res.status(statusCode).json([{ status, message }]);
        } else {
            statusCode = 201;
            message = "Account Verification Email Sent... Please Check Your Email";
            status = "success";
            res.status(statusCode).json([{ status, message }]);
        }
    }

    static verifyEmailByToken = async (req, res) => {
        const { id, token } = req.params;
        // console.log(token)
        try {
            const user = await UserModel.findById(id);
            if(user){
                if (user.isAccountVerified) {
                    res.render('congratulation', {
                        name: user.name,
                        message: "Your account is already verified"
                    });
                } else {
                    if (Helper.EmailVerificationByToken(user, token, req, res)) {
                        res.render('congratulation', {
                            name: user.name,
                            message: "Congratulation on Account Verification"
                        });
                    }
                }
            }else{
                res.status(404).json([{ "status": "failed", "message": "Account does't exist" }]);
            }
        } catch (err) {
            Logs.errorHandler(err, req, res);
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email });
                if (user) {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (isMatch) {
                        if (user.isAccountVerified) {
                            // console.log(user);
                            const token = await Helper.Login(user);

                            res.json([{ "status": "success", "message": "Login Success", token }]);
                        } else {
                            res.status(403).json([{ "status": "failed", "message": "You have not verified your email. Please Verify your email to login." }]);
                        }

                    } else {
                        res.status(401).json([{ "status": "failed", "message": "Email or Password is not valid" }]);
                    }

                } else {
                    res.status(404).json([{ "status": "failed", "message": "Account does't exist" }]);
                }
            } else {
                res.status(401).json([{ "status": "failed", "message": "All fields are required" }]);
            }
        } catch (err) {
            // res.send(err.message)
            if (err) Logs.errorHandler(err, req, res);
        }
    }

    static getUser = async (req, res) => {
        try {
            const { _id, name, email, username, roles, avatar, isAccountVerified, mobile, designation, socialProfiles, coins } = req.user;
            const UserRoles = [];
            for (let r in roles) UserRoles.push(r);
            res.status(200).json([{
                _id, name, email, username, UserRoles, "avatar": IMAGE_URI+avatar, isAccountVerified, mobile, designation, socialProfiles, "coins": coins.totalCoins
            }]);
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }

    static logout = async (req, res) => {
        try {
            // //logout from single device
            const tokens = req.user.tokens;
            const newTokens = tokens.filter(t => t.token !== req.token);
            let logoutMode = req.headers.logoutmode || "scaller";
            console.log(req.headers.logoutmode);
            // console.log(logoutMode);
            let message = "";
            switch (logoutMode) {
                case "scaller":
                    message = "Sign out successfull";
                    await UserModel.findByIdAndUpdate(req.user._id, { tokens: newTokens });
                    break;
                case "all":
                    message = "Sign out successfull from all devices";
                    await UserModel.findByIdAndUpdate(req.user._id, { tokens: [] });
            }
            res.json([{ success: true, message }]);
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }


    }
    static updateUser = async (req, res) => {
        try {
            const { name, designation, mobile, socialProfiles, username } = req.body;
            let status_code = 304, message = "nothing to update", isUpdated = false;
            if (name) {
                if (Utils.isAllLetter(name)) {
                    if ((req.user.name).toLowerCase() !== name.toLowerCase()) {
                        await UserModel.findByIdAndUpdate(req.user._id, {name})
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
                    await UserModel.findByIdAndUpdate(req.user._id, {designation});
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
                res.status(200).json([{ "status": "success", "messages": "Updated successfully" }])
            } else {
                res.status(status_code).json([{ "status": "failed", message }])
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }

    }

    static UpdateAvatar = async (req, res) => {
        try {
            await UserModel.findByIdAndUpdate(req.user._id, {
                $set: { avatar: req.filePath }
            })
            await Helper.Update(req.user._id);
            res.status(200).json([{ "status": "sucess", "message": "file uploaded successfully" }])
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }

    static changeUserPassword = async (req, res) => {
        const { email, password, password_confirmation } = req.body;
        console.log(email, password, password_confirmation)
        if (email && password && password_confirmation) {
            if (password !== password_confirmation) {
                res.status(400).json([{ "status": "failed", "message": "New Password & confirm new password doesn't match" }])
            } else {
                const { isStrong, response } = Utils.checkPasswordValidation(password);
                if (isStrong) {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password, salt);
                    const user = await UserModel.findOne({email});
                    if(user){
                        // console.log(user._id);
                        await UserModel.findByIdAndUpdate(user._id, {
                            $set: { password: hashPassword }
                        });
                        res.status(200).json([{ "status": "success", "message": "Password changed successfully" }]);
                    }else{
                        res.status(404).json([{ "status": "failed", "message": "User doesn't exists" }]);
                    }
                } else {
                    res.status(400).json([{ "status": "failed", "message": response }]);
                }
            }
        } else {
            res.status(401).json([{ "status": "failed", "message": "All fields are required" }]);
        }
    }

    static sendResetPasswordEmail = async (req, res) => {
        try {
            const { email } = req.body;
            if (email) {
                if (Utils.ValidateEmail(email)) {
                    const user = await UserModel.findOne({ email });
                    if (user) {
                        await Helper.ForgetPassword(user, req, res);

                    } else {
                        res.status(404).json([{ "status": "failed", "message": "User doesn't exists" }]);
                    }
                } else {
                    res.status(422).json([{ "status": "failed", "message": "You have entered an invalid email address!" }]);
                }
            } else {
                res.status(401).json([{ "status": "failed", "message": "Email is required" }]);
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }

    static verifyOTP = async (req, res) => {
        try {

            const { email, otp } = req.body;
            if (otp && email) {
                try {
                    const user = await UserModel.findOne({ email });
                    if (user) {
                        await Helper.VerifyOTP(user, otp, req, res);
                    } else {
                        res.status(404).json([{ "status": "failed", "message": "User doesn't exists" }]);
                    }
                } catch (err) {
                    res.status(500).json([{ "status": "failed", "message": "something went wrong!!!" }])
                }
            } else {
                res.status(401).json([{ "status": "failed", "message": "all field is required" }]);
            }
        } catch (err) {
            if (err) throw new Error(`${err} at Helper.ForgetPassword`);
        }
    }
}

module.exports = { UserController }