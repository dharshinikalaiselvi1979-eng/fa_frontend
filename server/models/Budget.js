const mongoose = require("mongoose");

const budgetSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    month: { type: String, required: true }, // e.g., "YYYY-MM"
    monthlyBudget: { type: Number, required: true },
    categoryBudgets: [
      {
        category: { type: String, required: true },
        limit: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
