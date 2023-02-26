const express = require("express");
const { UserController } = require("../controllers/userController.js");
const { Auth } = require("../middlewares/AuthMiddleware");
const { Assets } = require("../utils/Assets");

const router = express.Router();
// Public Routes
router.post("/register", UserController.registration);
router.get("/verify/:id/:token", UserController.verifyEmailByToken);
router.post("/login", UserController.userLogin);
router.post("/send-reset-password-email", UserController.sendResetPasswordEmail);
router.post("/verify-otp", UserController.verifyOTP);

// Protected Routes
router.get("/", Auth.authUser, UserController.getUser);
router.post("/logout", Auth.authUser, UserController.logout);
router.put("/", Auth.authUser, UserController.updateUser);
router.put("/avatar", Auth.authUser, Assets.profileUpload, UserController.UpdateAvatar);
router.get("/avatar", Auth.authUser, Assets.getFile);
router.post("/changepassword", Auth.authUser, UserController.changeUserPassword);

module.exports = router;