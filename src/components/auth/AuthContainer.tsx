
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { PerformantFadeIn } from "@/components/ui/performance-animations";

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthContainer = React.memo(({ children }: AuthContainerProps) => {
  return (
    <div className="container max-w-md mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 25,
          duration: 0.6 
        }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl">
          {/* Premium glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          
          {/* Subtle animated border */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-50 animate-pulse-subtle pointer-events-none" />
          
          {/* Logo section with enhanced design */}
          <CardHeader className="text-center pb-2 relative z-10">
            <PerformantFadeIn delay={0.2}>
              <div className="flex justify-center mb-6">
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Glow effect behind logo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-2xl animate-pulse-subtle opacity-60" />
                  
                  {/* Logo container with premium styling */}
                  <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-card via-card/90 to-card/80 border border-border/30 flex items-center justify-center shadow-xl">
                    <img 
                      src="/lovable-uploads/1e18899e-2160-4944-9175-794607679d04.png" 
                      alt="AdiNox Logo" 
                      className="h-12 w-12 drop-shadow-lg"
                    />
                    
                    {/* Sparkle animation */}
                    <motion.div
                      className="absolute -top-1 -right-1 text-primary/70"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </PerformantFadeIn>
            
            <PerformantFadeIn delay={0.3}>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-2">
                AdiNox Authenticator
              </CardTitle>
              <CardDescription className="text-muted-foreground/80 font-medium">
                Secure • Fast • Reliable
              </CardDescription>
            </PerformantFadeIn>
          </CardHeader>
          
          <CardContent className="relative z-10 px-8">
            {children}
          </CardContent>
          
          <CardFooter className="text-center pb-8 pt-6 relative z-10">
            <PerformantFadeIn delay={0.4} className="w-full">
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Shield className="h-5 w-5 text-primary" />
                </motion.div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    Powered by AdiNox
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enterprise Security
                  </p>
                </div>
              </div>
              
              {/* Enhanced status indicators */}
              <div className="flex justify-center items-center space-x-2">
                {[0, 150, 300].map((delay, index) => (
                  <motion.div 
                    key={index}
                    className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: delay / 1000,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </PerformantFadeIn>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
});

AuthContainer.displayName = "AuthContainer";

export default AuthContainer;
