
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Shield } from "lucide-react";

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const AuthTabs = React.memo(({ activeTab, onTabChange, children }: AuthTabsProps) => {
  return (
    <div className="w-full space-y-6">
      {/* Professional Auth Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-xl p-3 mb-4">
            <Shield className="w-full h-full text-white" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">AdiNox</h1>
            <p className="text-slate-600 text-sm">Enterprise Security Portal</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-slate-100 rounded-lg">
            <TabsTrigger 
              value="login" 
              className="h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-md"
            >
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="signup"
              className="h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-md"
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

      {/* Footer */}
      <div className="text-center space-y-2">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} AdiNox. All rights reserved.
        </p>
        <p className="text-slate-600 text-sm font-medium">
          Developed by Adil Munawar
        </p>
      </div>
    </div>
  );
});

AuthTabs.displayName = "AuthTabs";

export default AuthTabs;
