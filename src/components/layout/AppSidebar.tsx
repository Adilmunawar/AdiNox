import React from "react";
import { LayoutDashboard, Shield, CreditCard, Key, StickyNote, Settings, LogOut, User, ChevronUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
      {/* Logo */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground leading-none">
                Adi<span className="text-primary">Nox</span>
              </h1>
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.2em] mt-0.5">Vault</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="opacity-30" />

      <SidebarContent className="px-2 py-2">
        {/* Main navigation */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30 px-3 mb-1 h-6">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainNav.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                      className={cn(
                        "h-9 rounded-lg transition-all duration-150 cursor-pointer group/item relative",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/5"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground/50 group-hover/item:text-sidebar-foreground"
                      )} />
                      {!collapsed && <span className="text-[13px]">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary */}
        <SidebarGroup className="mt-auto">
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30 px-3 mb-1 h-6">
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
                        "h-9 rounded-lg transition-all duration-150 cursor-pointer group/item relative",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/5"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground/50 group-hover/item:text-sidebar-foreground"
                      )} />
                      {!collapsed && <span className="text-[13px]">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="opacity-30" />

      {/* User footer */}
      <SidebarFooter className="p-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-secondary/30 transition-colors text-left outline-none",
                collapsed && "justify-center p-1.5"
              )}>
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5 text-primary/70" />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-sidebar-foreground truncate leading-none">
                        {user.user_metadata?.username || "User"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{user.email}</p>
                    </div>
                    <ChevronUp className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={collapsed ? "right" : "top"} className="w-52 glass-morphism">
              <div className="px-3 py-2">
                <p className="text-xs font-medium">{user.user_metadata?.username || "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs cursor-pointer">
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
