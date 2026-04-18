"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative w-10 h-10 rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 0 : 1,
          rotate: theme === "dark" ? 90 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-amber-500" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          rotate: theme === "dark" ? 0 : -90,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-blue-400" />
      </motion.div>
      <span className="sr-only">Changer le thème</span>
    </Button>
  );
}
