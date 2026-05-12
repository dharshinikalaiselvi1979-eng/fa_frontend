const Expense = require("../models/Expense");

// @desc    Get all expenses with pagination & filters
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, month, startDate, endDate, search, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.id };

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };
    
    // Filter by month string (YYYY-MM)
    if (month) {
      const year = parseInt(month.split('-')[0]);
      const mon = parseInt(month.split('-')[1]) - 1; // 0-indexed
      const startOfMonth = new Date(year, mon, 1);
      const endOfMonth = new Date(year, mon + 1, 0, 23, 59, 59);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }
    
    // Filter by specific dates
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Expense.countDocuments(query);

    res.status(200).json({
      expenses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, paymentMethod, date, notes, recurring, tags } = req.body;

    if (!title || !amount || !category) {
      res.status(400);
      throw new Error("Please provide title, amount, and category");
    }

    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount,
      category,
      paymentMethod,
      date: date ? new Date(date) : Date.now(),
      notes,
      recurring,
      tags
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error("User not authorized");
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    if (expense.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error("User not authorized");
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id, message: "Expense deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
};