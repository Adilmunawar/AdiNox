
import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Fade In animation component with enhanced features
export const FadeIn = ({ 
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
      transition={{ delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Slide In animation component
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
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    top: { x: 0, y: -50 },
    bottom: { x: 0, y: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration, type: "spring", damping: 15, stiffness: 100 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Pulse animation component
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
  repeat?: number;
}) => (
  <motion.div
    animate={{ scale }}
    transition={{ duration, repeat, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Enhanced Scale animation component
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
    transition={{ delay, duration, type: "spring", stiffness: 200, damping: 15 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered children animation with enhanced controls
export const StaggerContainer = ({
  children,
  staggerChildren = 0.1,
  delayChildren = 0,
  className = "",
  direction = "down"
}: {
  children: React.ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) => {
  const directionVariants: Record<string, Variants> = {
    up: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    },
    down: {
      hidden: { opacity: 0, y: -20 },
      show: { opacity: 1, y: 0 }
    },
    left: {
      hidden: { opacity: 0, x: 20 },
      show: { opacity: 1, x: 0 }
    },
    right: {
      hidden: { opacity: 0, x: -20 },
      show: { opacity: 1, x: 0 }
    }
  };
  
  return (
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
      {React.Children.map(children, (child) => 
        React.isValidElement(child) ? 
          <motion.div variants={directionVariants[direction]}>
            {child}
          </motion.div> : 
          child
      )}
    </motion.div>
  );
};

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
    transition={{ type: "spring", stiffness: 100 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Enhanced Loading spinner animation
export const LoadingSpinner = ({
  size = "md",
  className = "",
  color = "primary"
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "secondary" | "accent" | "white";
}) => {
  const sizeMap = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4"
  };
  
  const colorMap = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    white: "border-white"
  };
  
  return (
    <motion.div
      className={`${sizeMap[size]} rounded-full ${colorMap[color]} border-t-transparent ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// New Bounce animation
export const Bounce = ({
  children,
  className = "",
  height = 5,
  duration = 1.5,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  height?: number;
  duration?: number;
  delay?: number;
}) => (
  <motion.div
    animate={{ y: [0, -height, 0] }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// New Shake animation for alerts or attention
export const Shake = ({
  children,
  className = "",
  trigger = false
}: {
  children: React.ReactNode;
  className?: string;
  trigger: boolean;
}) => (
  <motion.div
    animate={trigger ? { 
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    } : {}}
    className={className}
  >
    {children}
  </motion.div>
);

// New Typewriter animation for text
export const Typewriter = ({ 
  text, 
  className = "",
  speed = 40
}: { 
  text: string;
  className?: string;
  speed?: number;
}) => {
  const [displayText, setDisplayText] = React.useState("");
  
  React.useEffect(() => {
    let currentIndex = 0;
    setDisplayText("");
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);
  
  return <span className={className}>{displayText}</span>;
};

// New Flip animation
export const Flip = ({
  children,
  className = "",
  trigger = false
}: {
  children: React.ReactNode;
  className?: string;
  trigger: boolean;
}) => (
  <motion.div
    animate={trigger ? { rotateY: 360 } : {}}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// New animated page transition wrapper
export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// New InView animation component that triggers when element is in viewport
export const RevealOnScroll = ({ 
  children, 
  className = ""
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// New GlowPulse animation for emphasis
export const GlowPulse = ({ 
  children, 
  className = "",
  color = "rgba(155, 135, 245, 0.6)"
}: { 
  children: React.ReactNode;
  className?: string;
  color?: string;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 0px ${color}`,
          `0 0 10px ${color}`,
          `0 0 0px ${color}`
        ]
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// New Magnetic animation for hover effects
export const MagneticEffect = ({ 
  children, 
  className = "",
  strength = 15
}: { 
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const { clientX, clientY } = e;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      
      const x = (clientX - (left + width / 2)) / strength;
      const y = (clientY - (top + height / 2)) / strength;
      
      setPosition({ x, y });
    }
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// New Parallax effect for scrolling
export const ParallaxLayer = ({
  children,
  className = "",
  speed = 0.5
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) => {
  const [scrollY, setScrollY] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <motion.div
      className={className}
      style={{ y: scrollY * speed }}
    >
      {children}
    </motion.div>
  );
};

// New animated number counter
export const CountUp = ({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  className = "",
  prefix = "",
  suffix = "",
  decimals = 0
}: {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = React.useState(start);
  const countRef = React.useRef(start);
  
  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const totalChange = end - start;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = start + totalChange * progress;
      
      countRef.current = currentCount;
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    
    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(step);
    }, delay * 1000);
    
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [start, end, duration, delay]);
  
  const formattedCount = React.useMemo(() => {
    return `${prefix}${count.toFixed(decimals)}${suffix}`;
  }, [count, prefix, suffix, decimals]);
  
  return <span className={className}>{formattedCount}</span>;
};

// New text scramble animation
export const TextScramble = ({
  text,
  className = "",
  duration = 2,
  chars = "!<>-_\\/[]{}—=+*^?#_"
}: {
  text: string;
  className?: string;
  duration?: number;
  chars?: string;
}) => {
  const [displayText, setDisplayText] = React.useState(text);
  
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    let iteration = 0;
    const maxIterations = 10;
    
    interval = setInterval(() => {
      setDisplayText(prev => {
        return prev.split("").map((char, idx) => {
          if (idx < (iteration / maxIterations) * text.length) {
            return text[idx];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
      });
      
      iteration += 1;
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, duration * 100);
    
    return () => clearInterval(interval);
  }, [text, chars, duration]);
  
  return <span className={className}>{displayText}</span>;
};
