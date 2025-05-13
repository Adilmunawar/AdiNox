
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };
  
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={`relative overflow-hidden ${sizeClasses[size]} ${className} transition-colors duration-300 hover:bg-primary/10`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-adinox-purple/10 to-adinox-red/10' : 'bg-gradient-to-tr from-yellow-200/10 to-amber-100/10'}`} />
      
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Sun className={`${iconSizes[size]} text-yellow-300`} />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className={`${iconSizes[size]} text-yellow-300 absolute opacity-70`} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Moon className={`${iconSizes[size]} text-adinox-purple`} />
            <motion.div
              className="absolute top-0 right-0"
              animate={{ 
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-adinox-purple/60" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Stars for dark mode button */}
      {theme === "light" && (
        <>
          <motion.div 
            className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-adinox-purple/60"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="absolute bottom-2 right-1.5 w-0.5 h-0.5 rounded-full bg-adinox-purple/60"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;
