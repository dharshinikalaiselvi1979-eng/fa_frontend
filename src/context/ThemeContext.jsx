import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("fin.theme") || "light",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("fin.theme", theme);
  }, [theme]);
  return (
    <Ctx.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export const useTheme = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("ThemeProvider missing");
  return c;
};
