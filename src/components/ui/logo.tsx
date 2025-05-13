
import React from "react";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const sizeMap = {
    sm: {
      container: "h-8 w-8",
      icon: "h-4 w-4",
      text: "text-lg"
    },
    md: {
      container: "h-10 w-10",
      icon: "h-5 w-5",
      text: "text-2xl"
    },
    lg: {
      container: "h-14 w-14",
      icon: "h-7 w-7",
      text: "text-3xl"
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div 
        className={cn(
          "rounded-full bg-primary/20 flex items-center justify-center",
          sizeMap[size].container
        )}
        whileHover={{ scale: 1.05 }}
        animate={{ 
          boxShadow: ["0 0 0 rgba(124, 58, 237, 0.2)", "0 0 20px rgba(124, 58, 237, 0.4)", "0 0 0 rgba(124, 58, 237, 0.2)"]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Shield className={cn("text-primary", sizeMap[size].icon)} />
      </motion.div>
      
      {showText && (
        <h1 className={cn(
          "font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary",
          sizeMap[size].text
        )}>
          AdiNox Authenticator
        </h1>
      )}
    </div>
  );
};

export default Logo;
