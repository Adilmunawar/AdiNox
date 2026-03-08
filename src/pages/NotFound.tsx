
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="text-center relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <span className="text-[140px] sm:text-[180px] font-extrabold leading-none tracking-tighter text-border/60 select-none">
            404
          </span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="pt-4">
            <Button asChild variant="outline" className="rounded-xl px-5 h-10 text-sm">
              <Link to={isAuthenticated ? "/" : "/auth"}>
                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
