import { useState, useEffect, useCallback } from "react";
import { goalService } from "@/services";

/**
 * Hook for the Goals & Savings Tracker.
 */
export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("fin.token");

  const fetchGoals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      console.warn("Could not fetch goals:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(
    async (goalData) => {
      if (!token) return;
      try {
        const created = await goalService.create(goalData);
        setGoals((prev) => [...prev, created]);
        return created;
      } catch (err) {
        console.warn("Create goal failed:", err.message);
        throw err;
      }
    },
    [token]
  );

  const updateGoal = useCallback(
    async (id, goalData) => {
      if (!token) return;
      try {
        const updated = await goalService.update(id, goalData);
        setGoals((prev) => prev.map((g) => (g._id === id ? updated : g)));
        return updated;
      } catch (err) {
        console.warn("Update goal failed:", err.message);
        throw err;
      }
    },
    [token]
  );

  const deleteGoal = useCallback(
    async (id) => {
      if (!token) return;
      try {
        await goalService.delete(id);
        setGoals((prev) => prev.filter((g) => g._id !== id));
      } catch (err) {
        console.warn("Delete goal failed:", err.message);
        throw err;
      }
    },
    [token]
  );

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refresh: fetchGoals,
  };
}

export default useGoals;
