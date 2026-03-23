import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBiometric } from "@/hooks/useBiometric";
import { useFaceAuth } from "@/hooks/useFaceAuth";
import FaceScanner from "@/components/auth/FaceScanner";
import {
  User, Shield, Info, Trash2, Mail, Lock, Bell, Timer, Eye, Key, Save, Loader2,
  Fingerprint, ScanFace, Smartphone, Monitor, Ban, CheckCircle2, XCircle, Plus, Camera,
  HelpCircle, MessageCircle, BookOpen, ExternalLink, ChevronRight, Copy, Check,
  AlertTriangle, LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

type UserSettings = {
  auto_lock_timeout: number;
  clipboard_clear_seconds: number;
  show_favicons: boolean;
  default_password_length: number;
  notifications_enabled: boolean;
  biometric_enabled: boolean;
  face_scan_enabled: boolean;
};

const defaultSettings: UserSettings = {
  auto_lock_timeout: 300,
  clipboard_clear_seconds: 30,
  show_favicons: true,
  default_password_length: 16,
  notifications_enabled: true,
  biometric_enabled: false,
  face_scan_enabled: false,
};

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "preferences", label: "Preferences", icon: Key },
  { id: "help", label: "Help", icon: HelpCircle },
] as const;

type TabId = typeof tabs[number]["id"];

const SettingRow = ({ icon: Icon, label, description, children }: {
  icon: React.ElementType; label: string; description?: string; children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-8 w-8 rounded-lg bg-secondary/60 border border-border/20 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground/50 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="shrink-0 ml-4">{children}</div>
  </div>
);

const BiometricIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "face": return <ScanFace className="h-4 w-4" />;
    case "fingerprint": return <Fingerprint className="h-4 w-4" />;
    default: return <Lock className="h-4 w-4" />;
  }
};

const faqItems = [
  {
    q: "How does biometric authentication work?",
    a: "AdiNox uses your device's built-in biometric hardware (Touch ID, Face ID, Windows Hello) via WebAuthn. Your biometric data never leaves your device — only a cryptographic key pair is created and the public key is stored securely.",
  },
  {
    q: "What is AI Face Scan and how is it different?",
    a: "AI Face Scan uses a neural network (face-api.js) running entirely in your browser to create a 128-point facial descriptor. Unlike hardware biometrics, it works on any device with a camera. The face data is encrypted and stored in your Supabase vault.",
  },
  {
    q: "How is my data encrypted?",
    a: "All sensitive data (passwords, card numbers, document images) is encrypted using AES-256 encryption before storage. Your vault is protected by Row Level Security (RLS) policies ensuring only you can access your data.",
  },
  {
    q: "What happens if I forget my password?",
    a: "You can reset your password via the login page using your registered email address. A password reset link will be sent to your email. Your vault data remains encrypted and accessible after password reset.",
  },
  {
    q: "Can I export my data?",
    a: "Currently, data export is not available through the UI. Contact support if you need to export your vault data. We're working on adding this feature in a future update.",
  },
  {
    q: "What is the auto-lock timeout?",
    a: "The auto-lock timeout determines how long the app stays unlocked after your last interaction. Once the timeout expires, you'll need to authenticate again using your password or biometric method.",
  },
  {
    q: "Is my data safe if I lose my device?",
    a: "Yes. All data is stored server-side with encryption and protected by RLS policies tied to your authenticated session. Without your credentials, no one can access your vault — even with physical access to your device.",
  },
];

