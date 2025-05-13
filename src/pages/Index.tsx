
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Shield, User, Settings, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import AnimatedBackground from "@/components/ui/animated-background";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "@/components/ui/logo";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";

// Main App Content component
const AppContent = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-500">
      <header className="border-b border-border/40 mb-8 pb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Logo size="md" />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none hover:bg-primary/10 transition-all border-primary/20"
          >
            <Settings className="h-4 w-4 mr-2" /> Settings
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
        <SlideIn direction="right" className="mb-6 p-4 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/40 flex items-center gap-3">
          <motion.div 
            className="bg-primary/20 h-10 w-10 rounded-full flex items-center justify-center overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            <User className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{user.user_metadata.username || user.email}</span>
            </p>
            <p className="text-xs text-muted-foreground/70">
              Your tokens are securely encrypted and synced across your devices
            </p>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
              <Star className="h-4 w-4 text-amber-400" />
            </Button>
          </div>
        </SlideIn>
      )}
      
      <ScrollArea className="h-[calc(100vh-220px)]">
        <TokenList />
      </ScrollArea>
    </div>
  );
};

// Main Index component that provides context providers
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6">
      <div className="container mx-auto max-w-4xl relative z-10">
        <TokenProvider>
          <Card className="shadow-xl bg-card/80 backdrop-blur-md border-white/5">
            <CardContent className="p-6">
              <AppContent />
            </CardContent>
          </Card>
          <FadeIn delay={0.3} className="mt-8 text-center text-sm text-muted-foreground">
            <p>AdiNox Vault Keeper &copy; {new Date().getFullYear()}</p>
            <p className="mt-2 font-medium">Proudly Developed by Adil Munawar</p>
            <div className="flex justify-center gap-2 mt-3">
              <Button variant="ghost" size="sm">
                Terms
              </Button>
              <Button variant="ghost" size="sm">
                Privacy
              </Button>
              <Button variant="ghost" size="sm">
                Support
              </Button>
            </div>
          </FadeIn>
        </TokenProvider>
      </div>
    </div>
  );
};

export default Index;
