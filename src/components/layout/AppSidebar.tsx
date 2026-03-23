import React from "react";
import {
  LayoutDashboard, Shield, CreditCard, Key, FileText, Settings,
  LogOut, ChevronRight, Lock, HelpCircle, Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "2FA Tokens", url: "/tokens", icon: Shield },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Passwords", url: "/passwords", icon: Key },
  { title: "Documents", url: "/documents", icon: FileText },
];

type VaultStats = { tokens: number; cards: number; passwords: number; documents: number };

const statKeyMap: Record<string, keyof VaultStats> = {
  "/tokens": "tokens",
  "/cards": "cards",
  "/passwords": "passwords",
  "/documents": "documents",
};

export const AppSidebar = React.memo(() => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = React.useState<VaultStats>({ tokens: 0, cards: 0, passwords: 0, documents: 0 });

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const [t, c, p, d] = await Promise.all([
        supabase.from("user_tokens").select("id", { count: "exact", head: true }),
        supabase.from("vault_cards").select("id", { count: "exact", head: true }),
        supabase.from("vault_passwords").select("id", { count: "exact", head: true }),
        supabase.from("vault_documents" as any).select("id", { count: "exact", head: true }),
      ]);
      setStats({ tokens: t.count ?? 0, cards: c.count ?? 0, passwords: p.count ?? 0, documents: d.count ?? 0 });
    })();
  }, [user]);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const username = user?.user_metadata?.username || "User";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* ── Brand ── */}
      <SidebarHeader className={cn("px-4 pt-5 pb-5", collapsed && "px-2")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3 px-1")}>
          <div className="h-9 w-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0 shadow-[0_2px_12px_-2px_hsl(168_76%_50%/0.5)]">
            <Shield className="h-[18px] w-[18px] text-sidebar-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-[15px] font-bold tracking-tight text-sidebar-foreground leading-none">
                Adi<span className="text-sidebar-primary">Nox</span>
              </h1>
              <p className="text-[10px] text-sidebar-foreground/40 mt-0.5 font-medium">Security Vault</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className={cn("px-3 flex-1", collapsed && "px-2")}>
        <SidebarGroup>
          {!collapsed && (
            <p className="text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/30 font-semibold px-3 mb-2">
              Menu
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.url);
                const statKey = statKeyMap[item.url];
                const count = statKey ? stats[statKey] : null;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                      className={cn(
                        "h-10 rounded-lg transition-all duration-150 cursor-pointer group/nav relative",
                        active
                          ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      {/* Active pill */}
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            layoutId="nav-pill"
                            className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-full bg-sidebar-primary"
                            initial={{ opacity: 0, scaleY: 0.5 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0.5 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>

                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-sidebar-primary" : "text-sidebar-foreground/40 group-hover/nav:text-sidebar-foreground"
                        )}
                        strokeWidth={active ? 2.2 : 1.8}
                      />

                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="text-[13px] truncate">{item.title}</span>
                          {count !== null && count > 0 && (
                            <span
                              className={cn(
                                "text-[10px] font-semibold tabular-nums min-w-[20px] text-center rounded-md px-1.5 py-px",
                                active
                                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                                  : "bg-sidebar-accent text-sidebar-foreground/50"
                              )}
                            >
                              {count}
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

        {/* ── System (bottom-anchored) ── */}
        <div className="mt-auto pt-2">
          {!collapsed && (
            <p className="text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/30 font-semibold px-3 mb-2">
              System
            </p>
          )}
          <SidebarMenu className="space-y-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate("/settings")}
                tooltip={collapsed ? "Settings" : undefined}
                className={cn(
                  "h-10 rounded-lg transition-all duration-150 cursor-pointer group/nav",
                  isActive("/settings")
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Settings className={cn("h-4 w-4 shrink-0", isActive("/settings") ? "text-sidebar-primary" : "text-sidebar-foreground/40")} strokeWidth={isActive("/settings") ? 2.2 : 1.8} />
                {!collapsed && <span className="text-[13px]">Settings</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate("/settings?tab=help")}
                tooltip={collapsed ? "Help" : undefined}
                className="h-10 rounded-lg transition-all duration-150 cursor-pointer group/nav text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <HelpCircle className="h-4 w-4 shrink-0 text-sidebar-foreground/40 group-hover/nav:text-sidebar-foreground" strokeWidth={1.8} />
                {!collapsed && <span className="text-[13px]">Help & FAQ</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* ── Encryption badge ── */}
      {!collapsed && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-sidebar-primary/10 border border-sidebar-primary/15">
            <Lock className="h-3 w-3 text-sidebar-primary/70" />
            <span className="text-[10px] text-sidebar-primary/70 font-medium">End-to-End Encrypted</span>
          </div>
        </div>
      )}

      {/* ── User footer ── */}
      <SidebarFooter className={cn("px-3 pb-4 pt-1", collapsed && "px-2")}>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center w-full rounded-lg transition-colors duration-150 outline-none group",
                  collapsed ? "justify-center p-2 hover:bg-sidebar-accent/50" : "gap-3 p-2 hover:bg-sidebar-accent/50"
                )}
              >
                <div className="relative shrink-0">
                  <div className="h-8 w-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-sidebar-primary">{initials}</span>
                  </div>
                  <div className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-sidebar-primary border-[1.5px] border-sidebar" />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-semibold text-sidebar-foreground truncate leading-tight">
                        {username}
                      </p>
                      <p className="text-[10px] text-sidebar-foreground/40 truncate">{user.email}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/20 group-hover:text-sidebar-foreground/40 transition-colors shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="right"
              sideOffset={8}
              className="w-52 rounded-xl shadow-lg border-border/60"
            >
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold text-foreground">{username}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs cursor-pointer gap-2">
                <Settings className="h-3.5 w-3.5" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive text-xs cursor-pointer gap-2"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
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
