const BMIHistory = require("../models/BMIHistory");

// Log BMI
const logBMI = async (req, res) => {
  try {
    const { weight, height, date } = req.body;
    const userId = req.user.id;

    if (!weight || !height || !date) {
      return res.status(400).json({ success: false, message: "Please provide weight, height, and date" });
    }

    const heightInMeters = Number(height) / 100;
    const bmi = Number((Number(weight) / (heightInMeters * heightInMeters)).toFixed(1));

    const newBMI = new BMIHistory({
      userId,
      weight: Number(weight),
      height: Number(height),
      bmi,
      date,
    });

    await newBMI.save();

    res.status(201).json({
      success: true,
      message: "BMI logged successfully",
      bmiEntry: newBMI,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get BMI History
const getBMIHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await BMIHistory.find({ userId }).sort({ date: 1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  logBMI,
  getBMIHistory,
};
