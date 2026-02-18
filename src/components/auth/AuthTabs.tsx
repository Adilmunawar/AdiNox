
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Shield, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <div className="w-full space-y-6">
      {/* Auth Card */}
      <div className="relative group">
        {/* Outer glow */}
        <div className="absolute -inset-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Card */}
        <div className="relative bg-card/80 backdrop-blur-2xl border border-border/30 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-primary/20 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-primary/20 rounded-br-2xl" />
          
          {/* Logo Section */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="mx-auto w-14 h-14 bg-gradient-to-br from-primary/90 to-primary/60 rounded-2xl p-3 mb-5 relative"
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="w-full h-full text-primary-foreground" />
              <motion.div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-card border-2 border-primary/50 rounded-lg flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Fingerprint className="w-3 h-3 text-primary" />
              </motion.div>
            </motion.div>
            
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Adi<span className="text-primary">Nox</span>
              </h1>
              <p className="text-muted-foreground/70 text-xs tracking-[0.2em] uppercase font-medium">
                Enterprise Security Portal
              </p>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-secondary/30 backdrop-blur-sm rounded-xl border border-border/30">
              <TabsTrigger 
                value="login" 
                className="h-9 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-lg transition-all duration-300 data-[state=inactive]:text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="signup"
                className="h-9 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 rounded-lg transition-all duration-300 data-[state=inactive]:text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Content */}
            <motion.div 
              className="min-h-[380px]"
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'login' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </Tabs>
        </div>
      </div>

      {/* Copyright */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-[11px] text-muted-foreground/50 tracking-wider">
          &copy; {new Date().getFullYear()} AdiNox — All rights reserved
        </p>
      </motion.div>
    </div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
