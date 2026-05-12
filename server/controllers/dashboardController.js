const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const mongoose = require("mongoose");

// @desc    Get summary (total expenses, budget, remaining)
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const year = parseInt(currentMonth.split('-')[0]);
    const mon = parseInt(currentMonth.split('-')[1]) - 1;
    const startOfMonth = new Date(year, mon, 1);
    const endOfMonth = new Date(year, mon + 1, 0, 23, 59, 59);

    const expenses = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
    ]);
    const totalSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;

    const budget = await Budget.findOne({ user: req.user.id, month: currentMonth });
    const monthlyBudget = budget ? budget.monthlyBudget : 0;
    
    // Highest spending category
    const categoryExpenses = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);
    const highestCategory = categoryExpenses.length > 0 ? categoryExpenses[0]._id : "N/A";

    res.status(200).json({
      totalSpent,
      monthlyBudget,
      remaining: monthlyBudget - totalSpent,
      highestCategory,
      savingsPercentage: monthlyBudget ? Math.max(0, ((monthlyBudget - totalSpent) / monthlyBudget) * 100).toFixed(2) : 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category breakdown
// @route   GET /api/dashboard/categories
// @access  Private
const getCategoriesData = async (req, res, next) => {
  try {
    const data = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", value: { $sum: "$amount" } } }
    ]);
    const formatted = data.map(d => ({ name: d._id, value: d.value }));
    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly spending trend (last 6 months)
// @route   GET /api/dashboard/monthly
// @access  Private
const getMonthlyTrend = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const data = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formatted = data.map(d => {
      const date = new Date(d._id.year, d._id.month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        year: d._id.year,
        total: d.total
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategoriesData, getMonthlyTrend };
