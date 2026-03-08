import React, { Suspense, useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import CommandPalette from "@/components/layout/CommandPalette";
import BiometricLockScreen from "@/components/auth/BiometricLockScreen";
import { motion } from "framer-motion";
import { Bell, Search, LayoutDashboard, Shield, CreditCard, Key, StickyNote, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useBiometric } from "@/hooks/useBiometric";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/tokens": "2FA Tokens",
  "/cards": "Cards",
  "/passwords": "Passwords",
  "/notes": "Notes",
  "/settings": "Settings",
};

const mobileNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/tokens", icon: Shield, label: "Tokens" },
  { path: "/cards", icon: CreditCard, label: "Cards" },
  { path: "/passwords", icon: Key, label: "Keys" },
  { path: "/notes", icon: StickyNote, label: "Notes" },
];

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      className="h-8 w-8 rounded-full border-2 border-border border-t-primary"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const AppLayout = React.memo(() => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnrolled } = useBiometric();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [lockTimeout, setLockTimeout] = useState(300);

  // Fetch user's auto-lock setting
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_settings")
      .select("auto_lock_timeout, biometric_enabled")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLockTimeout(data.auto_lock_timeout);
          // Only auto-lock if biometric is enabled and enrolled
          if ((data as any).biometric_enabled && isEnrolled) {
            // Don't lock on initial load
          }
        }
      });
  }, [user, isEnrolled]);

  // Activity tracking for auto-lock
  useEffect(() => {
    const resetActivity = () => setLastActivity(Date.now());
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, resetActivity));
  }, []);

  // Auto-lock timer
  useEffect(() => {
    if (!isEnrolled) return;
    const interval = setInterval(() => {
      const idle = (Date.now() - lastActivity) / 1000;
      if (idle >= lockTimeout && !isLocked) {
        setIsLocked(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastActivity, lockTimeout, isLocked, isEnrolled]);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
    setLastActivity(Date.now());
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <SidebarProvider>
      <div className="h-screen w-full overflow-hidden flex">
        {!isMobile && <AppSidebar />}

        <div className="flex-1 h-screen flex flex-col overflow-hidden">
          {/* Sticky header */}
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border/20 bg-background/70 backdrop-blur-2xl px-4 relative">
            {/* Top glow accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
            
            <div className="flex items-center gap-3">
              {!isMobile && <SidebarTrigger className="text-muted-foreground/50 hover:text-foreground transition-colors" />}
              <div className="h-4 w-px bg-border/20 hidden md:block" />
              <h2 className="text-sm font-semibold text-foreground/90">{currentLabel}</h2>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-xs text-muted-foreground/50 hover:text-foreground"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/30 bg-secondary/20 px-1.5 text-[10px] font-mono text-muted-foreground/40">
                  ⌘K
                </kbd>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </Button>
            </div>
          </header>

          {/* Main content — scrollable area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="max-w-6xl mx-auto">
              <Suspense fallback={<LoadingFallback />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        {isMobile && (
          <nav className="fixed bottom-0 inset-x-0 z-50 h-16 bg-card/80 backdrop-blur-2xl border-t border-border/20 flex items-center justify-around px-1 safe-area-bottom">
            {mobileNavItems.map((item) => {
              const active = item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all duration-200 relative",
                    active ? "text-primary" : "text-muted-foreground/40"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                  <span className="text-[9px] font-semibold">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="mobile-tab-indicator"
                      className="absolute -top-0.5 h-0.5 w-8 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </div>
    </SidebarProvider>
  );
});

AppLayout.displayName = "AppLayout";
export default AppLayout;
