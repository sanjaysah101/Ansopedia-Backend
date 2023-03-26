const express = require("express");
const { NotificationController } = require("../controllers/NotificationController");
// const { Auth } = require("../middlewares/AuthMiddleware");
const { Auth } = require("../middlewares/AuthTokenVerifyMiddleware");
const router = express.Router();

// router.post("/", Auth.verifyFirebaseToken, Auth.isAccountVerified, NotificationController.createNotification);
router.get("/", Auth.verifyFirebaseToken, NotificationController.getNotification);
module.exports = router;