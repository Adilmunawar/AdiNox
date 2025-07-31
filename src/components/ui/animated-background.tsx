
import { cn } from "@/lib/utils";
import React from "react";
import { useTheme } from "@/context/ThemeContext";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  const { theme } = useTheme();
  
  return (
    <>
      {/* Simple gradient background optimized for performance */}
      <div className={cn(
        "fixed inset-0 -z-10",
        theme === 'dark' 
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100",
        className
      )} />
      
      {/* Subtle overlay for texture */}
      <div className={cn(
        "fixed inset-0 -z-10 opacity-40",
        theme === 'dark'
          ? "bg-[radial-gradient(circle_at_50%_50%,rgba(155,135,245,0.1)_0%,transparent_50%)]"
          : "bg-[radial-gradient(circle_at_50%_50%,rgba(155,135,245,0.05)_0%,transparent_50%)]"
      )} />
    </>
  );
};

export default AnimatedBackground;
