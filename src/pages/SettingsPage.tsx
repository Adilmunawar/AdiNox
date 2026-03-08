import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Palette, Info, Trash2, Mail, Lock, Bell, Timer, Eye, Key, Save, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserSettings = {
  auto_lock_timeout: number;
  clipboard_clear_seconds: number;
  show_favicons: boolean;
  default_password_length: number;
  notifications_enabled: boolean;
};

const defaultSettings: UserSettings = {
  auto_lock_timeout: 300,
  clipboard_clear_seconds: 30,
  show_favicons: true,
  default_password_length: 16,
  notifications_enabled: true,
};

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
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_settings")
      .select("auto_lock_timeout, clipboard_clear_seconds, show_favicons, default_password_length, notifications_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        auto_lock_timeout: data.auto_lock_timeout,
        clipboard_clear_seconds: data.clipboard_clear_seconds,
        show_favicons: data.show_favicons,
        default_password_length: data.default_password_length,
        notifications_enabled: data.notifications_enabled,
      });
    } else if (!error) {
      // No row yet — insert defaults
      await supabase.from("user_settings").insert({ user_id: user.id });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_settings")
      .update(settings)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } else {
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
      setDirty(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-border border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground/60 mt-1">Manage your account and vault preferences.</p>
        </div>
        {dirty && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 btn-premium">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </motion.div>
        )}
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
        <SettingsSection icon={Shield} title="Security" description="Vault protection preferences" index={1}>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Two-Factor Auth</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">Active</Badge>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">Auto-Lock Timeout</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground/70">
                  {settings.auto_lock_timeout >= 60 ? `${Math.floor(settings.auto_lock_timeout / 60)}m` : `${settings.auto_lock_timeout}s`}
                </span>
              </div>
              <Slider
                value={[settings.auto_lock_timeout]}
                onValueChange={v => updateSetting("auto_lock_timeout", v[0])}
                min={60} max={1800} step={60}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/30">1 min</span>
                <span className="text-[9px] text-muted-foreground/30">30 min</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">Clipboard Clear</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground/70">{settings.clipboard_clear_seconds}s</span>
              </div>
              <Slider
                value={[settings.clipboard_clear_seconds]}
                onValueChange={v => updateSetting("clipboard_clear_seconds", v[0])}
                min={5} max={120} step={5}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/30">5s</span>
                <span className="text-[9px] text-muted-foreground/30">2 min</span>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Vault Preferences */}
        <SettingsSection icon={Key} title="Vault Preferences" description="Default behaviors for your vault" index={2}>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
                <div>
                  <span className="text-xs text-muted-foreground block">Show Favicons</span>
                  <span className="text-[10px] text-muted-foreground/30">Display site icons in password list</span>
                </div>
              </div>
              <Switch
                checked={settings.show_favicons}
                onCheckedChange={v => updateSetting("show_favicons", v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">Default Password Length</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground/70">{settings.default_password_length} chars</span>
              </div>
              <Slider
                value={[settings.default_password_length]}
                onValueChange={v => updateSetting("default_password_length", v[0])}
                min={8} max={64} step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/30">8</span>
                <span className="text-[9px] text-muted-foreground/30">64</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-muted-foreground/50" />
                <div>
                  <span className="text-xs text-muted-foreground block">Notifications</span>
                  <span className="text-[10px] text-muted-foreground/30">Security alerts and reminders</span>
                </div>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={v => updateSetting("notifications_enabled", v)}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection icon={Palette} title="Appearance" description="Theme and display preferences" index={3}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <Badge variant="secondary" className="text-[10px]">Dark Mode</Badge>
          </div>
        </SettingsSection>

        {/* About */}
        <SettingsSection icon={Info} title="About" description="App information and credits" index={4}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Version</span>
              <span className="text-xs font-mono text-muted-foreground/70">2.1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Developer</span>
              <span className="text-xs font-medium text-primary/70">Adil Munawar</span>
            </div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <motion.div custom={5} variants={stagger} initial="hidden" animate="visible">
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
