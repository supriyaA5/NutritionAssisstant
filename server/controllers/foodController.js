const Food = require("../models/Food");

// Search Food Database / Get Custom Foods
const getFoods = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query; // search query

    let query = {};
    
    if (q) {
      // Find matches case-insensitively, allowing global foods or this user's custom foods
      query = {
        name: { $regex: q, $options: "i" },
        $or: [
          { userId: null },
          { userId: userId }
        ]
      };
    } else {
      // Return custom foods of this user + some default foods
      query = {
        $or: [
          { userId: null },
          { userId: userId }
        ]
      };
    }

    const foods = await Food.find(query).limit(50);
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Custom Food to Library
const addFood = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, fiber } = req.body;
    const userId = req.user.id;

    if (!name || calories === undefined) {
      return res.status(400).json({ success: false, message: "Name and calories are required" });
    }

    // Check if food with this name already exists for the user or globally
    const existing = await Food.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      $or: [
        { userId: null },
        { userId }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "A food item with this name already exists." });
    }

    const newFood = new Food({
      name,
      calories: Number(calories),
      protein: protein ? Number(protein) : 0,
      carbs: carbs ? Number(carbs) : 0,
      fat: fat ? Number(fat) : 0,
      fiber: fiber ? Number(fiber) : 0,
      isCustom: true,
      userId,
    });

    await newFood.save();

    res.status(201).json({
      success: true,
      message: "Custom food item added to library",
      food: newFood,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Custom Food from Library
const deleteFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const food = await Food.findOne({ _id: req.params.id, userId });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Custom food item not found or unauthorized"
      });
    }

    await Food.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Custom food item deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { addFood, getFoods, deleteFood };