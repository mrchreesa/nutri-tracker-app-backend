const authOnly = (req, res, next) => {
  if (req.cookies.user != "undefined") {
    next();
  } else {
    res.json({ msg: "Not Authed" });
  }
};

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

module.exports = {
  authOnly,
  ingredientsFactory,
};
