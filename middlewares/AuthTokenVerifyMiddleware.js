const { JWT } = require("../utils/JWT");
const { UserModel } = require("../models/User");
const ApiModel = require("../models/ApiModel").default;
const Enum = require("../utils/Enum");
class Auth {
  static verifyFirebaseToken = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      res
        .status(401)
        .json(
          ApiModel.getApiModel(
            Enum.status.FAILED,
            "Authorization Token is missing"
          )
        );
    } else if (!authorization.startsWith("Bearer")) {
      res
        .status(401)
        .json(
          ApiModel.getApiModel(
            Enum.status.FAILED,
            "token must start with Bearer"
          )
        );
    } else {
      const token = authorization.split(" ")[1];
      if (!token) {
        res
          .status(401)
          .json(ApiModel.getApiModel(Enum.status.FAILED, "token is missing"));
      } else {
        const { getAuth } = require("firebase-admin/auth");
        getAuth()
          .verifyIdToken(token)
          .then((decodedToken) => {
            req.firebaseUser = decodedToken;
            next();
          })
          .catch((error) => {
            res
              .status(401)
              .json(
                ApiModel.getApiModel(Enum.status.FAILED, "Unauthorized Access")
              );
          });
      }
    }
  };
  static isAccountVerified = async (req, res, next) => {
    req.user = await UserModel.findOne({ uid: req.firebaseUser.uid }).populate({
      path: "roles",
    });
    if (req.user) {
      // console.log(req.user)

      req.user.isAccountVerified
        ? next()
        : res
            .status(403)
            .json(
              ApiModel.getApiModel(
                Enum.status.FAILED,
                "You have not verified your email. Please verify your email to login."
              )
            );
    } else {
      res
        .status(404)
        .json(ApiModel.getApiModel(Enum.status.FAILED, "User not found"));
    }
  };
  static verifyCustomToken = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      res
        .status(401)
        .json(
          ApiModel.getApiModel(
            Enum.status.FAILED,
            "Authorization Token is missing"
          )
        );
    } else if (!authorization.startsWith("Bearer")) {
      res
        .status(401)
        .json(
          ApiModel.getApiModel(
            Enum.status.FAILED,
            "token must start with Bearer"
          )
        );
    } else {
      const token = authorization.split(" ")[1];
      if (!token) {
        res
          .status(401)
          .json(ApiModel.getApiModel(Enum.status.FAILED, "token is missing"));
      } else {
        const { message, userId, isValid } = await JWT.verifyAuthToken(token);
        // console.log(message, userId, isValid)
        if (!isValid) {
          res
            .status(404)
            .json(ApiModel.getApiModel(Enum.status.FAILED, message));
        } else {
          const user = await UserModel.findById(userId);
          // Check is Token expired;
          const tok = user.tokens.filter((t) => t.token === token);
          // console.log(tok)
          if (tok.length > 0) {
            req.user = user;
            req.token = token;
            req.status = "Success";
            next();
          } else {
            res
              .status(403)
              .json(ApiModel.getApiModel("Forbidden", "session expire"));
          }
        }
      }
    }
  };
}

module.exports = { Auth };
