const mongoose = require("mongoose");

const IngredientsSchema = new mongoose.Schema({
  name: String,
  foodId: Number,
  imageName: String,
  calories: Number,
  protein: Number,
  polyUnsaturatedFat: Number,
  monoUnsaturatedFat: Number,
  totalFat: Number,
  carbs: Number,
  sugar: Number,
});

module.exports = mongoose.model("Ingredients", IngredientsSchema);
