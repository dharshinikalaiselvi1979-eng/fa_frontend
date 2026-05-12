const cron = require("node-cron");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");

const initCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running Daily Budget Check...");
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      
      const budgets = await Budget.find({ month: currentMonth });
      
      for (const budget of budgets) {
        const startOfMonth = new Date(currentMonth + "-01T00:00:00.000Z");
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

        const expenses = await Expense.aggregate([
          { $match: { user: budget.user, date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
        ]);
        
        const totalSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;
        const remaining = budget.monthlyBudget - totalSpent;

        // If spent more than 90% of budget
        if (totalSpent > (budget.monthlyBudget * 0.9)) {
          // Check if notification already exists for this month to avoid spam
          const existingNotif = await Notification.findOne({
            user: budget.user,
            title: "Budget Alert",
            createdAt: { $gte: startOfMonth }
          });

          if (!existingNotif) {
            await Notification.create({
              user: budget.user,
              title: "Budget Alert",
              message: `Warning! You have spent ${((totalSpent/budget.monthlyBudget)*100).toFixed(1)}% of your monthly budget. Only $${remaining} remaining.`,
              type: "Alert"
            });
            console.log(`Alert created for user ${budget.user}`);
          }
        }
      }
    } catch (error) {
      console.error("Error in cron job:", error);
    }
  });
};

module.exports = initCronJobs;
