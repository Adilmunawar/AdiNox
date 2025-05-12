
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, QrCode, MoreVertical, Trash2, AlertCircle, Check } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
      
      // Calculate progress percentage for the timer
      const progressValue = (remaining / token.period) * 100;
      setProgress(progressValue);
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
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleShowQR = () => {
    setShowQR(true);
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

  const animatedDigits = (code: string) => {
    return formatTOTPDisplay(code).split('').map((digit, index) => (
      <span 
        key={index} 
        className="inline-block transform transition-all duration-300 hover:scale-110 hover:text-primary"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {digit}
      </span>
    ));
  };

  return (
    <>
      <Card className={cn(
        "token-card hover:shadow-xl transition-all p-4 border-l-4 bg-card/90 backdrop-blur-md",
        timeRemaining <= 5 ? "border-l-destructive" : "border-l-primary"
      )}>
        <div className="flex justify-between items-start mb-2">
          <div className="max-w-[70%]">
            <h3 className="font-semibold text-lg line-clamp-1 group flex items-center">
              {token.issuer}
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">
                {token.algorithm}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{token.name}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/20">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 w-56 animate-in slide-in-from-top-5 fade-in-20">
              <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2" /> Copy Code
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(token)} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" /> Edit Token
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleShowQR} className="cursor-pointer">
                <QrCode className="h-4 w-4 mr-2" /> Show QR Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer" 
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className={`mt-6 p-3 bg-background/50 backdrop-blur-sm rounded-lg flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
          <div className="token-code text-2xl font-mono font-bold select-all flex">
            {animatedDigits(token.currentCode)}
          </div>
          <Button 
            variant={copied ? "success" : "outline"} 
            size="sm" 
            className={cn(
              "flex gap-1 items-center transition-all duration-300",
              copied ? "bg-green-600 text-white hover:bg-green-700" : ""
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {!isMobile && <span>Copy</span>}
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-4 relative">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-muted-foreground">Refreshes in</span>
            <span className={`text-sm font-medium ${getTimerColor()} transition-colors duration-300`}>
              {timeRemaining}s
            </span>
          </div>
          <Progress 
            value={progress} 
            className={cn(
              "h-2 transition-all duration-300",
              timeRemaining <= 5 ? "bg-muted/80" : "bg-muted/40",
            )}
            indicatorClassName={cn(
              timeRemaining <= 5 ? "animate-pulse bg-destructive" : 
              timeRemaining <= 10 ? "bg-amber-500" : "bg-primary"
            )}
          />
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
            {timeRemaining <= 5 && (
              <div className="text-destructive flex items-center gap-1 text-xs animate-pulse">
                <AlertCircle className="h-3 w-3" />
                <span>Expiring soon</span>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-center">Token QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-white p-4 rounded-lg shadow-inner">
              <div className="w-48 h-48 flex items-center justify-center bg-muted text-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary/20 via-primary/40 to-primary/20 animate-pulse" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm text-muted-foreground bg-white/80 p-2 rounded backdrop-blur-sm">
                    For security reasons, the original QR code cannot be regenerated without the original secret.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-center">
              <span className="font-semibold">{token.issuer}</span> ({token.name})
            </p>
            <p className="mt-1 text-xs text-center text-muted-foreground">
              Type: TOTP | Algorithm: {token.algorithm} | Digits: {token.digits}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowQR(false)} 
              className="mt-4"
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
