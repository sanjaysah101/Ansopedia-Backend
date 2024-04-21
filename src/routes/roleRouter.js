const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/RolesController")
// const checkUserAuth = require("../middlewares/auth-middleware.js");
// const { authPage } = require("../middlewares/auth-role");


//Multiple http methods per route and parameter values

// router.get("/", checkUserAuth, authPage, RoleController.getRoles);
// router.post("/", checkUserAuth, authPage, RoleController.createRole);
router.post("/", RoleController.createRole);


//Named parameter routes
// router.get("/:id", checkUserAuth, authPage, RoleController.getRole);
// router.put("/:id", checkUserAuth, authPage, RoleController.updateRole);
// router.delete("/:id", checkUserAuth, authPage, RoleController.deleteRole);


module.exports = router;