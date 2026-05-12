const mongoose = require("mongoose");

const goalSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    color: { type: String, default: "#3b82f6" }, // To look good on UI
    status: { type: String, enum: ["In Progress", "Completed"], default: "In Progress" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
