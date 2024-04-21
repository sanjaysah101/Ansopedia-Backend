const ApiModel = require("../models/ApiModel").default;

const canSendNotification = (req, res, next) => {
  const roles = req.user.roles;
  const titleList = [];
  let canSend = false;
  roles.forEach((role) => {
    titleList.push(role.title);
    if (role.title === "superadmin") {
      canSend = true;
    }
  });
  if (!canSend) {
    res
      .status(403)
      .json(
        ApiModel.getApiModel(
          Enum.status.FAILED,
          "You don't hava permission to access"
        )
      );
  } else {
    next();
  }
};

module.exports = { canSendNotification };
