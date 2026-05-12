import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import { CATEGORIES, CATEGORY_KEYS, formatINR } from "@/lib/finance-data";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Budget() {
  const { budget, setBudget, expenses } = useFinance();
  const [draft, setDraft] = useState(String(budget));

  const monthTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const pct = budget > 0 ? (monthTotal / budget) * 100 : 0;
  const status = pct > 90 ? "danger" : pct > 70 ? "warning" : "success";
  const barColor =
    status === "danger"
      ? "bg-danger"
      : status === "warning"
        ? "bg-warning"
        : "bg-success";

  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  // AI suggested split
  const suggestions = useMemo(() => {
    const split = {
      food: 0.25,
      travel: 0.15,
      entertainment: 0.08,
      utilities: 0.1,
      health: 0.07,
      shopping: 0.1,
      education: 0.1,
      bills: 0.15,
    };
    return CATEGORY_KEYS.map((k) => ({
      key: k,
      suggested: budget * split[k],
      spent: totals[k] || 0,
    }));
  }, [budget, totals]);

  return (
    <div>
      <PageHeader title="Budget" subtitle="Plan smart, spend smarter." />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 lg:col-span-2 shadow-soft">
          <h3 className="font-semibold mb-1">Monthly Budget</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Set or update your monthly limit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <Input
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            <Button
              className="gradient-primary h-12"
              onClick={() => {
                const n = Number(draft);
                if (!n || n < 0) return toast.error("Enter a valid amount");
                setBudget(n);
                toast.success("Budget updated 🎯");
              }}
            >
              Update Budget
            </Button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Used this month
              </span>
              <span className="font-semibold">
                {formatINR(monthTotal)} / {formatINR(budget)}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              {status === "danger" && (
                <>
                  <AlertTriangle className="h-4 w-4 text-danger" />
                  <span className="text-danger">
                    You've crossed 90% — try reducing spending in{" "}
                    {topCat(totals)}.
                  </span>
                </>
              )}
              {status === "warning" && (
                <>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-warning">
                    Heads up — you're at {pct.toFixed(0)}% of budget.
                  </span>
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-success">Great! You're on track.</span>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">AI Budget Tips</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="p-2 bg-muted/50 rounded-lg">
              💡 Cap food spending at 25% of your budget.
            </li>
            <li className="p-2 bg-muted/50 rounded-lg">
              🚇 Use public transit to save up to ₹800/mo.
            </li>
            <li className="p-2 bg-muted/50 rounded-lg">
              📦 Review subscriptions monthly — cancel unused ones.
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold mb-1">AI Suggested Category Limits</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Based on smart benchmarks for young professionals.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.map((s) => {
            const c = CATEGORIES[s.key];
            const Icon = c.icon;
            const used = (s.spent / s.suggested) * 100;
            return (
              <div key={s.key} className="p-3 rounded-xl border bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `hsl(${c.hsl} / 0.15)`,
                      color: `hsl(${c.hsl})`,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium flex-1">{c.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatINR(s.spent)} / {formatINR(s.suggested)}
                  </span>
                </div>
                <Progress value={Math.min(100, used)} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function topCat(totals) {
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return top ? CATEGORIES[top[0]].label : "your top category";
}
