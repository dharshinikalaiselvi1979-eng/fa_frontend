const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// @desc    Set or update budget for a month
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { month, monthlyBudget, categoryBudgets } = req.body; // month format: "YYYY-MM"

    if (!month || !monthlyBudget) {
      res.status(400);
      throw new Error("Month and monthly budget are required");
    }

    let budget = await Budget.findOne({ user: req.user.id, month });

    if (budget) {
      budget.monthlyBudget = monthlyBudget;
      if (categoryBudgets) budget.categoryBudgets = categoryBudgets;
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user.id,
        month,
        monthlyBudget,
        categoryBudgets: categoryBudgets || []
      });
    }

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget for a month
// @route   GET /api/budgets/:month
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const { month } = req.params;
    const budget = await Budget.findOne({ user: req.user.id, month });

    if (!budget) {
      return res.status(200).json({ message: "No budget set for this month", data: null });
    }

    // Calculate spent amount to return with budget
    const year = parseInt(month.split('-')[0]);
    const mon = parseInt(month.split('-')[1]) - 1;
    const startOfMonth = new Date(year, mon, 1);
    const endOfMonth = new Date(year, mon + 1, 0, 23, 59, 59);

    const expenses = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
    ]);

    const totalSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;
    const remaining = budget.monthlyBudget - totalSpent;

    res.status(200).json({
      budget,
      totalSpent,
      remaining,
      progressPercentage: (totalSpent / budget.monthlyBudget) * 100
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { setBudget, getBudget };