const SettingsPage = React.memo(() => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { capability, isEnrolled, enrolledDevices, enroll, removeCredential, loading: bioLoading } = useBiometric();
  const { isEnrolled: faceEnrolled, removeFaceData } = useFaceAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tabParam = searchParams.get("tab");
    return (tabParam && ["account", "security", "preferences", "help"].includes(tabParam)) ? tabParam as TabId : "account";
  });
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Sync tab from URL changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["account", "security", "preferences", "help"].includes(tabParam)) {
      setActiveTab(tabParam as TabId);
    }
  }, [searchParams]);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_settings")
      .select("auto_lock_timeout, clipboard_clear_seconds, show_favicons, default_password_length, notifications_enabled, biometric_enabled, face_scan_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        auto_lock_timeout: data.auto_lock_timeout,
        clipboard_clear_seconds: data.clipboard_clear_seconds,
        show_favicons: data.show_favicons,
        default_password_length: data.default_password_length,
        notifications_enabled: data.notifications_enabled,
        biometric_enabled: (data as any).biometric_enabled ?? false,
        face_scan_enabled: (data as any).face_scan_enabled ?? false,
      });
    } else if (!error) {
      await supabase.from("user_settings").insert({ user_id: user.id });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_settings")
      .update(settings as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your preferences have been updated." });
      setDirty(false);
    }
    setSaving(false);
  }, [user, settings, toast]);

  const handleEnrollBiometric = useCallback(async () => {
    setEnrolling(true);
    const success = await enroll();
    if (success) {
      toast({ title: "Biometric enrolled!", description: `${capability.label} has been registered.` });
      updateSetting("biometric_enabled", true);
    } else {
      toast({ title: "Enrollment failed", description: "Could not register biometric.", variant: "destructive" });
    }
    setEnrolling(false);
  }, [enroll, capability, toast, updateSetting]);

  const handleRemoveDevice = useCallback(async (id: string, name: string) => {
    await removeCredential(id);
    toast({ title: "Device removed", description: `${name} has been unregistered.` });
    if (enrolledDevices.length <= 1) updateSetting("biometric_enabled", false);
  }, [removeCredential, toast, enrolledDevices, updateSetting]);

  const handleFaceEnrollSuccess = useCallback(() => {
    setShowFaceScanner(false);
    updateSetting("face_scan_enabled", true);
    toast({ title: "Face enrolled!", description: "Your face has been scanned and stored securely." });
  }, [updateSetting, toast]);

  const handleRemoveFaceData = useCallback(async () => {
    await removeFaceData();
    updateSetting("face_scan_enabled", false);
    toast({ title: "Face data removed", description: "Your face scan data has been deleted." });
  }, [removeFaceData, updateSetting, toast]);

  const handleCopyEmail = useCallback(() => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Manage your account, security, and preferences</p>
        </div>
        {dirty && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Button onClick={handleSave} disabled={saving} size="sm" className="rounded-xl gap-2 h-9">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </Button>
          </motion.div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-secondary/40 rounded-xl border border-border/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-1 justify-center",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm border border-border/30"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-background/50"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl">
        {activeTab === "account" && <AccountTab user={user} copiedEmail={copiedEmail} onCopyEmail={handleCopyEmail} onSignOut={signOut} />}
        {activeTab === "security" && (
          <SecurityTab
            settings={settings}
            updateSetting={updateSetting}
            capability={capability}
            isEnrolled={isEnrolled}
            enrolledDevices={enrolledDevices}
            enrolling={enrolling}
            onEnrollBiometric={handleEnrollBiometric}
            onRemoveDevice={handleRemoveDevice}
            faceEnrolled={faceEnrolled}
            onShowFaceScanner={() => setShowFaceScanner(true)}
            onRemoveFaceData={handleRemoveFaceData}
          />
        )}
        {activeTab === "preferences" && <PreferencesTab settings={settings} updateSetting={updateSetting} />}
        {activeTab === "help" && <HelpTab />}
      </div>

      {/* Face Scanner Dialog */}
      <Dialog open={showFaceScanner} onOpenChange={setShowFaceScanner}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-2xl border-border/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanFace className="h-5 w-5 text-primary" />
              Face Scan Enrollment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/50">
              Position your face in the frame. The AI will perform 5 deep scans to create your facial profile.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FaceScanner mode="enroll" onSuccess={handleFaceEnrollSuccess} onCancel={() => setShowFaceScanner(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

// ── Account Tab ──
const AccountTab = React.memo(({ user, copiedEmail, onCopyEmail, onSignOut }: any) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
    <Card className="p-5 border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-1">Profile Information</h3>
      <p className="text-[11px] text-muted-foreground/50 mb-4">Your account details</p>
      <Separator className="mb-4 bg-border/20" />

      <div className="space-y-1 divide-y divide-border/10">
        <SettingRow icon={Mail} label="Email" description="Your login email address">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{user?.email || "—"}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopyEmail}>
              {copiedEmail ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground/40" />}
            </Button>
          </div>
        </SettingRow>

        <SettingRow icon={User} label="Username" description="Your display name">
          <span className="text-xs font-medium text-foreground">{user?.user_metadata?.username || "—"}</span>
        </SettingRow>

        <SettingRow icon={CheckCircle2} label="Account Status" description="Verification status">
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
          </Badge>
        </SettingRow>
      </div>
    </Card>

    <Card className="p-5 border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-1">About AdiNox</h3>
      <p className="text-[11px] text-muted-foreground/50 mb-4">App information</p>
      <Separator className="mb-4 bg-border/20" />
      <div className="space-y-1 divide-y divide-border/10">
        <SettingRow icon={Info} label="Version"><span className="text-xs font-mono text-muted-foreground">2.3.0</span></SettingRow>
        <SettingRow icon={User} label="Developer"><span className="text-xs font-medium text-primary/80">Adil Munawar</span></SettingRow>
      </div>
    </Card>

    {/* Sign Out & Danger */}
    <Card className="p-5 border-border/30">
      <div className="space-y-3">
        <Button variant="outline" className="w-full h-10 rounded-xl gap-2 text-sm" onClick={onSignOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </Card>

    <Card className="p-5 border-destructive/20 bg-destructive/[0.02]">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-lg bg-destructive/10 border border-destructive/15 flex items-center justify-center">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
          <p className="text-[11px] text-muted-foreground/50">Permanent, irreversible actions</p>
        </div>
      </div>
      <Separator className="mb-3 bg-destructive/10" />
      <SettingRow icon={Trash2} label="Delete Account" description="Permanently remove all your data">
        <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10" disabled>
          Delete
        </Button>
      </SettingRow>
    </Card>
  </motion.div>
));
AccountTab.displayName = "AccountTab";

// ── Security Tab ──
const SecurityTab = React.memo(({ settings, updateSetting, capability, isEnrolled, enrolledDevices, enrolling, onEnrollBiometric, onRemoveDevice, faceEnrolled, onShowFaceScanner, onRemoveFaceData }: any) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
    {/* Hardware Biometrics */}
    <Card className="p-5 border-primary/10 bg-primary/[0.01]">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
          <Fingerprint className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Hardware Biometrics</h3>
          <p className="text-[11px] text-muted-foreground/50">Touch ID, Face ID, Windows Hello</p>
        </div>
        {capability.available ? (
          <Badge variant="outline" className="ml-auto text-[9px] border-emerald-500/30 text-emerald-500 gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> {capability.label}
          </Badge>
        ) : (
          <Badge variant="outline" className="ml-auto text-[9px] border-muted-foreground/30 text-muted-foreground gap-1">
            <Ban className="h-2.5 w-2.5" /> Not Available
          </Badge>
        )}
      </div>
      <Separator className="my-4 bg-primary/10" />

      {capability.available ? (
        <div className="space-y-1 divide-y divide-border/10">
          <SettingRow icon={Lock} label="Biometric Lock" description="Lock vault after inactivity">
            <Switch
              checked={settings.biometric_enabled}
              onCheckedChange={(v: boolean) => {
                if (v && !isEnrolled) onEnrollBiometric();
                else updateSetting("biometric_enabled", v);
              }}
            />
          </SettingRow>

          {enrolledDevices.length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider mb-2">Enrolled Devices</p>
              <div className="space-y-2">
                {enrolledDevices.map((device: any) => (
                  <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/10">
                    <div className="flex items-center gap-3">
                      {device.device_name?.toLowerCase().includes("iphone") || device.device_name?.toLowerCase().includes("android")
                        ? <Smartphone className="h-4 w-4 text-muted-foreground/40" />
                        : <Monitor className="h-4 w-4 text-muted-foreground/40" />
                      }
                      <div>
                        <p className="text-xs font-medium">{device.device_name || "Unknown"}</p>
                        <p className="text-[9px] text-muted-foreground/30">Added {new Date(device.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive/60 hover:text-destructive" onClick={() => onRemoveDevice(device.id, device.device_name)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3">
            <Button
              variant="outline"
              className="w-full h-9 rounded-xl gap-2 text-xs border-dashed border-border/30 hover:border-primary/20"
              onClick={onEnrollBiometric}
              disabled={enrolling}
            >
              {enrolling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {enrolling ? "Enrolling..." : `Add ${capability.label}`}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/40 text-center py-2">No biometric hardware detected. Use AI Face Scan below instead.</p>
      )}
    </Card>

    {/* AI Face Scan */}
    <Card className="p-5 border-primary/10 bg-primary/[0.01]">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
          <ScanFace className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Face Scan</h3>
          <p className="text-[11px] text-muted-foreground/50">Camera-based neural network authentication</p>
        </div>
        <Badge variant="outline" className="ml-auto text-[9px] border-primary/20 text-primary/70 gap-1">
          <Camera className="h-2.5 w-2.5" /> Universal
        </Badge>
      </div>
      <Separator className="my-4 bg-primary/10" />

      <div className="space-y-1 divide-y divide-border/10">
        <SettingRow icon={ScanFace} label="Face Scan Lock" description="Use camera to unlock vault">
          <Switch
            checked={settings.face_scan_enabled}
            onCheckedChange={(v: boolean) => {
              if (v && !faceEnrolled) onShowFaceScanner();
              else updateSetting("face_scan_enabled", v);
            }}
          />
        </SettingRow>

        {faceEnrolled ? (
          <div className="pt-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-medium">Face Enrolled</p>
                  <p className="text-[9px] text-muted-foreground/30">Ready for authentication</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg" onClick={onShowFaceScanner}>Re-scan</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive/60 hover:text-destructive" onClick={onRemoveFaceData}>Remove</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3">
            <Button variant="outline" className="w-full h-9 rounded-xl gap-2 text-xs border-dashed border-border/30 hover:border-primary/20" onClick={onShowFaceScanner}>
              <Camera className="h-3.5 w-3.5" /> Scan Your Face
            </Button>
          </div>
        )}
      </div>
    </Card>

    {/* Lock & Clipboard */}
    <Card className="p-5 border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-1">Lock Settings</h3>
      <p className="text-[11px] text-muted-foreground/50 mb-4">Timeout and clipboard behavior</p>
      <Separator className="mb-4 bg-border/20" />

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground">Auto-Lock Timeout</span>
            </div>
            <span className="text-xs font-mono text-foreground/70">
              {settings.auto_lock_timeout >= 60 ? `${Math.floor(settings.auto_lock_timeout / 60)}m` : `${settings.auto_lock_timeout}s`}
            </span>
          </div>
          <Slider value={[settings.auto_lock_timeout]} onValueChange={(v: number[]) => updateSetting("auto_lock_timeout", v[0])} min={60} max={1800} step={60} />
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
            <span className="text-xs font-mono text-foreground/70">{settings.clipboard_clear_seconds}s</span>
          </div>
          <Slider value={[settings.clipboard_clear_seconds]} onValueChange={(v: number[]) => updateSetting("clipboard_clear_seconds", v[0])} min={5} max={120} step={5} />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground/30">5s</span>
            <span className="text-[9px] text-muted-foreground/30">2 min</span>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
));
SecurityTab.displayName = "SecurityTab";

// ── Preferences Tab ──
const PreferencesTab = React.memo(({ settings, updateSetting }: any) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
    <Card className="p-5 border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-1">Vault Settings</h3>
      <p className="text-[11px] text-muted-foreground/50 mb-4">Default behaviors for your vault</p>
      <Separator className="mb-4 bg-border/20" />

      <div className="space-y-1 divide-y divide-border/10">
        <SettingRow icon={Eye} label="Show Favicons" description="Display site icons in password list">
          <Switch checked={settings.show_favicons} onCheckedChange={(v: boolean) => updateSetting("show_favicons", v)} />
        </SettingRow>

        <SettingRow icon={Bell} label="Notifications" description="Security alerts and reminders">
          <Switch checked={settings.notifications_enabled} onCheckedChange={(v: boolean) => updateSetting("notifications_enabled", v)} />
        </SettingRow>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Default Password Length</span>
          </div>
          <span className="text-xs font-mono text-foreground/70">{settings.default_password_length} chars</span>
        </div>
        <Slider value={[settings.default_password_length]} onValueChange={(v: number[]) => updateSetting("default_password_length", v[0])} min={8} max={64} step={1} />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground/30">8</span>
          <span className="text-[9px] text-muted-foreground/30">64</span>
        </div>
      </div>
    </Card>

    <Card className="p-5 border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-1">Appearance</h3>
      <p className="text-[11px] text-muted-foreground/50 mb-4">Theme and display</p>
      <Separator className="mb-4 bg-border/20" />
      <SettingRow icon={Eye} label="Theme">
        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/15">Light Mode</Badge>
      </SettingRow>
    </Card>
  </motion.div>
));
PreferencesTab.displayName = "PreferencesTab";

// ── Help Tab ──
const HelpTab = React.memo(() => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
    {/* Quick Links */}
    <Card className="p-5 border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-1">Quick Help</h3>
      <p className="text-[11px] text-muted-foreground/50 mb-4">Resources and support</p>
      <Separator className="mb-4 bg-border/20" />

      <div className="grid gap-2">
        {[
          { icon: BookOpen, label: "Getting Started Guide", desc: "Learn the basics of AdiNox vault", action: "Read the FAQ below" },
          { icon: Shield, label: "Security Overview", desc: "How your data is protected", action: "AES-256 + RLS + WebAuthn" },
          { icon: MessageCircle, label: "Contact Support", desc: "Need help? Reach out to us", action: "adilmunawar@support.com" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/10 hover:bg-secondary/30 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <item.icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground/40">{item.desc}</p>
            </div>
            <span className="text-[10px] text-muted-foreground/40 shrink-0">{item.action}</span>
          </div>
        ))}
      </div>
    </Card>

    {/* FAQ */}
    <Card className="p-5 border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-1">Frequently Asked Questions</h3>
      <p className="text-[11px] text-muted-foreground/50 mb-4">Common questions about AdiNox</p>
      <Separator className="mb-4 bg-border/20" />

      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border/10">
            <AccordionTrigger className="text-xs font-medium text-foreground hover:no-underline py-3">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground/60 leading-relaxed pb-3">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>

    {/* Security Info */}
    <Card className="p-5 border-primary/10 bg-primary/[0.01]">
      <h3 className="text-sm font-semibold text-foreground mb-3">Security Architecture</h3>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Encryption", value: "AES-256-GCM" },
          { label: "Auth Protocol", value: "WebAuthn FIDO2" },
          { label: "Data Isolation", value: "Row Level Security" },
          { label: "Face AI Model", value: "128-point NN" },
          { label: "Transport", value: "TLS 1.3" },
          { label: "Architecture", value: "Zero-knowledge" },
        ].map((item, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-secondary/20 border border-border/10">
            <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">{item.label}</p>
            <p className="text-xs font-semibold text-foreground mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  </motion.div>
));
HelpTab.displayName = "HelpTab";

SettingsPage.displayName = "SettingsPage";
export default SettingsPage;
