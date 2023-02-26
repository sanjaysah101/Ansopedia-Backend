const express = require("express");
const { ContactController } = require("../controllers/ContactController");


const router = express.Router();
//Public Routes
router.post("/", ContactController.contact);

module.exports = router;