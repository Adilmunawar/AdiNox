
import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { PerformantSlideIn, PerformantFadeIn } from "@/components/ui/performance-animations";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showAuth?: boolean;
  className?: string;
}

export const PageHeader = React.memo(({
  title,
  description,
  showAuth = true,
  className
}: PageHeaderProps) => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = React.useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <header className={cn("flex flex-col space-y-4 mb-8", className)}>
      <div className="flex items-center justify-between">
        <PerformantSlideIn direction="left" delay={0.1} duration={0.6}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Logo size="md" />
          </motion.div>
        </PerformantSlideIn>

        <div className="flex items-center gap-3">
          {showAuth && user && (
            <PerformantSlideIn direction="right" delay={0.2} duration={0.6}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full relative hover:bg-primary/10 transition-all duration-300 hover:scale-105 group"
                  >
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <User className="h-5 w-5 transition-colors group-hover:text-primary" />
                      <motion.div 
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 animate-in slide-in-from-top-5 fade-in-20 border-primary/20 glass-morphism shadow-glow-lg">
                  <DropdownMenuLabel className="flex items-center gap-2 pb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold">My Account</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem disabled className="text-muted-foreground font-mono text-xs">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors duration-200">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 transition-colors duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PerformantSlideIn>
          )}
        </div>
      </div>

      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <PerformantFadeIn delay={0.3} direction="up">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                {title}
              </h1>
            </PerformantFadeIn>
          )}
          {description && (
            <PerformantFadeIn delay={0.4} direction="up">
              <p className="text-muted-foreground text-base">
                {description}
              </p>
            </PerformantFadeIn>
          )}
        </div>
      )}
    </header>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;
