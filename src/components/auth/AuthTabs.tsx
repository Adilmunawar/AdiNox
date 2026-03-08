
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <div className="w-full space-y-5">
      {/* Main card */}
      <div className="relative">
        <div className="relative bg-card/70 backdrop-blur-2xl border border-border/30 rounded-2xl p-6 sm:p-8 overflow-hidden"
          style={{ boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(139, 112, 240, 0.04)' }}
        >
          {/* Subtle top border glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          {/* Logo */}
          <motion.div 
            className="text-center mb-7"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mx-auto w-12 h-12 bg-primary/12 border border-primary/15 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Adi<span className="text-primary">Nox</span>
            </h1>
            <p className="text-muted-foreground/60 text-[11px] tracking-[0.2em] uppercase font-medium mt-1">
              Enterprise Security Portal
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-10 p-1 bg-secondary/40 rounded-xl border border-border/20">
              <TabsTrigger 
                value="login" 
                className="h-8 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 data-[state=inactive]:text-muted-foreground hover:text-foreground"
              >
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </TabsTrigger>
              
              <TabsTrigger 
                value="signup"
                className="h-8 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 data-[state=inactive]:text-muted-foreground hover:text-foreground"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'login' ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </Tabs>
        </div>
      </div>

      {/* Copyright */}
      <motion.p 
        className="text-center text-[10px] text-muted-foreground/40 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        &copy; {new Date().getFullYear()} AdiNox — All rights reserved
      </motion.p>
    </div>
  );
});

AuthTabs.displayName = "AuthTabs";
export default AuthTabs;
