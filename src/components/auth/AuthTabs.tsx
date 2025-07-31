
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="relative mb-8">
        <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted/30 backdrop-blur-sm border border-border/30 shadow-inner">
          <TabsTrigger 
            value="login" 
            className="relative h-12 font-semibold text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300 group"
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="h-4 w-4 group-data-[state=active]:text-primary transition-colors" />
              Sign In
              {activeTab === "login" && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                >
                  <ArrowRight className="h-3 w-3 text-primary" />
                </motion.div>
              )}
            </motion.div>
            
            {activeTab === "login" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-md -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="signup"
            className="relative h-12 font-semibold text-sm data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300 group"
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="h-4 w-4 group-data-[state=active]:text-primary transition-colors" />
              Sign Up
              {activeTab === "signup" && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                >
                  <ArrowRight className="h-3 w-3 text-primary" />
                </motion.div>
              )}
            </motion.div>
            
            {activeTab === "signup" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-md -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            duration: 0.3
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
