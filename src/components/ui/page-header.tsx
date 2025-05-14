
import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { SlideIn, FadeIn } from "@/components/ui/animations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showAuth?: boolean;
  className?: string;
  icon?: React.ReactNode; // Add optional icon prop
}

export const PageHeader = ({
  title,
  description,
  showAuth = true,
  className,
  icon,
}: PageHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className={cn("flex flex-col space-y-3 mb-8", className)}>
      <div className="flex items-center justify-between">
        <SlideIn direction="left" delay={0.1} duration={0.6}>
          <Logo size="md" />
        </SlideIn>

        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ThemeToggle />
          </motion.div>
          
          {showAuth && user && (
            <SlideIn direction="right" delay={0.2} duration={0.6}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full relative hover:bg-primary/10 transition-colors"
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
                <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-5 fade-in-20">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SlideIn>
          )}
        </div>
      </div>

      {(title || description) && (
        <div className="space-y-1 flex items-start">
          {icon && (
            <FadeIn delay={0.3} direction="up" className="mr-3 mt-1">
              {icon}
            </FadeIn>
          )}
          <div>
            {title && (
              <motion.h1 
                className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-adinox-purple to-adinox-red"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {title}
              </motion.h1>
            )}
            {description && (
              <FadeIn delay={0.4} direction="up">
                <p className="text-muted-foreground">
                  {description}
                </p>
              </FadeIn>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PageHeader;
