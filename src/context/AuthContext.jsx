import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/services";
import { toast } from "sonner";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(
    () => localStorage.getItem("fin.authed") === "1"
  );
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem("fin.authUser");
    return s ? JSON.parse(s) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("fin.authed", isAuthed ? "1" : "0");
  }, [isAuthed]);

  const login = useCallback(async (emailOrBool, password) => {
    // Support legacy call: login() with no args (used by other pages still)
    if (emailOrBool === undefined || emailOrBool === true) {
      setIsAuthed(true);
      return;
    }
    // Real backend call: login(email, password)
    setLoading(true);
    try {
      const data = await authService.login(emailOrBool, password);
      localStorage.setItem("fin.token", data.token);
      localStorage.setItem("fin.authUser", JSON.stringify({ name: data.name, email: data.email, _id: data._id, phoneNumber: data.phoneNumber }));
      // Clear any stale local finance data so we load fresh from backend
      localStorage.removeItem("fin.expenses");
      localStorage.removeItem("fin.budget");
      localStorage.removeItem("fin.banks");
      setUser({ name: data.name, email: data.email, _id: data._id, phoneNumber: data.phoneNumber });
      setIsAuthed(true);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed. Check your credentials.";
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, phoneNumber) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, phoneNumber);
      localStorage.setItem("fin.token", data.token);
      localStorage.setItem("fin.authUser", JSON.stringify({ name: data.name, email: data.email, _id: data._id, phoneNumber: data.phoneNumber }));
      // Clear any stale local finance data for a clean start
      localStorage.removeItem("fin.expenses");
      localStorage.removeItem("fin.budget");
      localStorage.removeItem("fin.banks");
      setUser({ name: data.name, email: data.email, _id: data._id, phoneNumber: data.phoneNumber });
      setIsAuthed(true);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed. Try again.";
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem("fin.authUser");
    localStorage.removeItem("fin.token");
    setUser(null);
    setIsAuthed(false);
  }, []);

  return (
    <Ctx.Provider value={{ isAuthed, user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("AuthProvider missing");
  return c;
};
