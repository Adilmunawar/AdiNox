
import React, { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

interface NoiseTextureProps {
  opacity?: number;
  speed?: number; // Animation speed
  colored?: boolean; // Whether to add color tint
}

const NoiseTexture = ({ 
  opacity = 0.3, 
  speed = 0.003, 
  colored = true 
}: NoiseTextureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    let animationFrameId: number;
    let frame = 0;
    
    // Create noise pattern
    const createNoise = () => {
      const w = canvas.width;
      const h = canvas.height;
      const idata = ctx.createImageData(w, h);
      const buffer = new Uint32Array(idata.data.buffer);
      
      // Base color tint for the noise
      const baseTint = {
        r: theme === 'dark' ? 30 : 245,  // Red component
        g: theme === 'dark' ? 20 : 240,  // Green component
        b: theme === 'dark' ? 40 : 247   // Blue component
      };
      
      const purpleTint = {
        r: 155,  // Red component
        g: 135,  // Green component
        b: 245   // Blue component
      };
      
      const time = frame * speed;
      
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          // Perlin-like noise algorithm (simplified)
          const value = Math.random() * 255;
          
          let r, g, b;
          
          if (colored) {
            const mixFactor = 0.08; // How much to mix in the tint (subtle)
            
            // Alternate between base tint and purple tint based on position and time
            const usePurple = 
              (Math.sin(x * 0.01 + time) + Math.cos(y * 0.01 - time)) > 0.5;
              
            const tint = usePurple ? purpleTint : baseTint;
            
            // Mix grayscale noise with tint color
            r = Math.floor(value * (1 - mixFactor) + tint.r * mixFactor);
            g = Math.floor(value * (1 - mixFactor) + tint.g * mixFactor);
            b = Math.floor(value * (1 - mixFactor) + tint.b * mixFactor);
          } else {
            // Standard grayscale noise
            r = g = b = value;
          }
          
          // Set pixel color with specified opacity
          buffer[y * w + x] = 
            (Math.floor(opacity * 255) << 24) | // Alpha
            (b << 16) | // Blue
            (g << 8) | // Green
            r; // Red
        }
      }
      
      ctx.putImageData(idata, 0, 0);
      frame++;
      animationFrameId = requestAnimationFrame(createNoise);
    };
    
    createNoise();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [opacity, speed, theme, colored]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-5 pointer-events-none"
      style={{ 
        opacity: opacity, 
        mixBlendMode: theme === 'dark' ? 'soft-light' : 'multiply' 
      }}
    />
  );
};

export default NoiseTexture;
