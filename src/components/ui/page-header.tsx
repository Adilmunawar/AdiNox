
import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { SlideIn } from "@/components/ui/animations";
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
}

export const PageHeader = ({
  title,
  description,
  showAuth = true,
  className,
}: PageHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className={cn("flex flex-col space-y-2 mb-6", className)}>
      <div className="flex items-center justify-between">
        <SlideIn direction="left" delay={0.1}>
          <Logo size="md" />
        </SlideIn>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {showAuth && user && (
            <SlideIn direction="right" delay={0.1}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
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
        <div className="space-y-1">
          {title && (
            <motion.h1 
              className="text-3xl font-bold tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
          )}
          {description && (
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
          )}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
