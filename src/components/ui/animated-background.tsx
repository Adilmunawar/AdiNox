
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import NoiseTexture from "./noise-texture";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", resize);
    
    // Enhanced colors for better contrast based on theme
    const darkColors = [
      "rgba(155, 135, 245, 0.6)",  // Purple (AdiNox Purple)
      "rgba(214, 188, 250, 0.5)",  // Light Purple
      "rgba(124, 58, 237, 0.5)",   // Vivid purple
      "rgba(234, 56, 76, 0.4)",    // Red (AdiNox Red)
      "rgba(91, 33, 182, 0.5)",    // Indigo
    ];
    
    const lightColors = [
      "rgba(155, 135, 245, 0.4)",  // Purple (AdiNox Purple)
      "rgba(214, 188, 250, 0.3)",  // Lighter purple
      "rgba(124, 58, 237, 0.3)",   // Vivid purple
      "rgba(234, 56, 76, 0.2)",    // Red (AdiNox Red)
      "rgba(229, 222, 255, 0.4)",  // Soft purple
    ];
    
    // Particles array
    const particlesArray: any[] = [];
    
    // Reduce number of particles on mobile for better performance
    const numberOfParticles = isMobile ? 30 : 75;
    
    // Particle class with enhanced behavior
    class Particle {
      x: number;
      y: number;
      size: number;
      baseSize: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Smaller particle size on mobile
        this.baseSize = Math.random() * (isMobile ? 10 : 20) + (isMobile ? 8 : 15);
        this.size = this.baseSize;
        // Slower movement on mobile
        const speedFactor = isMobile ? 0.4 : 1;
        this.speedX = (Math.random() * 1.5 - 0.75) * speedFactor;
        this.speedY = (Math.random() * 1.5 - 0.75) * speedFactor;
        this.color = (theme === 'dark' ? darkColors : lightColors)[Math.floor(Math.random() * 5)];
        this.opacity = Math.random() * 0.5 + 0.5;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Less dramatic size change on mobile to prevent layout shifts
        const sizeVariation = isMobile ? 1 : 3;
        this.size = this.baseSize + Math.sin(Date.now() * 0.001) * sizeVariation;
        
        // Less dramatic opacity changes on mobile
        const opacityVariation = isMobile ? 0.1 : 0.2;
        this.opacity = 0.5 + Math.sin(Date.now() * 0.002) * opacityVariation;
        
        // Bounce off edges with slight randomization
        if (this.x < 0 || this.x > canvas.width) {
          this.speedX *= -1;
          // Less randomness on mobile
          if (!isMobile) {
            this.speedX += (Math.random() * 0.2 - 0.1);
          }
        }
        if (this.y < 0 || this.y > canvas.height) {
          this.speedY *= -1;
          // Less randomness on mobile
          if (!isMobile) {
            this.speedY += (Math.random() * 0.2 - 0.1);
          }
        }
        
        // Ensure speeds don't get too extreme
        const maxSpeed = isMobile ? 1 : 2;
        this.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, this.speedX));
        this.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, this.speedY));
      }
      
      draw() {
        // Apply color with dynamic opacity
        ctx.globalAlpha = this.opacity;
        
        // Draw gradient circle
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0, 
          this.x, this.y, this.size
        );
        
        // Parse the original color to get RGB values
        const colorMatch = this.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (colorMatch) {
          const [_, r, g, b, a] = colorMatch;
          const alpha = a ? parseFloat(a) : 1; // Parse a to number or use 1 if undefined
          
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
          gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        } else {
          // Fallback if parsing fails
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(0.6, this.color.replace(/[\d.]+\)$/, "0.4)"));
          gradient.addColorStop(1, this.color.replace(/[\d.]+\)$/, "0)"));
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect - reduced on mobile
        if (!isMobile) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = this.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = 1; // Reset global alpha
      }
    }
    
    // Create particles
    function init() {
      particlesArray.length = 0; // Clear existing particles
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    
    function animate() {
      // Apply fade effect instead of full clear
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = theme === 'dark' ? 'rgba(26, 31, 44, 0.5)' : 'rgba(246, 246, 247, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      
      // Draw gradient background based on theme
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      if (theme === 'dark') {
        gradient.addColorStop(0, "hsla(222, 30%, 12%, 0.7)");
        gradient.addColorStop(0.5, "hsla(252, 83%, 25%, 0.6)");
        gradient.addColorStop(1, "hsla(222, 30%, 15%, 0.7)");
      } else {
        gradient.addColorStop(0, "hsla(225, 25%, 95%, 0.7)");
        gradient.addColorStop(0.5, "hsla(252, 100%, 97%, 0.6)");
        gradient.addColorStop(1, "hsla(225, 25%, 98%, 0.7)");
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Connect particles with lines - fewer connections on mobile
        const maxConnections = isMobile ? 3 : 8;
        let connections = 0;
        
        for (let j = i; j < particlesArray.length; j++) {
          // Limit number of connections per particle on mobile
          if (isMobile && connections >= maxConnections) break;
          
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Dynamic connection distance based on screen size - shorter on mobile
          const maxDistance = Math.min(canvas.width, canvas.height) * (isMobile ? 0.1 : 0.15);
          
          if (distance < maxDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - (distance / maxDistance);
            
            ctx.beginPath();
            ctx.strokeStyle = particlesArray[i].color.replace(/[\d.]+\)$/, `${opacity * (isMobile ? 0.2 : 0.3)})`);
            ctx.lineWidth = isMobile ? 0.3 : 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
            ctx.closePath();
            
            if (isMobile) connections++;
          }
        }
        
        // Regenerate particles less frequently on mobile
        const regenerationChance = isMobile ? 0.0005 : 0.001;
        if (Math.random() < regenerationChance) {
          particlesArray.splice(i, 1);
          particlesArray.push(new Particle());
          i--;
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [theme, isMobile]); // Re-initialize when theme or mobile status changes
  
  return (
    <>
      <canvas 
        ref={canvasRef} 
        className={cn("fixed inset-0 -z-10", className)} 
        style={{ filter: `blur(${isMobile ? '30px' : '40px'})` }}
      />
      <div className={cn(
        "fixed inset-0 -z-10 opacity-70",
        theme === 'dark' 
          ? "bg-gradient-to-br from-background/70 via-background/50 to-background/70" 
          : "bg-gradient-to-br from-background/50 via-background/30 to-background/50"
      )} />
      <NoiseTexture opacity={theme === 'dark' ? 0.35 : 0.18} />
      
      {/* Add subtle floating elements - DISABLED ON MOBILE */}
      {!isMobile && (
        <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-adinox-purple/10 to-adinox-red/10 blur-3xl"
            style={{ top: '15%', left: '10%' }}
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute w-56 h-56 rounded-full bg-gradient-to-br from-adinox-light-purple/10 to-adinox-purple/10 blur-3xl"
            style={{ top: '60%', right: '15%' }}
            animate={{
              x: [0, -40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-adinox-red/5 to-adinox-light-purple/5 blur-3xl"
            style={{ bottom: '20%', left: '20%' }}
            animate={{
              x: [0, 50, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
    </>
  );
};

export default AnimatedBackground;
