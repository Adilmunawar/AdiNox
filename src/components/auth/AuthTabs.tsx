
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Shield, Sparkles, Lock } from "lucide-react";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full space-y-8"
    >
      {/* Main Auth Card */}
      <div className="relative">
        {/* Glassmorphism Container */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl" />
        
        <div className="relative p-8 sm:p-10">
          {/* Logo and Branding Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-10"
          >
            {/* Logo with Advanced Effects */}
            <div className="relative mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative mx-auto w-20 h-20 mb-6"
              >
                {/* Glowing Ring */}
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30 blur-lg"
                />
                
                {/* Logo Container */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                  <img 
                    src="/Adil-Munawar-Uploads/1e18899e-2160-4944-9175-794607679d04.png" 
                    alt="AdiNox Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
              
              {/* Brand Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl sm:text-5xl font-black mb-3"
              >
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  AdiNox
                </span>
              </motion.h1>
              
              {/* Subtitle with Animation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-white/80 mb-2"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-base font-medium">Premium Authentication</span>
                <Sparkles className="h-4 w-4 text-pink-400" />
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-sm text-white/60 flex items-center justify-center gap-2"
              >
                <Lock className="h-3 w-3 text-purple-400" />
                Bank-grade security for your digital identity
              </motion.p>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            {/* Enhanced Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
                <TabsTrigger 
                  value="login" 
                  className="h-12 text-base font-semibold data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-xl border-0 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </motion.div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="signup"
                  className="h-12 text-base font-semibold data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 rounded-xl border-0 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Sign Up</span>
                  </motion.div>
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            {/* Tab Content with Advanced Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ 
                  opacity: 0, 
                  x: activeTab === "login" ? -50 : 50,
                  scale: 0.95 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1 
                }}
                exit={{ 
                  opacity: 0, 
                  x: activeTab === "login" ? 50 : -50,
                  scale: 0.95 
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.4, 0, 0.2, 1] 
                }}
                className="min-h-[400px] flex items-center justify-center"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/20 shadow-lg">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360] 
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 10, repeat: Infinity, ease: "linear" }
            }}
          >
            <Shield className="h-4 w-4 text-green-400" />
          </motion.div>
          <span className="text-sm text-white/80 font-medium">
            256-bit SSL Encryption Active
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </motion.div>
    </motion.div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
