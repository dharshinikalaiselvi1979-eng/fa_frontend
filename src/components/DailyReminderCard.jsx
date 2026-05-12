import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFinance } from "@/context/FinanceContext";
import { formatINR } from "@/lib/finance-data";
import { KEY_ENABLED, KEY_TIME, requestNotificationPermission } from "@/hooks/useReminder";
import { Bell, BellOff, BellRing, Clock, TestTube } from "lucide-react";
import { toast } from "sonner";

export default function DailyReminderCard() {
  const { expenses, budget } = useFinance();

  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(KEY_ENABLED) === "true"
  );
  const [time, setTime] = useState(
    () => localStorage.getItem(KEY_TIME) || "20:00"
  );
  const [permission, setPermission] = useState(
    () => ("Notification" in window ? Notification.permission : "unsupported")
  );

  // Persist changes immediately
  const toggle = useCallback(async (val) => {
    if (val && permission !== "granted") {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") {
        toast.error("Please allow notifications in your browser to enable reminders.");
        return;
      }
    }
    setEnabled(val);
    localStorage.setItem(KEY_ENABLED, String(val));
    toast.success(val ? `Daily reminder set for ${formatTime(time)} ⏰` : "Reminder turned off");
  }, [permission, time]);

  const saveTime = useCallback((newTime) => {
    setTime(newTime);
    localStorage.setItem(KEY_TIME, newTime);
    if (enabled) toast.success(`Reminder updated to ${formatTime(newTime)} ⏰`);
  }, [enabled]);

  // Send a test notification right now
  const testNow = useCallback(async () => {
    if (permission !== "granted") {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") {
        toast.error("Notification permission denied by browser.");
        return;
      }
    }

    // Compute quick summary
    const now = new Date();
    const monthTotal = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
    const remaining = Math.max(0, budget - monthTotal);

    new Notification("📊 FIN AI Daily Review", {
      body: `This month: ${formatINR(monthTotal)} spent. Budget remaining: ${formatINR(remaining)}.`,
      icon: "/favicon.ico",
      tag: "fin-test",
      requireInteraction: false,
    });
    toast.success("Test notification sent! Check your OS notification area.");
  }, [permission, expenses, budget]);

  const permissionLabel = {
    granted: { text: "Allowed", color: "bg-success/15 text-success" },
    denied:  { text: "Blocked — allow in browser settings", color: "bg-danger/15 text-danger" },
    default: { text: "Not requested yet", color: "bg-warning/15 text-warning" },
    unsupported: { text: "Not supported in this browser", color: "bg-muted text-muted-foreground" },
  }[permission] || { text: permission, color: "bg-muted text-muted-foreground" };

  return (
    <Card className="p-5 shadow-soft mt-4">
      <div className="flex items-center gap-2 mb-4">
        <BellRing className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Daily Reminders</h3>
        <Badge className={`ml-auto text-xs px-2 py-0.5 rounded-full ${permissionLabel.color}`}>
          {permissionLabel.text}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Get a daily notification to review your expenses, budget, and savings. Opens the app with your daily summary.
      </p>

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 mb-3">
        <div className="flex items-center gap-2">
          {enabled ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-medium">
            {enabled ? "Reminder is ON" : "Reminder is OFF"}
          </span>
        </div>
        <Switch checked={enabled} onCheckedChange={toggle} />
      </div>

      {/* Time picker */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">Reminder time</Label>
          <input
            type="time"
            value={time}
            onChange={(e) => saveTime(e.target.value)}
            className="bg-transparent text-sm font-semibold outline-none w-full cursor-pointer"
          />
        </div>
        <span className="text-xs text-muted-foreground">{formatTime(time)}</span>
      </div>

      {/* Test button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={testNow}
      >
        <TestTube className="h-3.5 w-3.5 mr-2" />
        Send test notification now
      </Button>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Reminder fires once per day at {formatTime(time)}. Keep the app open in a browser tab.
      </p>
    </Card>
  );
}

function formatTime(hhmm) {
  if (!hhmm) return "8:00 PM";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
