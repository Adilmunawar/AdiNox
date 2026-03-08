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
    <div className="w-full space-y-6">
      <div className="relative">
        <div
          className="relative bg-card/70 backdrop-blur-2xl border border-border/25 rounded-2xl p-6 sm:p-8 overflow-hidden"
          style={{ boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(139, 112, 240, 0.04)' }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/[0.04] to-transparent rounded-bl-full" />

          {/* Logo — only shown on mobile (desktop has branding panel) */}
          <motion.div
            className="text-center mb-8 lg:mb-6"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lg:hidden mx-auto w-14 h-14 bg-primary/10 border border-primary/15 rounded-2xl flex items-center justify-center mb-4 relative">
              <Shield className="w-7 h-7 text-primary" />
              <div className="absolute inset-0 rounded-2xl animate-pulse-ring border border-primary/20" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              <span className="lg:hidden">Adi<span className="text-primary">Nox</span></span>
              <span className="hidden lg:inline">{activeTab === "login" ? "Welcome back" : "Create account"}</span>
            </h1>
            <p className="text-muted-foreground/50 text-[11px] tracking-[0.15em] uppercase font-medium mt-1.5">
              <span className="lg:hidden">Security Vault</span>
              <span className="hidden lg:inline">{activeTab === "login" ? "Sign in to your vault" : "Start protecting your digital life"}</span>
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-secondary/30 rounded-xl border border-border/15">
              <TabsTrigger
                value="login"
                className="h-9 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 rounded-lg transition-all duration-200 data-[state=inactive]:text-muted-foreground/60 hover:text-foreground"
              >
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="h-9 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 rounded-lg transition-all duration-200 data-[state=inactive]:text-muted-foreground/60 hover:text-foreground"
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

      <motion.p
        className="text-center text-[10px] text-muted-foreground/30 tracking-wider lg:hidden"
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
