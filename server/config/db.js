const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Ensure environment variables are loaded relative to the server folder
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Check if URI is empty, undefined or the default placeholder
    if (!uri || uri.trim() === "" || uri.includes("<your") || uri.includes("connection string")) {
      console.warn("⚠️  Warning: MONGO_URI in server/.env is not configured. Falling back to local MongoDB: mongodb://127.0.0.1:27017/nutrition_assistant");
      uri = "mongodb://127.0.0.1:27017/nutrition_assistant";
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(error.message);
    console.error("\nPlease check your server/.env file and ensure MongoDB is running.");
    process.exit(1);
  }
};

module.exports = connectDB;