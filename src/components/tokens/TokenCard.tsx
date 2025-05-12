
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, QrCode, MoreVertical, Trash2, AlertCircle } from "lucide-react";
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

interface TokenCardProps {
  token: TokenType;
  onRemove: (id: string) => void;
  onEdit?: (token: TokenType) => void;
}

const TokenCard = ({ token, onRemove, onEdit }: TokenCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(token.period));
  const [progress, setProgress] = useState(0);
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
    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
    });
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

  return (
    <Card className="token-card hover:shadow-md transition-all p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{token.issuer}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{token.name}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" /> Copy Code
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(token)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Token
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <QrCode className="h-4 w-4 mr-2" /> Show QR Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className={`mt-4 flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
        <div className="token-code text-2xl font-mono font-bold">{formatTOTPDisplay(token.currentCode)}</div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-1 items-center" 
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
          {!isMobile && <span>Copy</span>}
        </Button>
      </div>
      
      <div className="mt-4 relative">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted-foreground">Refreshes in</span>
          <span className={`text-sm font-medium ${getTimerColor()}`}>{timeRemaining}s</span>
        </div>
        <Progress value={progress} className="h-2" />
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
  );
};

export default TokenCard;
