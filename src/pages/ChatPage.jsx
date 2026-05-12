import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import { CATEGORIES, formatINR } from "@/lib/finance-data";
import { Send, Bot, User, Sparkles, CheckCircle2, PlusCircle, Target } from "lucide-react";
import { aiService } from "@/services";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Add ₹500 food expense",
  "Set my budget to ₹20,000",
  "Where did I spend the most?",
  "How can I save more?",
  "Show my budget status",
  "List recent expenses",
];

// ── Action Card shown in chat after AI performs an action ────
function ActionCard({ action, actionData }) {
  if (action === "expense_added" && actionData?.expense) {
    const exp = actionData.expense;
    const cat = CATEGORIES[exp.category] || CATEGORIES["shopping"];
    const Icon = cat?.icon;
    return (
      <div className="flex items-center gap-3 mt-2 p-3 rounded-xl border border-success/30 bg-success/5">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-success/15 text-success">
          {Icon ? <Icon className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{exp.title}</p>
          <p className="text-xs text-muted-foreground">{cat?.label || exp.category} • {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
        </div>
        <span className="font-bold text-sm text-success">−{formatINR(exp.amount)}</span>
        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
      </div>
    );
  }
  if (action === "budget_set" && actionData?.amount) {
    return (
      <div className="flex items-center gap-3 mt-2 p-3 rounded-xl border border-primary/30 bg-primary/5">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/15 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Budget Updated</p>
          <p className="text-xs text-muted-foreground">Monthly limit set to {formatINR(actionData.amount)}</p>
        </div>
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
      </div>
    );
  }
  return null;
}

export default function ChatPage() {
  const { addExpense, setBudget } = useFinance();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Hello! I'm **FIN AI** — your smart finance assistant.\n\nI can **add expenses**, **set your budget**, and answer any finance question.\n\nTry: _\"Add ₹500 food expense\"_ or _\"Set budget to ₹25,000\"_",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Local smart reply (used when not logged in)
  const localReply = (q) => {
    const t = q.toLowerCase();
    const tip = /save|tip|reduce/.test(t)
      ? "💡 To save more: reduce your top spending category by 20%, cancel unused subscriptions, and automate savings transfers on payday."
      : /budget/.test(t)
      ? "Go to the **Budget** page to set or update your monthly limit! 🎯"
      : /add|spent|expense/.test(t)
      ? "To add expenses via chat, please **login** first so I can save them to your account! 🔐"
      : "I can help you track expenses, set budgets, and give financial advice. Try asking: _\"Add ₹500 food expense\"_ 💡";
    return tip;
  };

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q) return;

    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);

    const token = localStorage.getItem("fin.token");
    try {
      if (!token) {
        await new Promise((r) => setTimeout(r, 600));
        setMessages((m) => [...m, { role: "ai", text: localReply(q) }]);
        return;
      }

      const result = await aiService.chat(q);
      const { reply, action, actionData } = result;

      // Execute the action in the frontend app
      if (action === "expense_added" && actionData?.expense) {
        // Update FinanceContext so all pages reflect new expense immediately
        addExpense(actionData.expense);
        toast.success(`Added: ${actionData.expense.title} — ${formatINR(actionData.expense.amount)}`);
      } else if (action === "budget_set" && actionData?.amount) {
        // Update FinanceContext so Budget page reflects new budget immediately
        setBudget(actionData.amount);
        toast.success(`Budget set to ${formatINR(actionData.amount)} 🎯`);
      }

      setMessages((m) => [...m, { role: "ai", text: reply, action, actionData }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "⚠️ Couldn't connect to the backend. Make sure the server is running on port 5001." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div>
      <PageHeader title="AI Chat 🤖" subtitle="Your intelligent finance assistant — add expenses, set budgets, get insights." />
      <Card className="shadow-soft flex flex-col h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 animate-slide-up ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "ai" && (
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[82%] md:max-w-[72%] ${m.role === "user" ? "" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                {/* Action Card shown below the AI message */}
                {m.role === "ai" && m.action && (
                  <ActionCard action={m.action} actionData={m.actionData} />
                )}
              </div>
              {m.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2 items-center">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground inline-block" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground inline-block" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground inline-block" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-muted transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-primary" /> {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !typing && send()}
            placeholder='Try: "Add ₹500 food expense" or "Set budget ₹30,000"'
            disabled={typing}
          />
          <Button onClick={() => send()} className="gradient-primary" disabled={typing || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
