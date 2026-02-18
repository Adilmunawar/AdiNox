
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="text-center relative z-10 px-4">
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full" />
          <div className="relative inline-block">
            <motion.div
              className="text-[120px] sm:text-[160px] font-bold leading-none tracking-tighter text-foreground/10"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{
                backgroundImage: 'linear-gradient(90deg, hsl(var(--foreground) / 0.08), hsl(var(--primary) / 0.3), hsl(var(--foreground) / 0.08))',
                backgroundSize: '200% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              404
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground/70 max-w-sm mx-auto text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-4"
          >
            <Button 
              asChild 
              className="rounded-xl px-6 h-11 shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 transition-all"
            >
              <Link to={isAuthenticated ? "/" : "/auth"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
