const { Helper } = require('../utils/Helper.js');
const { UserModel } = require('../models/User.js');
const { Logs } = require('../middlewares/Logs.js');
const ApiModel = require('../models/ApiModel.js');
const Enum = require('../utils/Enum.js');
const path = require('path');

class UserController {
  static verifyEmailByToken = async (req, res) => {
    const { id, token } = req.params;

    if (id && token) {
      try {
        const user = await UserModel.findById(id);
        if (user) {
          if (user.isAccountVerified) {
            return res.render(
              path.join(__dirname, '../views/congratulation.hbs'),
              {
                name: user.name,
                message: 'Your account is already verified',
              }
            );
          } else if (Helper.EmailVerificationByToken(user, token, req, res)) {
            return res.render(
              path.join(__dirname, '../views/congratulation.hbs'),
              {
                name: user.name,
                message: 'Congratulation on Account Verification',
              }
            );
          }
        } else {
          res
            .status(404)
            .json(
              ApiModel.getApiModel(Enum.status.FAILED, "Account does't exist")
            );
        }
      } catch (err) {
        Logs.errorHandler(err, req, res);
      }
    } else {
      res
        .status(404)
        .json(ApiModel.getApiModel(Enum.status.FAILED, 'Invalid request'));
    }
  };
}
module.exports = { UserController };
