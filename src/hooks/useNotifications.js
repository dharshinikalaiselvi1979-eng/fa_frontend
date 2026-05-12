import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services";

/**
 * Hook for the Notifications page.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("fin.token");

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.warn("Could not fetch notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(
    async (id) => {
      if (!token) return;
      try {
        const updated = await notificationService.markRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        return updated;
      } catch (err) {
        console.warn("Mark read failed:", err.message);
      }
    },
    [token]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    loading,
    markRead,
    unreadCount,
    refresh: fetchNotifications,
  };
}

export default useNotifications;
