const express = require("express");
const router = express.Router();
const { logBMI, getBMIHistory } = require("../controllers/bmiController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, logBMI);
router.get("/history", authMiddleware, getBMIHistory);

module.exports = router;
