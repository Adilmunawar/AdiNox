
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Shield, Sparkles } from "lucide-react";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <div className="w-full space-y-8">
      {/* Professional Auth Card */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-adinox-purple/10 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-adinox-purple/5 via-transparent to-adinox-purple/5 rounded-2xl"></div>
        
        {/* Header Section */}
        <div className="relative z-10 text-center mb-8">
          {/* Logo with enhanced styling */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-adinox-purple via-adinox-purple to-adinox-light-purple rounded-2xl p-4 mb-6 shadow-lg shadow-adinox-purple/25 relative">
            <Shield className="w-full h-full text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-adinox-purple/30 rounded-full animate-pulse">
              <Sparkles className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          {/* Title with gradient text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-adinox-light-purple to-adinox-purple bg-clip-text text-transparent">
              AdiNox
            </h1>
            <p className="text-slate-400 text-base font-medium">Enterprise Security Portal</p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-adinox-purple to-transparent mx-auto"></div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full relative z-10">
          {/* Enhanced Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-1 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <TabsTrigger 
              value="login" 
              className="h-12 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-adinox-purple data-[state=active]:to-adinox-purple/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-adinox-purple/25 rounded-lg transition-all duration-300 text-slate-300 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="signup"
              className="h-12 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-adinox-purple data-[state=active]:to-adinox-purple/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-adinox-purple/25 rounded-lg transition-all duration-300 text-slate-300 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Content with enhanced styling */}
          <div className="min-h-[450px] relative">
            {children}
          </div>
        </Tabs>
      </div>

      {/* Enhanced Footer */}
      <div className="text-center space-y-3 relative z-10">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-slate-600"></div>
          <span>&copy; {new Date().getFullYear()} AdiNox. All rights reserved.</span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-slate-600"></div>
        </div>
        <p className="text-adinox-light-purple text-sm font-medium flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3" />
          Developed by Adil Munawar
          <Sparkles className="h-3 w-3" />
        </p>
      </div>
    </div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
