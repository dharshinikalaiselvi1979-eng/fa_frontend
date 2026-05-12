import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !pwd) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, pwd);
      toast.success("Welcome back to FIN AI 💰");
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-md p-8 shadow-elegant animate-scale-in">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
            ₹
          </div>
          <div>
            <h1 className="text-2xl font-bold">FIN AI 💰</h1>
            <p className="text-xs text-muted-foreground">
              Smart Personal Finance
            </p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Login to manage your money smartly.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox /> <span>Remember me</span>
            </label>
            <button type="button" className="text-primary hover:underline">
              Forgot password?
            </button>
          </div>
          {error && (
            <p className="text-sm text-danger animate-fade-in">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full gradient-primary"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-sm text-center mt-6 text-muted-foreground">
          New here?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
