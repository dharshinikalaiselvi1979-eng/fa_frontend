const axios = require("axios");

// ─────────────────────────────────────────────────────────────
// CATEGORY MAPS
// ─────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  Food:          /food|eat|meal|swiggy|zomato|restaurant|cafe|pizza|burger|dominos|kfc|mcdonald|lunch|dinner|breakfast|snack|chai|coffee|biryani|dosa/i,
  Travel:        /travel|uber|ola|metro|train|flight|petrol|fuel|bus|cab|auto|rapido|commute|ride/i,
  Entertainment: /entertainment|netflix|spotify|movie|cinema|prime|hotstar|game|concert|show|amazon prime|zee5/i,
  Utilities:     /utilities|electricity|water|gas|wifi|internet|broadband|bill|recharge|phone/i,
  Healthcare:    /health|pharmacy|hospital|doctor|medicine|gym|clinic|medic|apollo|pharmeasy/i,
  Shopping:      /shopping|amazon|flipkart|myntra|shop|mall|store|clothes|dress|shoes|purchase/i,
  Education:     /education|course|udemy|coursera|book|college|tuition|school|class|study/i,
  Bills:         /rent|emi|loan|insurance|tax|maintenance|society|subscription/i,
};

const CATEGORY_LABELS = Object.keys(CATEGORY_KEYWORDS); // ["Food","Travel",...]

const detectCategory = (text) => {
  for (const [cat, regex] of Object.entries(CATEGORY_KEYWORDS)) {
    if (regex.test(text)) return cat;
  }
  return "Shopping"; // default
};

// ─────────────────────────────────────────────────────────────
// INTENT DETECTION
// Returns: { intent, ...extracted }
// ─────────────────────────────────────────────────────────────
const detectIntent = (msg) => {
  const t = msg.toLowerCase().trim();

  // ── ADD EXPENSE ───────────────────────────────────────────
  // "add 500 food", "spent 300 on uber", "add swiggy 450 food",
  // "I spent 200 on coffee", "add expense 1000 rent", "add ₹800 for shopping"
  const addMatch =
    t.match(/(?:add|spent|spend|paid|pay|bought|expense)[^\d]*[₹rs\.]?\s*(\d+[\d,]*)\s*(?:on|for|in|-)?\s*(.+)?/i) ||
    t.match(/[₹rs\.]?\s*(\d+[\d,]*)\s*(?:on|for|in)\s+(.+)/i);

  if (addMatch && !t.includes("budget") && !t.includes("limit")) {
    const rawAmount = addMatch[1].replace(/,/g, "");
    const amount = parseFloat(rawAmount);
    const rest = (addMatch[2] || "").trim();
    if (amount > 0) {
      const category = detectCategory(rest || msg);
      // derive a title: use meaningful keywords or fallback to category
      let title = rest.split(/\s+/).slice(0, 4).join(" ") || category;
      title = title.charAt(0).toUpperCase() + title.slice(1);
      return { intent: "add_expense", amount, category, title };
    }
  }

  // ── SET BUDGET ────────────────────────────────────────────
  // "set budget 20000", "my budget is 30000", "change budget to 25000", "budget 15000"
  const budgetMatch = t.match(/(?:set|change|update|my)?\s*(?:monthly\s+)?budget\s*(?:to|is|=|:)?\s*[₹rs\.]?\s*(\d+[\d,]*)/i) ||
                     t.match(/[₹rs\.]?\s*(\d+[\d,]*)\s*(?:is|as|for)?\s*(?:my\s+)?(?:monthly\s+)?budget/i);
  if (budgetMatch) {
    const amount = parseFloat(budgetMatch[1].replace(/,/g, ""));
    if (amount > 0) return { intent: "set_budget", amount };
  }

  // ── QUERY INTENTS ─────────────────────────────────────────
  if (/(?:how much|total|spent|spending)\s+(?:on|in|for)\s+(\w+)/i.test(t)) {
    const catMatch = t.match(/(?:on|in|for)\s+(\w+)/i);
    const cat = catMatch ? detectCategory(catMatch[1]) : null;
    return { intent: "category_spending", category: cat };
  }
  if (/top|most|highest|biggest|max/i.test(t)) return { intent: "top_category" };
  if (/budget|limit|remain|left/i.test(t)) return { intent: "budget_status" };
  if (/total|spent|how much|all expense/i.test(t)) return { intent: "total_spending" };
  if (/category|breakdown|split/i.test(t)) return { intent: "categories" };
  if (/save|saving|reduce|tip|advice|suggest/i.test(t)) return { intent: "savings" };
  if (/recurring|subscription|repeat/i.test(t)) return { intent: "recurring" };
  if (/score|health|financial health/i.test(t)) return { intent: "health_score" };
  if (/trend|month|monthly|last month/i.test(t)) return { intent: "trend" };
  if (/hi|hello|hey|help|start|what can/i.test(t)) return { intent: "greeting" };
  if (/show|list|recent|transaction|expense/i.test(t)) return { intent: "list_expenses" };

  return { intent: "general" };
};

