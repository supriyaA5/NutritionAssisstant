const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Food = require("./models/Food");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

// 👉 MONGODB CODE GOES HERE
let mongoUri = process.env.MONGO_URI;
if (!mongoUri || mongoUri.trim() === "" || mongoUri.includes("<your") || mongoUri.includes("connection string")) {
  console.warn("⚠️  Warning: MONGO_URI in server/.env is not configured. Falling back to local MongoDB: mongodb://127.0.0.1:27017/nutrition_assistant");
  mongoUri = "mongodb://127.0.0.1:27017/nutrition_assistant";
}

mongoose.connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err.message));

app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// POST API (SAVE FOOD)
app.post("/api/food", async (req, res) => {
  try {
    const newFood = new Food(req.body);
    await newFood.save();
    res.json(newFood);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL FOOD
app.get("/api/food", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE FOOD
app.delete("/api/food/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});