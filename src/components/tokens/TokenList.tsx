
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import TokenCard from "./TokenCard";
import AddTokenForm from "./AddTokenForm";
import { useTokens } from "@/context/TokenContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { TokenType } from "@/context/TokenContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const TokenList = () => {
  const { tokens, removeToken, sortTokens } = useTokens();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const isMobile = useIsMobile();

  const filteredTokens = tokens.filter(token => {
    const term = searchTerm.toLowerCase();
    return token.name.toLowerCase().includes(term) || 
           token.issuer.toLowerCase().includes(term);
  });

  const handleEditToken = (token: TokenType) => {
    setSelectedToken(token);
    // Implement edit functionality here or open a modal
    console.log("Edit token:", token);
  };

  return (
    <div className="space-y-6">
      <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Sort & Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup 
                onValueChange={(value) => sortTokens(value as "name" | "issuer" | "createdAt")}
                defaultValue="name"
              >
                <DropdownMenuRadioItem value="name">Sort by Name</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="issuer">Sort by Issuer</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="createdAt">Sort by Date Added</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Select
            defaultValue="name"
            onValueChange={(value) => sortTokens(value as "name" | "issuer" | "createdAt")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="issuer">Sort by Issuer</SelectItem>
              <SelectItem value="createdAt">Sort by Date Added</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
        {filteredTokens.length > 0 ? (
          filteredTokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              onRemove={removeToken}
              onEdit={handleEditToken}
            />
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No tokens match your search" : "No tokens added yet"}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsAddingToken(true)}
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first token
              </Button>
            )}
          </div>
        )}
      </div>

      <AddTokenForm />
    </div>
  );
};

export default TokenList;
