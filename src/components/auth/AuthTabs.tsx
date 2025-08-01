
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Shield } from "lucide-react";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <div className="w-full space-y-6">
      {/* Auth Card with Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 rgba(155, 135, 245, 0.2)", 
                    "0 0 30px rgba(155, 135, 245, 0.4)", 
                    "0 0 0 rgba(155, 135, 245, 0.2)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
              >
                <img 
                  src="/Adil-Munawar-Uploads/1e18899e-2160-4944-9175-794607679d04.png" 
                  alt="AdiNox Logo" 
                  className="h-16 w-16 object-contain"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-primary/5 to-transparent" />
              </motion.div>
            </div>
            
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-foreground"
              >
                Welcome to{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  AdiNox
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-sm text-muted-foreground flex items-center justify-center gap-2"
              >
                <Shield className="h-4 w-4 text-primary" />
                Secure authentication for your digital life
              </motion.p>
            </div>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger 
              value="login" 
              className="h-10 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 rounded-lg"
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </motion.div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="signup"
              className="h-10 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 rounded-lg"
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </motion.div>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Shield className="h-3 w-3 text-primary" />
          Your data is encrypted and secure with AdiNox
        </p>
      </motion.div>
    </div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
