const Meal = require("../models/Meal");

// Add Meal
const addMeal = async (req, res) => {
  try {
    const { foodName, calories, protein, carbs, fat, fiber, mealType, date } = req.body;
    const userId = req.user.id;

    if (!foodName || calories === undefined || !mealType || !date) {
      return res.status(400).json({ success: false, message: "Please provide foodName, calories, mealType, and date" });
    }

    const newMeal = new Meal({
      userId,
      foodName,
      calories: Number(calories),
      protein: protein ? Number(protein) : 0,
      carbs: carbs ? Number(carbs) : 0,
      fat: fat ? Number(fat) : 0,
      fiber: fiber ? Number(fiber) : 0,
      mealType,
      date,
    });

    await newMeal.save();

    res.status(201).json({
      success: true,
      message: "Meal logged successfully",
      meal: newMeal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Meals (optional query: date)
const getMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const query = { userId };
    if (date) {
      query.date = date;
    }

    const meals = await Meal.find(query).sort({ createdAt: -1 });
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Meal
const deleteMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const meal = await Meal.findOne({ _id: req.params.id, userId });

    if (!meal) {
      return res.status(404).json({ success: false, message: "Meal not found" });
    }

    await Meal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Meal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addMeal,
  getMeals,
  deleteMeal,
};
