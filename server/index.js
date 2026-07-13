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

// Helper function to safely URL-encode the password in the connection string
const encodeMongoUriPassword = (uri) => {
  if (!uri || typeof uri !== "string") return uri;

  const parts = uri.split("://");
  if (parts.length !== 2) return uri;
  const protocol = parts[0] + "://";
  const remainder = parts[1];

  const hostEndIndex = remainder.search(/[\/\?]/);
  const authority = hostEndIndex === -1 ? remainder : remainder.substring(0, hostEndIndex);
  const pathAndQuery = hostEndIndex === -1 ? "" : remainder.substring(hostEndIndex);

  const atIndex = authority.lastIndexOf("@");
  if (atIndex === -1) return uri;

  const auth = authority.substring(0, atIndex);
  const host = authority.substring(atIndex + 1);

  const colonIndex = auth.indexOf(":");
  if (colonIndex === -1) return uri;

  const username = auth.substring(0, colonIndex);
  const password = auth.substring(colonIndex + 1);

  const specialChars = /[!@#$%^&*(),.?":{}|<>+=\/]/;
  
  let isAlreadyEncoded = false;
  if (password.includes("%")) {
    try {
      isAlreadyEncoded = decodeURIComponent(password) !== password;
    } catch (e) {
      isAlreadyEncoded = false;
    }
  }

  if (specialChars.test(password) && !isAlreadyEncoded) {
    console.log("ℹ️ Auto-encoding special characters in MONGO_URI password...");
    const encodedPassword = encodeURIComponent(password);
    return `${protocol}${username}:${encodedPassword}@${host}${pathAndQuery}`;
  }

  return uri;
};

// 👉 MONGODB CODE GOES HERE
let mongoUri = process.env.MONGO_URI;
if (!mongoUri || mongoUri.trim() === "" || mongoUri.includes("<your") || mongoUri.includes("connection string")) {
  console.warn("⚠️  Warning: MONGO_URI in environment is not configured. Falling back to local MongoDB: mongodb://127.0.0.1:27017/nutrition_assistant");
  mongoUri = "mongodb://127.0.0.1:27017/nutrition_assistant";
} else {
  mongoUri = encodeMongoUriPassword(mongoUri);
}

mongoose.connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err.message));

app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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