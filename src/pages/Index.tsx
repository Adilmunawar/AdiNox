
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogOut } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TokenProvider } from "@/context/TokenContext";
import PinSetup from "@/components/auth/PinSetup";
import PinEntry from "@/components/auth/PinEntry";
import TokenList from "@/components/tokens/TokenList";
import AnimatedBackground from "@/components/ui/animated-background";

// App Content component that displays the main content when authenticated
const AppContent = () => {
  const { lockApp, isSetupComplete } = useAuth();
  const { user, signOut } = useAuth();

  // Auto-lock after inactivity (5 minutes)
  useEffect(() => {
    let inactivityTimer: number;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(lockApp, 5 * 60 * 1000); // 5 minutes
    };
    
    // Set up event listeners for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);
    
    // Start initial timer
    resetTimer();
    
    // Clean up event listeners
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [lockApp]);
  
  return (
    <div>
      <header className="border-b mb-8 pb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">AdiNox Authenticator</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none"
            onClick={lockApp}
          >
            <Lock className="h-4 w-4 mr-2" /> Lock App
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      {user && (
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Logged in as: <span className="font-medium text-foreground">{user.user_metadata.username || user.email}</span>
          </p>
        </div>
      )}
      
      <TokenList />
    </div>
  );
};

// Auth wrapper component that handles showing setup or entry based on auth state
const AuthWrapper = () => {
  const { isAuthenticated, isSetupComplete } = useAuth();
  
  if (!isSetupComplete) {
    return <PinSetup />;
  }
  
  if (!isAuthenticated) {
    return <PinEntry />;
  }
  
  return <AppContent />;
};

// Main Index component that provides context providers
const Index = () => {
  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <TokenProvider>
          <Card className="shadow-xl bg-card/80 backdrop-blur-md">
            <CardContent className="p-6">
              <AuthWrapper />
            </CardContent>
          </Card>
          <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>AdiNox Vault Keeper &copy; {new Date().getFullYear()}</p>
            <p className="mt-2 font-medium">Proudly Developed by Adil Munawar</p>
          </footer>
        </TokenProvider>
      </div>
    </div>
  );
};

export default Index;
