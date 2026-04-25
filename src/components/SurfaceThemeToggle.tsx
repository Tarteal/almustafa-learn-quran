import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SurfaceTheme = "dark" | "light";

const STORAGE_KEY = "surface-theme";

export const getStoredSurfaceTheme = (): SurfaceTheme => {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" ? "light" : "dark";
};

export const useSurfaceTheme = () => {
  const [theme, setTheme] = useState<SurfaceTheme>(() => getStoredSurfaceTheme());
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);
  return { theme, setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
};

interface Props {
  theme: SurfaceTheme;
  onToggle: () => void;
  className?: string;
}

const SurfaceThemeToggle = ({ theme, onToggle, className }: Props) => {
  const isDark = theme === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default SurfaceThemeToggle;
