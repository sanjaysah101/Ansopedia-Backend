const { RoleModel } = require("../models/Roles");
const { Logs } = require("../middlewares/Logs");
const ApiModel = require("../models/ApiModel").default;
const Enum = require("../utils/Enum");

class RoleController {
  static createRole = async (req, res) => {
    let message,
      isRoleCreated = false,
      statusCode;
    const { title, description } = req.body;
    if (title && description) {
      try {
        const isRoleExist = await RoleModel.findOne({ title });
        if (isRoleExist) {
          statusCode = 403;
          message = "Role already exists";
        } else {
          const newRole = new RoleModel({ title, description });
          await newRole.save();
          isRoleCreated = true;
        }
      } catch (error) {
        Logs.errorHandler(error, req, res);
        statusCode = 500;
        message = "something went wrong";
      }
    } else {
      statusCode = 401;
      message = "All fields are required";
    }
    if (!isRoleCreated)
      res
        .status(statusCode)
        .json(ApiModel.getApiModel(Enum.status.SUCCESS, message));
    else {
      res
        .status(201)
        .json(ApiModel.getApiModel(Enum.status.SUCCESS, "created"));
    }
  };
}
module.exports = RoleController;
