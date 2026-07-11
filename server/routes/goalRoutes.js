const express = require("express");
const router = Router = express.Router();
const { getGoal, updateGoal } = require("../controllers/goalController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getGoal);
router.post("/", authMiddleware, updateGoal);

module.exports = router;
