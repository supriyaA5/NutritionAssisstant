const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    age: {
      type: Number,
    },

    weight: {
      type: Number, // in kg
    },

    height: {
      type: Number, // in cm
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    goal: {
      type: String,
      enum: ["Lose Weight", "Gain Weight", "Maintain Weight"],
      default: "Maintain Weight",
    },

    profilePicture: {
      type: String,
      default: "avatar-1.png",
    },

    targetCalories: {
      type: Number,
      default: 2000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);