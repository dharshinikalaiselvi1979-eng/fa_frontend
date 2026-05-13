import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { CATEGORIES } from "@/lib/finance-data";
import { expenseService, budgetService, authService, mapCategoryToFrontend } from "@/services";

const Ctx = createContext(null);

export function FinanceProvider({ children }) {
  // ── Local state (always available, used as fallback) ──────────
  const [expenses, setExpenses] = useState(() => {
    const s = localStorage.getItem("fin.expenses");
    return s ? JSON.parse(s) : [];
  });
  const [budget, setBudgetLocal] = useState(
    () => Number(localStorage.getItem("fin.budget")) || 0
  );
  const [customCategories, setCustomCategories] = useState(() => {
    const s = localStorage.getItem("fin.customCats");
    return s ? JSON.parse(s) : [];
  });
  const [backendReady, setBackendReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // ── Persist to localStorage ───────────────────────────────────
  useEffect(() => localStorage.setItem("fin.expenses", JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem("fin.budget", String(budget)), [budget]);
  useEffect(() => localStorage.setItem("fin.customCats", JSON.stringify(customCategories)), [customCategories]);
  // ── Sync from backend on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("fin.token");
    if (!token) {
      setIsOffline(true);
      return;
    }

    // Fetch budget and expenses simultaneously
    Promise.all([
      expenseService.getAll({ limit: 200 }).catch(() => ({ expenses: [] })),
      budgetService.get(new Date().toISOString().slice(0, 7)).catch(() => null)
    ]).then(([expenseData, budgetData]) => {
      // Always set expenses from backend (even empty = user has none)
      if (expenseData && expenseData.expenses) {
        setExpenses(expenseData.expenses);
      }
      
      // Budget response could be:
      //   { budget: { monthlyBudget: N }, ... }  → user has a budget
      //   { message: "No budget set", data: null } → no budget yet
      //   null → API error
      if (budgetData && budgetData.budget && budgetData.budget.monthlyBudget) {
        setBudgetLocal(budgetData.budget.monthlyBudget);
      } else {
        setBudgetLocal(0); // Ensure clean state
      }
      setBackendReady(true);
      setIsOffline(false);
    }).catch(() => {
      setBackendReady(false);
      setIsOffline(true);
    });
  }, []);

  // ── Computed values ───────────────────────────────────────────
  const monthSpend = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const notifications = useMemo(() => {
    const list = [];
    const pct = budget > 0 ? (monthSpend / budget) * 100 : 0;
    
    if (budget > 0) {
      if (pct >= 100) {
        list.push({ id: "n1", title: "Over Budget 🚨", message: `You have exceeded your monthly budget by ₹${(monthSpend - budget).toFixed(0)}!`, type: "danger", date: new Date().toISOString(), read: false });
      } else if (pct >= 90) {
        list.push({ id: "n1", title: "Budget Critical 🚨", message: `You've used ${pct.toFixed(0)}% of your monthly budget. Only ₹${(budget - monthSpend).toFixed(0)} left.`, type: "warning", date: new Date().toISOString(), read: false });
      } else if (pct >= 70) {
        list.push({ id: "n2", title: "Heads up ⚠️", message: `You've crossed 70% of your monthly budget.`, type: "warning", date: new Date().toISOString(), read: false });
      }
    }

    if (monthSpend > 0) {
      list.push({ id: "n3", title: "Weekly Summary 📊", message: `You spent ₹${(monthSpend / 4).toFixed(0)} this week on average.`, type: "info", date: new Date(Date.now() - 86400000).toISOString(), read: true });
      list.push({ id: "n4", title: "AI Insight 🤖", message: `Top spending category: ${topCategory(expenses)}. Consider reducing it to save more!`, type: "info", date: new Date(Date.now() - 2 * 86400000).toISOString(), read: true });
    }
    return list;
  }, [expenses, monthSpend, budget]);

  // ── Expense CRUD (tries backend, falls back to local) ─────────
  const addExpense = useCallback(async (e) => {
    const token = localStorage.getItem("fin.token");

    // If the expense already has an id, it was pre-saved (e.g. by AI chat).
    // Just update local state — don't POST to backend again.
    if (e.id) {
      setExpenses((prev) => [e, ...prev]);
      return;
    }

    // New expense from manual form — optimistic add then confirm with backend
    const localEntry = { ...e, id: crypto.randomUUID() };
    setExpenses((prev) => [localEntry, ...prev]);

    if (token) {
      try {
        const saved = await expenseService.add(e);
        setExpenses((prev) => prev.map((x) => (x.id === localEntry.id ? saved : x)));
      } catch {
        // Keep optimistic local entry if backend fails
      }
    }
  }, []);

  const addExpenses = useCallback(async (arr) => {
    const token = localStorage.getItem("fin.token");
    const localEntries = arr.map((e) => ({ ...e, id: crypto.randomUUID() }));
    setExpenses((prev) => [...localEntries, ...prev]);

    if (token) {
      // Save each to backend (fire and forget)
      arr.forEach((e) => expenseService.add(e).catch(() => {}));
    }
  }, []);

  const updateExpense = useCallback(async (id, e) => {
    setExpenses((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x)));
    const token = localStorage.getItem("fin.token");
    if (token) {
      try {
        await expenseService.update(id, e);
      } catch {
        // Local update already applied
      }
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
    const token = localStorage.getItem("fin.token");
    if (token) {
      try {
        await expenseService.delete(id);
      } catch {
        // Local delete already applied
      }
    }
  }, []);

  // ── Budget (tries backend, falls back to local) ───────────────
  const setBudget = useCallback(async (n) => {
    setBudgetLocal(n);
    const token = localStorage.getItem("fin.token");
    if (token) {
      const month = new Date().toISOString().slice(0, 7);
      budgetService.set(month, n).catch(() => {});
    }
  }, []);


  const value = {
    expenses,
    addExpense,
    addExpenses,
    updateExpense,
    deleteExpense,
    budget,
    setBudget,
    customCategories,
    addCustomCategory: (c) => setCustomCategories((prev) => [...prev, c]),
    deleteCustomCategory: (k) => setCustomCategories((prev) => prev.filter((c) => c.key !== k)),
    notifications,
    markAllRead: () => {},
    backendReady,
    isOffline,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function topCategory(expenses) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return top ? CATEGORIES[top[0]]?.label || top[0] : "—";
}

export function useFinance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFinance must be used inside FinanceProvider");
  return c;
}
