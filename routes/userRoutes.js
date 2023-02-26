const express = require("express");
const { UserController } = require("../controllers/userController.js");
const { Auth } = require("../middlewares/AuthMiddleware");
const { Assets } = require("../utils/Assets");

const router = express.Router();
// Public Routes
router.post("/register", UserController.registration);
router.get("/verify/:id/:token", UserController.verifyAccountByToken);
router.post("/login", UserController.userLogin);

// Protected Routes
router.get("/", Auth.auth, UserController.getUser);
router.post("/logout", Auth.auth, UserController.logout);
router.put("/", Auth.auth, UserController.updateUser);
router.put("/avatar", Auth.auth, Assets.profileUpload, UserController.UpdateAvatar);
router.get("/avatar", Auth.auth, Assets.getFile);

module.exports = router;