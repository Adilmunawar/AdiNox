import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Key, Eye, EyeOff, Copy, Trash2, Globe, RefreshCw, Search, MoreVertical, Lock, Shield, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VaultPassword = {
  id: string;
  site_name: string;
  site_url: string | null;
  username: string;
  encrypted_password: string;
  notes: string | null;
  category: string | null;
  favicon_url: string | null;
  created_at: string;
};

const getStrength = (pw: string): { score: number; label: string; color: string } => {
  if (!pw) return { score: 0, label: "", color: "bg-border/40" };
  const checks = [pw.length >= 8, pw.length >= 12, /[a-z]/.test(pw), /[A-Z]/.test(pw), /\d/.test(pw), /[!@#$%^&*(),.?":{}|<>]/.test(pw)];
  const s = checks.filter(Boolean).length;
  const configs = [
    { label: "Very Weak", color: "bg-destructive" },
    { label: "Weak", color: "bg-orange-500" },
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-primary" },
    { label: "Excellent", color: "bg-primary/80" },
  ];
  return { score: s, ...(configs[s - 1] || configs[0]) };
};

const generatePassword = (length: number, upper: boolean, lower: boolean, numbers: boolean, symbols: boolean): string => {
  let chars = "";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (numbers) chars += "0123456789";
  if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const stagger = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

const PasswordItem = React.memo(({ pw, onDelete }: { pw: VaultPassword; onDelete: (id: string) => void }) => {
  const [visible, setVisible] = useState(false);
  const { toast } = useToast();

  const copyField = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  const faviconUrl = pw.site_url
    ? `https://www.google.com/s2/favicons?domain=${new URL(pw.site_url.startsWith("http") ? pw.site_url : `https://${pw.site_url}`).hostname}&sz=32`
    : null;

  return (
    <Card className="p-4 border-border/30 bg-white hover:shadow-[var(--shadow-md)] transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-xl bg-muted/50 border border-border/30 flex items-center justify-center shrink-0 overflow-hidden">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" className="h-5 w-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground/40" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{pw.site_name}</h3>
            <p className="text-[11px] text-muted-foreground/50 truncate">{pw.username}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground/40 hover:text-foreground shrink-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => copyField(pw.username, "Username")} className="text-xs cursor-pointer">
              <Copy className="h-3 w-3 mr-2" /> Copy Username
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyField(pw.encrypted_password, "Password")} className="text-xs cursor-pointer">
              <Key className="h-3 w-3 mr-2" /> Copy Password
            </DropdownMenuItem>
            {pw.site_url && (
              <DropdownMenuItem onClick={() => window.open(pw.site_url!.startsWith("http") ? pw.site_url! : `https://${pw.site_url}`, "_blank")} className="text-xs cursor-pointer">
                <ExternalLink className="h-3 w-3 mr-2" /> Open Site
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(pw.id)} className="text-destructive text-xs cursor-pointer">
              <Trash2 className="h-3 w-3 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 p-3 bg-muted/30 border border-border/20 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm tracking-wide text-foreground">
            {visible ? pw.encrypted_password : "•".repeat(Math.min(pw.encrypted_password.length, 16))}
          </p>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground/50" onClick={() => setVisible(!visible)}>
              {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground/50" onClick={() => copyField(pw.encrypted_password, "Password")}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex gap-0.5 mt-2">
          {[1, 2, 3, 4, 5, 6].map(i => {
            const s = getStrength(pw.encrypted_password);
            return <div key={i} className={cn("h-0.5 flex-1 rounded-full transition-colors", i <= s.score ? s.color : "bg-border/30")} />;
          })}
        </div>
      </div>
    </Card>
  );
});
PasswordItem.displayName = "PasswordItem";

const PasswordsPage = () => {
  const [passwords, setPasswords] = useState<VaultPassword[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({ site_name: "", site_url: "", username: "", password: "", notes: "" });

  const [genLength, setGenLength] = useState(16);
  const [genUpper, setGenUpper] = useState(true);
  const [genLower, setGenLower] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);

  const fetchPasswords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("vault_passwords").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: "Failed to load passwords.", variant: "destructive" });
    else setPasswords((data || []) as VaultPassword[]);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => { fetchPasswords(); }, [fetchPasswords]);

  const handleGenerate = () => {
    const pw = generatePassword(genLength, genUpper, genLower, genNumbers, genSymbols);
    setForm(f => ({ ...f, password: pw }));
  };

  const handleAdd = async () => {
    if (!user || !form.site_name || !form.username || !form.password) return;
    const { error } = await supabase.from("vault_passwords").insert({
      user_id: user.id, site_name: form.site_name, site_url: form.site_url || null,
      username: form.username, encrypted_password: form.password, notes: form.notes || null,
    });
    if (error) { toast({ title: "Error", description: "Failed to save password.", variant: "destructive" }); return; }
    toast({ title: "Password saved", description: `Credentials for ${form.site_name} added.` });
    setForm({ site_name: "", site_url: "", username: "", password: "", notes: "" });
    setIsAdding(false);
    fetchPasswords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this password?")) return;
    const { error } = await supabase.from("vault_passwords").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); return; }
    setPasswords(passwords.filter(p => p.id !== id));
    toast({ title: "Deleted", description: "Password removed." });
  };

  const filtered = passwords.filter(p => {
    const t = search.toLowerCase();
    return p.site_name.toLowerCase().includes(t) || p.username.toLowerCase().includes(t);
  });

  const inputCls = "h-10 bg-muted/40 border-border/40 rounded-xl text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/15";
  const strength = getStrength(form.password);

  const formContent = (
    <div className="space-y-4 py-2">
      <div><Label className="text-[11px] text-muted-foreground/70 mb-1.5 block font-medium">Site Name</Label>
        <Input className={inputCls} value={form.site_name} onChange={e => setForm(f => ({ ...f, site_name: e.target.value }))} placeholder="Google, GitHub..." required />
      </div>
      <div><Label className="text-[11px] text-muted-foreground/70 mb-1.5 block font-medium">URL (optional)</Label>
        <Input className={inputCls} value={form.site_url} onChange={e => setForm(f => ({ ...f, site_url: e.target.value }))} placeholder="https://example.com" />
      </div>
      <div><Label className="text-[11px] text-muted-foreground/70 mb-1.5 block font-medium">Username / Email</Label>
        <Input className={inputCls} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="user@email.com" required />
      </div>
      <div>
        <Label className="text-[11px] text-muted-foreground/70 mb-1.5 block font-medium">Password</Label>
        <div className="flex gap-2">
          <Input className={cn(inputCls, "flex-1")} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" required />
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl border-border/40" onClick={handleGenerate} title="Generate">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        {form.password && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground/50">Strength</span>
              <span className="text-muted-foreground/70 font-medium">{strength.label}</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= strength.score ? strength.color : "bg-border/30")} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-muted/30 border border-border/20 rounded-xl space-y-3">
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-semibold">Generator</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Length: {genLength}</span>
          <Slider value={[genLength]} onValueChange={v => setGenLength(v[0])} min={8} max={64} step={1} className="w-32" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Uppercase", val: genUpper, set: setGenUpper },
            { label: "Lowercase", val: genLower, set: setGenLower },
            { label: "Numbers", val: genNumbers, set: setGenNumbers },
            { label: "Symbols", val: genSymbols, set: setGenSymbols },
          ].map(opt => (
            <div key={opt.label} className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{opt.label}</span>
              <Switch checked={opt.val} onCheckedChange={opt.set} className="scale-75" />
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleAdd} className="w-full h-11 rounded-xl shadow-[var(--shadow-glow-primary)]" disabled={!form.site_name || !form.username || !form.password}>
        <Plus className="h-4 w-4 mr-1.5" /> Save Password
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/12 flex items-center justify-center">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Password Manager</h1>
              <p className="text-sm text-muted-foreground/60 mt-0.5">Store and manage your credentials securely.</p>
            </div>
          </div>
          {!isMobile && (
            <Button onClick={() => setIsAdding(true)} className="rounded-xl gap-2 shadow-[var(--shadow-glow-primary)]">
              <Plus className="h-4 w-4" /> Add Password
            </Button>
          )}
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
        <Input
          placeholder="Search credentials..."
          className="pl-10 bg-white border-border/40 rounded-xl h-11 shadow-[var(--shadow-xs)]"
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse border border-border/20" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl border border-dashed border-border/50 shadow-[var(--shadow-xs)]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4">
            <Key className="h-7 w-7 text-primary/50" />
          </div>
          <p className="text-lg font-semibold text-foreground">{search ? "No results found" : "No passwords saved yet"}</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-5">{search ? "Try a different search term." : "Add your first credential to the vault."}</p>
          {!search && <Button onClick={() => setIsAdding(true)} className="rounded-xl shadow-[var(--shadow-glow-primary)]"><Plus className="h-4 w-4 mr-1.5" /> Add Password</Button>}
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pw, i) => (
            <motion.div key={pw.id} custom={i} variants={stagger} initial="hidden" animate="visible">
              <PasswordItem pw={pw} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}

      {isMobile && (
        <motion.div className="fixed bottom-20 right-4 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
          <Button size="lg" className="h-14 w-14 rounded-full shadow-[var(--shadow-glow-primary)] p-0" onClick={() => setIsAdding(true)}>
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {isMobile ? (
        <Drawer open={isAdding} onOpenChange={setIsAdding}>
          <DrawerContent className="px-4 pb-6 max-h-[90vh] overflow-y-auto">
            <DrawerHeader className="text-left"><DrawerTitle className="flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Add Password</DrawerTitle></DrawerHeader>
            {formContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="sm:max-w-md bg-white border-border/40 rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Add Password</DialogTitle></DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PasswordsPage;
