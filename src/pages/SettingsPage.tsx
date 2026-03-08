import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, Palette, Info, Trash2, Mail, Lock, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const stagger = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }),
};

const SettingsSection = ({ icon: Icon, title, description, children, index }: {
  icon: React.ElementType; title: string; description: string; children: React.ReactNode; index: number;
}) => (
  <motion.div custom={index} variants={stagger} initial="hidden" animate="visible">
    <Card className="p-6 border-border/30 bg-card/60 backdrop-blur-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-secondary/40 border border-border/20 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">{description}</p>
        </div>
      </div>
      <Separator className="mb-4 bg-border/20" />
      {children}
    </Card>
  </motion.div>
);

const SettingsPage = React.memo(() => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground/60 mt-1">Manage your account and preferences.</p>
      </motion.div>

      <div className="space-y-5 max-w-2xl">
        {/* Profile */}
        <SettingsSection icon={User} title="Profile" description="Your account information" index={0}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Email</span>
              </div>
              <span className="text-xs font-mono text-foreground/80">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Username</span>
              </div>
              <span className="text-xs font-medium text-foreground/80">{user?.user_metadata?.username || "—"}</span>
            </div>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection icon={Shield} title="Security" description="Password and authentication settings" index={1}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Password</span>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-lg" disabled>
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Two-Factor Auth</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">Active</Badge>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection icon={Palette} title="Appearance" description="Theme and display preferences" index={2}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <Badge variant="secondary" className="text-[10px]">Dark Mode</Badge>
          </div>
        </SettingsSection>

        {/* About */}
        <SettingsSection icon={Info} title="About" description="App information and credits" index={3}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Version</span>
              <span className="text-xs font-mono text-muted-foreground/70">2.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Developer</span>
              <span className="text-xs font-medium text-primary/70">Adil Munawar</span>
            </div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <motion.div custom={4} variants={stagger} initial="hidden" animate="visible">
          <Card className="p-6 border-destructive/20 bg-destructive/[0.03]">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-destructive/10 border border-destructive/15 flex items-center justify-center shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">Irreversible actions</p>
              </div>
            </div>
            <Separator className="mb-4 bg-destructive/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Delete Account</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Permanently remove your account and all data</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10" disabled>
                Delete
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});

SettingsPage.displayName = "SettingsPage";
export default SettingsPage;
