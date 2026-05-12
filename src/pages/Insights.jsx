import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import { CATEGORIES, formatINR } from "@/lib/finance-data";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

export default function Insights() {
  const { expenses, budget } = useFinance();

  const insights = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const top = sorted[0];
    const second = sorted[1];

    const items = [];
    if (top)
      items.push({
        icon: AlertTriangle,
        color: "warning",
        title: `You're overspending on ${CATEGORIES[top[0]].label}`,
        text: `${formatINR(top[1])} (${((top[1] / total) * 100).toFixed(0)}% of all spending). Consider setting a category limit.`,
      });
    if (second)
      items.push({
        icon: TrendingUp,
        color: "accent",
        title: `${CATEGORIES[second[0]].label} is your second biggest`,
        text: `${formatINR(second[1])} this period. Watch this category to avoid surprises.`,
      });
    items.push({
      icon: Lightbulb,
      color: "primary",
      title: "Smart save tip",
      text: `Cutting ${top ? CATEGORIES[top[0]].label : "top"} spending by just 15% could save you ${formatINR((top?.[1] || 0) * 0.15)} per month.`,
    });
    const budgetPct = budget > 0 ? ((total / budget) * 100).toFixed(0) : 0;
    items.push({
      icon: TrendingDown,
      color: "success",
      title: "Budget health",
      text: budget > 0
        ? `You've used ${budgetPct}% of your monthly budget. ${budgetPct < 80 ? "Looking good!" : "Time to slow down."}`
        : "No budget set yet — set one in the Budget page to track your spending!",
    });
    return items;
  }, [expenses, budget]);

  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="Smart observations from your spending data."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((it, i) => {
          const Icon = it.icon;
          return (
            <Card
              key={i}
              className="p-5 shadow-soft hover:shadow-elegant transition-all animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${it.color}/10 text-${it.color}`}
                  style={{
                    background: `hsl(var(--${it.color}) / 0.15)`,
                    color: `hsl(var(--${it.color}))`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{it.title}</h3>
                  <p className="text-sm text-muted-foreground">{it.text}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 mt-6 gradient-primary text-white shadow-elegant">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">Need personalized advice?</h3>
        </div>
        <p className="text-sm text-white/90">
          Open the AI Chat assistant to ask specific questions about your
          finances.
        </p>
      </Card>
    </div>
  );
}
