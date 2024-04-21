const express = require("express");
const { StreamController } = require("../controllers/Contents/StreamController");
const { Auth } = require("../middlewares/AuthTokenVerifyMiddleware");

const router = express.Router();
//Public Routes
// router.post("/:branch?", contentsController.createContent);
router.post("/:stream?/:branch?/:subject?/:chapter?", Auth.verifyFirebaseToken, Auth.isAccountVerified, StreamController.addStream);
// router.put("/:id", contentsController.updatestream);
// router.get("/:stream", contentsController.getStream);
router.get("/:stream?/:branch?/:subject?/:chapter?", StreamController.getStream);

module.exports = router;