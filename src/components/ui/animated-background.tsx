
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  return (
    <>
      {/* Enhanced professional dark gradient background */}
      <div className={cn(
        "fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5",
        className
      )}>
        {/* Subtle animated orbs for depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />
      </div>
    </>
  );
};

export default AnimatedBackground;
