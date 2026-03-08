import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CreditCard, Trash2, Eye, EyeOff, Copy, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type VaultCard = {
  id: string;
  card_type: string;
  card_holder: string;
  card_number: string;
  expiry_date: string | null;
  cvv: string | null;
  issuer_bank: string | null;
  card_brand: string | null;
  color_theme: string | null;
  notes: string | null;
  created_at: string;
};

const detectCardBrand = (num: string): string => {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  if (/^35/.test(n)) return "JCB";
  if (/^3(?:0[0-5]|[68])/.test(n)) return "Diners";
  return "Other";
};

const brandColors: Record<string, string> = {
  Visa: "from-blue-600/80 to-blue-900/90",
  Mastercard: "from-red-600/70 to-orange-700/80",
  Amex: "from-emerald-600/70 to-teal-800/80",
  Discover: "from-orange-500/70 to-amber-700/80",
  JCB: "from-green-600/70 to-green-900/80",
  Diners: "from-cyan-600/70 to-cyan-900/80",
  Other: "from-primary/50 to-primary/80",
};

const maskNumber = (num: string) => {
  const clean = num.replace(/\s/g, "");
  if (clean.length <= 4) return clean;
  return "•••• •••• •••• " + clean.slice(-4);
};

const formatCardNumber = (num: string) => {
  const clean = num.replace(/\s/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
};

const FlipCard = React.memo(({ card, onDelete }: { card: VaultCard; onDelete: (id: string) => void }) => {
  const [flipped, setFlipped] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const { toast } = useToast();
  const brand = card.card_brand || detectCardBrand(card.card_number);
  const gradient = brandColors[brand] || brandColors.Other;

  const copyNumber = () => {
    navigator.clipboard.writeText(card.card_number.replace(/\s/g, ""));
    toast({ title: "Copied", description: "Card number copied to clipboard." });
  };

  return (
    <div className="perspective-1000 h-[210px]">
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-br border border-white/10 shadow-xl",
            gradient
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-medium">{card.card_type}</p>
              <p className="text-xs text-white/70 mt-0.5">{card.issuer_bank || brand}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-white/10">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyNumber(); }} className="text-xs cursor-pointer">
                  <Copy className="h-3 w-3 mr-2" /> Copy Number
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} className="text-destructive text-xs cursor-pointer">
                  <Trash2 className="h-3 w-3 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Chip */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300/80 to-yellow-500/60 border border-yellow-400/30" />

          <div>
            <p className="text-lg font-mono text-white tracking-[0.15em] mb-3">
              {showFull ? formatCardNumber(card.card_number) : maskNumber(card.card_number)}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Card Holder</p>
                <p className="text-xs text-white/90 font-medium uppercase tracking-wide">{card.card_holder}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Expires</p>
                <p className="text-xs text-white/90 font-mono">{card.expiry_date || "••/••"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl flex flex-col justify-between bg-gradient-to-br border border-white/10 shadow-xl overflow-hidden",
            gradient
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-10 bg-black/40 mt-6" />
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">CVV</p>
              <div className="bg-white/10 backdrop-blur-sm rounded px-3 py-1.5">
                <p className="text-sm font-mono text-white tracking-widest">{card.cvv || "•••"}</p>
              </div>
            </div>
            <p className="text-[9px] text-white/30 leading-relaxed">
              This card is stored securely in your AdiNox vault. Tap to flip back.
            </p>
          </div>
          <div className="px-6 pb-4 flex justify-between items-center">
            <p className="text-xs text-white/60 font-bold">{brand}</p>
            <p className="text-[9px] text-white/30">AdiNox Vault</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
FlipCard.displayName = "FlipCard";

const stagger = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

const CardsPage = () => {
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({
    card_type: "credit", card_holder: "", card_number: "", expiry_date: "", cvv: "", issuer_bank: "", color_theme: "purple", notes: "",
  });

  const fetchCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("vault_cards").select("*").order("created_at", { ascending: false });
    if (error) { toast({ title: "Error", description: "Failed to load cards.", variant: "destructive" }); }
    else setCards((data || []) as VaultCard[]);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleAdd = async () => {
    if (!user || !form.card_holder || !form.card_number) return;
    const brand = detectCardBrand(form.card_number);
    const { error } = await supabase.from("vault_cards").insert({
      user_id: user.id, ...form, card_brand: brand,
    });
    if (error) { toast({ title: "Error", description: "Failed to add card.", variant: "destructive" }); return; }
    toast({ title: "Card added", description: `${brand} card saved to vault.` });
    setForm({ card_type: "credit", card_holder: "", card_number: "", expiry_date: "", cvv: "", issuer_bank: "", color_theme: "purple", notes: "" });
    setIsAdding(false);
    fetchCards();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this card?")) return;
    const { error } = await supabase.from("vault_cards").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); return; }
    toast({ title: "Deleted", description: "Card removed from vault." });
    setCards(cards.filter(c => c.id !== id));
  };

  const inputCls = "h-10 bg-secondary/30 border-border/40 rounded-lg text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/15";

  const formContent = (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-[11px] text-muted-foreground mb-1 block">Card Type</Label>
          <Select value={form.card_type} onValueChange={v => setForm(f => ({ ...f, card_type: v }))}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="credit">Credit Card</SelectItem>
              <SelectItem value="debit">Debit Card</SelectItem>
              <SelectItem value="id">ID Card</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label className="text-[11px] text-muted-foreground mb-1 block">Issuer Bank</Label>
          <Input className={inputCls} value={form.issuer_bank} onChange={e => setForm(f => ({ ...f, issuer_bank: e.target.value }))} placeholder="e.g. Chase" />
        </div>
      </div>
      <div><Label className="text-[11px] text-muted-foreground mb-1 block">Card Holder Name</Label>
        <Input className={inputCls} value={form.card_holder} onChange={e => setForm(f => ({ ...f, card_holder: e.target.value }))} placeholder="JOHN DOE" required />
      </div>
      <div><Label className="text-[11px] text-muted-foreground mb-1 block">Card Number</Label>
        <Input className={inputCls} value={form.card_number} onChange={e => setForm(f => ({ ...f, card_number: e.target.value }))} placeholder="4242 4242 4242 4242" maxLength={19} required />
        {form.card_number.length >= 4 && (
          <p className="text-[10px] text-primary/70 mt-1">Detected: {detectCardBrand(form.card_number)}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-[11px] text-muted-foreground mb-1 block">Expiry Date</Label>
          <Input className={inputCls} value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} placeholder="MM/YY" maxLength={5} />
        </div>
        <div><Label className="text-[11px] text-muted-foreground mb-1 block">CVV</Label>
          <Input className={inputCls} value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))} placeholder="•••" maxLength={4} type="password" />
        </div>
      </div>
      <Button onClick={handleAdd} className="w-full h-11 rounded-xl btn-premium" disabled={!form.card_holder || !form.card_number}>
        <Plus className="h-4 w-4 mr-1.5" /> Save Card
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Identity Cards</h1>
            <p className="text-sm text-muted-foreground/60 mt-1">Securely store your bank cards and identity documents.</p>
          </div>
          {!isMobile && (
            <Button onClick={() => setIsAdding(true)} className="rounded-xl gap-2 btn-premium">
              <Plus className="h-4 w-4" /> Add Card
            </Button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-[210px] rounded-2xl bg-card/40 animate-pulse border border-border/20" />)}
        </div>
      ) : cards.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border/40">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <CreditCard className="h-7 w-7 text-primary/50" />
          </div>
          <p className="text-lg font-medium">No cards saved yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-4">Add your first card to the vault.</p>
          <Button onClick={() => setIsAdding(true)} className="rounded-xl btn-premium"><Plus className="h-4 w-4 mr-1.5" /> Add Card</Button>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div key={card.id} custom={i} variants={stagger} initial="hidden" animate="visible">
              <FlipCard card={card} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}

      {isMobile && (
        <motion.div className="fixed bottom-20 right-4 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 p-0" onClick={() => setIsAdding(true)}>
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {isMobile ? (
        <Drawer open={isAdding} onOpenChange={setIsAdding}>
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader className="text-left"><DrawerTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Add Card</DrawerTitle></DrawerHeader>
            {formContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/30 rounded-2xl">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Add Card</DialogTitle></DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CardsPage;
