const mongoose = require("mongoose");

const waterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    glasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Water", waterSchema);
