
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full space-y-8"
    >
      {/* Main Auth Card */}
      <div className="relative">
        {/* Card Background */}
        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl">
          {/* Logo and Title Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            {/* Logo */}
            <div className="relative mb-6">
              <div className="mx-auto w-16 h-16 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 shadow-lg">
                <img 
                  src="/Adil-Munawar-Uploads/1e18899e-2160-4944-9175-794607679d04.png" 
                  alt="AdiNox Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">
              AdiNox
            </h1>
            <p className="text-slate-400 text-sm">
              Secure Authentication Portal
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                <TabsTrigger 
                  value="login" 
                  className="h-10 text-sm font-medium data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg border-0 text-slate-300 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="signup"
                  className="h-10 text-sm font-medium data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg border-0 text-slate-300 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ 
                  opacity: 0, 
                  x: activeTab === "login" ? -20 : 20,
                  scale: 0.98 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1 
                }}
                exit={{ 
                  opacity: 0, 
                  x: activeTab === "login" ? 20 : -20,
                  scale: 0.98 
                }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeInOut" 
                }}
                className="min-h-[350px]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center"
      >
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} AdiNox. All rights reserved.
        </p>
      </motion.div>
    </motion.div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
