const express = require("express");
const { AuthController } = require("../controllers/AuthController");
const { Auth } = require("../middlewares/AuthTokenVerifyMiddleware");
const { Assets } = require("../utils/Assets");

const router = express.Router();
// Public Routes
router.get("/sign-in-with-google", Auth.verifyFirebaseToken, AuthController.sign_in_with_google);
router.post("/register", AuthController.createUserWithEmailAndPassword);
// router.get("/verify/:id/:token", UserController.verifyEmailByToken);
router.post("/login", AuthController.signInWithEmailAndPassword);
// router.post("/send-reset-password-email", UserController.sendResetPasswordEmail);
// router.post("/verify-otp", UserController.verifyOTP);
router.post("/changepassword", Auth.verifyFirebaseToken, Auth.isAccountVerified, AuthController.changeUserPassword);

// // Protected Routes
router.get("/", Auth.verifyFirebaseToken, Auth.isAccountVerified, AuthController.getUser);
// router.post("/logout", Auth.authUser, UserController.logout);
router.put("/", Auth.verifyFirebaseToken, Auth.isAccountVerified, AuthController.updateUser);
router.put("/avatar", Auth.verifyFirebaseToken, Auth.isAccountVerified, Assets.profileUpload, AuthController.UpdateAvatar);
router.get("/avatar", Auth.verifyFirebaseToken, Auth.isAccountVerified, Assets.getFile);


module.exports = router;