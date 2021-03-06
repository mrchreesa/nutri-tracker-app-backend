const router = require("express").Router();
const bodyParser = require("body-parser");
const axios = require("axios");
const Ingredients = require("../Models/Ingredients");

const { authOnly } = require("../Libs");
require("dotenv").config();
const ingredientsFactory = (data) => {
  const nutrients = data.nutrition.nutrients;
  let newNutrients = {};
  nutrients.forEach((item, index) => {
    newNutrients[item.name] = item;
  });
  const totalFats =
    (newNutrients["Poly Unsaturated Fat"] !== undefined
      ? newNutrients["Poly Unsaturated Fat"].amount
      : 0) +
    (newNutrients["Mono Unsaturated Fat"] !== undefined
      ? newNutrients["Mono Unsaturated Fat"].amount
      : 0);
  let day = new Date();
  let dayOfWeek = { $dayOfWeek: "$date" };

  return {
    name: data.name,
    foodId: data.id,
    imageName: data.image,
    calories:
      newNutrients.Calories.amount !== undefined
        ? newNutrients.Calories.amount
        : 0,
    protein:
      newNutrients.Protein !== undefined ? newNutrients.Protein.amount : 0,
    polyUnsaturatedFat:
      newNutrients["Poly Unsaturated Fat"] !== undefined
        ? newNutrients["Poly Unsaturated Fat"].amount
        : 0,
    monoUnsaturatedFat:
      newNutrients["Mono Unsaturated Fat"] !== undefined
        ? newNutrients["Mono Unsaturated Fat"].amount
        : 0,
    totalFat: totalFats,
    carbs:
      newNutrients.Carbohydrates.amount !== undefined
        ? newNutrients.Carbohydrates.amount
        : 0,
    date: day,
  };
};

const addFoodToIngredients = (spoonacularData, res) => {
  const newFoodEntry = new Ingredients(ingredientsFactory(spoonacularData));
  return newFoodEntry.save();
};

module.exports = (db) => {
  // router.use("/", authOnly);

  // GET food from SpoonacularAPI and ADD to database
  router.post("/:foodId", (req, res) => {
    const foodId = req.params.foodId;
    axios
      .get(
        `https://api.spoonacular.com/food/ingredients/${foodId}/information?amount=1&apiKey=${process.env.API_KEY2}`
      )
      .then((response) => {
        const spoonacularData = response.data;
        Ingredients.findOne({ foodId: foodId }).then((data) => {
          if (data == undefined) {
            addFoodToIngredients(spoonacularData).then((data) => {
              res.status(201).send(data);
            });
          } else {
            const id = data._id;
            Ingredients.findByIdAndUpdate(
              id,
              ingredientsFactory(spoonacularData)
            ).then((data) => {
              res.status(201).send(data);
            });
          }
        });
      })
      .catch((err) => {
        console.log(err.message);

        res.status(400);
      });
  });

  // GET food from SpoonacularAPI
  router.get("/:foodId", (req, res) => {
    const foodId = req.params.foodId;
    axios
      .get(
        `https://api.spoonacular.com/food/ingredients/${foodId}/information?amount=1&apiKey=${process.env.API_KEY2}`
      )
      .then((data) => {
        res.send(data.data);
      });
  });

  // GET all food from database
  router.get("/", (req, res) => {
    let day = new Date();

    Ingredients.find({
      // date: {
      //   $gte: day.setDate(day.getDate() - 1),
      //   $lte: day.setDate(day.getDate() + 1),
      // },
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send(err.message);
      });
  });

  // DELETE food from the database by Id
  router.delete("/:id", (req, res) => {
    const id = req.params.id;
    Ingredients.findOneAndDelete({ _id: id })
      .then((response) => {
        res.send(response.data);
      })
      .catch((err) => {
        res.send(err.message);
      });
  });

  return router;
};
