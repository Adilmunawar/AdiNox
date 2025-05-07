
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import TokenCard from "./TokenCard";
import AddTokenForm from "./AddTokenForm";
import { useTokens } from "@/context/TokenContext";

const TokenList = () => {
  const { tokens, removeToken, sortTokens } = useTokens();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTokens = tokens.filter(token => {
    const term = searchTerm.toLowerCase();
    return token.name.toLowerCase().includes(term) || 
           token.issuer.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              onRemove={removeToken}
            />
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No tokens match your search" : "No tokens added yet"}
            </p>
          </div>
        )}
      </div>

      <AddTokenForm />
    </div>
  );
};

export default TokenList;
