
import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const sizeMap = {
    sm: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-lg" },
    md: { container: "h-10 w-10", icon: "h-5 w-5", text: "text-xl" },
    lg: { container: "h-12 w-12", icon: "h-6 w-6", text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn(
        "rounded-xl bg-primary/12 border border-primary/15 flex items-center justify-center",
        sizeMap[size].container
      )}>
        <Shield className={cn("text-primary", sizeMap[size].icon)} />
      </div>
      
      {showText && (
        <h1 className={cn("font-bold tracking-tight text-foreground", sizeMap[size].text)}>
          Adi<span className="text-primary">Nox</span>
        </h1>
      )}
    </div>
  );
};

export default Logo;
