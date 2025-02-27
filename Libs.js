const authOnly = (req, res, next) => {
	if (req.cookies.user != "undefined") {
		next();
	} else {
		res.json({ msg: "Not Authed" });
	}
};

const ingredientsFactory = (data) => {
	const nutrients = data.nutrition?.nutrients || [];
	let newNutrients = {};
	nutrients.forEach((item) => {
		newNutrients[item.name] = item;
	});
	const polyUnsaturatedFat = newNutrients["Poly Unsaturated Fat"]?.amount || 0;
	const monoUnsaturatedFat = newNutrients["Mono Unsaturated Fat"]?.amount || 0;
	const totalFats = polyUnsaturatedFat + monoUnsaturatedFat;
	let day = new Date();
	let dayOfWeek = { $dayOfWeek: "$date" };

	return {
		name: data.name || "Unknown",
		foodId: Number(data.id) || 0,
		imageName: data.image || "",
		calories: newNutrients["Calories"]?.amount || 0,
		protein: newNutrients["Protein"]?.amount || 0,
		polyUnsaturatedFat: polyUnsaturatedFat,
		monoUnsaturatedFat: monoUnsaturatedFat,
		totalFat: totalFats,
		carbs: newNutrients["Carbohydrates"]?.amount || 0,
		sugar: newNutrients["Sugar"]?.amount || 0,
		date: new Date(),
	};
};

module.exports = {
	authOnly,
	ingredientsFactory,
};
