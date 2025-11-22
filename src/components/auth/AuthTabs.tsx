
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
    <div className="w-full space-y-6">
      {/* Professional Auth Card */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        
        {/* Card */}
        <div className="relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Logo and Title Section */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary via-primary to-purple-500 rounded-xl p-3.5 mb-4 shadow-lg shadow-primary/30 relative animate-fade-in">
              <Shield className="w-full h-full text-primary-foreground" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary/40 rounded-full animate-pulse">
                <Sparkles className="w-2.5 h-2.5 text-primary-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
                AdiNox
              </h1>
              <p className="text-muted-foreground text-sm">Enterprise Security Portal</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-secondary/50 backdrop-blur-sm rounded-xl border border-border/50">
              <TabsTrigger 
                value="login" 
                className="h-10 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 rounded-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="signup"
                className="h-10 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 rounded-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Content */}
            <div className="min-h-[400px]">
              {children}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AdiNox. All rights reserved.
        </p>
      </div>
    </div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
