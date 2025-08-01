
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Sparkles, Lock, Globe } from "lucide-react";
import { PerformantFadeIn } from "@/components/ui/performance-animations";
import { useTheme } from "@/context/ThemeContext";

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthContainer = React.memo(({ children }: AuthContainerProps) => {
  const { theme } = useTheme();
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 280, 
          damping: 25,
          duration: 0.4 
        }}
        className="w-full max-w-md"
      >
        <Card className={`
          relative overflow-hidden backdrop-blur-xl border shadow-2xl
          ${theme === 'dark' 
            ? 'bg-card/95 border-border/60 shadow-primary/5' 
            : 'bg-card/98 border-border/40 shadow-lg'
          }
        `}>
          {/* Enhanced glass effect overlay */}
          <div className={`
            absolute inset-0 pointer-events-none
            ${theme === 'dark'
              ? 'bg-gradient-to-br from-primary/8 via-transparent to-secondary/8'
              : 'bg-gradient-to-br from-primary/4 via-transparent to-secondary/4'
            }
          `} />
          
          {/* Subtle animated border - optimized */}
          <div className={`
            absolute inset-0 rounded-lg pointer-events-none opacity-30
            ${theme === 'dark'
              ? 'bg-gradient-to-r from-primary/30 via-transparent to-secondary/30'
              : 'bg-gradient-to-r from-primary/20 via-transparent to-secondary/20'
            }
          `} 
          style={{
            animation: 'pulse-subtle 4s ease-in-out infinite'
          }} />
          
          {/* Logo section with enhanced design */}
          <CardHeader className="text-center pb-2 relative z-10">
            <PerformantFadeIn delay={0.1}>
              <div className="flex justify-center mb-6">
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {/* Enhanced glow effect behind logo */}
                  <div className={`
                    absolute inset-0 rounded-full blur-2xl opacity-40
                    ${theme === 'dark'
                      ? 'bg-gradient-to-r from-primary/40 to-secondary/40'
                      : 'bg-gradient-to-r from-primary/25 to-secondary/25'
                    }
                  `} 
                  style={{
                    animation: 'pulse-subtle 3s ease-in-out infinite'
                  }} />
                  
                  {/* Logo container with premium styling */}
                  <div className={`
                    relative h-20 w-20 rounded-full flex items-center justify-center shadow-xl
                    ${theme === 'dark'
                      ? 'bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/40'
                      : 'bg-gradient-to-br from-card via-card/98 to-card/95 border border-border/30'
                    }
                  `}>
                    <img 
                      src="/Adil-Munawar-Uploads/1e18899e-2160-4944-9175-794607679d04.png" 
                      alt="AdiNox Logo" 
                      className="h-12 w-12 drop-shadow-lg"
                    />
                    
                    {/* Enhanced sparkle animation */}
                    <motion.div
                      className="absolute -top-1 -right-1 text-primary/80"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 4,
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
            
            <PerformantFadeIn delay={0.2}>
              <CardTitle className={`
                text-3xl font-bold mb-2
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent'
                }
              `}>
                AdiNox Authenticator
              </CardTitle>
              <CardDescription className="text-muted-foreground/90 font-medium flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Secure • Fast • Reliable
              </CardDescription>
            </PerformantFadeIn>
          </CardHeader>
          
          <CardContent className="relative z-10 px-8">
            {children}
          </CardContent>
          
          <CardFooter className="text-center pb-8 pt-6 relative z-10">
            <PerformantFadeIn delay={0.3} className="w-full">
              {/* Enhanced security badges */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.div
                  className={`
                    h-12 w-12 rounded-full flex items-center justify-center
                    ${theme === 'dark'
                      ? 'bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/30'
                      : 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20'
                    }
                  `}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Shield className="h-5 w-5 text-primary" />
                </motion.div>
                
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    Enterprise Security
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    SSL Encrypted
                  </p>
                </div>
              </div>
              
              {/* Developer credit */}
              <div className={`
                text-center py-3 px-4 rounded-lg mb-4
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-muted/40 to-muted/20 border border-border/30'
                  : 'bg-gradient-to-r from-muted/60 to-muted/40 border border-border/20'
                }
              `}>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Proudly Developed by
                </p>
                <p className="text-sm font-bold text-primary">
                  Adil Munawar
                </p>
              </div>
              
              {/* Enhanced status indicators */}
              <div className="flex justify-center items-center space-x-3">
                {[0, 200, 400].map((delay, index) => (
                  <motion.div 
                    key={index}
                    className={`
                      h-2 w-2 rounded-full
                      ${theme === 'dark'
                        ? 'bg-gradient-to-r from-primary to-secondary'
                        : 'bg-gradient-to-r from-primary/80 to-secondary/80'
                      }
                    `}
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 2.5,
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
