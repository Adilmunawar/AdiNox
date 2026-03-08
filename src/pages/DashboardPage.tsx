import React from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Clock, Activity, ArrowRight, Lightbulb, ScanLine, CreditCard, Key, StickyNote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TokenProvider, useTokens } from "@/context/TokenContext";
import { getTimeRemaining, formatTOTPDisplay } from "@/utils/tokenUtils";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

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
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }),
};

const StatsCard = ({ icon: Icon, label, value, accent, index }: {
  icon: React.ElementType; label: string; value: string | number; accent?: boolean; index: number;
}) => (
  <motion.div custom={index} variants={staggerItem} initial="hidden" animate="visible">
    <Card className={cn(
      "relative overflow-hidden p-5 border-border/30 bg-card/60 backdrop-blur-sm hover-lift transition-all",
      accent && "border-primary/20"
    )}>
      <div className="absolute top-3 right-3 opacity-[0.06]">
        <Icon className="h-12 w-12" />
      </div>
      <div className="relative z-10">
        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-3",
          accent ? "bg-primary/12 border border-primary/15" : "bg-secondary/40 border border-border/20"
        )}>
          <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-muted-foreground")} />
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">{label}</p>
      </div>
    </Card>
  </motion.div>
);

const DashboardContent = () => {
  const { tokens } = useTokens();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tipIndex] = React.useState(() => Math.floor(Math.random() * securityTips.length));
  const [vaultStats, setVaultStats] = React.useState({ cards: 0, passwords: 0, notes: 0 });

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

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground/60 mt-1">Your security overview at a glance.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard icon={Shield} label="2FA Tokens" value={tokens.length} accent index={0} />
        <StatsCard icon={CreditCard} label="Saved Cards" value={vaultStats.cards} index={1} />
        <StatsCard icon={Key} label="Passwords" value={vaultStats.passwords} index={2} />
        <StatsCard icon={StickyNote} label="Secure Notes" value={vaultStats.notes} index={3} />
        <StatsCard icon={Clock} label="Expiring Soon" value={urgentTokens.length} index={4} />
        <StatsCard icon={Activity} label="Security Score" value="A+" accent index={5} />
      </div>

      {/* Quick Actions */}
      <motion.div custom={6} variants={staggerItem} initial="hidden" animate="visible">
        <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/tokens")}
            className="h-11 rounded-xl gap-2 shadow-md shadow-primary/10 btn-premium"
          >
            <Plus className="h-4 w-4" /> Add Token
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/cards")}
            className="h-11 rounded-xl gap-2"
          >
            <CreditCard className="h-4 w-4" /> Add Card
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/passwords")}
            className="h-11 rounded-xl gap-2"
          >
            <Key className="h-4 w-4" /> Add Password
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/notes")}
            className="h-11 rounded-xl gap-2"
          >
            <StickyNote className="h-4 w-4" /> Add Note
          </Button>
        </div>
      </motion.div>

      {/* Recent Tokens */}
      {recentTokens.length > 0 && (
        <motion.div custom={7} variants={staggerItem} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest">Recent Tokens</h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => navigate("/tokens")}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTokens.map((token, i) => (
              <motion.div
                key={token.id}
                custom={8 + i}
                variants={staggerItem}
                initial="hidden"
                animate="visible"
              >
                <Card className="p-4 border-border/30 bg-card/60 backdrop-blur-sm hover-lift cursor-pointer transition-all" onClick={() => navigate("/tokens")}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center">
                      <Shield className="h-3.5 w-3.5 text-primary/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{token.issuer}</p>
                      <p className="text-[10px] text-muted-foreground/50 truncate">{token.name}</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-secondary/20 border border-border/20 rounded-lg">
                    <p className="text-lg font-mono font-bold tracking-[0.1em] text-foreground">
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
        <Card className="p-5 border-border/20 bg-primary/[0.03] border-primary/10">
          <div className="flex gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">Security Tip</p>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">{securityTips[tipIndex]}</p>
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
