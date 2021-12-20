const router = require("express").Router();
const Users = require("../Models/Users");
const Ingredients = require("../Models/Ingredients");
const bcrypt = require("bcrypt");

module.exports = function (database) {
  router.post("/", (req, res) => {
    const { username, password, email } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
      const newUser = new Users({
        username,
        password: hash,
        email,
      });
      newUser.save();

      res.send({ username, email });
    });
  });
  router.get("/", (req, res) => {
    const { username, email } = req.body;

    res.send({ username, email });
  });

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

  router.post("/:userId/ingredients/:ingredientId", (req, res) => {
    const userId = req.params.userId;
    const ingredientId = req.params.ingredientId;
    Ingredients.findOneAndUpdate({ foodId: ingredientId }, req.body, {
      upsert: true,
      returnDocument: "after",
    });
    Users.findByIdAndUpdate(userId, { ingredients: [ingredientId] });
  });

  router.get("/session", (req, res) => {
    const cookieData = JSON.parse(req.cookies.user);
    res.json({ cookieData });
  });

  router.delete("/session", (req, res) => {
    res.cookie("user", undefined, { httpOnly: true });
    res.json({ message: "Logged out!" });
  });

  return router;
};
