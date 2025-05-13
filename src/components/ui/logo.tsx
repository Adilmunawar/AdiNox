
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
          "rounded-full bg-gradient-to-br from-adinox-purple to-adinox-red/70 flex items-center justify-center",
          sizeMap[size].container
        )}
        whileHover={{ 
          scale: 1.1,
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.5 }
        }}
        animate={{ 
          boxShadow: [
            "0 0 0 rgba(155, 135, 245, 0.2)", 
            "0 0 25px rgba(155, 135, 245, 0.6)", 
            "0 0 0 rgba(155, 135, 245, 0.2)"
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-adinox-purple/20 to-adinox-red/20"
        />
        <Shield className={cn("text-white", sizeMap[size].icon)} />
      </motion.div>
      
      {showText && (
        <motion.h1 
          className={cn(
            "font-bold text-transparent",
            sizeMap[size].text
          )}
          style={{
            backgroundImage: "linear-gradient(90deg, #ea384c, #9B87F5, #D6BCFA, #ea384c)",
            backgroundSize: "300% 100%",
            backgroundClip: "text",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          AdiNox Authenticator
        </motion.h1>
      )}
    </div>
  );
};

export default Logo;
