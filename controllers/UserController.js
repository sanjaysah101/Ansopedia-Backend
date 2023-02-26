const bcrypt = require("bcrypt");

const { UserModel } = require("../models/User.js");
const { Utils } = require("../utils/Utils")
const { Logs } = require("../middlewares/Logs");
const { RoleModel } = require("../models/Roles");
const { Helper } = require("../utils/Helper");

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
                                    const superadmin = await RoleModel.findOne({ "title": "superadmin" }).select("_id");
                                    const username = email.split("@")[0];
                                    const newUser = new UserModel({ name, email, "roles": { superadmin }, password: hashPassword, isAccountVerified: false, tc, username });
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

    static verifyAccountByToken = async (req, res) => {
        const { id, token } = req.params;
        // console.log(token)
        try {
            const user = await UserModel.findById(id);
            if (user.isAccountVerified) {
                res.render('congratulation', {
                    name: user.name,
                    message: "Your account is already verified"
                });
            } else {
                if (Helper.EmailVerificationByToken(user, token)) {
                    res.render('congratulation', {
                        name: user.name,
                        message: "Congratulation on Account Verification"
                    });
                }
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
                _id, name, email, username, UserRoles, avatar, isAccountVerified, mobile, designation, socialProfiles, "coins": coins.totalCoins
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
            const update = { ...req.user };
            let updateUser = { ...update._doc }
            let status_code = 304, message = "nothing to update", isUpdated = false;
            if (name) {
                if (Utils.isAllLetter(name)) {
                    if ((updateUser.name).toLowerCase() !== name.toLowerCase()) {
                        updateUser = { ...update._doc, name }
                        isUpdated = true;
                    }
                    // console.log(isUpdated)
                } else {
                    isUpdated = false;
                    status_code = 422;
                    message = "Invalid name";
                    // console.log(message, status, status_code)
                }
            }
            // if (email) updateUser = { ...updateUser, email };
            // console.log(updateUser.designation)
            if (designation) {
                let tempDesignation = (updateUser.designation) ? (updateUser.designation).toLowerCase() : "";
                console.log(tempDesignation)
                if (tempDesignation !== designation.toLowerCase()) {
                    updateUser = { ...update._doc, designation }
                    isUpdated = true;
                }
            };
            if (mobile) {
                if (Utils.isAllNumber(mobile)) {
                    if ((updateUser.mobile) !== mobile) {
                        updateUser = { ...update._doc, mobile }
                        isUpdated = true;
                    }
                }
            };
            // if (username) {
            //     // console.log(username)
            //     if (updateUser.username) {
            //         // console.log(updateUser.username)
            //     } else {
            //         updateUser = { ...update._doc, username }
            //         isUpdated = true;
            //         await Notification.username(updateUser);
            //     }
            // }

            // if(socialProfiles) {
            //     console.log(socialProfiles)
            //     updateUser = {...updateUser, }
            // }
            if (isUpdated) {
                UserModel.findByIdAndUpdate(updateUser._id, updateUser).exec((err, info) => {
                    if (err) errorHandler(err, req, res);
                    res.status(200).json([{ "status": "success", "messages": "Updated successfully" }])
                })
                // res.send(updateUser)
            } else {
                res.status(status_code).json([{ "status": "failed", message }])
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }

    }

    static UpdateAvatar = async (req, res) => {
        try{
            await UserModel.findByIdAndUpdate(req.user._id, {
                $set: { avatar: req.filePath }
            })
            res.status(200).json([{ "status": "sucess", "message": "file uploaded successfully" }])
        }catch(err){
            if (err) Logs.errorHandler(err, req, res);
        }
    }
}

module.exports = { UserController }