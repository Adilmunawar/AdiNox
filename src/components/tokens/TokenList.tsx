
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Plus, Filter, Calendar, Clock, Grid, List, Copy, Edit, QrCode, MoreVertical, Trash2 } from "lucide-react";
import TokenCard from "./TokenCard";
import AddTokenForm from "./AddTokenForm";
import { useTokens } from "@/context/TokenContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { TokenType } from "@/context/TokenContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatTOTPDisplay, getTimeRemaining } from "@/utils/tokenUtils";

const TokenList = () => {
  const { tokens, removeToken, sortTokens } = useTokens();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "issuer" | "createdAt">("name");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const filteredTokens = tokens.filter(token => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = token.name.toLowerCase().includes(term) || 
                         token.issuer.toLowerCase().includes(term);
    
    if (filterType && filterType !== "all") {
      return matchesSearch && token.algorithm === filterType;
    }
    
    return matchesSearch;
  });

  const handleEditToken = (token: TokenType) => {
    setSelectedToken(token);
    // Implement edit functionality here or open a modal
    console.log("Edit token:", token);
  };
  
  const handleSortChange = (value: string) => {
    const sortValue = value as "name" | "issuer" | "createdAt";
    setSortBy(sortValue);
    sortTokens(sortValue);
  };
  
  // Group tokens by issuer for list view
  const groupedTokens = filteredTokens.reduce((acc, token) => {
    if (!acc[token.issuer]) {
      acc[token.issuer] = [];
    }
    acc[token.issuer].push(token);
    return acc;
  }, {} as Record<string, TokenType[]>);
  
  const algorithmTypes = [...new Set(tokens.map(token => token.algorithm))];
  
  // Animation delay for staggered entrance
  const getAnimationDelay = (index: number) => {
    return {
      animationDelay: `${index * 0.05}s`
    };
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card/30 backdrop-blur-sm p-4 border border-border/50 shadow-lg">
        <div className={`flex gap-3 flex-wrap ${isMobile ? 'flex-col' : 'items-center'}`}>
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              className="pl-9 bg-background/70 backdrop-blur-sm border-input/50 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow lg:flex-grow-0">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter & Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2 border-b border-border">
                    <h4 className="mb-2 text-xs font-medium">Sort by</h4>
                    <DropdownMenuRadioGroup 
                      value={sortBy}
                      onValueChange={(value) => handleSortChange(value)}
                    >
                      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="issuer">Issuer</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="createdAt">Date Added</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                  
                  <div className="p-2">
                    <h4 className="mb-2 text-xs font-medium">Filter by Algorithm</h4>
                    <DropdownMenuRadioGroup 
                      value={filterType || "all"}
                      onValueChange={(value) => setFilterType(value === "all" ? null : value)}
                    >
                      <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                      {algorithmTypes.map((algo) => (
                        <DropdownMenuRadioItem key={algo} value={algo}>
                          {algo}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Select
                  value={sortBy}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[160px] bg-background/70 backdrop-blur-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="issuer">Sort by Issuer</SelectItem>
                    <SelectItem value="createdAt">Sort by Date Added</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filterType || "all"}
                  onValueChange={(value) => setFilterType(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[160px] bg-background/70 backdrop-blur-sm">
                    <SelectValue placeholder="Filter by Algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {algorithmTypes.map((algo) => (
                      <SelectItem key={algo} value={algo}>{algo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
              className={isMobile ? "w-full" : ""}
            >
              <ToggleGroupItem value="grid" className="flex-1" aria-label="Grid view">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" className="flex-1" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        {filteredTokens.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredTokens.length}</span> tokens
              {filterType && <span> filtered by <Badge variant="outline" className="ml-1">{filterType}</Badge></span>}
            </div>
          </div>
        )}
      </div>

      {viewMode === "grid" ? (
        <div className={`grid gap-4 animate-in fade-in-50 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token, index) => (
              <div 
                key={token.id} 
                style={getAnimationDelay(index)}
                className="animate-in fade-in slide-in-from-bottom-3"
              >
                <TokenCard
                  token={token}
                  onRemove={removeToken}
                  onEdit={handleEditToken}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="max-w-md mx-auto space-y-4 p-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xl font-medium">
                  {searchTerm ? "No tokens match your search" : "No tokens added yet"}
                </p>
                <p className="text-muted-foreground">
                  {searchTerm ? 
                    "Try adjusting your search or filters to find what you're looking for." : 
                    "Add your first authentication token to get started with secure access."
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsAddingToken(true)}
                    className="mt-4 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first token
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in-50">
          {Object.keys(groupedTokens).length > 0 ? (
            Object.entries(groupedTokens).map(([issuer, issuerTokens], groupIndex) => (
              <div 
                key={issuer} 
                className="bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-4 animate-in fade-in slide-in-from-bottom-3"
                style={getAnimationDelay(groupIndex)}
              >
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  {issuer}
                  <Badge className="ml-2" variant="outline">{issuerTokens.length}</Badge>
                </h3>
                <div className="space-y-3">
                  {issuerTokens.map((token, tokenIndex) => (
                    <div 
                      key={token.id}
                      className="p-3 bg-background/50 rounded-lg animate-in fade-in"
                      style={getAnimationDelay(tokenIndex)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="token-code text-lg font-mono font-bold">
                              {formatTOTPDisplay(token.currentCode)}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeRemaining(token.period)}s
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            navigator.clipboard.writeText(token.currentCode);
                            toast({
                              title: "Code copied",
                              description: "The code has been copied to your clipboard.",
                            });
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {handleEditToken && (
                                <DropdownMenuItem onClick={() => handleEditToken(token)} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => setSelectedToken(token)} className="cursor-pointer">
                                <QrCode className="h-4 w-4 mr-2" /> QR Code
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive cursor-pointer" 
                                onClick={() => removeToken(token.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="max-w-md mx-auto space-y-4 p-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xl font-medium">
                  {searchTerm ? "No tokens match your search" : "No tokens added yet"}
                </p>
                <p className="text-muted-foreground">
                  {searchTerm ? 
                    "Try adjusting your search or filters to find what you're looking for." : 
                    "Add your first authentication token to get started with secure access."
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsAddingToken(true)}
                    className="mt-4 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first token
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AddTokenForm />
      
      {/* Selected Token Dialog for QR Code */}
      {selectedToken && (
        <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
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
                <span className="font-semibold">{selectedToken.issuer}</span> ({selectedToken.name})
              </p>
              <p className="mt-1 text-xs text-center text-muted-foreground">
                Type: TOTP | Algorithm: {selectedToken.algorithm} | Digits: {selectedToken.digits}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedToken(null)} 
                className="mt-4"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TokenList;
