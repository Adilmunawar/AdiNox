
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogOut, Shield, User } from "lucide-react";
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
    <div className="animate-in fade-in duration-500">
      <header className="border-b border-border/40 mb-8 pb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
            AdiNox Authenticator
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none hover:bg-primary/10 transition-all border-primary/20"
            onClick={lockApp}
          >
            <Lock className="h-4 w-4 mr-2" /> Lock App
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-none hover:bg-destructive/10 transition-all border-destructive/20"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      {user && (
        <div className="mb-6 p-4 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/40 flex items-center gap-3">
          <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Logged in as: <span className="font-medium text-foreground">{user.user_metadata.username || user.email}</span>
            </p>
            <p className="text-xs text-muted-foreground/70">
              Your tokens are securely encrypted and synced across your devices
            </p>
          </div>
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
      <div className="container mx-auto max-w-4xl relative z-10">
        <TokenProvider>
          <Card className="shadow-xl bg-card/80 backdrop-blur-md border-white/5">
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