// ─────────────────────────────────────────────────────────────
// SMART LOCAL RESPONSE GENERATOR
// ─────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const generateLocalResponse = (message, userData, intentResult) => {
  const { userName, expenses, budget, monthlyIncome } = userData;
  const { intent } = intentResult;
  const firstName = userName ? userName.split(" ")[0] : "there";
  const now = new Date();

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = Math.max(0, budget - monthTotal);
  const budgetPct = budget > 0 ? ((monthTotal / budget) * 100).toFixed(0) : 0;

  const catTotals = {};
  expenses.forEach((e) => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0];

  const merchantCount = {};
  expenses.forEach((e) => { merchantCount[e.title] = (merchantCount[e.title] || 0) + 1; });
  const recurring = Object.entries(merchantCount).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);

  switch (intent) {
    case "add_expense": {
      const { amount, category, title } = intentResult;
      return `✅ Got it! I'm adding **${title}** — ${fmt(amount)} under **${category}** category.\n\n_Expense saved successfully!_`;
    }

    case "set_budget": {
      const { amount } = intentResult;
      return `✅ Done! Your monthly budget has been set to **${fmt(amount)}**.\n\n` +
        (monthTotal > 0 ? `You've already spent ${fmt(monthTotal)} this month — that's ${((monthTotal / amount) * 100).toFixed(0)}% of your new budget.` :
          "You haven't spent anything yet this month — great timing!");
    }

    case "greeting":
      return `👋 Hi ${firstName}! I'm FIN AI — I can help you:\n\n` +
        `• 💸 **Add expenses**: _"Add ₹500 food expense"_ or _"I spent 300 on Uber"_\n` +
        `• 🎯 **Set budget**: _"Set my budget to ₹30,000"_\n` +
        `• 📊 **Check spending**: _"How much did I spend on food?"_\n` +
        `• 💡 **Get tips**: _"How can I save more?"_\n` +
        `• 🏦 **Budget status**: _"How much budget is left?"_\n\n` +
        (expenses.length > 0
          ? `You currently have ${expenses.length} expenses and have spent ${fmt(monthTotal)} this month.`
          : `No expenses yet — start by adding one!`);

    case "top_category":
      if (!topCat) return "No expenses yet. Try: _\"Add ₹500 food expense\"_";
      return `📊 **Top spending breakdown:**\n\n` +
        sorted.slice(0, 5).map(([cat, amt], i) => {
          const pct = ((amt / total) * 100).toFixed(0);
          return `${i + 1}. **${cat}** — ${fmt(amt)} (${pct}%)`;
        }).join("\n") +
        `\n\n💡 Tip: _"How can I reduce my ${topCat[0]} spending?"_`;

    case "budget_status":
      if (budget === 0) return `No budget set yet!\n\nTry: _"Set my budget to ₹20,000"_ 🎯`;
      const statusMsg = budgetPct > 90 ? "🚨 **Critical!** Almost out of budget."
        : budgetPct > 70 ? "⚠️ **Warning.** Nearing your limit."
        : "✅ **On track!** Good spending discipline.";
      return `📊 **Budget Status — ${now.toLocaleString("en-IN", { month: "long" })}:**\n\n` +
        `• Budget: **${fmt(budget)}**\n• Spent: **${fmt(monthTotal)}** (${budgetPct}%)\n• Remaining: **${fmt(remaining)}**\n\n${statusMsg}`;

    case "category_spending": {
      const { category } = intentResult;
      if (!category) return "Which category? Try: _\"How much did I spend on food?\"_";
      const amt = catTotals[category] || 0;
      return amt > 0
        ? `💰 You've spent **${fmt(amt)}** on **${category}** (${((amt / total) * 100).toFixed(0)}% of all spending).\n\nWant tips to reduce it? Ask _"How to save on ${category.toLowerCase()}?"_`
        : `No ${category.toLowerCase()} expenses found yet.`;
    }

    case "total_spending":
      return `💰 **Your spending summary:**\n\n` +
        `• **This month:** ${fmt(monthTotal)} / ${fmt(budget)} (${budgetPct}% used)\n` +
        `• **All-time total:** ${fmt(total)} across ${expenses.length} transactions\n` +
        `• **Avg per transaction:** ${fmt(expenses.length > 0 ? total / expenses.length : 0)}\n` +
        (topCat ? `• **Top category:** ${topCat[0]} (${fmt(topCat[1])})` : "");

    case "categories":
      if (!topCat) return "No expenses yet! Add one: _\"Add ₹500 food expense\"_";
      return `📊 **Spending by category:**\n\n` +
        sorted.map(([cat, amt]) => {
          const pct = ((amt / total) * 100).toFixed(0);
          const bar = "█".repeat(Math.max(1, Math.floor(pct / 10)));
          return `**${cat}**: ${bar} ${fmt(amt)} (${pct}%)`;
        }).join("\n");

    case "savings":
      if (!topCat) return "Add some expenses first, then I'll give you personalized savings tips!";
      return `💡 **Personalized savings tips for ${firstName}:**\n\n` +
        `1. Cut **${topCat[0]}** spending by 20% → save **${fmt(topCat[1] * 0.2)}/month**\n` +
        (recurring.length > 0 ? `2. Review **"${recurring[0][0]}"** (appears ${recurring[0][1]} times) — still using it?\n` : `2. Set daily spending alerts to stay mindful\n`) +
        `3. Automate savings — move **${fmt(monthlyIncome ? monthlyIncome * 0.1 : 2000)}** to savings on payday\n\n` +
        `You have **${fmt(remaining)}** left this month. Keep it up! 💪`;

    case "recurring":
      if (recurring.length === 0) return "No recurring expenses detected yet. Keep adding more transactions!";
      return `🔄 **Recurring expenses:**\n\n` +
        recurring.slice(0, 6).map(([merchant, count]) => {
          const avg = expenses.filter(e => e.title === merchant).reduce((s, e) => s + e.amount, 0) / count;
          return `• **${merchant}** — ${count}× (avg ${fmt(avg)})`;
        }).join("\n") +
        "\n\nReview these and cancel what you don't use! 💡";

    case "health_score": {
      const income = monthlyIncome || 0;
      const ratio = income > 0 ? monthTotal / income : budget > 0 ? monthTotal / budget : 0;
      let score = 90;
      if (ratio > 0.9) score = 28; else if (ratio > 0.7) score = 52; else if (ratio > 0.5) score = 74;
      const emoji = score >= 80 ? "🟢" : score >= 55 ? "🟡" : "🔴";
      return `${emoji} **Financial Health Score: ${score}/100**\n\n` +
        `• Budget used: ${budgetPct}%\n• This month's spending: ${fmt(monthTotal)}\n` +
        (income > 0 ? `• Income ratio: ${((monthTotal / income) * 100).toFixed(0)}%\n\n` : "\n") +
        (score >= 80 ? "✅ Excellent! Keep saving consistently." :
          score >= 55 ? "⚠️ Decent — reduce your top category by 15%." :
          "🚨 High spending. Try setting a daily limit.");
    }

    case "list_expenses": {
      const recent = expenses.slice(0, 5);
      if (recent.length === 0) return "No expenses yet! Try: _\"Add ₹500 food expense\"_";
      return `📋 **Recent expenses:**\n\n` +
        recent.map((e, i) => `${i + 1}. **${e.title}** — ${fmt(e.amount)} (${e.category})`).join("\n") +
        `\n\n_Showing last ${recent.length} of ${expenses.length} total_`;
    }

    case "trend":
      return `📈 **Spending trend:**\n\n` +
        `• This month: **${fmt(monthTotal)}**\n` +
        (topCat ? `• Biggest category: **${topCat[0]}** at ${fmt(topCat[1])}\n` : "") +
        `\n💡 Visit the **Analytics page** for a full 6-month trend chart!`;

    default:
      return `🤖 Hi ${firstName}! Here's your quick snapshot:\n\n` +
        `• This month: **${fmt(monthTotal)}** / **${fmt(budget)}** budget\n` +
        `• Remaining: **${fmt(remaining)}**\n` +
        (topCat ? `• Top spend: **${topCat[0]}** (${fmt(topCat[1])})\n` : "") +
        `\n**What I can do for you:**\n` +
        `• _"Add ₹500 food expense"_ — adds instantly\n` +
        `• _"Set budget ₹25,000"_ — updates your budget\n` +
        `• _"How much did I spend on travel?"_ — category breakdown\n` +
        `• _"Give me saving tips"_ — personalized advice`;
  }
};

// ─────────────────────────────────────────────────────────────
// EXTERNAL AI (Only used when real API key is set)
// ─────────────────────────────────────────────────────────────
const PLACEHOLDER_KEYS = ["your_openrouter_api_key", "your_openai_api_key", "", undefined, null];
const isValidKey = (key) => key && !PLACEHOLDER_KEYS.includes(key) && key.length > 20;

const getAIResponse = async (prompt) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!isValidKey(apiKey)) return null;

    const isOpenRouter = process.env.AI_PROVIDER === "OpenRouter";
    const url = isOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = isOpenRouter ? "meta-llama/llama-3-8b-instruct:free" : "gpt-3.5-turbo";

    const response = await axios.post(
      url,
      { model, messages: [{ role: "user", content: prompt }] },
      { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, timeout: 10000 }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("External AI Error:", error.response?.data?.error?.message || error.message);
    return null;
  }
};

module.exports = { getAIResponse, generateLocalResponse, detectIntent, detectCategory, isValidKey, CATEGORY_LABELS };
