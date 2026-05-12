const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    paymentMethod: { type: String, default: "Cash" },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String },
    recurring: { type: Boolean, default: false },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);