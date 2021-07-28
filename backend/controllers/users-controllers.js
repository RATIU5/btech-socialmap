const HTTPError = require("../models/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (err) {
		return next(new HTTPError(500, `Error: Retrieving users failed; ${err}`));
	}

	res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signUserUp = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HTTPError(422, "Invalid inputs passed."));
	}
	const { name, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email });
	} catch (err) {
		return next(new HTTPError(500, `Error: Signing user up failed; ${err}`));
	}

	if (existingUser) {
		return next(new HTTPError(422, "Cannot use an email that is already in use"));
	}

	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		return next(new HTTPError(500, `Error: Signing user up failed; ${err}`));
	}

	const createdUser = new User({
		name,
		email,
		password: hashedPassword,
		image: req.file.path,
		places: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		return next(new HTTPError(500, `Error: Signing user up failed; ${err}`));
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) }); // 201 is successfully created code
};

const logUserIn = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HTTPError(422, "Invalid inputs passed."));
	}
	const { email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email });
	} catch (err) {
		return next(new HTTPError(500, `Error: Logging user in failed; ${err}`));
	}

	if (!existingUser) {
		return next(new HTTPError(401, "Failed to log user in"));
	}

	let isValidPassword = false;

	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		return next(new HTTPError(500, `Error: Logging user in failed; ${err}`));
	}

	if (!isValidPassword) {
		return next(new HTTPError(401, "Failed to log user in"));
	}

	res.status(200).json({ message: "Logged in", user: existingUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.signUserUp = signUserUp;
exports.logUserIn = logUserIn;
