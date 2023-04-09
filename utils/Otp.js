const { isValid } = require("date-fns");
const { UserModel } = require("../models/User.js");

class OTP {
    // Function to generate OTP
    static generateOTP() {
        var string = '0123456789';
        let OTP = '';
        var len = string.length;
        for (let i = 0; i < 6; i++) {
            OTP += string[Math.floor(Math.random() * len)];
        }
        return OTP;
    }

    static saveOTP = async (user, OTP) => {
        let isSaved, message, status_code;
        let oldOTP = user.otp?.sendOTP || [];
        //Remove all expire OTP
        if (oldOTP.length) {
            oldOTP = oldOTP.filter(otp => {
                const timeDiff = (Date.now() - parseInt(otp?.createdAt)) / 1000; //This will return remaining time in second
                if (timeDiff < 300) return otp; // otp expire in 5 min
            })
        }
        const otp = await UserModel.findById(user._id).select({ "otp": 1 });
        const timeDiff = (Date.now() - parseInt(otp?.otp?.createdAt)) / 1000 || 0;
        // console.log(timeDiff)
        if (timeDiff > 86400) {
            console.log(timeDiff)
            await UserModel.findByIdAndUpdate(user._id, {
                otp: {}
            })
        }

        let otpCount = user.otp?.otpCount || 0;
        if (otpCount < 3) {
            if (oldOTP.length < 1) {
                //update OTP field
                otpCount++;
                await UserModel.findByIdAndUpdate(user._id, {
                    otp: {
                        sendOTP: [...oldOTP, {
                            OTP,
                            createdAt: Date.now().toString()
                        }],
                        otpCount: otpCount,
                        createdAt: Date.now().toString()
                    }
                })
                isSaved = true;
                status_code = 200;
                message = "OTP send";
            } else {
                status_code = 429;
                isSaved = false;
                message = "Please request after 15 min";
            }
        }
        else {
            status_code = 429;
            isSaved = false;
            message = "You have crossed the maximum limit. Please try again after 24hrs";
        }
        // console.log(user)
        return {
            isSaved, message, status_code
        };
    }
    static matchOTP = async (user, OTP) => {
        try{
            // console.log(user)
            let isVerified = false, message = "OTP is not valid!!!", status_code = 401;
            //Remove all expire OTP
            let oldOTP = user?.otp?.sendOTP || [];
            // console.log(oldOTP)
            if (oldOTP.length) {
                oldOTP = oldOTP.filter(otp => {
                    const timeDiff = (Date.now() - parseInt(otp.createdAt)) / 1000; //This will return remaining time in second
                    if (timeDiff < 300) return otp; // otp expire in 5 min
                })
            }
            oldOTP.forEach(otp => {
                if (otp.OTP === OTP) {
                    isVerified = true;
                }
            })
            if (isVerified) {
                let otpCount = user.otp?.otpCount || 0;
    
                await UserModel.findByIdAndUpdate(user._id, {
                    otp: {
                        sendOTP: [],
                        otpCount: otpCount,
                        createdAt: Date.now().toString()
                    }
                })
                status_code = 200;
                message = "Verification Success!!!";
            }
            return { isVerified, message, status_code };
        }catch (err) {
            if (err) throw new Error(`${err} at OTP.matchOTP`);
        }
    }

}

module.exports = { OTP };

