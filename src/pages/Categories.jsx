import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CATEGORIES, CATEGORY_KEYS, formatINR } from "@/lib/finance-data";
import { Plus, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

const COLOR_OPTIONS = [
  "158 64% 40%",
  "210 90% 56%",
  "271 91% 65%",
  "24 95% 53%",
  "330 81% 60%",
  "38 92% 50%",
];

export default function Categories() {
  const {
    expenses,
    customCategories,
    addCustomCategory,
    deleteCustomCategory,
  } = useFinance();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organize spending. Add your own custom categories."
        action={
          <Button onClick={() => setOpen(true)} className="gradient-primary">
            <Plus className="h-4 w-4 mr-1" /> New Category
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORY_KEYS.map((k) => {
          const c = CATEGORIES[k];
          const Icon = c.icon;
          return (
            <Card
              key={k}
              className="p-4 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: `hsl(${c.hsl} / 0.15)`,
                  color: `hsl(${c.hsl})`,
                }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{c.label}</h3>
              <p className="text-xs text-muted-foreground">
                {formatINR(totals[k] || 0)} spent
              </p>
            </Card>
          );
        })}
        {customCategories.map((c) => (
          <Card key={c.key} className="p-4 shadow-soft relative group">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: `hsl(${c.color} / 0.15)`,
                color: `hsl(${c.color})`,
              }}
            >
              <Tag className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">{c.label}</h3>
            <p className="text-xs text-muted-foreground">Custom category</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete category?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This won't affect existing expenses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteCustomCategory(c.key);
                      toast.success("Deleted");
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pets"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
                    style={{ background: `hsl(${c})` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary"
              onClick={() => {
                if (!name.trim()) return toast.error("Enter a name");
                addCustomCategory({
                  key: crypto.randomUUID(),
                  label: name.trim(),
                  color,
                });
                setName("");
                setOpen(false);
                toast.success("Category added");
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
