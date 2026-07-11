const Exercise = require("../models/Exercise");

// Log Exercise
const addExercise = async (req, res) => {
  try {
    const { name, duration, caloriesBurned, date } = req.body;
    const userId = req.user.id;

    if (!name || !duration || !caloriesBurned || !date) {
      return res.status(400).json({ success: false, message: "Please provide name, duration, caloriesBurned, and date" });
    }

    const newExercise = new Exercise({
      userId,
      name,
      duration: Number(duration),
      caloriesBurned: Number(caloriesBurned),
      date,
    });

    await newExercise.save();

    res.status(201).json({
      success: true,
      message: "Exercise logged successfully",
      exercise: newExercise,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Exercises
const getExercises = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const query = { userId };
    if (date) {
      query.date = date;
    }

    const exercises = await Exercise.find(query).sort({ createdAt: -1 });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Exercise
const deleteExercise = async (req, res) => {
  try {
    const userId = req.user.id;
    const exercise = await Exercise.findOne({ _id: req.params.id, userId });

    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise log not found" });
    }

    await Exercise.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Exercise deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addExercise,
  getExercises,
  deleteExercise,
};
