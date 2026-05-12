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
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB for Seeding...");

    for (const name of defaultCategories) {
      const exists = await Category.findOne({ name, isDefault: true });
      if (!exists) {
        await Category.create({ name, isDefault: true });
        console.log(`Created default category: ${name}`);
      }
    }

    console.log("Seeding Completed.");
    process.exit();
  } catch (error) {
    console.error(`Error with seeding: ${error.message}`);
    process.exit(1);
  }
};

seedCategories();
