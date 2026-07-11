const express = require("express");
const router = express.Router();

const {
  addFood,
  getFoods,
  deleteFood,
} = require("../controllers/foodController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addFood);
router.get("/", authMiddleware, getFoods);
router.delete("/:id", authMiddleware, deleteFood);

module.exports = router;