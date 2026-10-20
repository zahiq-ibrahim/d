
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/user/userController");

const router = express.Router();

router.get("/me", authMiddleware, userController.getMe);

module.exports = router;
