import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES, formatINR } from "@/lib/finance-data";
import {
  Plus,
  Target,
  Bot,
  TrendingUp,
  TrendingDown,
  Wallet,
  Award,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { expenses, budget, user: financeUser } = useFinance();
  const { user: authUser } = useAuth();
  // Prefer authenticated user's name (from JWT), fallback to FinanceContext
  const user = authUser || financeUser;

  const stats = useMemo(() => {
    const now = new Date();
    const monthExp = expenses.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0);
    const remaining = Math.max(0, budget - monthTotal);
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    return {
      total,
      monthTotal,
      remaining,
      topCat: top?.[0],
      topCatAmount: top?.[1] || 0,
      totals,
    };
  }, [expenses, budget]);

  const pieData = Object.entries(stats.totals).map(([k, v]) => ({
    name: CATEGORIES[k].label,
    value: v,
    color: `hsl(${CATEGORIES[k].hsl})`,
  }));

  const trendData = useMemo(() => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    expenses.forEach((e) => {
      const k = new Date(e.date).toISOString().slice(0, 10);
      if (k in days) days[k] += e.amount;
    });
    return Object.entries(days).map(([d, v]) => ({
      day: new Date(d).toLocaleDateString("en-IN", { weekday: "short" }),
      value: v,
    }));
  }, [expenses]);

  const recent = [...expenses]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);
  const pct = budget > 0 ? (stats.monthTotal / budget) * 100 : 0;

  return (
    <div>
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0]} 👋`}
        subtitle="Here's your financial snapshot today."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          icon={<Wallet />}
          label="Total Expenses"
          value={formatINR(stats.total)}
          trend="+12%"
          up
        />
        <StatCard
          icon={<Target />}
          label="Remaining Budget"
          value={formatINR(stats.remaining)}
          trend={`${(100 - pct).toFixed(0)}% left`}
        />
        <StatCard
          icon={<TrendingUp />}
          label="This Month"
          value={formatINR(stats.monthTotal)}
          trend={`${pct.toFixed(0)}% used`}
          highlight
        />
        <StatCard
          icon={<Award />}
          label="Top Category"
          value={stats.topCat ? CATEGORIES[stats.topCat].label : "—"}
          trend={formatINR(stats.topCatAmount)}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <QuickAction
          onClick={() => navigate("/expenses")}
          icon={<Plus />}
          label="Add Expense"
        />
        <QuickAction
          onClick={() => navigate("/budget")}
          icon={<Target />}
          label="Set Budget"
        />
        <QuickAction
          onClick={() => navigate("/chat")}
          icon={<Bot />}
          label="Ask AI"
        />
      </div>


      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Spending Trend</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-1">Categories</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
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
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-xs">
            {pieData.slice(0, 6).map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Budget & Recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Monthly Budget</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/budget")}
            >
              Edit
            </Button>
          </div>
          <div className="text-3xl font-bold">
            {formatINR(stats.monthTotal)}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            of {formatINR(budget)}
          </p>
          <Progress value={Math.min(100, pct)} className="h-2.5" />
          <p
            className={`text-xs mt-2 ${pct > 90 ? "text-danger" : pct > 70 ? "text-warning" : "text-success"}`}
          >
            {pct > 90
              ? "🚨 Over budget alert!"
              : pct > 70
                ? "⚠️ Approaching limit"
                : "✅ On track"}
          </p>
        </Card>

        <Card className="p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/expenses")}
            >
              View all
            </Button>
          </div>
          <div className="space-y-2">
            {recent.map((e) => {
              const cat = CATEGORIES[e.category];
              const Icon = cat.icon;
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `hsl(${cat.hsl} / 0.15)`,
                      color: `hsl(${cat.hsl})`,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.label} •{" "}
                      {new Date(e.date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="font-semibold text-sm">
                    −{formatINR(e.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, up, highlight }) {
  return (
    <Card
      className={`p-4 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-0.5 ${highlight ? "gradient-primary text-white border-0" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center ${highlight ? "bg-white/20" : "bg-primary/10 text-primary"}`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${highlight ? "text-white/90" : up ? "text-success" : "text-muted-foreground"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <p
        className={`text-xs ${highlight ? "text-white/80" : "text-muted-foreground"}`}
      >
        {label}
      </p>
      <p className="text-xl md:text-2xl font-bold mt-0.5 truncate">{value}</p>
    </Card>
  );
}

function QuickAction({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border bg-card shadow-soft hover:shadow-elegant hover:border-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-3 text-left"
    >
      <div className="h-9 w-9 rounded-lg gradient-primary text-white flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
