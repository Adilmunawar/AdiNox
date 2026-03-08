import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateTOTP } from "@/utils/tokenUtils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TokenCardSkeleton from "@/components/tokens/TokenCardSkeleton";

export type TokenType = {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  period: number;
  digits: number;
  algorithm: string;
  currentCode: string;
  createdAt: Date;
};

type TokenContextType = {
  tokens: TokenType[];
  addToken: (token: Omit<TokenType, "id" | "currentCode" | "createdAt">) => void;
  removeToken: (id: string) => void;
  updateToken: (id: string, token: Partial<TokenType>) => void;
  sortTokens: (sortBy: "name" | "issuer" | "createdAt") => void;
  filterTokens: (searchTerm: string) => TokenType[];
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [sortOption, setSortOption] = useState<"name" | "issuer" | "createdAt">("name");
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!user) {
        setTokens([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("user_tokens")
          .select("*")
          .order(sortOption, { ascending: sortOption !== "createdAt" });

        if (error) throw error;

        const transformedTokens = data.map((token) => ({
          id: token.id,
          name: token.name,
          issuer: token.issuer,
          secret: token.secret,
          period: token.period,
          digits: token.digits,
          algorithm: token.algorithm,
          currentCode: "------",
          createdAt: new Date(token.created_at),
        }));

        setTokens(transformedTokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        toast({
          title: "Failed to load tokens",
          description: "There was an error loading your tokens. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [user, sortOption, toast]);

  useEffect(() => {
    const updateCodes = async () => {
      if (tokens.length === 0) return;
      
      const updatedTokens = await Promise.all(
        tokens.map(async (token) => {
          try {
            const currentCode = await generateTOTP(token.secret, {
              period: token.period,
              digits: token.digits,
              algorithm: token.algorithm as "SHA1" | "SHA256" | "SHA512",
            });
            return { ...token, currentCode };
          } catch (error) {
            console.error(`Error generating code for token ${token.id}:`, error);
            return token;
          }
        })
      );

      setTokens(updatedTokens);
    };

    if (tokens.length > 0) updateCodes();

    const intervalId = setInterval(updateCodes, 1000);
    return () => clearInterval(intervalId);
  }, [tokens.length]);

  const addToken = async (newToken: Omit<TokenType, "id" | "currentCode" | "createdAt">) => {
    if (!user) {
      toast({ title: "Authentication required", description: "You must be logged in to add tokens.", variant: "destructive" });
      return;
    }

    try {
      const cleanSecret = newToken.secret.replace(/\s+/g, '').toUpperCase();
      const { data, error } = await supabase.from("user_tokens").insert({
        user_id: user.id, name: newToken.name, issuer: newToken.issuer,
        secret: cleanSecret, period: newToken.period, digits: newToken.digits, algorithm: newToken.algorithm,
      }).select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No data returned from insert operation");

      const currentCode = await generateTOTP(cleanSecret, {
        period: newToken.period, digits: newToken.digits,
        algorithm: newToken.algorithm as "SHA1" | "SHA256" | "SHA512",
      });

      const addedToken: TokenType = {
        id: data[0].id, name: newToken.name, issuer: newToken.issuer,
        secret: cleanSecret, period: newToken.period, digits: newToken.digits,
        algorithm: newToken.algorithm, currentCode, createdAt: new Date(data[0].created_at),
      };

      setTokens(prevTokens => [...prevTokens, addedToken]);
      toast({ title: "Token added", description: `${newToken.issuer || 'New token'} has been added successfully.` });
    } catch (error) {
      console.error("Error adding token:", error);
      toast({ title: "Error adding token", description: "There was a problem adding the token.", variant: "destructive" });
    }
  };

  const removeToken = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("user_tokens").delete().eq("id", id);
      if (error) throw error;
      setTokens(prevTokens => prevTokens.filter(token => token.id !== id));
      toast({ title: "Token removed", description: "The token has been removed successfully." });
    } catch (error) {
      console.error("Error removing token:", error);
      toast({ title: "Error removing token", description: "There was a problem removing the token.", variant: "destructive" });
    }
  };

  const updateToken = async (id: string, updatedFields: Partial<TokenType>) => {
    if (!user) return;
    try {
      const dbUpdateFields: any = {};
      if (updatedFields.name) dbUpdateFields.name = updatedFields.name;
      if (updatedFields.issuer) dbUpdateFields.issuer = updatedFields.issuer;
      if (updatedFields.secret) dbUpdateFields.secret = updatedFields.secret.replace(/\s+/g, '').toUpperCase();
      if (updatedFields.period) dbUpdateFields.period = updatedFields.period;
      if (updatedFields.digits) dbUpdateFields.digits = updatedFields.digits;
      if (updatedFields.algorithm) dbUpdateFields.algorithm = updatedFields.algorithm;
      
      if (Object.keys(dbUpdateFields).length > 0) {
        const { error } = await supabase.from("user_tokens").update(dbUpdateFields).eq("id", id);
        if (error) throw error;
      }
      
      setTokens(prevTokens => prevTokens.map(token => token.id === id ? { ...token, ...updatedFields } : token));
      toast({ title: "Token updated", description: "The token has been updated successfully." });
    } catch (error) {
      console.error("Error updating token:", error);
      toast({ title: "Error updating token", description: "There was a problem updating the token.", variant: "destructive" });
    }
  };

  const sortTokens = (sortBy: "name" | "issuer" | "createdAt") => {
    setSortOption(sortBy);
  };

  const filterTokens = (searchTerm: string) => {
    if (!searchTerm.trim()) return tokens;
    const term = searchTerm.toLowerCase();
    return tokens.filter(token => token.name.toLowerCase().includes(term) || token.issuer.toLowerCase().includes(term));
  };

  return (
    <TokenContext.Provider value={{ tokens, addToken, removeToken, updateToken, sortTokens, filterTokens }}>
      {isLoading && user ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
          {[1, 2, 3].map(i => <TokenCardSkeleton key={i} />)}
        </div>
      ) : (
        children
      )}
    </TokenContext.Provider>
  );
};

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (context === undefined) throw new Error("useTokens must be used within a TokenProvider");
  return context;
};
