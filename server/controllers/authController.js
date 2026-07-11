const User = require("../models/User");
const BMIHistory = require("../models/BMIHistory");
const Goal = require("../models/Goal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Calorie calculator helper
const calculateDailyCalories = (user) => {
  const { weight, height, age, gender, goal } = user;
  if (!weight || !height || !age) {
    return 2000; // default fallback target
  }

  let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
  if (gender === "female") {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  const tdee = bmr * 1.375; // assume light-moderate activity
  let target = tdee;
  if (goal === "Lose Weight") {
    target -= 500;
  } else if (goal === "Gain Weight") {
    target += 500;
  }

  return Math.max(1200, Math.round(target));
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, weight, height, gender, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill name, email and password"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object structure
    const userData = {
      name,
      email,
      password: hashedPassword,
      age: age ? Number(age) : undefined,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      gender: gender || "male",
      goal: goal || "Maintain Weight",
    };

    // Auto-calculate initial target calories
    userData.targetCalories = calculateDailyCalories(userData);

    const user = await User.create(userData);

    // Save initial goal record
    await Goal.create({
      userId: user._id,
      type: user.goal,
      targetCalories: user.targetCalories,
      targetWeight: user.weight,
    });

    // Save initial BMI record if weight/height are provided
    if (user.weight && user.height) {
      const heightInMeters = user.height / 100;
      const bmi = Number((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
      const todayStr = new Date().toISOString().split("T")[0];
      await BMIHistory.create({
        userId: user._id,
        weight: user.weight,
        height: user.height,
        bmi,
        date: todayStr,
      });
    }

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        goal: user.goal,
        profilePicture: user.profilePicture,
        targetCalories: user.targetCalories,
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        goal: user.goal,
        profilePicture: user.profilePicture,
        targetCalories: user.targetCalories,
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, age, weight, height, gender, goal, profilePicture } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Capture old values to check for modifications
    const weightChanged = weight !== undefined && Number(weight) !== user.weight;
    const heightChanged = height !== undefined && Number(height) !== user.height;
    const goalChanged = goal !== undefined && goal !== user.goal;

    // Apply updates
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (age !== undefined) user.age = age === "" ? undefined : Number(age);
    if (weight !== undefined) user.weight = weight === "" ? undefined : Number(weight);
    if (height !== undefined) user.height = height === "" ? undefined : Number(height);
    if (gender !== undefined) user.gender = gender;
    if (goal !== undefined) user.goal = goal;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    // Recalculate target calories based on updated statistics
    user.targetCalories = calculateDailyCalories(user);

    await user.save();

    const todayStr = new Date().toISOString().split("T")[0];

    // Log BMI history if metrics updated
    if ((weightChanged || heightChanged) && user.weight && user.height) {
      const heightInMeters = user.height / 100;
      const bmi = Number((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
      
      // Update or create today's BMI log
      await BMIHistory.findOneAndUpdate(
        { userId, date: todayStr },
        { weight: user.weight, height: user.height, bmi },
        { upsert: true, new: true }
      );
    }

    // Log/Update Goal entry
    if (goalChanged || weightChanged) {
      await Goal.findOneAndUpdate(
        { userId },
        {
          type: user.goal,
          targetCalories: user.targetCalories,
          targetWeight: user.weight
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        goal: user.goal,
        profilePicture: user.profilePicture,
        targetCalories: user.targetCalories,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile
};