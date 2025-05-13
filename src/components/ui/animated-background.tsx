
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import NoiseTexture from "./noise-texture";
import { useTheme } from "@/context/ThemeContext";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className }: AnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
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
    
    // Colors based on theme
    const darkColors = [
      "rgba(147, 51, 234, 0.5)",  // Purple
      "rgba(139, 92, 246, 0.5)",  // Lighter purple
      "rgba(124, 58, 237, 0.5)",  // Vivid purple
      "rgba(109, 40, 217, 0.5)",  // Deep purple
      "rgba(91, 33, 182, 0.5)",   // Indigo
    ];
    
    const lightColors = [
      "rgba(147, 51, 234, 0.3)",  // Purple (lighter opacity)
      "rgba(139, 92, 246, 0.3)",  // Lighter purple
      "rgba(124, 58, 237, 0.3)",  // Vivid purple
      "rgba(167, 139, 250, 0.3)", // Lavender
      "rgba(196, 181, 253, 0.3)", // Very light purple
    ];
    
    // Particles array
    const particlesArray: any[] = [];
    const numberOfParticles = 60;
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 20 + 10;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = (theme === 'dark' ? darkColors : lightColors)[Math.floor(Math.random() * 5)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.size > 0.2) this.size -= 0.05;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background based on theme
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (theme === 'dark') {
        gradient.addColorStop(0, "hsl(222, 28%, 10%)");
        gradient.addColorStop(0.5, "hsl(252, 81%, 25%)");
        gradient.addColorStop(1, "hsl(222, 28%, 14%)");
      } else {
        gradient.addColorStop(0, "hsl(225, 25%, 95%)");
        gradient.addColorStop(0.5, "hsl(252, 100%, 97%)");
        gradient.addColorStop(1, "hsl(225, 25%, 98%)");
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Connect particles with lines
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particlesArray[i].color;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
        
        // Regenerate particles if too small
        if (particlesArray[i].size <= 0.3) {
          particlesArray.splice(i, 1);
          i--;
          particlesArray.push(new Particle());
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [theme]); // Re-initialize when theme changes
  
  return (
    <>
      <canvas 
        ref={canvasRef} 
        className={cn("fixed inset-0 -z-10", className)} 
        style={{ filter: "blur(50px)" }}
      />
      <div className={cn(
        "fixed inset-0 -z-10 opacity-70",
        theme === 'dark' 
          ? "bg-gradient-to-br from-background/70 via-background/50 to-background/70" 
          : "bg-gradient-to-br from-background/50 via-background/30 to-background/50"
      )} />
      <NoiseTexture opacity={theme === 'dark' ? 0.4 : 0.2} />
    </>
  );
};

export default AnimatedBackground;
