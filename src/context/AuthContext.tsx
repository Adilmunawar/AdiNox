
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  pin: string | null;
  setupPin: (newPin: string) => void;
  verifyPin: (enteredPin: string) => boolean;
  lockApp: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if setup is complete on load
  useEffect(() => {
    const storedPin = localStorage.getItem("adinox_pin");
    if (storedPin) {
      setPin(storedPin);
      setIsSetupComplete(true);
    }
  }, []);

  const setupPin = (newPin: string) => {
    // In a real app, we would hash this pin before storing
    localStorage.setItem("adinox_pin", newPin);
    setPin(newPin);
    setIsSetupComplete(true);
    setIsAuthenticated(true);
    toast({
      title: "PIN setup complete",
      description: "Your PIN has been set successfully.",
    });
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === pin) {
      setIsAuthenticated(true);
      toast({
        title: "Authentication successful",
        description: "Welcome back!",
      });
      return true;
    }
    
    toast({
      title: "Authentication failed",
      description: "Incorrect PIN. Please try again.",
      variant: "destructive",
    });
    return false;
  };

  const lockApp = () => {
    setIsAuthenticated(false);
    toast({
      title: "App locked",
      description: "Please enter your PIN to continue.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isSetupComplete,
        pin,
        setupPin,
        verifyPin,
        lockApp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
