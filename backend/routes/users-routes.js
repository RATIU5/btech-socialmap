const express = require("express");
const router = express.Router();
const usersControllers = require("../controllers/users-controllers");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");

router.get("/", usersControllers.getUsers);

router.post(
	"/signup",
	fileUpload.single("image"),
	[
		check("name").not().isEmpty(),
		check("email").normalizeEmail().isEmail(),
		check("password").isLength({ min: 6 }),
	],
	usersControllers.signUserUp
);

router.post(
	"/login",
	[check("email").normalizeEmail().isEmail(), check("password").isLength({ min: 6 })],
	usersControllers.logUserIn
);

module.exports = router;
