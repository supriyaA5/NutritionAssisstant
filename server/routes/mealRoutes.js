const express = require("express");
const router = express.Router();
const { addMeal, getMeals, deleteMeal } = require("../controllers/mealController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addMeal);
router.get("/", authMiddleware, getMeals);
router.delete("/:id", authMiddleware, deleteMeal);

module.exports = router;
