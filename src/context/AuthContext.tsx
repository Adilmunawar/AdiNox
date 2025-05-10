
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  // PIN-related properties
  setupPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  lockApp: () => void;
  isSetupComplete: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// PIN storage keys
const PIN_KEY = 'adinox_pin';
const PIN_SETUP_KEY = 'adinox_pin_setup';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(() => {
    // Check if PIN setup is complete on initialization
    return localStorage.getItem(PIN_SETUP_KEY) === 'true';
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Setup PIN function
  const setupPin = (pin: string) => {
    try {
      // Store hashed PIN (in a real app, use a proper hashing algorithm)
      localStorage.setItem(PIN_KEY, btoa(pin));
      localStorage.setItem(PIN_SETUP_KEY, 'true');
      setIsSetupComplete(true);
      toast({
        title: "PIN Setup Complete",
        description: "Your PIN has been set successfully.",
      });
    } catch (error) {
      toast({
        title: "PIN Setup Failed",
        description: "Failed to set up your PIN. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Verify PIN function
  const verifyPin = (pin: string) => {
    try {
      const storedPin = localStorage.getItem(PIN_KEY);
      if (storedPin && btoa(pin) === storedPin) {
        setIsLocked(false);
        toast({
          title: "Unlocked",
          description: "App unlocked successfully.",
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Lock app function
  const lockApp = () => {
    setIsLocked(true);
    toast({
      title: "App Locked",
      description: "Enter your PIN to continue.",
    });
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        isAuthenticated: !!user && !isLocked,
        setupPin,
        verifyPin,
        lockApp,
        isSetupComplete,
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
