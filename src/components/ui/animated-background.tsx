
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  return (
    <div className={cn("fixed inset-0 -z-10 bg-background overflow-hidden", className)}>
      {/* Soft teal ambient orb */}
      <motion.div 
        className="absolute top-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full blur-[180px]"
        style={{ background: 'radial-gradient(circle, hsl(168 76% 42% / 0.04), transparent 70%)' }}
        animate={{ x: [0, 30, -15, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary orb */}
      <motion.div 
        className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(circle, hsl(168 76% 42% / 0.03), transparent 70%)' }}
        animate={{ x: [0, -25, 15, 0], y: [0, 25, -20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Center accent */}
      <motion.div 
        className="absolute top-[35%] left-[25%] w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, hsl(168 76% 42% / 0.02), transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(210 20% 12%) 0.5px, transparent 0.5px)',
        backgroundSize: '32px 32px'
      }} />
    </div>
  );
};

export default AnimatedBackground;
