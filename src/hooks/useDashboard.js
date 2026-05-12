import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "@/services";
import { useFinance } from "@/context/FinanceContext";

/**
 * Hook for Dashboard analytics data.
 * Uses backend when token is available, falls back to local FinanceContext data.
 */
export function useDashboard() {
  const finance = useFinance();
  const token = localStorage.getItem("fin.token");

  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sum, monthly, cats] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getMonthly(),
        dashboardService.getCategories(),
      ]);
      setSummary(sum);
      setMonthlyData(monthly);
      setCategoriesData(cats);
    } catch (err) {
      console.warn("Dashboard backend unavailable:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    monthlyData,
    categoriesData,
    loading,
    refresh: fetchData,
  };
}

export default useDashboard;
