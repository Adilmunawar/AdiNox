import React from "react";
import { LayoutDashboard, Shield, CreditCard, Key, StickyNote, Settings, LogOut, User, ChevronUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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

export const AppSidebar = React.memo(() => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/30">
      {/* Logo */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/12 border border-primary/15 flex items-center justify-center shrink-0 relative">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground leading-none">
                Adi<span className="text-primary">Nox</span>
              </h1>
              <p className="text-[9px] text-muted-foreground/35 uppercase tracking-[0.2em] mt-0.5 font-medium">Vault</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="opacity-20" />

      <SidebarContent className="px-2 py-3 overflow-hidden">
        <div className="flex h-full flex-col justify-between">
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/25 px-3 mb-1.5 h-6 font-semibold">
                Main
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {mainNav.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.url)}
                        tooltip={collapsed ? item.title : undefined}
                        className={cn(
                          "h-9 rounded-lg transition-all duration-200 cursor-pointer group/item relative",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/5"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <item.icon className={cn(
                          "h-4 w-4 shrink-0 transition-colors duration-200",
                          active ? "text-primary" : "text-muted-foreground/40 group-hover/item:text-sidebar-foreground"
                        )} />
                        {!collapsed && <span className="text-[13px]">{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/25 px-3 mb-1.5 h-6 font-semibold">
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
                          "h-9 rounded-lg transition-all duration-200 cursor-pointer group/item relative",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/5"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <item.icon className={cn(
                          "h-4 w-4 shrink-0 transition-colors duration-200",
                          active ? "text-primary" : "text-muted-foreground/40 group-hover/item:text-sidebar-foreground"
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

      <SidebarSeparator className="opacity-20" />

      <SidebarFooter className="p-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-secondary/20 transition-all duration-200 text-left outline-none",
                collapsed && "justify-center p-1.5"
              )}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5 text-primary/70" />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-sidebar-foreground truncate leading-none">
                        {user.user_metadata?.username || "User"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/35 truncate mt-0.5">{user.email}</p>
                    </div>
                    <ChevronUp className="h-3 w-3 text-muted-foreground/25 shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={collapsed ? "right" : "top"} className="w-52 bg-card/95 backdrop-blur-2xl border-border/25">
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold">{user.user_metadata?.username || "User"}</p>
                <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border/15" />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs cursor-pointer">
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/15" />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive text-xs cursor-pointer">
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
