"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  variant?: "icon" | "pill" | "dropdown";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "icon",
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  if (variant === "pill") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme"
        className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:border-zinc-400 dark:hover:border-zinc-500 transition-all cursor-pointer ${className}`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
        >
          {isDark ? (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-100" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-zinc-900" />
              <span>Light</span>
            </>
          )}
        </motion.div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs cursor-pointer ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-zinc-100" />
        ) : (
          <Sun className="w-4 h-4 text-zinc-900" />
        )}
      </motion.div>
    </button>
  );
};
