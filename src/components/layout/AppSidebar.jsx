import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  FolderKanban,
  Target,
  BarChart3,
  Bot,
  Bell,
  Settings,
  Sparkles,
  Trophy,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Expenses", url: "/expenses", icon: Wallet },
  { title: "Categories", url: "/categories", icon: FolderKanban },
  { title: "Budget", url: "/budget", icon: Target },
  { title: "Goals", url: "/goals", icon: Trophy },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];
const ai = [
  { title: "AI Insights", url: "/insights", icon: Sparkles },
  { title: "AI Chat", url: "/chat", icon: Bot },
];
const account = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p);

  const renderItems = (items) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink
              to={item.url}
              end
              className={({ isActive: a }) =>
                `flex items-center gap-3 rounded-lg transition-all ${a ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60"}`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
            <span className="text-white font-bold">₹</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-bold text-base">
                FIN AI <span className="text-primary">💰</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Smart Finance
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
          <SidebarGroupContent>{renderItems(main)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>AI Tools</SidebarGroupLabel>}
          <SidebarGroupContent>{renderItems(ai)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Account</SidebarGroupLabel>}
          <SidebarGroupContent>{renderItems(account)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
