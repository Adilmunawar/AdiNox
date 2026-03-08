import React, { Suspense, useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/ui/page-transition";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import CommandPalette from "@/components/layout/CommandPalette";
import BiometricLockScreen from "@/components/auth/BiometricLockScreen";
import { motion } from "framer-motion";
import { Bell, Search, LayoutDashboard, Shield, CreditCard, Key, StickyNote, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useBiometric } from "@/hooks/useBiometric";
import { useFaceAuth } from "@/hooks/useFaceAuth";
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
      className="h-8 w-8 rounded-full border-2 border-border/40 border-t-primary"
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
  const { isEnrolled: bioEnrolled } = useBiometric();
  const { isEnrolled: faceEnrolled } = useFaceAuth();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [lockTimeout, setLockTimeout] = useState(300);
  const [lockEnabled, setLockEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_settings")
      .select("auto_lock_timeout, biometric_enabled, face_scan_enabled")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLockTimeout(data.auto_lock_timeout);
          const bioActive = (data as any).biometric_enabled && bioEnrolled;
          const faceActive = (data as any).face_scan_enabled && faceEnrolled;
          setLockEnabled(bioActive || faceActive);
        }
      });
  }, [user, bioEnrolled, faceEnrolled]);

  useEffect(() => {
    const resetActivity = () => setLastActivity(Date.now());
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, resetActivity));
  }, []);

  useEffect(() => {
    if (!lockEnabled) return;
    const interval = setInterval(() => {
      const idle = (Date.now() - lastActivity) / 1000;
      if (idle >= lockTimeout && !isLocked) {
        setIsLocked(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastActivity, lockTimeout, isLocked, lockEnabled]);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
    setLastActivity(Date.now());
  }, []);

  const currentLabel = routeLabels[location.pathname] || "AdiNox";

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
    <>
      <BiometricLockScreen
        isLocked={isLocked}
        onUnlock={handleUnlock}
        userName={user?.user_metadata?.username}
      />
      <SidebarProvider>
        <div className="h-screen w-full overflow-hidden flex bg-background">
          {!isMobile && <AppSidebar />}

          <div className="flex-1 h-screen flex flex-col overflow-hidden">
            {/* Sticky header */}
            <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border/50 bg-white/90 backdrop-blur-xl px-4 sm:px-6">
              <div className="flex items-center gap-3">
                {!isMobile && <SidebarTrigger className="text-muted-foreground/60 hover:text-foreground transition-colors" />}
                {!isMobile && <div className="h-5 w-px bg-border/40" />}
                <h2 className="text-sm font-semibold text-foreground tracking-tight">{currentLabel}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 text-xs text-muted-foreground/70 hover:text-foreground rounded-xl hover:bg-muted/60"
                  onClick={() => setCommandOpen(true)}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-md border border-border/50 bg-muted/60 px-1.5 text-[10px] font-mono text-muted-foreground/50">
                    ⌘K
                  </kbd>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative rounded-xl hover:bg-muted/60">
                  <Bell className="h-4 w-4 text-muted-foreground/60" />
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_4px_rgba(20,184,166,0.4)]" />
                </Button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 bg-background">
              <div className="max-w-6xl mx-auto">
                <Suspense fallback={<LoadingFallback />}>
                  <Outlet />
                </Suspense>
              </div>
            </main>
          </div>

          {isMobile && (
            <nav className="fixed bottom-0 inset-x-0 z-50 h-16 bg-white/95 backdrop-blur-xl border-t border-border/40 flex items-center justify-around px-1 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
              {mobileNavItems.map((item) => {
                const active = item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 relative",
                      active ? "text-primary" : "text-muted-foreground/60"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[9px] font-semibold">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="mobile-tab-indicator"
                        className="absolute -top-0.5 h-0.5 w-8 bg-primary rounded-full shadow-[0_0_6px_rgba(20,184,166,0.4)]"
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
    </>
  );
});

AppLayout.displayName = "AppLayout";
export default AppLayout;
