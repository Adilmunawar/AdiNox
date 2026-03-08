import React from "react";
import {
  LayoutDashboard, Shield, CreditCard, Key, StickyNote, Settings,
  LogOut, ChevronUp, Lock,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "2FA Tokens", url: "/tokens", icon: Shield },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Passwords", url: "/passwords", icon: Key },
  { title: "Notes", url: "/notes", icon: StickyNote },
];

const secondaryNav = [
  { title: "Settings", url: "/settings", icon: Settings },
];

type VaultStats = { tokens: number; cards: number; passwords: number; notes: number };

export const AppSidebar = React.memo(() => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = React.useState<VaultStats>({ tokens: 0, cards: 0, passwords: 0, notes: 0 });

  React.useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [t, c, p, n] = await Promise.all([
        supabase.from("user_tokens").select("id", { count: "exact", head: true }),
        supabase.from("vault_cards").select("id", { count: "exact", head: true }),
        supabase.from("vault_passwords").select("id", { count: "exact", head: true }),
        supabase.from("vault_notes").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        tokens: t.count ?? 0, cards: c.count ?? 0,
        passwords: p.count ?? 0, notes: n.count ?? 0,
      });
    };
    fetchStats();
  }, [user]);

  const getStatForPath = (path: string): number | null => {
    switch (path) {
      case "/tokens": return stats.tokens;
      case "/cards": return stats.cards;
      case "/passwords": return stats.passwords;
      case "/notes": return stats.notes;
      default: return null;
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const totalItems = stats.tokens + stats.cards + stats.passwords + stats.notes;
  const username = user?.user_metadata?.username || "User";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      {/* Logo header */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 relative overflow-hidden">
            <Shield className="h-5 w-5 text-primary relative z-10" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-extrabold tracking-tight text-foreground leading-none">
                Adi<span className="text-primary">Nox</span>
              </h1>
              <p className="text-[8px] text-muted-foreground uppercase tracking-[0.3em] mt-1 font-semibold">
                Security Vault
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-border" />

      {/* Vault status banner */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="rounded-xl bg-primary/[0.04] border border-primary/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
                Vault Active
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-foreground tracking-tight">{totalItems}</span>
              <span className="text-[10px] text-muted-foreground font-medium">secured items</span>
            </div>
            <div className="flex gap-3 mt-2">
              {[
                { label: "Tokens", val: stats.tokens, color: "text-primary" },
                { label: "Cards", val: stats.cards, color: "text-blue-500" },
                { label: "Keys", val: stats.passwords, color: "text-amber-500" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1">
                  <span className={cn("text-[10px] font-bold", s.color)}>{s.val}</span>
                  <span className="text-[8px] text-muted-foreground/60">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <SidebarContent className="px-2 py-2 overflow-hidden">
        <div className="flex h-full flex-col justify-between">
          {/* Main nav */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 px-3 mb-1 h-6 font-bold">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {mainNav.map((item) => {
                  const active = isActive(item.url);
                  const stat = getStatForPath(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.url)}
                        tooltip={collapsed ? item.title : undefined}
                        className={cn(
                          "h-10 rounded-xl transition-all duration-200 cursor-pointer group/item relative",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          />
                        )}
                        <item.icon className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                          active
                            ? "text-primary"
                            : "text-muted-foreground/60 group-hover/item:text-foreground"
                        )} />
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-[13px]">{item.title}</span>
                            {stat !== null && stat > 0 && (
                              <span className={cn(
                                "text-[10px] font-bold min-w-[20px] text-center rounded-md px-1.5 py-0.5",
                                active
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground/50"
                              )}>
                                {stat}
                              </span>
                            )}
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* System nav */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 px-3 mb-1 h-6 font-bold">
                System
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNav.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.url)}
                        tooltip={collapsed ? item.title : undefined}
                        className={cn(
                          "h-10 rounded-xl transition-all duration-200 cursor-pointer group/item relative",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          />
                        )}
                        <item.icon className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                          active ? "text-primary" : "text-muted-foreground/60 group-hover/item:text-foreground"
                        )} />
                        {!collapsed && <span className="text-[13px]">{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarSeparator className="bg-border" />

      {/* Security badge */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 px-2">
            <Lock className="h-3 w-3 text-primary" />
            <span className="text-[9px] text-muted-foreground font-medium">End-to-End Encrypted</span>
          </div>
        </div>
      )}

      {/* User footer */}
      <SidebarFooter className="p-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-muted transition-all duration-200 text-left outline-none group",
                collapsed && "justify-center p-2"
              )}>
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 relative overflow-hidden">
                  <span className="text-[11px] font-bold text-primary relative z-10">{initials}</span>
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card" />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-foreground truncate leading-none">
                        {username}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-1">{user.email}</p>
                    </div>
                    <ChevronUp className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side={collapsed ? "right" : "top"}
              className="w-56 bg-card border-border rounded-xl shadow-lg"
            >
              <div className="px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{initials}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{username}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs cursor-pointer rounded-lg mx-1">
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive text-xs cursor-pointer rounded-lg mx-1"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";
export default AppSidebar;
