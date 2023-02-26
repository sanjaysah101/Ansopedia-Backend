const { RoleModel } = require("../models/Roles");
const { Logs } = require("../middlewares/Logs");

class RoleController {
    static createRole = async (req, res) => {
        let message, isRoleCreated = false, statusCode, status = "failed";
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
            res.status(statusCode).json([{ status, message }]);
        else {
            message = "created";
            status = "success";
            res.status(201).json([{ status, message }]);
        }
    }
}
module.exports = RoleController;