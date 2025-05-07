
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateTOTP } from "@/utils/tokenUtils";

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

  // Initialize tokens from localStorage
  useEffect(() => {
    const storedTokens = localStorage.getItem("adinox_tokens");
    if (storedTokens) {
      const parsedTokens = JSON.parse(storedTokens);
      // Convert date strings back to Date objects
      const tokensWithDates = parsedTokens.map((token: any) => ({
        ...token,
        createdAt: new Date(token.createdAt),
      }));
      setTokens(tokensWithDates);
    }
  }, []);

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    if (tokens.length > 0) {
      localStorage.setItem("adinox_tokens", JSON.stringify(tokens));
    }
  }, [tokens]);

  // Update token codes every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTokens((currentTokens) => {
        return currentTokens.map(token => {
          return {
            ...token,
            currentCode: generateTOTP(token.secret, {
              period: token.period,
              digits: token.digits,
              algorithm: token.algorithm as "SHA1" | "SHA256" | "SHA512",
            })
          };
        });
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const addToken = (newToken: Omit<TokenType, "id" | "currentCode" | "createdAt">) => {
    const token: TokenType = {
      ...newToken,
      id: crypto.randomUUID(),
      currentCode: generateTOTP(newToken.secret, {
        period: newToken.period,
        digits: newToken.digits,
        algorithm: newToken.algorithm as "SHA1" | "SHA256" | "SHA512",
      }),
      createdAt: new Date(),
    };

    setTokens(prevTokens => [...prevTokens, token]);
    
    toast({
      title: "Token added",
      description: `${newToken.issuer || 'New token'} has been added successfully.`,
    });
  };

  const removeToken = (id: string) => {
    setTokens(prevTokens => prevTokens.filter(token => token.id !== id));
    
    toast({
      title: "Token removed",
      description: "The token has been removed successfully.",
    });
  };

  const updateToken = (id: string, updatedFields: Partial<TokenType>) => {
    setTokens(prevTokens => prevTokens.map(token => 
      token.id === id ? { ...token, ...updatedFields } : token
    ));
    
    toast({
      title: "Token updated",
      description: "The token has been updated successfully.",
    });
  };

  const sortTokens = (sortBy: "name" | "issuer" | "createdAt") => {
    setSortOption(sortBy);
    
    setTokens(prevTokens => [...prevTokens].sort((a, b) => {
      if (sortBy === "createdAt") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return a[sortBy].localeCompare(b[sortBy]);
      }
    }));
  };

  const filterTokens = (searchTerm: string) => {
    if (!searchTerm.trim()) return tokens;
    
    const term = searchTerm.toLowerCase();
    return tokens.filter(token => 
      token.name.toLowerCase().includes(term) || 
      token.issuer.toLowerCase().includes(term)
    );
  };

  return (
    <TokenContext.Provider
      value={{
        tokens,
        addToken,
        removeToken,
        updateToken,
        sortTokens,
        filterTokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return context;
};
