
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Copy, MoreVertical, Trash2, Edit, QrCode, Clock } from "lucide-react";
import { TokenType, useTokens } from "@/context/TokenContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { formatTOTPDisplay, getTimeRemaining } from "@/utils/tokenUtils";

type TokenCardProps = {
  token: TokenType;
  onRemove: (id: string) => void;
  onEdit?: (token: TokenType) => void;
};

const TokenCard = ({ token, onRemove, onEdit }: TokenCardProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(token.period));
  const { viewToken, copyToken } = useTokens();
  
  // Update the time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(token.period));
    }, 1000);
    
    // View the token when the component mounts
    viewToken(token);
    
    return () => clearInterval(interval);
  }, [token]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToken(token);
  };

  const getPeriodClass = () => {
    if (timeLeft <= 5) {
      return "text-destructive animate-pulse";
    }
    if (timeLeft <= 10) {
      return "text-orange-500";
    }
    return "text-muted-foreground";
  };

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-card/30 border-border/50 transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{token.issuer}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{token.name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(token)} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer">
                <QrCode className="h-4 w-4 mr-2" /> QR Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer" 
                onClick={() => onRemove(token.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-background/50 rounded-lg p-3 flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-mono font-bold tracking-wider cursor-pointer" onClick={() => viewToken(token)}>
              {formatTOTPDisplay(token.currentCode)}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0" 
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-1">
            <Badge variant="outline" className="text-xs">
              {token.algorithm} / {token.digits} digits
            </Badge>
            <div className={cn("flex items-center text-xs", getPeriodClass())}>
              <Clock className="h-3 w-3 mr-1" />
              <span>{timeLeft}s</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCard;
