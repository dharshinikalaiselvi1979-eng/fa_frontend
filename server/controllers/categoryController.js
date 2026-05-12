const Category = require("../models/Category");

// @desc    Get categories (defaults + user specific)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [{ isDefault: true }, { user: req.user.id }]
    });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400);
      throw new Error("Category name is required");
    }

    // Check if exists
    const exists = await Category.findOne({ name, $or: [{ isDefault: true }, { user: req.user.id }] });
    if (exists) {
      res.status(400);
      throw new Error("Category already exists");
    }

    const category = await Category.create({
      user: req.user.id,
      name,
      isDefault: false
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    if (category.isDefault) {
      res.status(400);
      throw new Error("Cannot delete default category");
    }

    if (category.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error("Not authorized");
    }

    await category.deleteOne();
    res.status(200).json({ id: req.params.id, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, deleteCategory };
