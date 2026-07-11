const Water = require("../models/Water");

// Get Water Log for a Date
const getWaterByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    let waterLog = await Water.findOne({ userId, date });
    if (!waterLog) {
      // Return 0 if not logged yet
      return res.status(200).json({ userId, date, glasses: 0 });
    }

    res.status(200).json(waterLog);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update/Log Water
const updateWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, glasses } = req.body;

    if (!date || glasses === undefined) {
      return res.status(400).json({ success: false, message: "Date and glasses are required" });
    }

    let waterLog = await Water.findOne({ userId, date });

    if (waterLog) {
      waterLog.glasses = Math.max(0, Number(glasses));
      await waterLog.save();
    } else {
      waterLog = new Water({
        userId,
        date,
        glasses: Math.max(0, Number(glasses)),
      });
      await waterLog.save();
    }

    res.status(200).json({
      success: true,
      message: "Water log updated successfully",
      water: waterLog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Water Logs (for range, e.g., weekly)
const getWaterLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const logs = await Water.find({ userId }).sort({ date: 1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWaterByDate,
  updateWater,
  getWaterLogs,
};
