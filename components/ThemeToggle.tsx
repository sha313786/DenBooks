"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export default function ThemeToggle({ className = "", compact = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Bright/Dark Mode"
      className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer select-none ${
        isDark
          ? "border-slate-700/80 bg-slate-800/80 text-amber-300 hover:border-amber-400/50 hover:bg-slate-800"
          : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-100"
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun size={13} className="text-amber-400 shrink-0" />
          {!compact && <span>Bright</span>}
        </>
      ) : (
        <>
          <Moon size={13} className="text-indigo-600 shrink-0" />
          {!compact && <span>Dark</span>}
        </>
      )}
    </button>
  );
}
