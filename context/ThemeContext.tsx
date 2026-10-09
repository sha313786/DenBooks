"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved =
        (localStorage.getItem("denbooks_theme") as Theme) ||
        (localStorage.getItem("denbooks_landing_theme") as Theme) ||
        "dark";

      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        applyThemeToDocument(saved);
      } else {
        applyThemeToDocument("dark");
      }
    } catch {
      applyThemeToDocument("dark");
    }

    // Sync across tabs/windows
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "denbooks_theme" || e.key === "denbooks_landing_theme") {
        const next = (e.newValue as Theme) || "dark";
        if (next === "light" || next === "dark") {
          setThemeState(next);
          applyThemeToDocument(next);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const applyThemeToDocument = (t: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
    root.setAttribute("data-theme", t);
    try {
      localStorage.setItem("denbooks_theme", t);
      localStorage.setItem("denbooks_landing_theme", t);
    } catch {}
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyThemeToDocument(t);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    applyThemeToDocument(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
