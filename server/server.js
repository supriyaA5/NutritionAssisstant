const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const Food = require("./models/Food");

const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const mealRoutes = require("./routes/mealRoutes");
const waterRoutes = require("./routes/waterRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const goalRoutes = require("./routes/goalRoutes");
const bmiRoutes = require("./routes/bmiRoutes");

dotenv.config({ path: path.join(__dirname, ".env") });

const seedFoods = async () => {
  try {
    const count = await Food.countDocuments();
    if (count === 0) {
      const defaultFoods = [
        { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
        { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1 },
        { name: "Oatmeal", calories: 150, protein: 6, carbs: 28, fat: 4, fiber: 4 },
        { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        { name: "Salmon (100g)", calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0 },
        { name: "White Rice (1 cup cooked)", calories: 205, protein: 4.2, carbs: 45, fat: 0.4, fiber: 0.6 },
        { name: "Greek Yogurt (100g)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
        { name: "Boiled Egg (1 large)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0 },
        { name: "Broccoli (100g)", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
        { name: "Almonds (30g)", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
        { name: "Avocado (1 medium)", calories: 240, protein: 3, carbs: 12, fat: 22, fiber: 10 },
        { name: "Sweet Potato (1 medium)", calories: 103, protein: 2.3, carbs: 24, fat: 0.2, fiber: 3.8 },
        { name: "Canned Tuna (1 can)", calories: 120, protein: 26, carbs: 0, fat: 1, fiber: 0 },
        { name: "Spinach (100g)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
        { name: "Quinoa (1 cup cooked)", calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5 }
      ];
      await Food.insertMany(defaultFoods);
      console.log("🌱 Default food database seeded successfully!");
    }
  } catch (error) {
    console.error("❌ Failed to seed default food database:", error.message);
  }
};

connectDB().then(() => {
  seedFoods();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/bmi", bmiRoutes);

app.get("/test", (req, res) => {
  res.send("Test route is working");
});

app.get("/", (req, res) => {
  res.send("Nutrition Assistant Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});