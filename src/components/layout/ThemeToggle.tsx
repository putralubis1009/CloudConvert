"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ isMobile = false }: { isMobile?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={
          isMobile
            ? "p-2 rounded-lg w-9 h-9"
            : "p-2.5 rounded-xl border border-transparent w-10 h-10"
        }
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  if (isMobile) {
    return (
      <button
        type="button"
        aria-label="Toggle tema gelap/terang"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle tema gelap/terang"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all duration-200"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
