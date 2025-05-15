
import React from "react";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  interactive?: boolean;
}

export const Logo = ({ size = "md", showText = true, className, interactive = true }: LogoProps) => {
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

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className={cn("flex items-center gap-3", className)}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <motion.div 
        className={cn(
          "rounded-full bg-gradient-to-br from-adinox-purple to-adinox-red/70 flex items-center justify-center relative",
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
        
        {/* Animated shield icon */}
        <motion.div
          animate={isHovered ? {
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 0],
          } : {}}
          transition={{ duration: 0.6 }}
        >
          <Shield className={cn("text-white", sizeMap[size].icon)} />
        </motion.div>
        
        {/* Background pulse effect */}
        {isHovered && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-white"
          />
        )}
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
          <motion.span 
            animate={isHovered ? { y: [-2, 2, -2] } : {}}
            transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
          >
            Adi
          </motion.span>
          <motion.span 
            animate={isHovered ? { y: [2, -2, 2] } : {}}
            transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0, delay: 0.1 }}
          >
            Nox
          </motion.span>
          {" "}
          <motion.span 
            animate={isHovered ? { 
              scale: [1, 1.05, 1],
              color: ["#9B87F5", "#ea384c", "#9B87F5"] 
            } : {}}
            transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0 }}
            className="bg-clip-text text-transparent"
          >
            Authenticator
          </motion.span>
        </motion.h1>
      )}
    </div>
  );
};

export default Logo;
