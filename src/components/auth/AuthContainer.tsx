
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { PerformantFadeIn, PerformantScale } from "@/components/ui/performance-animations";

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthContainer = React.memo(({ children }: AuthContainerProps) => {
  return (
    <div className="container max-w-md mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-3xl animate-pulse-subtle"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-secondary/20 to-secondary/10 rounded-full blur-3xl animate-pulse-subtle delay-1000"></div>
          
          {/* Logo section */}
          <CardHeader className="text-center pb-2 relative z-10">
            <PerformantFadeIn delay={0.2}>
              <div className="flex justify-center mb-4">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse-subtle"></div>
                  <img 
                    src="/lovable-uploads/1e18899e-2160-4944-9175-794607679d04.png" 
                    alt="AdiNox Logo" 
                    className="relative h-16 w-16 drop-shadow-lg"
                  />
                </motion.div>
              </div>
            </PerformantFadeIn>
            
            <PerformantFadeIn delay={0.3}>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent">
                AdiNox Authenticator
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Secure authentication for your digital identity
              </CardDescription>
            </PerformantFadeIn>
          </CardHeader>
          
          <CardContent className="relative z-10 px-8">
            {children}
          </CardContent>
          
          <CardFooter className="text-center pb-8 pt-4 relative z-10">
            <PerformantFadeIn delay={0.4} className="w-full">
              <div className="flex items-center justify-center gap-2 mb-3">
                <motion.div
                  className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Shield className="h-4 w-4 text-primary" />
                </motion.div>
                <p className="text-sm font-medium text-muted-foreground">
                  Developed by Adil Munawar
                </p>
              </div>
              
              <div className="flex justify-center space-x-1">
                {[0, 100, 200].map((delay, index) => (
                  <motion.div 
                    key={index}
                    className="h-1.5 w-1.5 rounded-full bg-primary/60"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: delay / 1000
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
