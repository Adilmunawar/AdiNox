
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScaleIn, Pulse } from "@/components/ui/animations";
import { Shield, Key, Lock, Activity, ZapOff, Infinity, LucideIcon } from "lucide-react";

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
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  
  // Define security icons as an array of LucideIcon components
  const securityIcons: Array<LucideIcon> = [
    Shield,
    Key,
    Lock,
    Activity,
    ZapOff,
    Infinity
  ];
  
  // Token digits split for 3D effect
  const tokenDigits = token.split('');
  
  const sizeMap = {
    sm: {
      container: "h-32 w-32",
      digit: "text-lg",
      depth: 12,
      iconSize: "h-6 w-6"
    },
    md: {
      container: "h-48 w-48",
      digit: "text-2xl",
      depth: 18,
      iconSize: "h-8 w-8"
    },
    lg: {
      container: "h-64 w-64",
      digit: "text-3xl",
      depth: 24,
      iconSize: "h-10 w-10"
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    setMousePosition({ x, y });
    
    // Change glow intensity based on mouse position
    const distanceFromCenter = Math.sqrt(x * x + y * y) * 2; // Normalized to 0-1
    setGlowIntensity(0.5 + distanceFromCenter);
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
          "flex items-center justify-center cursor-pointer group",
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
        style={{
          boxShadow: `0 0 ${20 * glowIntensity}px ${8 * glowIntensity}px rgba(155, 135, 245, ${0.3 * glowIntensity})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-adinox-purple/10 to-adinox-red/10 rounded-xl" />
        
        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 overflow-hidden rounded-xl"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute bg-gradient-to-r from-adinox-purple/10 to-adinox-red/10 rounded-full",
                "opacity-30"
              )}
              style={{
                width: `${Math.random() * 50 + 20}px`,
                height: `${Math.random() * 50 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 40 - 20],
                y: [0, Math.random() * 40 - 20],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
          ))}
        </motion.div>
        
        {/* Security Symbols - properly type and render Lucide icons */}
        {securityIcons.map((Icon, index) => {
          const angle = (index / securityIcons.length) * Math.PI * 2;
          const radius = size === "sm" ? 50 : size === "md" ? 65 : 80;
          
          return (
            <motion.div 
              key={index}
              className={cn(
                "absolute text-white/70",
                sizeMap[size].iconSize,
                index % 2 === 0 ? "text-adinox-purple" : "text-adinox-red"
              )}
              style={{
                left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                top: `calc(50% + ${Math.sin(angle) * radius}px)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.7, 1, 0.7],
                scale: [0.8, 1, 0.8],
                rotate: isRotating ? 360 : 0
              }}
              transition={{ 
                duration: 3 + index, 
                delay: index * 0.2,
                ease: "easeInOut", 
                repeat: Infinity,
              }}
            >
              <Icon className="w-full h-full" />
            </motion.div>
          );
        })}
        
        {/* Token digits with enhanced 3D effect */}
        <div className="flex flex-wrap justify-center gap-1 p-4 max-w-[80%] z-10 relative">
          {tokenDigits.map((digit, index) => (
            <motion.div
              key={index}
              className={cn(
                "font-mono font-bold",
                sizeMap[size].digit
              )}
              initial={{ opacity: 0, z: -20 }}
              animate={{ 
                opacity: 1, 
                z: 0,
                color: ["rgba(255,255,255,0.9)", "rgba(219,188,250,1)", "rgba(255,255,255,0.9)"],
                textShadow: [
                  "0 0 8px rgba(155,135,245,0.5)",
                  "0 0 15px rgba(155,135,245,0.8)",
                  "0 0 8px rgba(155,135,245,0.5)"
                ]
              }}
              transition={{ 
                delay: index * 0.1, 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{ 
                transformStyle: "preserve-3d",
                transform: `translateZ(${Math.sin(index + Date.now() / 10000) * sizeMap[size].depth}px)`
              }}
            >
              {digit}
            </motion.div>
          ))}
        </div>
        
        {/* Enhanced glowing ring effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            boxShadow: [
              "inset 0 0 10px rgba(155,135,245,0.3)",
              "inset 0 0 20px rgba(155,135,245,0.6)",
              "inset 0 0 10px rgba(155,135,245,0.3)"
            ]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Pulsing edge highlight */}
        <motion.div
          className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ 
            background: `linear-gradient(90deg, 
              rgba(155,135,245,0.3), 
              rgba(214,188,250,0.3), 
              rgba(234,56,76,0.3), 
              rgba(214,188,250,0.3), 
              rgba(155,135,245,0.3)
            )`,
            backgroundSize: "200% 100%"
          }}
        />
        
        {/* Glowing effect */}
        <Pulse className="absolute inset-0 bg-gradient-to-r from-adinox-purple/10 via-transparent to-adinox-red/10 rounded-xl">
          <div></div>
        </Pulse>
      </motion.div>
    </ScaleIn>
  );
};

export default ThreeDToken;
