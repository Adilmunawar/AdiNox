import React from "react";
import { motion } from "framer-motion";
import {
  Shield, Clock, Activity, ArrowRight, Lightbulb, CreditCard, Key,
  FileText, TrendingUp, CheckCircle2, Fingerprint, Lock, Eye, Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { TokenProvider, useTokens } from "@/context/TokenContext";
import { getTimeRemaining, formatTOTPDisplay } from "@/utils/tokenUtils";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

/* ── animation helpers ── */
const stagger = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const securityTips = [
  "Enable 2FA on all your critical accounts — email, banking, and cloud services.",
  "Never share your TOTP secrets or recovery codes with anyone.",
  "Use unique passwords alongside 2FA for maximum security.",
  "Regularly review and remove tokens for accounts you no longer use.",
  "Keep a secure backup of your recovery codes in a safe location.",
];

/* ── Stat Card ── */
const StatCard = ({
  icon: Icon, label, value, accent, trend, path, index,
}: {
  icon: React.ElementType; label: string; value: string | number;
  accent?: boolean; trend?: string; path?: string; index: number;
}) => {
  const navigate = useNavigate();
  return (
    <motion.div custom={index} variants={stagger} initial="hidden" animate="visible">
      <Card
        onClick={() => path && navigate(path)}
        className={cn(
          "relative overflow-hidden p-5 border-border/20 bg-card transition-all duration-300 group hover:shadow-[var(--shadow-md)]",
          path && "cursor-pointer",
          accent && "border-primary/12 hover:border-primary/20",
        )}
      >
        {accent && (
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        )}
        <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <Icon className="h-24 w-24" />
        </div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center mb-3.5 transition-colors duration-300",
              accent ? "bg-primary/10 border border-primary/10" : "bg-muted/50 border border-border/20",
            )}>
              <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-muted-foreground/50")} />
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight leading-none">{value}</p>
            <p className="text-[11px] text-muted-foreground/45 mt-1.5 font-medium">{label}</p>
          </div>
          {trend && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/8 border border-primary/10">
              <TrendingUp className="h-2.5 w-2.5 text-primary" />
              <span className="text-[10px] font-bold text-primary">{trend}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

/* ── Quick Action Card ── */
const quickActions = [
  { label: "2FA Token", desc: "Add authenticator", icon: Shield, path: "/tokens", primary: true },
  { label: "Card", desc: "Save a card", icon: CreditCard, path: "/cards" },
  { label: "Password", desc: "Store credentials", icon: Key, path: "/passwords" },
  { label: "Document", desc: "Upload an ID", icon: FileText, path: "/documents" },
];

/* ── Main Content ── */
const DashboardContent = () => {
  const { tokens } = useTokens();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tipIndex] = React.useState(() => Math.floor(Math.random() * securityTips.length));
  const [vaultStats, setVaultStats] = React.useState({ cards: 0, passwords: 0, documents: 0 });
  const [greeting, setGreeting] = React.useState("");

  React.useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, p, d] = await Promise.all([
        supabase.from("vault_cards").select("id", { count: "exact", head: true }),
        supabase.from("vault_passwords").select("id", { count: "exact", head: true }),
        supabase.from("vault_documents" as any).select("id", { count: "exact", head: true }),
      ]);
      setVaultStats({ cards: c.count ?? 0, passwords: p.count ?? 0, documents: d.count ?? 0 });
    })();
  }, [user]);

  const urgentTokens = tokens.filter((t) => getTimeRemaining(t.period) <= 10);
  const recentTokens = tokens.slice(-3).reverse();
  const totalItems = tokens.length + vaultStats.cards + vaultStats.passwords + vaultStats.documents;
  const username = user?.user_metadata?.username || "there";

  // Vault health score (simple heuristic)
  const healthChecks = [
    tokens.length > 0,
    vaultStats.passwords > 0,
    vaultStats.cards >= 0,
    vaultStats.documents > 0,
    urgentTokens.length === 0,
  ];
  const healthScore = Math.round((healthChecks.filter(Boolean).length / healthChecks.length) * 100);

  return (
    <div className="space-y-7">
      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border/20 bg-card p-6 sm:p-8"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/[0.03] to-transparent rounded-bl-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/10 mb-4"
            >
              <Lock className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.15em]">Vault Secured</span>
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
              {greeting}, <span className="text-primary">{username}</span>
            </h1>
            <p className="text-sm text-muted-foreground/50 mt-2 max-w-md leading-relaxed">
              Your vault holds{" "}
              <span className="text-foreground font-semibold">{totalItems}</span> secured items across all categories.
            </p>
          </div>

          {/* Vault Health Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="shrink-0"
          >
            <Card className="p-4 border-border/20 bg-muted/20 w-fit">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.2" />
                    <circle
                      cx="24" cy="24" r="20" fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(healthScore / 100) * 125.6} 125.6`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{healthScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Vault Health</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs attention"}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        <StatCard icon={Shield} label="2FA Tokens" value={tokens.length} accent path="/tokens" index={0} />
        <StatCard icon={CreditCard} label="Saved Cards" value={vaultStats.cards} path="/cards" index={1} />
        <StatCard icon={Key} label="Passwords" value={vaultStats.passwords} path="/passwords" index={2} />
        <StatCard icon={FileText} label="Documents" value={vaultStats.documents} path="/documents" index={3} />
        <StatCard icon={Clock} label="Expiring Soon" value={urgentTokens.length} index={4} />
        <StatCard icon={Activity} label="Security Score" value="A+" accent trend="+2%" index={5} />
      </div>

      {/* ── Quick Actions ── */}
      <motion.div custom={6} variants={stagger} initial="hidden" animate="visible">
        <h3 className="text-[11px] font-semibold text-muted-foreground/35 uppercase tracking-[0.15em] mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              onClick={() => navigate(action.path)}
              className={cn(
                "p-4 cursor-pointer group transition-all duration-200 hover:shadow-[var(--shadow-md)] border-border/20",
                action.primary && "border-primary/15 bg-primary/[0.02]",
              )}
            >
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center mb-3 transition-colors",
                action.primary
                  ? "bg-primary/12 border border-primary/15 group-hover:bg-primary/18"
                  : "bg-muted/50 border border-border/20 group-hover:bg-muted/70",
              )}>
                <action.icon className={cn("h-4 w-4", action.primary ? "text-primary" : "text-muted-foreground/50")} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">{action.label}</p>
              <p className="text-[10px] text-muted-foreground/40 mt-0.5">{action.desc}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* ── Recent Tokens ── */}
      {recentTokens.length > 0 && (
        <motion.div custom={7} variants={stagger} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold text-muted-foreground/35 uppercase tracking-[0.15em]">
              Recent Tokens
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground/40 h-7 hover:text-foreground gap-1"
              onClick={() => navigate("/tokens")}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTokens.map((token, i) => {
              const remaining = getTimeRemaining(token.period);
              const pct = (remaining / token.period) * 100;
              return (
                <motion.div key={token.id} custom={8 + i} variants={stagger} initial="hidden" animate="visible">
                  <Card
                    className="p-4 border-border/20 bg-card hover:shadow-[var(--shadow-md)] cursor-pointer transition-all duration-300 group"
                    onClick={() => navigate("/tokens")}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                        <Shield className="h-4 w-4 text-primary/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{token.issuer}</p>
                        <p className="text-[10px] text-muted-foreground/35 truncate">{token.name}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold tabular-nums",
                        remaining <= 10 ? "text-destructive" : "text-muted-foreground/35",
                      )}>
                        {remaining}s
                      </span>
                    </div>
                    <div className="p-3 bg-muted/30 border border-border/15 rounded-xl group-hover:bg-muted/50 transition-colors">
                      <p className="text-lg font-mono font-bold tracking-[0.15em] text-foreground text-center">
                        {formatTOTPDisplay(token.currentCode)}
                      </p>
                    </div>
                    <div className="mt-2.5">
                      <Progress
                        value={pct}
                        className="h-1 bg-border/20"
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Security Features ── */}
      <motion.div custom={11} variants={stagger} initial="hidden" animate="visible">
        <h3 className="text-[11px] font-semibold text-muted-foreground/35 uppercase tracking-[0.15em] mb-3">
          Security Features
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Fingerprint, title: "Biometric Auth", desc: "Face & fingerprint login", active: true },
            { icon: Lock, title: "AES-256 Encryption", desc: "Military-grade protection", active: true },
            { icon: Eye, title: "Auto-Lock", desc: "Locks after inactivity", active: true },
          ].map((feat, i) => (
            <Card key={feat.title} className="p-4 border-border/20 bg-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0">
                  <feat.icon className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{feat.title}</p>
                  <p className="text-[10px] text-muted-foreground/40">{feat.desc}</p>
                </div>
                <div className="ml-auto h-2 w-2 rounded-full bg-primary/60 shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* ── Security Tip ── */}
      <motion.div custom={12} variants={stagger} initial="hidden" animate="visible">
        <Card className="p-5 border-primary/8 bg-primary/[0.015] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex gap-3.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.15em] mb-1">Security Tip</p>
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
