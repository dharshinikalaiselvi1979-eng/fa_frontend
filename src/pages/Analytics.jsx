import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import { CATEGORIES } from "@/lib/finance-data";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Sparkles } from "lucide-react";

export default function Analytics() {
  const { expenses } = useFinance();

  const monthlyTrend = useMemo(() => {
    const m = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      m[d.toLocaleDateString("en-IN", { month: "short" })] = 0;
    }
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const k = d.toLocaleDateString("en-IN", { month: "short" });
      if (k in m) m[k] += e.amount;
    });
    return Object.entries(m).map(([month, value]) => ({ month, value }));
  }, [expenses]);

  const weekly = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const day = d.getDate();
      const w = Math.min(3, Math.floor((day - 1) / 7));
      weeks[w] += e.amount;
    });
    return weeks.map((v, i) => ({ week: `W${i + 1}`, value: v }));
  }, [expenses]);

  const pieData = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).map(([k, v]) => ({
      name: CATEGORIES[k].label,
      value: v,
      color: `hsl(${CATEGORIES[k].hsl})`,
    }));
  }, [expenses]);

  const top = pieData.sort((a, b) => b.value - a.value)[0];
  const change =
    monthlyTrend.length > 1
      ? ((monthlyTrend[monthlyTrend.length - 1].value -
          monthlyTrend[monthlyTrend.length - 2].value) /
          (monthlyTrend[monthlyTrend.length - 2].value || 1)) *
        100
      : 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Visualize your spending and discover patterns."
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 shadow-soft lg:col-span-2">
          <h3 className="font-semibold mb-1">Monthly Spending Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-1">Category Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">All time</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={85}>
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-soft mb-4">
        <h3 className="font-semibold mb-1">Weekly Comparison</h3>
        <p className="text-xs text-muted-foreground mb-4">
          This month, by week
        </p>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="week"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 shadow-soft border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">AI Insight</h3>
          </div>
          <p className="text-sm">
            You spend most on{" "}
            <span className="font-semibold">{top?.name || "—"} 🍔</span>
          </p>
        </Card>
        <Card className="p-5 shadow-soft border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Trend</h3>
          </div>
          <p className="text-sm">
            Spending {change >= 0 ? "increased" : "decreased"} by{" "}
            <span className="font-semibold">
              {Math.abs(change).toFixed(0)}%
            </span>{" "}
            vs last month.
          </p>
        </Card>
      </div>
    </div>
  );
}
