
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, QrCode, MoreVertical, Trash2, AlertCircle, Check, ShieldCheck } from "lucide-react";
import { TokenType } from "@/context/TokenContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { formatTOTPDisplay, getTimeRemaining } from "@/utils/tokenUtils";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TokenCardProps {
  token: TokenType;
  onRemove: (id: string) => void;
  onEdit?: (token: TokenType) => void;
}

const TokenCard = ({ token, onRemove, onEdit }: TokenCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(token.period));
  const [progress, setProgress] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(token.period);
      setTimeRemaining(remaining);
      setProgress((remaining / token.period) * 100);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [token.period]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(token.currentCode);
    setCopied(true);
    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove the token for ${token.issuer || token.name}?`)) {
      onRemove(token.id);
    }
  };

  const getTimerColor = () => {
    if (timeRemaining <= 5) return "text-destructive";
    if (timeRemaining <= 10) return "text-amber-500";
    return "text-primary";
  };

  const getBarColor = () => {
    if (timeRemaining <= 5) return "bg-destructive";
    if (timeRemaining <= 10) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={{ y: -2 }}
        layoutId={`token-card-${token.id}`}
      >
        <Card className={cn(
          "relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm",
          "p-4 transition-all duration-300",
          "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
          timeRemaining <= 5 && "border-l-2 border-l-destructive"
        )}>
          {/* Top section */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{token.issuer}</h3>
                <p className="text-xs text-muted-foreground/70 truncate">{token.name}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-secondary/80 shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopy} className="cursor-pointer text-sm">
                  <Copy className="h-3.5 w-3.5 mr-2" /> Copy Code
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(token)} className="cursor-pointer text-sm">
                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit Token
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowQR(true)} className="cursor-pointer text-sm">
                  <QrCode className="h-3.5 w-3.5 mr-2" /> Show QR Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer text-sm" 
                  onClick={handleRemove}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Code display */}
          <div className={`p-3 bg-secondary/30 rounded-xl flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
            <div className="text-2xl font-mono font-bold tracking-[0.15em] select-all text-foreground">
              {formatTOTPDisplay(token.currentCode)}
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant={copied ? "secondary" : "outline"} 
                size="sm" 
                className={cn(
                  "h-8 text-xs transition-all duration-200 rounded-lg",
                  copied && "bg-green-500/20 text-green-400 border-green-500/30"
                )}
                onClick={handleCopy}
              >
                {copied ? (
                  <><Check className="h-3.5 w-3.5 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-3.5 w-3.5 mr-1" /> {!isMobile && "Copy"}</>
                )}
              </Button>
            </motion.div>
          </div>
          
          {/* Timer */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Refresh</span>
              <span className={`text-xs font-mono font-medium ${getTimerColor()} transition-colors`}>
                {timeRemaining}s
              </span>
            </div>
            <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${getBarColor()} transition-colors duration-300`}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </div>
            <AnimatePresence>
              {timeRemaining <= 5 && (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1 mt-1.5"
                >
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <span className="text-[10px] text-destructive font-medium">Expiring soon</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
      
      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm bg-card/95 backdrop-blur-xl border-border/30">
          <DialogHeader>
            <DialogTitle className="text-center text-base">Token Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-secondary/30 p-6 rounded-xl border border-border/30 mb-4">
              <div className="w-40 h-40 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                  For security reasons, the original QR code cannot be regenerated without the original secret.
                </p>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">{token.issuer}</p>
              <p className="text-xs text-muted-foreground">{token.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 bg-secondary/50 rounded-md text-muted-foreground">TOTP</span>
                <span className="text-[10px] px-2 py-0.5 bg-secondary/50 rounded-md text-muted-foreground">{token.algorithm}</span>
                <span className="text-[10px] px-2 py-0.5 bg-secondary/50 rounded-md text-muted-foreground">{token.digits} digits</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowQR(false)} 
              className="mt-5 w-full rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TokenCard;
