const { Helper } = require("../utils/Helper.js");
const { UserModel } = require("../models/User.js");
const { Logs } = require("../middlewares/Logs.js");
const ApiModel = require("../models/ApiModel.js");
const Enum = require("../utils/Enum.js");

class UserController {
    static verifyEmailByToken = async (req, res) => {
        const { id, token } = req.params;
        // console.log(token)
        if(id && token){
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
                    res.status(404).json(ApiModel.getApiModel(Enum.status.FAILED, "Account does't exist" ));
                }
            } catch (err) {
                Logs.errorHandler(err, req, res);
            }
        }else{
            res.status(404).json(ApiModel.getApiModel(Enum.status.FAILED, "Invalid request" ));
        }
    }
}
module.exports = { UserController };