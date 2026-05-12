import { useEffect, useCallback, useRef } from "react";
import { useFinance } from "@/context/FinanceContext";
import { formatINR } from "@/lib/finance-data";

// Keys in localStorage
const KEY_ENABLED = "fin.reminder.enabled";
const KEY_TIME    = "fin.reminder.time";    // "HH:MM" 24h
const KEY_LAST    = "fin.reminder.lastSent"; // "YYYY-MM-DD"

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function currentHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Requests browser notification permission.
 * Returns "granted" | "denied" | "default"
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

/**
 * Builds the daily summary text from expense data.
 */
function buildSummary(expenses, budget) {
  const now = new Date();
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const todayExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.toDateString() === now.toDateString();
  });

  const monthTotal  = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const todayTotal  = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining   = Math.max(0, budget - monthTotal);
  const budgetPct   = budget > 0 ? Math.round((monthTotal / budget) * 100) : 0;

  return {
    title: "📊 FIN AI Daily Review",
    body: todayTotal > 0
      ? `Today: ${formatINR(todayTotal)} spent. Month: ${formatINR(monthTotal)} (${budgetPct}% of budget). Remaining: ${formatINR(remaining)}.`
      : `No expenses logged today! Month total: ${formatINR(monthTotal)} (${budgetPct}% of budget). Remaining: ${formatINR(remaining)}.`,
    monthTotal,
    todayTotal,
    remaining,
    budgetPct,
  };
}

/**
 * useReminder hook — mounts in AppLayout, checks every 60s.
 * Fires a real OS browser notification + calls onTrigger() so the app
 * can show an in-app popup simultaneously.
 */
export function useReminder({ onTrigger }) {
  const { expenses, budget } = useFinance();
  const expensesRef = useRef(expenses);
  const budgetRef   = useRef(budget);

  // Keep refs fresh without restarting interval
  useEffect(() => { expensesRef.current = expenses; }, [expenses]);
  useEffect(() => { budgetRef.current   = budget;   }, [budget]);

  const fire = useCallback(() => {
    const summary = buildSummary(expensesRef.current, budgetRef.current);

    // ── Browser / OS notification ───────────────────────────
    if ("Notification" in window && Notification.permission === "granted") {
      const notif = new Notification(summary.title, {
        body: summary.body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "fin-daily-reminder",   // replaces previous, no stacking
        requireInteraction: true,    // stays until user dismisses
      });
      notif.onclick = () => {
        window.focus();
        window.location.href = "/";  // go to Dashboard
        notif.close();
      };
    }

    // ── In-app popup ────────────────────────────────────────
    if (onTrigger) onTrigger(summary);

    // Mark as sent for today
    localStorage.setItem(KEY_LAST, todayStr());
  }, [onTrigger]);

  useEffect(() => {
    const tick = () => {
      const enabled = localStorage.getItem(KEY_ENABLED) === "true";
      if (!enabled) return;

      const reminderTime = localStorage.getItem(KEY_TIME) || "20:00";
      const now          = currentHHMM();
      const lastSent     = localStorage.getItem(KEY_LAST) || "";

      // Trigger if current time matches and not already sent today
      if (now === reminderTime && lastSent !== todayStr()) {
        fire();
      }
    };

    tick(); // run once immediately
    const id = setInterval(tick, 60_000); // check every minute
    return () => clearInterval(id);
  }, [fire]);
}

export { KEY_ENABLED, KEY_TIME, KEY_LAST };
