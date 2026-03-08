
import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showAuth?: boolean;
  className?: string;
}

export const PageHeader = React.memo(({ title, description, showAuth = true, className }: PageHeaderProps) => {
  const { user, signOut } = useAuth();
  const handleSignOut = React.useCallback(() => { signOut(); }, [signOut]);

  return (
    <header className={cn("flex flex-col space-y-5 mb-8", className)}>
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Logo size="md" />
        </motion.div>

        <div className="flex items-center gap-2">
          {showAuth && user && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-9 w-9 hover:bg-secondary transition-colors"
                  >
                    <div className="relative">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-morphism">
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-muted-foreground font-mono text-[11px]">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <Settings className="mr-2 h-3.5 w-3.5" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive text-xs cursor-pointer">
                    <LogOut className="mr-2 h-3.5 w-3.5" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </div>
      </div>

      {(title || description) && (
        <motion.div 
          className="space-y-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {title && <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </motion.div>
      )}
    </header>
  );
});

PageHeader.displayName = "PageHeader";
export default PageHeader;
