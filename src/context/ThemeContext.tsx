
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Force dark theme only
  const [theme] = useState<Theme>("dark");
  
  const { toast } = useToast();

  // Always apply dark theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  // Disabled theme toggling - always dark
  const toggleTheme = () => {
    // Theme toggle disabled - always dark mode
  };
  
  const setTheme = () => {
    // Theme setting disabled - always dark mode
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setTheme as any }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
