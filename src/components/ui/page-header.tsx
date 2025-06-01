
import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
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
    <header className={cn("flex flex-col space-y-3 mb-8", className)}>
      <div className="flex items-center justify-between">
        <PerformantSlideIn direction="left" delay={0.1} duration={0.6}>
          <Logo size="md" />
        </PerformantSlideIn>

        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ThemeToggle />
          </motion.div>
          
          {showAuth && user && (
            <PerformantSlideIn direction="right" delay={0.2} duration={0.6}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full relative hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                  >
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <User className="h-5 w-5" />
                    </motion.div>
                    <motion.div 
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-5 fade-in-20 border-primary/20 bg-background/95 backdrop-blur-md">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
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
        <div className="space-y-1">
          {title}
          {description && (
            <PerformantFadeIn delay={0.4} direction="up">
              <p className="text-muted-foreground">
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
