
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  const { theme } = useTheme();
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="relative mb-8">
        <TabsList className={`
          grid w-full grid-cols-2 h-14 p-1 backdrop-blur-sm border shadow-inner
          ${theme === 'dark'
            ? 'bg-muted/40 border-border/40'
            : 'bg-muted/60 border-border/30'
          }
        `}>
          <TabsTrigger 
            value="login" 
            className={`
              relative h-12 font-semibold text-sm transition-all duration-300 group
              ${theme === 'dark'
                ? 'data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg'
                : 'data-[state=active]:bg-card/95 data-[state=active]:text-primary data-[state=active]:shadow-md'
              }
            `}
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="h-4 w-4 group-data-[state=active]:text-primary transition-colors" />
              Sign In
              <AnimatePresence>
                {activeTab === "login" && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-3 w-3 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {activeTab === "login" && (
              <motion.div
                layoutId="activeTabIndicator"
                className={`
                  absolute inset-0 rounded-md -z-10
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-primary/15 via-primary/8 to-transparent'
                    : 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent'
                  }
                `}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="signup"
            className={`
              relative h-12 font-semibold text-sm transition-all duration-300 group
              ${theme === 'dark'
                ? 'data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg'
                : 'data-[state=active]:bg-card/95 data-[state=active]:text-primary data-[state=active]:shadow-md'
              }
            `}
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="h-4 w-4 group-data-[state=active]:text-primary transition-colors" />
              Sign Up
              <AnimatePresence>
                {activeTab === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-3 w-3 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {activeTab === "signup" && (
              <motion.div
                layoutId="activeTabIndicator"
                className={`
                  absolute inset-0 rounded-md -z-10
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-primary/15 via-primary/8 to-transparent'
                    : 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent'
                  }
                `}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.25
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
