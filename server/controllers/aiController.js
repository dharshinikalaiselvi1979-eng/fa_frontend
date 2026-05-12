const { getAIResponse, generateLocalResponse, detectIntent, detectCategory, isValidKey } = require("../utils/aiHelper");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────
// Helper: load user context from MongoDB
// ─────────────────────────────────────────────────────────────
const loadUserContext = async (userId) => {
  const [user, expenses, budgetDoc] = await Promise.all([
    User.findById(userId),
    Expense.find({ user: userId }).sort({ date: -1 }).limit(100),
    Budget.findOne({ user: userId }).sort({ createdAt: -1 }),
  ]);
  return {
    userName: user ? user.name : "there",
    monthlyIncome: user ? user.monthlyIncome || 0 : 0,
    expenses: expenses.map((e) => ({ _id: e._id, title: e.title, amount: e.amount, category: e.category, date: e.date })),
    budget: budgetDoc ? budgetDoc.monthlyBudget : 0,
  };
};

// ─────────────────────────────────────────────────────────────
// @desc    AI Chat — understands intent & executes actions
// @route   POST /api/ai/chat
// @access  Private
// ─────────────────────────────────────────────────────────────
const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      res.status(400);
      throw new Error("Message is required");
    }

    const userData = await loadUserContext(req.user.id);
    const intentResult = detectIntent(message);
    let reply, action = null, actionData = null;

    // ── ACTION: Add Expense ──────────────────────────────────
    if (intentResult.intent === "add_expense") {
      const { amount, category, title } = intentResult;
      const newExpense = await Expense.create({
        user: req.user.id,
        title: title || category,
        amount,
        category,
        date: new Date(),
        paymentMethod: "Cash",
        tags: ["ai-added"],
      });

      // Build frontend-compatible expense object
      const frontendExpense = {
        id: newExpense._id.toString(),
        title: newExpense.title,
        amount: newExpense.amount,
        // Map backend category back to frontend key
        category: mapToFrontendKey(newExpense.category),
        date: newExpense.date.toISOString(),
        source: "manual",
        notes: "",
      };

      action = "expense_added";
      actionData = { expense: frontendExpense };
      reply = generateLocalResponse(message, userData, intentResult);
    }

    // ── ACTION: Set Budget ───────────────────────────────────
    else if (intentResult.intent === "set_budget") {
      const { amount } = intentResult;
      const month = new Date().toISOString().slice(0, 7); // "2025-05"

      await Budget.findOneAndUpdate(
        { user: req.user.id, month },
        { user: req.user.id, month, monthlyBudget: amount },
        { upsert: true, new: true }
      );

      action = "budget_set";
      actionData = { amount };
      reply = generateLocalResponse(message, userData, intentResult);
    }

    // ── QUERY / INFO ─────────────────────────────────────────
    else {
      // Try real AI first if key is valid
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
      if (isValidKey(apiKey)) {
        const context = `You are FIN AI, a concise personal finance assistant.
User: ${userData.userName}. Monthly budget: ₹${userData.budget}.
Recent expenses: ${userData.expenses.slice(0, 8).map((e) => `${e.title} ₹${e.amount} (${e.category})`).join(", ")}.
Answer in 2-3 sentences with specific numbers. Be friendly and emoji-rich.
User: ${message}`;
        const aiReply = await getAIResponse(context);
        if (aiReply) reply = aiReply;
      }

      if (!reply) {
        reply = generateLocalResponse(message, userData, intentResult);
      }
    }

    res.status(200).json({ reply, action, actionData });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    AI Summary
// @route   GET /api/ai/summary
// @access  Private
// ─────────────────────────────────────────────────────────────
const getSummary = async (req, res, next) => {
  try {
    const userData = await loadUserContext(req.user.id);
    const { expenses, budget } = userData;

    const catTotals = {};
    expenses.forEach((e) => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    let summary;
    if (isValidKey(apiKey)) {
      const prompt = `Provide a 3-sentence financial summary. Total spent: ₹${total}. Top categories: ${sorted.slice(0, 3).map(([k, v]) => `${k}: ₹${v}`).join(", ")}. Monthly budget: ₹${budget}.`;
      const aiReply = await getAIResponse(prompt);
      if (aiReply) summary = aiReply;
    }

    if (!summary) {
      const top = sorted[0];
      const pct = budget > 0 ? ((total / budget) * 100).toFixed(0) : 0;
      summary = `You've spent a total of ₹${total.toLocaleString("en-IN")} across ${expenses.length} transactions. ` +
        (top ? `Your biggest spending category is ${top[0]} at ₹${top[1].toLocaleString("en-IN")} (${((top[1] / total) * 100).toFixed(0)}% of all spending). ` : "") +
        `You've used ${pct}% of your ₹${budget.toLocaleString("en-IN")} monthly budget.`;
    }

    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    AI Health Score
// @route   GET /api/ai/health-score
// @access  Private
// ─────────────────────────────────────────────────────────────
const getHealthScore = async (req, res, next) => {
  try {
    const userData = await loadUserContext(req.user.id);
    const { expenses, budget, monthlyIncome } = userData;

    const now = new Date();
    const monthTotal = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);

    const income = monthlyIncome || 1;
    const ratio = monthTotal / income;
    let score = 90;
    if (ratio > 0.9) score = 28; else if (ratio > 0.7) score = 52; else if (ratio > 0.5) score = 74;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    let advice;
    if (isValidKey(apiKey)) {
      const prompt = `Financial health score: ${score}/100. Income: ₹${income}, spent ₹${monthTotal} this month. Give 2-sentence advice.`;
      const aiReply = await getAIResponse(prompt);
      if (aiReply) advice = aiReply;
    }

    if (!advice) {
      advice = score >= 80
        ? "Excellent financial health! Keep automating your savings and stay consistent."
        : score >= 55
          ? "Good progress — try reducing your top spending category by 15% next month."
          : "High spending detected. Set stricter daily limits and review subscriptions.";
    }

    res.status(200).json({ score, advice });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// Utility: Map backend Title Case → frontend lowercase key
// ─────────────────────────────────────────────────────────────
function mapToFrontendKey(backendCat) {
  const map = {
    Food: "food", Travel: "travel", Shopping: "shopping",
    Entertainment: "entertainment", Healthcare: "health",
    Bills: "bills", Education: "education", Utilities: "utilities",
    Other: "shopping", Salary: "bills", Freelance: "bills", Investments: "bills",
  };
  return map[backendCat] || "shopping";
}

module.exports = { chat, getSummary, getHealthScore };
