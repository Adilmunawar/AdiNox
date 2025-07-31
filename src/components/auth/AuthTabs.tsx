
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="relative mb-8">
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger 
            value="login" 
            className="relative h-10 font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </motion.div>
            {activeTab === "login" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-md -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className="relative h-10 font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </motion.div>
            {activeTab === "signup" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-md -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {children}
      </motion.div>
    </Tabs>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
