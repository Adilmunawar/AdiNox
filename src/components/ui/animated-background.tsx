
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
    </>
  );
};

export default AnimatedBackground;
