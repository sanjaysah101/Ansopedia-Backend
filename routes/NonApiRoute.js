const express = require("express");
const { UserController } = require("../controllers/UserController");
const { Assets } = require("../utils/Assets");
const { Auth } = require("../middlewares/AuthMiddleware");
const router = express.Router();

router.get("/user/verify/:id/:token", UserController.verifyEmailByToken);
router.get("/", (req, res) => {
    res.render("accountVerification", {name: "Sanjay Kumar Sah", otp: "Your OTP"});
})
// router.get("/images/:avatar", Assets.getAvatar);
router.get("/images/:imageURI?", Assets.getImage);
router.post("/images", Auth.authUser, Assets.fileUpload);

module.exports = router;