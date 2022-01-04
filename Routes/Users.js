const router = require("express").Router();
const Users = require("../Models/Users");
const Ingredients = require("../Models/Ingredients");
const bcrypt = require("bcrypt");

module.exports = function (database) {
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

                expiresIn: 86400,
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

  //GET User by Id
  router.get("/:userId", (req, res) => {
    Users.find({
      _id: req.params.userId,
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

  // GET food in User's profile
  router.get("/:userId/ingredients/:ingredientId", (req, res) => {
    const userId = req.params.userId;
    const ingredientId = req.params.ingredientId;
    Ingredients.find({
      _id: ingredientId,
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
  router.post("/:userId/ingredients/:ingredientId", (req, res) => {
    const userId = req.params.userId;
    const ingredientId = req.params.ingredientId;
    Ingredients.findOneAndUpdate({ foodId: ingredientId }, req.body, {
      returnDocument: "after",
    })
      .then((data) => {
        console.log(data);

        Users.findByIdAndUpdate(userId, { ingredients: [data._id] }).then(
          (response) => {
            console.log(response);
            res.status(201).send("User updated successfully");
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
    // Restrcuture spoonacular API object from client here.

    console.log();
  });

  //Create session/log in
  router.post("/session", (req, res) => {
    const { password, email } = req.body;

    Users.find({ email }).then((attemptedLoginUserData) => {
      if (attemptedLoginUserData.length) {
        const foundUser = attemptedLoginUserData[0];
        bcrypt
          .compare(password, foundUser.password)
          .then((isPasswordCorrect) => {
            if (isPasswordCorrect) {
              const userData = { username: foundUser.username, email };
              res.cookie("user", JSON.stringify(userData), {
                httpOnly: true,

                expiresIn: 86400,
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

  //GET current user/session
  router.get("/session", (req, res) => {
    // if (req.cookies.user == "undefined" || req.cookies.user == undefined) {
    //   res.status(401).json({ message: "not logged in!" });
    //   return;
    // }
    if (req.cookies.user) {
      const cookieData = JSON.parse(req.cookies.user);
      res.json(cookieData);
    } else {
      res.status(401).json({ message: "not logged in!" });
      return;
    }
  });

  //DELETE session/log out
  router.delete("/session", (req, res) => {
    res.cookie("user", undefined, { httpOnly: true });
    res.json({ message: "Logged out!" });
  });

  return router;
};
