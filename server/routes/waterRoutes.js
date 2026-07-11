const express = require("express");
const router = express.Router();
const { getWaterByDate, updateWater, getWaterLogs } = require("../controllers/waterController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getWaterByDate);
router.post("/", authMiddleware, updateWater);
router.get("/history", authMiddleware, getWaterLogs);

module.exports = router;
