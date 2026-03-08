import React from "react";
import {
  LayoutDashboard, Shield, CreditCard, Key, StickyNote, Settings,
  LogOut, ChevronUp, Lock, Zap,
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
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-white">
      {/* Logo header */}
      <SidebarHeader className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-[var(--shadow-glow-primary)]">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-extrabold tracking-tight text-foreground leading-none">
                Adi<span className="text-primary">Nox</span>
              </h1>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.25em] mt-1 font-semibold">
                Security Vault
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-border/40 mx-4" />

      {/* Vault status banner */}
      {!collapsed && (
        <div className="px-4 py-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/10 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/[0.04] rounded-bl-[3rem]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_rgba(20,184,166,0.5)] animate-pulse" />
                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
                  Vault Active
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">{totalItems}</span>
                <span className="text-[10px] text-muted-foreground/60 font-medium">items</span>
              </div>
              <div className="flex gap-4 mt-3">
                {[
                  { label: "Tokens", val: stats.tokens, icon: Shield },
                  { label: "Cards", val: stats.cards, icon: CreditCard },
                  { label: "Keys", val: stats.passwords, icon: Key },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <s.icon className="h-3 w-3 text-primary/50" />
                    <span className="text-[11px] font-bold text-foreground/80">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <SidebarContent className="px-3 py-1 overflow-hidden">
        <div className="flex h-full flex-col justify-between">
          {/* Main nav */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 px-3 mb-1.5 h-6 font-bold">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {mainNav.map((item) => {
                  const active = isActive(item.url);
                  const stat = getStatForPath(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.url)}
                        tooltip={collapsed ? item.title : undefined}
                        className={cn(
                          "h-11 rounded-xl transition-all duration-200 cursor-pointer group/item relative",
                          active
                            ? "bg-primary/8 text-primary font-semibold shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary shadow-[2px_0_8px_rgba(20,184,166,0.3)]"
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          />
                        )}
                        <item.icon className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                          active
                            ? "text-primary"
                            : "text-muted-foreground/50 group-hover/item:text-foreground"
                        )} />
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-[13px]">{item.title}</span>
                            {stat !== null && stat > 0 && (
                              <span className={cn(
                                "text-[10px] font-bold min-w-[22px] text-center rounded-lg px-1.5 py-0.5",
                                active
                                  ? "bg-primary/12 text-primary"
                                  : "bg-muted/80 text-muted-foreground/50"
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
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 px-3 mb-1 h-6 font-bold">
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
                          "h-11 rounded-xl transition-all duration-200 cursor-pointer group/item relative",
                          active
                            ? "bg-primary/8 text-primary font-semibold shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary shadow-[2px_0_8px_rgba(20,184,166,0.3)]"
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          />
                        )}
                        <item.icon className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                          active ? "text-primary" : "text-muted-foreground/50 group-hover/item:text-foreground"
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

      <SidebarSeparator className="bg-border/40 mx-4" />

      {/* Security badge */}
      {!collapsed && (
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/[0.04] border border-primary/8">
            <Lock className="h-3 w-3 text-primary/70" />
            <span className="text-[9px] text-primary/60 font-semibold tracking-wide">End-to-End Encrypted</span>
          </div>
        </div>
      )}

      {/* User footer */}
      <SidebarFooter className="p-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-muted/60 transition-all duration-200 text-left outline-none group",
                collapsed && "justify-center p-2"
              )}>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0 relative">
                  <span className="text-[11px] font-bold text-primary">{initials}</span>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-foreground truncate leading-none">
                        {username}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-1">{user.email}</p>
                    </div>
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side={collapsed ? "right" : "top"}
              className="w-56 bg-white border-border/60 rounded-xl shadow-lg"
            >
              <div className="px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{initials}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{username}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs cursor-pointer rounded-lg mx-1">
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
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
