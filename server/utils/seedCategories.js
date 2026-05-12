const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/Category");

dotenv.config();

const defaultCategories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Education",
  "Entertainment",
  "Healthcare",
  "Investments",
  "Salary",
  "Freelance",
  "Other"
];

const seedCategories = async () => {
  try {
    for (const name of defaultCategories) {
      const exists = await Category.findOne({ name, isDefault: true });
      if (!exists) {
        await Category.create({ name, isDefault: true });
        console.log(`Created default category: ${name}`);
      }
    }
    console.log("Category seeding checked.");
  } catch (error) {
    console.error(`Error with seeding: ${error.message}`);
  }
};

module.exports = seedCategories;
