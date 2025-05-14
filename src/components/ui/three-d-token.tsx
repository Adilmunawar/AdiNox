
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScaleIn, Pulse } from "@/components/ui/animations";
import { Shield, Key, Lock } from "lucide-react";

interface ThreeDTokenProps {
  token: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

export const ThreeDToken = ({ 
  token, 
  size = "md", 
  className,
  animate = true 
}: ThreeDTokenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Token digits split for 3D effect
  const tokenDigits = token.split('');
  
  const sizeMap = {
    sm: {
      container: "h-32 w-32",
      digit: "text-lg",
      depth: 12
    },
    md: {
      container: "h-48 w-48",
      digit: "text-2xl",
      depth: 18
    },
    lg: {
      container: "h-64 w-64",
      digit: "text-3xl",
      depth: 24
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    setMousePosition({ x, y });
  };

  useEffect(() => {
    if (!animate) return;
    
    // Auto rotation effect when not interacting
    const interval = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => setIsRotating(false), 3000);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [animate]);

  return (
    <ScaleIn className={cn("relative perspective-1000", className)}>
      <motion.div 
        ref={containerRef}
        className={cn(
          "relative rounded-xl bg-gradient-to-br from-adinox-purple/20 to-adinox-red/20 backdrop-blur-sm border border-white/10",
          "flex items-center justify-center cursor-pointer",
          sizeMap[size].container
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsRotating(false)}
        animate={isRotating ? { 
          rotateY: [0, 360], 
          transition: { duration: 3, ease: "easeInOut" } 
        } : { 
          rotateY: mousePosition.x * 30,
          rotateX: -mousePosition.y * 30,
          transition: { duration: 0.2 }
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-adinox-purple/10 to-adinox-red/10 rounded-xl" />
        
        {/* Security Symbols */}
        <motion.div 
          className="absolute -top-4 -right-4 text-primary"
          animate={{ rotate: isRotating ? 360 : 0 }}
          transition={{ duration: 3, ease: "linear", repeat: isRotating ? Infinity : 0 }}
        >
          <Shield className="h-8 w-8" />
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-3 -left-3 text-adinox-red"
          animate={{ rotate: isRotating ? -360 : 0 }}
          transition={{ duration: 3.5, ease: "linear", repeat: isRotating ? Infinity : 0 }}
        >
          <Lock className="h-6 w-6" />
        </motion.div>
        
        {/* Token digits with 3D effect */}
        <div className="flex flex-wrap justify-center gap-1 p-4 max-w-[80%]">
          {tokenDigits.map((digit, index) => (
            <motion.div
              key={index}
              className={cn(
                "font-mono font-bold text-white/90",
                sizeMap[size].digit
              )}
              initial={{ opacity: 0, z: -20 }}
              animate={{ 
                opacity: 1, 
                z: 0,
                textShadow: "0 0 8px rgba(255,255,255,0.5)"
              }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.8,
              }}
              style={{ 
                transformStyle: "preserve-3d",
                transform: `translateZ(${Math.sin(index) * sizeMap[size].depth}px)`
              }}
            >
              {digit}
            </motion.div>
          ))}
        </div>
        
        {/* Glowing effect */}
        <Pulse className="absolute inset-0 bg-gradient-to-r from-adinox-purple/10 via-transparent to-adinox-red/10 rounded-xl" />
      </motion.div>
    </ScaleIn>
  );
};

export default ThreeDToken;
