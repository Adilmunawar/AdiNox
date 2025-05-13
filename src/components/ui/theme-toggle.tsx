
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ThemeToggle = ({ 
  variant = "outline", 
  size = "sm",
  className = ""
}: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };
  
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={`relative overflow-hidden ${sizeClasses[size]} ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <motion.div
        initial={{ opacity: 0, rotate: -180 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 180 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-yellow-300" />
        ) : (
          <Moon className="h-4 w-4 text-primary" />
        )}
      </motion.div>
    </Button>
  );
};

export default ThemeToggle;
