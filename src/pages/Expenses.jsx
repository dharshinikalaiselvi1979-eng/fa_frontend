import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import {
  CATEGORIES,
  CATEGORY_KEYS,
  autoCategorize,
  formatINR,
} from "@/lib/finance-data";
import { Plus, Search, Edit2, Trash2, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [sort, setSort] = useState("date");

  const list = useMemo(() => {
    let arr = [...expenses];
    if (search)
      arr = arr.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase()),
      );
    if (filterCat !== "all") arr = arr.filter((e) => e.category === filterCat);
    arr.sort((a, b) =>
      sort === "amount"
        ? b.amount - a.amount
        : +new Date(b.date) - +new Date(a.date),
    );
    return arr;
  }, [expenses, search, filterCat, sort]);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track every rupee with AI auto-categorization."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="gradient-primary"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Expense
          </Button>
        }
      />

      <Card className="p-4 mb-4 shadow-soft">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="md:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORY_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {CATEGORIES[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v)}>
            <SelectTrigger className="md:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort: Date</SelectItem>
              <SelectItem value="amount">Sort: Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {list.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No expenses yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking your spending to see insights.
          </p>
          <Button onClick={() => setOpen(true)} className="gradient-primary">
            <Plus className="h-4 w-4 mr-1" /> Add your first
          </Button>
        </Card>
      ) : (
        <Card className="shadow-soft overflow-hidden">
          <div className="divide-y">
            {list.map((e) => {
              const cat = CATEGORIES[e.category];
              const Icon = cat.icon;
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-3 md:p-4 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `hsl(${cat.hsl} / 0.15)`,
                      color: `hsl(${cat.hsl})`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{e.title}</p>
                      {e.source === "bank" && (
                        <Badge variant="secondary" className="text-[10px]">
                          Bank
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cat.label} •{" "}
                      {new Date(e.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="font-semibold">−{formatINR(e.amount)}</div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(e);
                        setOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete this expense?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action can't be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteExpense(e.id);
                              toast.success("Expense deleted");
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <ExpenseDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={(data) => {
          if (editing) {
            updateExpense(editing.id, data);
            toast.success("Updated");
          } else {
            addExpense({ ...data, source: "manual" });
            toast.success("Expense added");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}

function ExpenseDialog({ open, onOpenChange, editing, onSubmit }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [aiCat, setAiCat] = useState(null);

  // sync when editing changes
  useMemo(() => {
    if (editing) {
      setTitle(editing.title);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setDate(editing.date.slice(0, 10));
      setNotes(editing.notes || "");
    } else {
      setTitle("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().slice(0, 10));
      setNotes("");
    }
  }, [editing, open]);

  useMemo(() => {
    setAiCat(title.length > 2 ? autoCategorize(title) : null);
  }, [title]);

  const submit = () => {
    if (!title.trim() || !amount) {
      toast.error("Title and amount required");
      return;
    }
    const cat = category || aiCat || autoCategorize(title);
    onSubmit({
      title: title.trim(),
      amount: Number(amount),
      category: cat,
      date: new Date(date).toISOString(),
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Swiggy order"
              className="mt-1"
            />
            {!category && aiCat && (
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI suggests:{" "}
                <span className="font-medium">{CATEGORIES[aiCat].label}</span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>
              Category{" "}
              {!category && (
                <span className="text-xs text-muted-foreground">
                  (AI auto if empty)
                </span>
              )}
            </Label>
            <Select
              value={category || undefined}
              onValueChange={(v) => setCategory(v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Auto categorize" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {CATEGORIES[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gradient-primary">
            {editing ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
