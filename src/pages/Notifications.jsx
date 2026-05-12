import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import { notificationService } from "@/services";
import { Bell, AlertTriangle, Info, CheckCircle2, Loader2 } from "lucide-react";

export default function Notifications() {
  const { notifications: localNotifications } = useFinance();
  const [backendNotifs, setBackendNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("fin.token");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    notificationService.getAll()
      .then((data) => setBackendNotifs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setBackendNotifs((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  // Merge backend + local notifications
  const notifications = [
    ...backendNotifs.map((n) => ({
      id: n._id,
      title: n.title,
      message: n.message,
      type: n.type === "Alert" ? "warning" : "info",
      date: n.createdAt,
      read: n.isRead,
      fromBackend: true,
    })),
    ...localNotifications,
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Budget alerts, summaries, and AI insights."
      />
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon =
            n.type === "warning"
              ? AlertTriangle
              : n.type === "success"
                ? CheckCircle2
                : Info;
          const color =
            n.type === "warning"
              ? "warning"
              : n.type === "success"
                ? "success"
                : "accent";
          return (
            <Card
              key={n.id}
              className={`p-4 shadow-soft flex gap-3 ${!n.read ? "border-primary/30" : ""}`}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `hsl(var(--${color}) / 0.15)`,
                  color: `hsl(var(--${color}))`,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{n.title}</h3>
                  {!n.read && n.fromBackend ? (
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => markRead(n.id)}>Mark read</Button>
                  ) : !n.read ? (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.date).toLocaleString("en-IN")}
                </p>
              </div>
            </Card>
          );
        })}
        {notifications.length === 0 && (
          <Card className="p-12 text-center shadow-soft">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
