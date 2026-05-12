import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFinance } from "@/context/FinanceContext";
import { CATEGORIES, formatINR } from "@/lib/finance-data";

export default function ChatWidget({ open, onClose }) {
  const { expenses, budget } = useFinance();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your FIN AI assistant 🤖. Ask me about your spending, budget, or how to save more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  if (!open) return null;

  const reply = (q) => {
    const t = q.toLowerCase();
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    if (/save|reduce|tip/.test(t))
      return `💡 Try cutting **${top ? CATEGORIES[top[0]].label : "your top category"}** by 20% to save around ${formatINR((top?.[1] || 0) * 0.2)}. Cook at home & use public transport when possible.`;
    if (/most|top|highest/.test(t))
      return top
        ? `You spend the most on **${CATEGORIES[top[0]].label}** — ${formatINR(top[1])}.`
        : "No data yet.";
    if (/budget/.test(t))
      return `Your monthly budget is ${formatINR(budget)}. So far this month you've spent ${formatINR(total)} (${((total / budget) * 100).toFixed(0)}% used).`;
    if (/total|spent/.test(t))
      return `You've spent ${formatINR(total)} across ${expenses.length} transactions.`;
    return `Here's a quick snapshot 📊\n• Total: ${formatINR(total)}\n• Top category: ${top ? CATEGORIES[top[0]].label : "—"}\n• Budget used: ${((total / budget) * 100).toFixed(0)}%`;
  };

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: reply(q) }]);
      setTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[520px] rounded-2xl border bg-card shadow-elegant flex flex-col animate-scale-in overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b gradient-primary text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div className="font-semibold">FIN AI Assistant</div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-3 py-2 flex gap-1">
              <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground inline-block" />
              <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground inline-block" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-2 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your finances..."
        />
        <Button size="icon" onClick={send} className="gradient-primary">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
