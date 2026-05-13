import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PageHeader from "@/components/PageHeader";
import { useFinance } from "@/context/FinanceContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import DailyReminderCard from "@/components/DailyReminderCard";

export default function Settings() {
  const { theme, toggle } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [currency, setCurrency] = useState("INR");

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and preferences."
      />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft lg:col-span-2">
          <h3 className="font-semibold mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="gradient-primary text-white text-lg font-bold">
                {name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <Button
            className="mt-4 gradient-primary"
            onClick={async () => {
              try {
                await updateProfile({ name, email, phoneNumber });
              } catch (e) {
                toast.error("Failed to update profile. Please try again.");
              }
            }}
          >
            Save changes
          </Button>

          <h3 className="font-semibold mt-8 mb-3">Change Password</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Current</Label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <div>
              <Label>New password</Label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => toast.success("Password updated")}
          >
            Update password
          </Button>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-semibold mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Dark mode</span>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggle} />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full mt-6"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </Card>
      </div>

      {/* ── Daily Reminders ─────────────────────────────────── */}
      <DailyReminderCard />
    </div>
  );
}
