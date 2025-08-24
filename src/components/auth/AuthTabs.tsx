
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Shield, Lock, Sparkles } from "lucide-react";

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
      {/* Professional Auth Card */}
      <div className="relative">
        {/* Enhanced Glass Card */}
        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-xl translate-y-12 -translate-x-12" />
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 relative z-10"
          >
            {/* Professional Logo */}
            <motion.div
              className="relative mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
                {/* Logo shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Shield className="w-full h-full text-white relative z-10" />
              </div>
              {/* Floating icons */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            </motion.div>
            
            {/* Enhanced Title */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                AdiNox
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400" />
                <p className="text-gray-300 text-sm font-medium">Enterprise Security Portal</p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-400" />
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            {/* Advanced Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 h-16 p-1 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 relative overflow-hidden">
                {/* Active tab indicator */}
                <motion.div
                  className="absolute inset-y-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg"
                  initial={false}
                  animate={{
                    x: activeTab === "login" ? 4 : "calc(50% - 4px)",
                    width: "calc(50% - 8px)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                
                <TabsTrigger 
                  value="login" 
                  className="h-14 text-sm font-semibold relative z-10 data-[state=active]:text-white data-[state=inactive]:text-gray-300 transition-all duration-300 rounded-xl border-0 hover:text-white group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg group-data-[state=active]:bg-white/30 transition-all">
                      <LogIn className="h-4 w-4" />
                    </div>
                    <span>Sign In</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="signup"
                  className="h-14 text-sm font-semibold relative z-10 data-[state=active]:text-white data-[state=inactive]:text-gray-300 transition-all duration-300 rounded-xl border-0 hover:text-white group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg group-data-[state=active]:bg-white/30 transition-all">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <span>Sign Up</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            {/* Enhanced Tab Content */}
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
                className="min-h-[400px] relative"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>

      {/* Professional Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-500" />
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} AdiNox. All rights reserved.
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-500" />
        </div>
        <motion.p 
          className="text-gray-300 text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          Proudly Developed by Adil Munawar
        </motion.p>
      </motion.div>
    </motion.div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
