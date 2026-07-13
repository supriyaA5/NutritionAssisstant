const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load local environment variables if present
dotenv.config({ path: path.join(__dirname, "../.env") });

// Helper function to safely URL-encode the password in the connection string
const encodeMongoUriPassword = (uri) => {
  if (!uri || typeof uri !== "string") return uri;

  // Split protocol
  const parts = uri.split("://");
  if (parts.length !== 2) return uri;
  const protocol = parts[0] + "://";
  const remainder = parts[1];

  // Separate host/authority from paths or query parameters
  const hostEndIndex = remainder.search(/[\/\?]/);
  const authority = hostEndIndex === -1 ? remainder : remainder.substring(0, hostEndIndex);
  const pathAndQuery = hostEndIndex === -1 ? "" : remainder.substring(hostEndIndex);

  // Separate credentials from host
  const atIndex = authority.lastIndexOf("@");
  if (atIndex === -1) return uri; // no auth credentials present

  const auth = authority.substring(0, atIndex);
  const host = authority.substring(atIndex + 1);

  // Separate username and password
  const colonIndex = auth.indexOf(":");
  if (colonIndex === -1) return uri; // no password present

  const username = auth.substring(0, colonIndex);
  const password = auth.substring(colonIndex + 1);

  // Check if password has special characters that must be URL-encoded
  // Standard reserved URL characters: : / ? # [ ] @ %
  const specialChars = /[!@#$%^&*(),.?":{}|<>+=\/]/;
  
  let isAlreadyEncoded = false;
  if (password.includes("%")) {
    try {
      isAlreadyEncoded = decodeURIComponent(password) !== password;
    } catch (e) {
      isAlreadyEncoded = false; // malformed percent encoding means it's not validly encoded
    }
  }

  if (specialChars.test(password) && !isAlreadyEncoded) {
    console.log("ℹ️ Auto-encoding special characters in MONGO_URI password...");
    const encodedPassword = encodeURIComponent(password);
    return `${protocol}${username}:${encodedPassword}@${host}${pathAndQuery}`;
  }

  return uri;
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Check if URI is empty, undefined or the default placeholder
    if (!uri || uri.trim() === "" || uri.includes("<your") || uri.includes("connection string")) {
      console.warn("⚠️  Warning: MONGO_URI in environment is not configured. Falling back to local MongoDB: mongodb://127.0.0.1:27017/nutrition_assistant");
      uri = "mongodb://127.0.0.1:27017/nutrition_assistant";
    } else {
      // Auto-repair password encoding if needed
      uri = encodeMongoUriPassword(uri);
    }

    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(error.message);
    console.error("\nPlease check your MONGO_URI environment variable and MongoDB Atlas network whitelist settings.");
    // Do NOT exit the process (process.exit(1)). Express server should keep listening to satisfy health checks/PORT requirements.
  }
};

module.exports = connectDB;