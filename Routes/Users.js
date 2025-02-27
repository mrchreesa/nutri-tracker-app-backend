const router = require("express").Router();
const Users = require("../Models/Users");
const Ingredients = require("../Models/Ingredients");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { authOnly, ingredientsFactory } = require("../Libs");
const { post } = require("./Ingredients");
const addFoodToIngredients = (spoonacularData, res) => {
	const newFoodEntry = new Ingredients(ingredientsFactory(spoonacularData));
	return newFoodEntry.save();
};
const dotenv = require("dotenv");
dotenv.config();
module.exports = function (database) {
	//GET current user/session
	router.get("/session", (req, res) => {
		if (req.cookies.user) {
			const cookieData = JSON.parse(req.cookies.user);
			res.json(cookieData);
		} else {
			res.status(401).json({ message: "not logged in!" });
			return;
		}
	});

	//GET User by Id
	router.get("/:username", (req, res) => {
		Users.find({
			username: req.params.username,
		})
			.populate({
				path: "ingredients.ingredient",
				model: Ingredients,
			})
			.then((response) => {
				res.status(200).send(response);
			});
		//res.send({ username, email });
	});

	// Register User
	router.post("/", (req, res) => {
		const { username, password, email } = req.body;
		if (password.length >= 6) {
			bcrypt.hash(password, 10).then((hash) => {
				const newUser = new Users({
					username,
					password: hash,
					email,
				});

				const validation = () => {
					newUser
						.validate()
						.then(() => {
							console.log("Validation passed.");
							newUser
								.save()
								.then(() => console.log("Saved successfully."))
								.catch(() => console.log("Saving failed."));
							res.cookie("user", JSON.stringify({ username, email }), {
								httpOnly: true,
								sameSite: "none",
								secure: true,
								maxAge: 86400000,
							});
							res.send({ username, email });
						})
						.catch(() => {
							res.status(401).send("User Validation failed.");
							console.log("Validation failed.");
						});
				};
				validation();
			});
		} else {
			res.status(500).send("Invalid Credentials");
		}
	});

	// GET food in User's profile
	router.get("/:username/ingredients/:ingredientId", (req, res) => {
		const username = req.params.username;
		const ingredientId = req.params.ingredientId;

		Users.find({
			username: username,
		})
			.then((data) => {
				res.send(data);
				console.log(data);
			})
			.catch((err) => {
				res.send(err.message);
			});
	});

	//POST food in User's profile
	router.post("/:username/ingredients/:ingredientId", (req, res) => {
		const ingredientId = req.params.ingredientId;
		const username = req.params.username;

		axios
			.get(`https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&apiKey=${process.env.API_KEY2}`)
			.then((response) => {
				const spoonacularData = response.data;
				Ingredients.findOne({ foodId: ingredientId }).then((data) => {
					console.log(data);
					if (data == undefined || null) {
						addFoodToIngredients(spoonacularData).then((data) => {
							Ingredients.findOneAndUpdate({ foodId: ingredientId }, req.body, {
								returnDocument: "after",
							})
								.then((data) => {
									console.log(data);

									Users.findOneAndUpdate(
										{ username: username },
										{
											$push: {
												ingredients: {
													ingredient: data._id,
													date: new Date(),
												},
											},
										}
									).then((response) => {
										res.status(201).send("User updated successfully" + response);
									});
								})

								.catch((error) => {
									console.log(error);
								});
						});
					} else {
						const id = data._id;
						Ingredients.findByIdAndUpdate(id, ingredientsFactory(spoonacularData, username)).then((response) => {
							console.log(response);
							Ingredients.findOneAndUpdate({ foodId: ingredientId }, req.body, {
								returnDocument: "after",
							})
								.then((data) => {
									console.log(data);

									Users.findOneAndUpdate(
										{ username: username },
										{
											$push: {
												ingredients: {
													ingredient: data._id,
													date: new Date(),
												},
											},
										}
									).then((response) => {
										res.status(201).send("User updated successfully" + response);
									});
								})

								.catch((error) => {
									console.log(error, "asdqwd");
								});
						});
					}
				});
			})
			.catch((err) => {
				console.log(err.message);

				res.status(400);
			});

		// Restrcuture spoonacular API object from client here.
	});
	//DELETE session/log out
	router.delete("/session", (req, res) => {
		res.cookie("user", undefined, { httpOnly: true });
		res.json({ message: "Logged out!" });
	});

	//DELETE food in User's profile
	router.patch("/:username/ingredients/:foodEntryId", (req, res) => {
		const { foodEntryId, username } = req.params;

		Users.findOneAndUpdate(
			{ username: username },
			{
				$pull: { ingredients: { _id: foodEntryId } },
			},
			{ new: true }
		)
			.then((response) => {
				res.send(response);

				// const newResponse = response.ingredients;
				// Users.findOne(newResponse)
				//   .then((response) => {
				//     console.log(response);
				//   })
				//   .catch((err) => {
				//     res.send(err.message);
				//   });
			})

			.catch((err) => {
				res.send(err.message);
			});
	});

	//Create session/log in
	router.post("/session", (req, res) => {
		const { password, email } = req.body;

		Users.find({ email }).then((attemptedLoginUserData) => {
			if (attemptedLoginUserData.length) {
				const foundUser = attemptedLoginUserData[0];
				bcrypt.compare(password, foundUser.password).then((isPasswordCorrect) => {
					if (isPasswordCorrect) {
						const userData = { username: foundUser.username, email };
						res.cookie("user", JSON.stringify(userData), {
							httpOnly: true,
							sameSite: "none",
							secure: true,
							maxAge: 86400000,
						});
						res.send(userData);
						console.log(userData);
					} else {
						res.status(401).send("Incorrect credentials");
					}
				});
			} else {
				res.status(401).send("Invalid User");
			}
		});
	});

	return router;
};
