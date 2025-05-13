
import React from "react";
import { motion } from "framer-motion";

// Fade In animation component
export const FadeIn = ({ 
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
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration }}
    className={className}
  >
    {children}
  </motion.div>
);

// Slide In animation component
export const SlideIn = ({
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
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    top: { x: 0, y: -30 },
    bottom: { x: 0, y: 30 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation component
export const Pulse = ({
  children,
  className = "",
  scale = [1, 1.05, 1],
  duration = 2,
  repeat = Infinity
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number[];
  duration?: number;
  repeat?: number;  // Changed from number | "Infinity" to just number
}) => (
  <motion.div
    animate={{ scale }}
    transition={{ duration, repeat, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale animation component
export const ScaleIn = ({
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
    transition={{ delay, duration }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered children animation
export const StaggerContainer = ({
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
          delayChildren
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Loading spinner animation
export const LoadingSpinner = ({
  size = "md",
  className = ""
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeMap = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4"
  };
  
  return (
    <motion.div
      className={`${sizeMap[size]} rounded-full border-primary border-t-transparent ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};
