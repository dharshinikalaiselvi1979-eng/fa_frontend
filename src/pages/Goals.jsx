import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import { useGoals } from "@/hooks/useGoals";
import { formatINR } from "@/lib/finance-data";
import {
  Plus,
  Target,
  Trash2,
  CheckCircle2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function Goals() {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useGoals();
  const [open, setOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle("");
    setTargetAmount("");
    setDeadline("");
  };

  const handleCreate = async () => {
    if (!title || !targetAmount || !deadline) {
      toast.error("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      await createGoal({
        title,
        targetAmount: Number(targetAmount),
        deadline,
      });
      toast.success("Goal created! 🎯");
      setOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to create goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await updateGoal(selectedGoal._id, {
        currentAmount: selectedGoal.currentAmount + amount,
      });
      toast.success(`Added ${formatINR(amount)} to "${selectedGoal.title}"`);
      setDepositOpen(false);
      setDepositAmount("");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      toast.success("Goal deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const token = localStorage.getItem("fin.token");

  return (
    <div>
      <PageHeader
        title="Goals & Savings 🎯"
        subtitle="Track your savings goals and celebrate milestones."
        action={
          <Button onClick={() => setOpen(true)} className="gradient-primary">
            <Plus className="h-4 w-4 mr-1" /> New Goal
          </Button>
        }
      />

      {!token && (
        <Card className="p-5 mb-4 border-primary/20 bg-primary/5 shadow-soft">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Login with your account</strong> to sync goals to the
            backend and keep them persistent across devices.
          </p>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No goals yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first savings goal and start tracking progress.
          </p>
          <Button onClick={() => setOpen(true)} className="gradient-primary">
            <Plus className="h-4 w-4 mr-1" /> Create first goal
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(
              100,
              (goal.currentAmount / goal.targetAmount) * 100
            );
            const remaining = goal.targetAmount - goal.currentAmount;
            const isCompleted = goal.status === "Completed" || pct >= 100;
            const daysLeft = Math.max(
              0,
              Math.floor(
                (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
              )
            );

            return (
              <Card
                key={goal._id}
                className="p-5 shadow-soft hover:shadow-elegant transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center"
                      style={{ background: goal.color + "33" }}
                    >
                      <Target
                        className="h-4 w-4"
                        style={{ color: goal.color || "#3b82f6" }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {daysLeft > 0 ? `${daysLeft} days left` : "Past deadline"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(goal._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatINR(goal.currentAmount)}</span>
                    <span className="text-muted-foreground">
                      {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {pct.toFixed(0)}% complete
                  </p>
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Goal achieved! 🎉
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setDepositOpen(true);
                    }}
                  >
                    <TrendingUp className="h-3.5 w-3.5 mr-1" /> Add savings (
                    {formatINR(remaining)} remaining)
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Goal Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Emergency Fund, Vacation, Laptop"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Target Amount (₹)</Label>
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="50000"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="gradient-primary"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Savings Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Savings — {selectedGoal?.title}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="1000"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit} className="gradient-primary">
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
