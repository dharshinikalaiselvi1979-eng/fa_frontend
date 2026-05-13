import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, LogOut, Bot } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useCallback } from "react";
import ChatWidget from "@/components/ChatWidget";
import { useReminder } from "@/hooks/useReminder";
import DailyCheckIn from "@/components/DailyCheckIn";

export default function AppLayout() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { notifications } = useFinance();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;
  const [chatOpen, setChatOpen]         = useState(false);
  const [checkIn, setCheckIn]           = useState(null); // daily check-in popup

  // Mount reminder system — fires every 60s, shows OS + in-app popup
  const handleReminderTrigger = useCallback((summary) => {
    setCheckIn(summary);
  }, []);
  useReminder({ onTrigger: handleReminderTrigger });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-3 md:px-4 gap-2">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger animate-pulse" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 ml-1">
                <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto animate-fade-in">
            <Outlet />
          </main>
        </div>

        {/* Floating AI button */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full gradient-primary shadow-glow flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open AI chat"
        >
          <Bot className="h-6 w-6 text-white" />
        </button>
        <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />

        {/* Daily check-in popup (appears at reminder time) */}
        {checkIn && (
          <DailyCheckIn summary={checkIn} onDismiss={() => setCheckIn(null)} />
        )}

      </div>
    </SidebarProvider>
  );
}
