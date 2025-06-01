
import React from "react";
import { motion } from "framer-motion";

// High-performance animation components optimized for 60fps

export const PerformantFadeIn = React.memo(({ 
  children, 
  delay = 0,
  duration = 0.5,
  className = "",
  direction = null
}: { 
  children: React.ReactNode; 
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | null;
}) => {
  const directionMap: Record<string, {x: number, y: number}> = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none: { y: 0, x: 0 }
  };

  const directionValue = direction ? directionMap[direction] : directionMap["none"];

  return (
    <motion.div
      initial={{ opacity: 0, ...directionValue }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        delay, 
        duration, 
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for smoother animation
        type: "tween"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export const PerformantSlideIn = React.memo(({
  children,
  direction = "left",
  delay = 0,
  duration = 0.5,
  className = ""
}: {
  children: React.ReactNode;
  direction?: "left" | "right" | "top" | "bottom";
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  const directionMap = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    top: { x: 0, y: -50 },
    bottom: { x: 0, y: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        delay, 
        duration, 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        mass: 1
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export const PerformantScale = React.memo(({
  children,
  delay = 0,
  duration = 0.5,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      delay, 
      duration, 
      type: "spring", 
      stiffness: 260, 
      damping: 20 
    }}
    className={className}
  >
    {children}
  </motion.div>
));

export const PerformantHover = React.memo(({
  children,
  scale = 1.05,
  className = ""
}: {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) => (
  <motion.div
    whileHover={{ 
      scale,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }}
    whileTap={{ scale: 0.98 }}
    className={className}
  >
    {children}
  </motion.div>
));

export const PerformantStagger = React.memo(({
  children,
  staggerChildren = 0.1,
  delayChildren = 0,
  className = ""
}: {
  children: React.ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
}) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren,
          delayChildren,
          type: "tween",
          ease: [0.25, 0.1, 0.25, 1]
        }
      }
    }}
    className={className}
  >
    {React.Children.map(children, (child, index) => 
      React.isValidElement(child) ? 
        <motion.div 
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div> : 
        child
    )}
  </motion.div>
));

PerformantFadeIn.displayName = "PerformantFadeIn";
PerformantSlideIn.displayName = "PerformantSlideIn";
PerformantScale.displayName = "PerformantScale";
PerformantHover.displayName = "PerformantHover";
PerformantStagger.displayName = "PerformantStagger";
