const express = require("express");
const router = express.Router();
const { addExercise, getExercises, deleteExercise } = require("../controllers/exerciseController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addExercise);
router.get("/", authMiddleware, getExercises);
router.delete("/:id", authMiddleware, deleteExercise);

module.exports = router;
