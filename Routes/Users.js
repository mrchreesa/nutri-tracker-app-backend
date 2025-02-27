const router = require("express").Router();
const Users = require("../Models/Users");
const Ingredients = require("../Models/Ingredients");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { ingredientsFactory } = require("../Libs"); // Assuming this exists in your project

module.exports = function (database) {
	// GET current user/session
	router.get("/session", (req, res) => {
		if (req.cookies.user) {
			res.json(JSON.parse(req.cookies.user));
		} else {
			res.status(401).json({ message: "Not logged in" });
		}
	});

	// GET user by username

	router.get("/:username", async (req, res) => {
		try {
			const { username } = req.params;
			if (!username || username === "undefined") {
				return res.status(400).json({ message: "Invalid username" });
			}
			const user = await Users.find({ username }).populate({
				path: "ingredients.ingredient",
				model: "Ingredients",
			});
			if (!user.length) {
				return res.status(404).json({ message: "User not found" });
			}
			res.status(200).json(user);
		} catch (error) {
			console.error("Error fetching user:", error);
			res.status(500).json({ message: "Failed to fetch user" });
		}
	});

	// Register user
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

	// GET food in user's profile
	router.get("/:username/ingredients/:ingredientId", async (req, res) => {
		try {
			const { username, ingredientId } = req.params;
			const user = await Users.findOne({ username }).populate({
				path: "ingredients.ingredient",
				model: "Ingredients",
			});
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			// Optionally filter ingredients by ingredientId if needed
			res.status(200).json(user);
		} catch (error) {
			console.error("Error fetching user ingredients:", error);
			res.status(500).json({ message: "Failed to fetch ingredients" });
		}
	});

	// POST food to user's profile
	router.post("/:username/ingredients/:ingredientId", async (req, res) => {
		try {
			const { username, ingredientId } = req.params;

			if (!username || username === "undefined") {
				return res.status(400).json({ message: "Invalid username" });
			}

			const user = await Users.findOne({ username });
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			let ingredient = await Ingredients.findOne({ foodId: ingredientId });
			if (!ingredient) {
				try {
					const response = await axios.get(`https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&apiKey=${process.env.SPOONACULAR_API_KEY}`);
					const spoonacularData = response.data;
					ingredient = new Ingredients(ingredientsFactory(spoonacularData));
					await ingredient.save();
				} catch (apiError) {
					console.error("Spoonacular API error:", apiError);
					return res.status(500).json({ message: "Failed to fetch ingredient data from Spoonacular API" });
				}
			}

			await Users.findOneAndUpdate(
				{ username },
				{
					$push: {
						ingredients: {
							ingredient: ingredient._id,
							date: new Date(),
						},
					},
				},
				{ new: true }
			);

			res.status(201).json({ message: "Ingredient added successfully" });
		} catch (error) {
			console.error("Error adding ingredient:", error);
			res.status(500).json({ message: "Failed to add ingredient", error: error.message });
		}
	});

	// DELETE session/logout
	router.delete("/session", (req, res) => {
		res.cookie("user", undefined, {
			httpOnly: true,
			sameSite: "none",
			secure: true,
			maxAge: 0,
		});
		res.json({ message: "Logged out!" });
	});

	// DELETE food from user's profile
	router.patch("/:username/ingredients/:foodEntryId", async (req, res) => {
		try {
			const { username, foodEntryId } = req.params;

			const user = await Users.findOneAndUpdate(
				{ username },
				{
					$pull: { ingredients: { _id: foodEntryId } },
				},
				{ new: true }
			);

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			res.status(200).json(user);
		} catch (error) {
			console.error("Error removing ingredient:", error);
			res.status(500).json({ message: "Failed to remove ingredient" });
		}
	});

	// Create session/login
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
				path: "/",
				maxAge: 86400000,
			});
			res.json(userData);
		} catch (error) {
			console.error("Login error:", error);
			res.status(500).json({ message: "Failed to log in" });
		}
	});

	return router;
};
