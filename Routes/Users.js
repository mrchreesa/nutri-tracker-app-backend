const router = require("express").Router();
const Users = require("../Models/Users");
const bcrypt = require("bcrypt");

module.exports = function (database) {
	// Register User
	router.post("/", async (req, res) => {
		try {
			const { username, password, email } = req.body;
			if (!username || !password || !email) {
				return res.status(400).json({ message: "Missing required fields" });
			}
			if (password.length < 6) {
				return res.status(400).json({ message: "Password must be at least 6 characters" });
			}
			const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
			if (existingUser) {
				return res.status(409).json({ message: "Username or email already taken" });
			}
			const hash = await bcrypt.hash(password, 10);
			const newUser = new Users({ username, password: hash, email });
			await newUser.save();
			const userData = { username, email };
			res.cookie("user", JSON.stringify(userData), {
				httpOnly: true,
				sameSite: "none",
				secure: true,
				maxAge: 86400000,
			});
			res.status(201).json(userData);
		} catch (error) {
			console.error("Registration error:", error);
			res.status(500).json({ message: "Failed to register user" });
		}
	});

	// Check Session
	router.get("/session", (req, res) => {
		if (req.cookies.user) {
			res.json(JSON.parse(req.cookies.user));
		} else {
			res.status(401).json({ message: "Not logged in" });
		}
	});

	// Get User by Username
	router.get("/:username", (req, res) => {
		Users.find({ username: req.params.username })
			.populate({ path: "ingredients.ingredient", model: "Ingredients" })
			.then((response) => res.status(200).json(response))
			.catch((err) => res.status(500).json({ message: err.message }));
	});

	// Login
	router.post("/session", async (req, res) => {
		try {
			const { email, password } = req.body;
			const user = await Users.findOne({ email });
			if (!user) {
				return res.status(401).json({ message: "Invalid user" });
			}
			const isPasswordCorrect = await bcrypt.compare(password, user.password);
			if (!isPasswordCorrect) {
				return res.status(401).json({ message: "Incorrect credentials" });
			}
			const userData = { username: user.username, email };
			res.cookie("user", JSON.stringify(userData), {
				httpOnly: true,
				sameSite: "none",
				secure: true,
				maxAge: 86400000,
			});
			res.json(userData);
		} catch (error) {
			console.error("Login error:", error);
			res.status(500).json({ message: "Failed to log in" });
		}
	});

	// Logout
	router.delete("/session", (req, res) => {
		console.log("Logout requested");
		res.cookie("user", undefined, {
			httpOnly: true,
			sameSite: "none",
			secure: true,
			maxAge: 0,
		});
		res.json({ message: "Logged out!" });
	});

	return router;
};
