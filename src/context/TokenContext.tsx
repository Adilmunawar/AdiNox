
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateTOTP } from "@/utils/tokenUtils";
import { useAuth } from "@/context/AuthContext";

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

  // Generate a storage key that's unique per user
  const getStorageKey = () => {
    if (user) {
      return `adinox_tokens_${user.id}`;
    }
    return "adinox_tokens";
  };

  // Initialize tokens from localStorage using the user-specific key
  useEffect(() => {
    const storedTokens = localStorage.getItem(getStorageKey());
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        // Convert date strings back to Date objects
        const tokensWithDates = parsedTokens.map((token: any) => ({
          ...token,
          createdAt: new Date(token.createdAt),
          // Default code will be updated in the next effect
          currentCode: "------"
        }));
        setTokens(tokensWithDates);
      } catch (error) {
        console.error("Error parsing stored tokens:", error);
        // If there's an error parsing, start with empty tokens
        setTokens([]);
      }
    } else {
      setTokens([]); // Reset tokens when user changes or logs out
    }
  }, [user?.id]); // Update tokens when user changes

  // Save tokens to localStorage whenever they change, using user-specific key
  useEffect(() => {
    if (tokens.length > 0 && user) {
      localStorage.setItem(getStorageKey(), JSON.stringify(tokens));
    }
  }, [tokens, user?.id]);

  // Update token codes every second
  useEffect(() => {
    const updateCodes = async () => {
      if (tokens.length === 0) return; // Skip if no tokens
      
      const updatedTokens = await Promise.all(
        tokens.map(async (token) => {
          try {
            const currentCode = await generateTOTP(token.secret, {
              period: token.period,
              digits: token.digits,
              algorithm: token.algorithm as "SHA1" | "SHA256" | "SHA512",
            });
            
            return {
              ...token,
              currentCode
            };
          } catch (error) {
            console.error(`Error generating code for token ${token.id}:`, error);
            // Keep the previous code if there's an error
            return token;
          }
        })
      );

      setTokens(updatedTokens);
    };

    // Update codes immediately on mount and when tokens change
    if (tokens.length > 0) {
      updateCodes();
    }

    const intervalId = setInterval(updateCodes, 1000);
    return () => clearInterval(intervalId);
  }, [tokens.length]);

  const addToken = async (newToken: Omit<TokenType, "id" | "currentCode" | "createdAt">) => {
    try {
      // Clean up the secret (remove spaces and convert to uppercase)
      const cleanSecret = newToken.secret.replace(/\s+/g, '').toUpperCase();
      
      const currentCode = await generateTOTP(cleanSecret, {
        period: newToken.period,
        digits: newToken.digits,
        algorithm: newToken.algorithm as "SHA1" | "SHA256" | "SHA512",
      });

      const token: TokenType = {
        ...newToken,
        secret: cleanSecret, // Store the cleaned secret
        id: crypto.randomUUID(),
        currentCode,
        createdAt: new Date(),
      };

      setTokens(prevTokens => [...prevTokens, token]);
      
      // Save to localStorage immediately after adding a token
      if (user) {
        const updatedTokens = [...tokens, token];
        localStorage.setItem(getStorageKey(), JSON.stringify(updatedTokens));
      }
      
      toast({
        title: "Token added",
        description: `${newToken.issuer || 'New token'} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding token:", error);
      toast({
        title: "Error adding token",
        description: "There was a problem adding the token. Please check the secret key.",
        variant: "destructive",
      });
    }
  };

  const removeToken = (id: string) => {
    const updatedTokens = tokens.filter(token => token.id !== id);
    setTokens(updatedTokens);
    
    // Save to localStorage immediately after removing a token
    if (user) {
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedTokens));
    }
    
    toast({
      title: "Token removed",
      description: "The token has been removed successfully.",
    });
  };

  const updateToken = (id: string, updatedFields: Partial<TokenType>) => {
    const updatedTokens = tokens.map(token => 
      token.id === id ? { ...token, ...updatedFields } : token
    );
    
    setTokens(updatedTokens);
    
    // Save to localStorage immediately after updating a token
    if (user) {
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedTokens));
    }
    
    toast({
      title: "Token updated",
      description: "The token has been updated successfully.",
    });
  };

  const sortTokens = (sortBy: "name" | "issuer" | "createdAt") => {
    setSortOption(sortBy);
    
    const sortedTokens = [...tokens].sort((a, b) => {
      if (sortBy === "createdAt") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return a[sortBy].localeCompare(b[sortBy]);
      }
    });
    
    setTokens(sortedTokens);
    
    // Save sorted order to localStorage
    if (user) {
      localStorage.setItem(getStorageKey(), JSON.stringify(sortedTokens));
    }
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
