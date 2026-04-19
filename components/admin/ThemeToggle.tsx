"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdminI18n } from "@/components/admin/AdminI18nProvider";

export function ThemeToggle() {
  const { t } = useAdminI18n();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative h-10 w-10 rounded-xl",
        "bg-secondary/60 hover:bg-secondary",
        "border border-border/60",
        "transition-colors duration-200"
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
    >
      {!mounted ? (
        <span className="h-5 w-5 rounded-full bg-muted-foreground/20" />
      ) : (
        <>
          <motion.div
            initial={false}
            animate={{
              scale: theme === "dark" ? 0 : 1,
              rotate: theme === "dark" ? 90 : 0,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
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
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="absolute"
          >
            <Moon className="h-5 w-5 text-sky-400" />
          </motion.div>
        </>
      )}
      <span className="sr-only">{t("theme.toggle")}</span>
    </Button>
  );
}
