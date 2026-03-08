import React from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Clock, Activity, ArrowRight, Lightbulb, CreditCard, Key, StickyNote, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TokenProvider, useTokens } from "@/context/TokenContext";
import { getTimeRemaining, formatTOTPDisplay } from "@/utils/tokenUtils";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const securityTips = [
  "Enable 2FA on all your critical accounts — email, banking, and cloud services.",
  "Never share your TOTP secrets or recovery codes with anyone.",
  "Use unique passwords alongside 2FA for maximum security.",
  "Regularly review and remove tokens for accounts you no longer use.",
  "Keep a secure backup of your recovery codes in a safe location.",
];

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }),
};

const StatsCard = ({ icon: Icon, label, value, accent, trend, index }: {
  icon: React.ElementType; label: string; value: string | number; accent?: boolean; trend?: string; index: number;
}) => (
  <motion.div custom={index} variants={staggerItem} initial="hidden" animate="visible">
    <Card className={cn(
      "relative overflow-hidden p-5 border-border/20 bg-card/50 backdrop-blur-sm transition-all duration-300 group cursor-default",
      "hover:border-border/40 hover:bg-card/70",
      accent && "border-primary/15 hover:border-primary/25"
    )}>
      {/* Gradient top accent */}
      {accent && <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />}
      
      {/* Background icon watermark */}
      <div className="absolute -top-2 -right-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <Icon className="h-20 w-20" />
      </div>

      <div className="relative z-10">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
          accent
            ? "bg-primary/10 border border-primary/15 group-hover:bg-primary/15"
            : "bg-secondary/30 border border-border/15 group-hover:bg-secondary/50"
        )}>
          <Icon className={cn("h-4.5 w-4.5", accent ? "text-primary" : "text-muted-foreground/70")} />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            <p className="text-[11px] text-muted-foreground/50 mt-1 font-medium">{label}</p>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-emerald-500/80">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px] font-semibold">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
);

const quickActions = [
  { label: "Add Token", icon: Shield, path: "/tokens", primary: true },
  { label: "Add Card", icon: CreditCard, path: "/cards" },
  { label: "Add Password", icon: Key, path: "/passwords" },
  { label: "Add Note", icon: StickyNote, path: "/notes" },
];

const DashboardContent = () => {
  const { tokens } = useTokens();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tipIndex] = React.useState(() => Math.floor(Math.random() * securityTips.length));
  const [vaultStats, setVaultStats] = React.useState({ cards: 0, passwords: 0, notes: 0 });
  const [greeting, setGreeting] = React.useState("");

  React.useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  React.useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [cardsRes, passwordsRes, notesRes] = await Promise.all([
        supabase.from("vault_cards").select("id", { count: "exact", head: true }),
        supabase.from("vault_passwords").select("id", { count: "exact", head: true }),
        supabase.from("vault_notes").select("id", { count: "exact", head: true }),
      ]);
      setVaultStats({
        cards: cardsRes.count ?? 0,
        passwords: passwordsRes.count ?? 0,
        notes: notesRes.count ?? 0,
      });
    };
    fetchStats();
  }, [user]);

  const urgentTokens = tokens.filter(t => getTimeRemaining(t.period) <= 10);
  const recentTokens = tokens.slice(-3).reverse();
  const totalItems = tokens.length + vaultStats.cards + vaultStats.passwords + vaultStats.notes;
  const username = user?.user_metadata?.username || "there";

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border/20 bg-card/40 backdrop-blur-sm p-6 sm:p-8"
      >
        {/* Accent gradients */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/[0.05] to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/[0.03] to-transparent rounded-tr-full" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-3"
              >
                <Sparkles className="h-4 w-4 text-primary/70" />
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary/70 font-medium tracking-wider uppercase">
                  Vault Active
                </Badge>
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {greeting}, <span className="text-gradient">{username}</span>
              </h1>
              <p className="text-sm text-muted-foreground/50 mt-2 max-w-md">
                Your vault holds <span className="text-foreground/70 font-medium">{totalItems}</span> secured items. Everything is encrypted and protected.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard icon={Shield} label="2FA Tokens" value={tokens.length} accent index={0} />
        <StatsCard icon={CreditCard} label="Saved Cards" value={vaultStats.cards} index={1} />
        <StatsCard icon={Key} label="Passwords" value={vaultStats.passwords} index={2} />
        <StatsCard icon={StickyNote} label="Secure Notes" value={vaultStats.notes} index={3} />
        <StatsCard icon={Clock} label="Expiring Soon" value={urgentTokens.length} index={4} />
        <StatsCard icon={Activity} label="Security Score" value="A+" accent trend="+2%" index={5} />
      </div>

      {/* Quick Actions */}
      <motion.div custom={6} variants={staggerItem} initial="hidden" animate="visible">
        <h3 className="text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-[0.15em] mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(action => (
            <Button
              key={action.label}
              onClick={() => navigate(action.path)}
              variant={action.primary ? "default" : "outline"}
              className={cn(
                "h-11 rounded-xl gap-2 transition-all duration-200",
                action.primary && "shadow-lg shadow-primary/15 btn-premium"
              )}
            >
              <action.icon className="h-4 w-4" /> {action.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Recent Tokens */}
      {recentTokens.length > 0 && (
        <motion.div custom={7} variants={staggerItem} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-[0.15em]">Recent Tokens</h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground/50 h-7 hover:text-foreground" onClick={() => navigate("/tokens")}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTokens.map((token, i) => (
              <motion.div key={token.id} custom={8 + i} variants={staggerItem} initial="hidden" animate="visible">
                <Card
                  className="p-4 border-border/20 bg-card/50 backdrop-blur-sm hover:bg-card/70 hover:border-border/30 cursor-pointer transition-all duration-300 group"
                  onClick={() => navigate("/tokens")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                      <Shield className="h-4 w-4 text-primary/60" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{token.issuer}</p>
                      <p className="text-[10px] text-muted-foreground/40 truncate">{token.name}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/15 border border-border/15 rounded-xl group-hover:bg-secondary/25 transition-colors">
                    <p className="text-lg font-mono font-bold tracking-[0.12em] text-foreground">
                      {formatTOTPDisplay(token.currentCode)}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Security Tip */}
      <motion.div custom={11} variants={staggerItem} initial="hidden" animate="visible">
        <Card className="p-5 border-primary/10 bg-primary/[0.02] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-[0.15em] mb-1.5">Security Tip</p>
              <p className="text-sm text-muted-foreground/60 leading-relaxed">{securityTips[tipIndex]}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const DashboardPage = () => (
  <TokenProvider>
    <DashboardContent />
  </TokenProvider>
);

export default DashboardPage;
