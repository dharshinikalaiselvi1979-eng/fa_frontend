import { useState, useEffect, useCallback } from "react";
import { expenseService } from "@/services";
import { useFinance } from "@/context/FinanceContext";
import { toast } from "sonner";

/**
 * Drop-in replacement hook for expense operations that use the real backend.
 * Falls back to FinanceContext (localStorage) if user is not logged in with JWT.
 */
export function useExpenses() {
  const finance = useFinance();
  const token = localStorage.getItem("fin.token");

  const [expenses, setExpenses] = useState(finance.expenses);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchFromBackend = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { expenses: backendExpenses } = await expenseService.getAll({
        limit: 100,
      });
      setExpenses(backendExpenses);
    } catch (err) {
      console.warn("Backend unavailable, using local data:", err.message);
      setExpenses(finance.expenses);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFromBackend();
  }, [fetchFromBackend]);

  const addExpense = useCallback(
    async (expenseData) => {
      if (!token) {
        finance.addExpense(expenseData);
        return;
      }
      setSyncing(true);
      try {
        const newExpense = await expenseService.add(expenseData);
        setExpenses((prev) => [newExpense, ...prev]);
        finance.addExpense(expenseData); // keep context in sync
      } catch (err) {
        console.warn("Backend add failed, using local:", err.message);
        finance.addExpense(expenseData);
        toast.error("Saved locally — backend unavailable");
      } finally {
        setSyncing(false);
      }
    },
    [token, finance]
  );

  const updateExpense = useCallback(
    async (id, expenseData) => {
      if (!token) {
        finance.updateExpense(id, expenseData);
        return;
      }
      setSyncing(true);
      try {
        const updated = await expenseService.update(id, expenseData);
        setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      } catch (err) {
        console.warn("Backend update failed, using local:", err.message);
        finance.updateExpense(id, expenseData);
      } finally {
        setSyncing(false);
      }
    },
    [token, finance]
  );

  const deleteExpense = useCallback(
    async (id) => {
      if (!token) {
        finance.deleteExpense(id);
        return;
      }
      setSyncing(true);
      try {
        await expenseService.delete(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        console.warn("Backend delete failed, using local:", err.message);
        finance.deleteExpense(id);
      } finally {
        setSyncing(false);
      }
    },
    [token, finance]
  );

  return {
    expenses,
    loading,
    syncing,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: fetchFromBackend,
  };
}

export default useExpenses;
