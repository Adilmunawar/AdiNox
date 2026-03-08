
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, QrCode, MoreVertical, Trash2, AlertCircle, Check, ShieldCheck } from "lucide-react";
import { TokenType } from "@/context/TokenContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatTOTPDisplay, getTimeRemaining } from "@/utils/tokenUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TokenCardProps {
  token: TokenType;
  onRemove: (id: string) => void;
  onEdit?: (token: TokenType) => void;
}

const CountdownCircle = ({ timeRemaining, period }: { timeRemaining: number; period: number }) => {
  const size = 32;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeRemaining / period) * circumference;
  const isUrgent = timeRemaining <= 5;
  const isWarning = timeRemaining <= 10 && !isUrgent;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border) / 0.3)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isUrgent ? "hsl(var(--destructive))" : isWarning ? "hsl(var(--accent-foreground))" : "hsl(var(--primary))"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      <span className={cn(
        "absolute text-[9px] font-mono font-bold transition-colors",
        isUrgent ? "text-destructive" : isWarning ? "text-amber-500" : "text-primary"
      )}>
        {timeRemaining}
      </span>
    </div>
  );
};

const TokenCard = ({ token, onRemove, onEdit }: TokenCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(token.period));
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeKey, setCodeKey] = useState(0);
  const prevCodeRef = useRef(token.currentCode);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(token.period));
    }, 1000);
    return () => clearInterval(interval);
  }, [token.period]);

  // Detect code changes for transition
  useEffect(() => {
    if (prevCodeRef.current !== token.currentCode && token.currentCode !== "------") {
      prevCodeRef.current = token.currentCode;
      setCodeKey(k => k + 1);
    }
  }, [token.currentCode]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(token.currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRemove = () => {
    if (window.confirm(`Remove token for ${token.issuer || token.name}?`)) {
      onRemove(token.id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        whileTap={copied ? { scale: [1, 1.02, 1] } : undefined}
      >
        <Card className={cn(
          "relative overflow-hidden border-border/30 bg-card/70 backdrop-blur-sm",
          "p-4 transition-all duration-200 hover:border-border/50 hover-lift",
          timeRemaining <= 5 && "border-l-2 border-l-destructive/60"
        )}>
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-1.5 bg-primary/8 rounded-lg shrink-0 border border-primary/10">
                <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate text-foreground">{token.issuer}</h3>
                <p className="text-[11px] text-muted-foreground/60 truncate">{token.name}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleCopy} className="text-xs cursor-pointer">
                  <Copy className="h-3 w-3 mr-2" /> Copy Code
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(token)} className="text-xs cursor-pointer">
                    <Edit className="h-3 w-3 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowQR(true)} className="text-xs cursor-pointer">
                  <QrCode className="h-3 w-3 mr-2" /> QR Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive text-xs cursor-pointer" onClick={handleRemove}>
                  <Trash2 className="h-3 w-3 mr-2" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Code with fade transition */}
          <div className={`p-3 bg-secondary/20 border border-border/20 rounded-xl flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={codeKey}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-mono font-bold tracking-[0.12em] select-all text-foreground"
              >
                {formatTOTPDisplay(token.currentCode)}
              </motion.div>
            </AnimatePresence>
            <Button 
              variant={copied ? "secondary" : "outline"} 
              size="sm" 
              className={cn(
                "h-7 text-[11px] rounded-lg transition-all",
                copied && "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              )}
              onClick={handleCopy}
            >
              {copied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> {!isMobile && "Copy"}</>}
            </Button>
          </div>
          
          {/* Timer with circular countdown */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CountdownCircle timeRemaining={timeRemaining} period={token.period} />
              <AnimatePresence>
                {timeRemaining <= 5 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <AlertCircle className="h-2.5 w-2.5 text-destructive" />
                    <span className="text-[10px] text-destructive font-medium">Expiring</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              {token.algorithm} · {token.digits}d
            </span>
          </div>
        </Card>
      </motion.div>
      
      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm bg-card border-border/30">
          <DialogHeader>
            <DialogTitle className="text-center text-sm">Token Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="bg-secondary/20 border border-border/20 p-5 rounded-xl mb-3">
              <div className="w-36 h-36 flex items-center justify-center">
                <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
                  QR code cannot be regenerated without the original secret.
                </p>
              </div>
            </div>
            <p className="text-sm font-medium">{token.issuer}</p>
            <p className="text-[11px] text-muted-foreground">{token.name}</p>
            <div className="flex items-center gap-1.5 mt-2">
              {["TOTP", token.algorithm, `${token.digits}d`].map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-secondary/40 border border-border/20 rounded text-muted-foreground font-mono">{tag}</span>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowQR(false)} className="mt-4 w-full rounded-lg text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TokenCard;
