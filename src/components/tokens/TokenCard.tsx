
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, MoreVertical } from "lucide-react";
import { TokenType } from "@/context/TokenContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatTOTPDisplay, getTimeRemaining } from "@/utils/tokenUtils";
import { useToast } from "@/components/ui/use-toast";

interface TokenCardProps {
  token: TokenType;
  onRemove: (id: string) => void;
}

const TokenCard = ({ token, onRemove }: TokenCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(token.period));
  const [dashOffset, setDashOffset] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(token.period);
      setTimeRemaining(remaining);
      
      // Calculate the dash offset for the progress circle
      const circumference = 2 * Math.PI * 45;
      const offset = circumference * (1 - remaining / token.period);
      setDashOffset(offset);
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

  return (
    <Card className="token-card">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{token.issuer}</h3>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRemove(token.id)}>
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="token-code">{formatTOTPDisplay(token.currentCode)}</div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      
      <svg className="countdown-ring" viewBox="0 0 100 100">
        <circle 
          cx="50" 
          cy="50" 
          r="45"
          strokeDasharray="283"
          strokeDashoffset={dashOffset}
        />
        <text 
          x="50" 
          y="55" 
          textAnchor="middle" 
          fill="currentColor" 
          fontSize="20"
          fontWeight="bold"
        >
          {timeRemaining}
        </text>
      </svg>
    </Card>
  );
};

export default TokenCard;
