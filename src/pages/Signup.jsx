import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => {
    let s = 0;
    if (pwd.length >= 6) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  }, [pwd]);

  const labels = ["Too weak", "Weak", "Okay", "Good", "Strong"];
  const colors = [
    "bg-danger",
    "bg-danger",
    "bg-warning",
    "bg-warning",
    "bg-success",
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !pwd) return toast.error("Fill all fields");
    if (pwd !== confirm) return toast.error("Passwords don't match");
    if (strength < 2) return toast.error("Password too weak");
    setLoading(true);
    try {
      await register(name, email, pwd, phoneNumber);
      toast.success("Account created! Welcome 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Registration failed");
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
        <h2 className="text-xl font-semibold mb-1">Create your account</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Start managing money like a pro.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative mt-1">
              <Input
                type={show ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {pwd && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < strength ? colors[strength] : "bg-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {labels[strength]}
                </p>
              </div>
            )}
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
            {confirm && confirm !== pwd && (
              <p className="text-xs text-danger mt-1">Passwords don't match</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-center mt-6 text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
