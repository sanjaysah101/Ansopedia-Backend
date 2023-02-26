const express = require("express");
const { NotificationController } = require("../controllers/NotificationController");
const { Auth } = require("../middlewares/AuthMiddleware");
const router = express.Router();

router.post("/", Auth.authUser, NotificationController.createNotification);
router.get("/", Auth.authUser, NotificationController.getNotification);
module.exports = router;