const express = require("express");
const { LeadersController } = require("../controllers/LeadersController");
const { Auth } = require("../middlewares/AuthTokenVerifyMiddleware");
// const { Auth } = require("../middlewares/AuthMiddleware");
const router = express.Router();

// router.get("/", Auth.authUser, LeadersController.getLeaders);
router.get("/", Auth.verifyFirebaseToken, LeadersController.getLeaders);
module.exports = router;