
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  return (
    <div className={cn("fixed inset-0 -z-10 bg-background overflow-hidden", className)}>
      {/* Large ambient orbs */}
      <motion.div 
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/6 rounded-full blur-[100px]"
        animate={{ 
          x: [0, 30, -20, 0], 
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-[80px]"
        animate={{ 
          x: [0, -30, 20, 0], 
          y: [0, 20, -30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-primary/3 rounded-full blur-[60px]"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
    </div>
  );
};

export default AnimatedBackground;
