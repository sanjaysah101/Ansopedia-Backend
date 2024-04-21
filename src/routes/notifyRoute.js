const express = require("express");
const { NotificationController } = require("../controllers/NotificationController");
const { canSendNotification } = require("../middlewares/RoleAuthorization")
// const { Auth } = require("../middlewares/AuthMiddleware");
const { Auth } = require("../middlewares/AuthTokenVerifyMiddleware");
const router = express.Router();

router.post("/", Auth.verifyFirebaseToken, Auth.isAccountVerified, canSendNotification, NotificationController.createNotification);
router.get("/", Auth.verifyFirebaseToken, NotificationController.getNotification);
module.exports = router;