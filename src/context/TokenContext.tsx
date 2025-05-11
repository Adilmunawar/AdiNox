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
      try {
        const parsedTokens = JSON.parse(storedTokens);
        // Convert date strings back to Date objects
        const tokensWithDates = parsedTokens.map((token: any) => ({
          ...token,
          createdAt: new Date(token.createdAt),
          // Regenerate code on load to ensure it's current
          currentCode: generateTOTP(token.secret, {
            period: token.period,
            digits: token.digits,
            algorithm: token.algorithm as "SHA1" | "SHA256" | "SHA512",
          })
        }));
        setTokens(tokensWithDates);
      } catch (error) {
        console.error("Error parsing stored tokens:", error);
        // If there's an error parsing, start with empty tokens
        setTokens([]);
      }
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
          try {
            const currentCode = generateTOTP(token.secret, {
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
        });
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const addToken = (newToken: Omit<TokenType, "id" | "currentCode" | "createdAt">) => {
    try {
      // Clean up the secret (remove spaces and convert to uppercase)
      const cleanSecret = newToken.secret.replace(/\s+/g, '').toUpperCase();
      
      const currentCode = generateTOTP(cleanSecret, {
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
