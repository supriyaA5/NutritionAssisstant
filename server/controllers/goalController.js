const Goal = require("../models/Goal");
const User = require("../models/User");

// Helper to calculate target calories based on BMR/TDEE
const calculateDailyCalories = (user) => {
  const { weight, height, age, gender, goal } = user;
  if (!weight || !height || !age) {
    return 2000; // default fallback target
  }

  // Mifflin-St Jeor Equation
  let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
  if (gender === "female") {
    bmr -= 161;
  } else {
    bmr += 5; // male/other default BMR offset
  }

  // Activity multiplier: light to moderate exercise (1.375)
  const tdee = bmr * 1.375;

  let target = tdee;
  if (goal === "Lose Weight") {
    target -= 500;
  } else if (goal === "Gain Weight") {
    target += 500;
  }

  return Math.max(1200, Math.round(target));
};

// Get User Goal
const getGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    let goal = await Goal.findOne({ userId }).sort({ createdAt: -1 });

    if (!goal) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      
      // Create a default goal if none exists
      goal = new Goal({
        userId,
        type: user.goal || "Maintain Weight",
        targetCalories: user.targetCalories || 2000,
        targetWeight: user.weight || 70,
      });
      await goal.save();
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Goal
const updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, targetWeight } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: "Goal type is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update goal on user first
    user.goal = type;
    if (targetWeight) {
      user.weight = Number(targetWeight); // update current weight or keep target
    }

    // Calculate new target calories
    const targetCalories = calculateDailyCalories(user);
    user.targetCalories = targetCalories;
    await user.save();

    // Log in goals collection
    let goal = await Goal.findOne({ userId });
    if (goal) {
      goal.type = type;
      goal.targetCalories = targetCalories;
      if (targetWeight) goal.targetWeight = Number(targetWeight);
      await goal.save();
    } else {
      goal = new Goal({
        userId,
        type,
        targetCalories,
        targetWeight: targetWeight ? Number(targetWeight) : user.weight,
      });
      await goal.save();
    }

    res.status(200).json({
      success: true,
      message: "Goal updated and calories auto-calculated!",
      goal,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        targetCalories: user.targetCalories,
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGoal,
  updateGoal,
  calculateDailyCalories,
};
