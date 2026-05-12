import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatINR } from "@/lib/finance-data";
import { useNavigate } from "react-router-dom";
import {
  X,
  TrendingUp,
  Wallet,
  PiggyBank,
  Target,
  ExternalLink,
} from "lucide-react";

/**
 * DailyCheckIn
 * Slides in from the bottom-right like a real notification card
 * when the daily reminder fires. Dismissible by clicking X or any action.
 *
 * Props:
 *   summary   – { title, body, monthTotal, todayTotal, remaining, budgetPct }
 *   onDismiss – callback to hide it
 */
export default function DailyCheckIn({ summary, onDismiss }) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 30_000);
    return () => clearTimeout(timerRef.current);
  }, [onDismiss]);

  if (!summary) return null;

  const { monthTotal, todayTotal, remaining, budgetPct } = summary;

  const statusColor =
    budgetPct >= 90 ? "text-danger" : budgetPct >= 70 ? "text-warning" : "text-success";
  const barColor =
    budgetPct >= 90 ? "[&>div]:bg-danger" : budgetPct >= 70 ? "[&>div]:bg-warning" : "[&>div]:bg-success";

  const go = (path) => {
    navigate(path);
    onDismiss();
  };

  return (
    // Slide-in animation via Tailwind + existing CSS variable
    <div className="fixed bottom-24 right-5 z-50 w-[340px] animate-slide-up">
      <Card className="shadow-elegant border border-primary/20 overflow-hidden">
        {/* Header */}
        <div className="gradient-primary px-4 py-3 flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Daily Finance Review</p>
            <p className="text-white/80 text-xs">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="p-4 grid grid-cols-3 gap-2 border-b">
          <Stat icon={<Wallet className="h-3.5 w-3.5" />} label="Today" value={formatINR(todayTotal)} />
          <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Month" value={formatINR(monthTotal)} />
          <Stat icon={<PiggyBank className="h-3.5 w-3.5" />} label="Left" value={formatINR(remaining)} highlight />
        </div>

        {/* Budget bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Budget used
            </span>
            <span className={`font-bold ${statusColor}`}>{budgetPct}%</span>
          </div>
          <Progress value={Math.min(100, budgetPct)} className={`h-2 ${barColor}`} />
          <p className="text-xs text-muted-foreground mt-1">
            {budgetPct >= 90
              ? "🚨 Almost out! Review your spending."
              : budgetPct >= 70
              ? "⚠️ 70%+ used. Slow down a bit."
              : "✅ On track! Keep it up."}
          </p>
        </div>

        {/* Quick actions */}
        <div className="p-3 pt-2 flex gap-2">
          <Button
            size="sm"
            className="flex-1 gradient-primary text-xs h-8"
            onClick={() => go("/")}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> Dashboard
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={() => go("/expenses")}
          >
            <Wallet className="h-3 w-3 mr-1" /> Add Expense
          </Button>
        </div>

        {/* Auto-dismiss hint */}
        <p className="text-center text-[10px] text-muted-foreground pb-2">
          Dismisses automatically in 30s
        </p>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value, highlight }) {
  return (
    <div className={`rounded-lg p-2 text-center ${highlight ? "bg-primary/10" : "bg-muted/50"}`}>
      <div className={`flex items-center justify-center gap-1 mb-1 ${highlight ? "text-primary" : "text-muted-foreground"}`}>
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className={`text-xs font-bold truncate ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}
