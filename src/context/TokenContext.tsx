import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateTOTP } from "@/utils/tokenUtils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logTokenAccess } from "@/utils/accessLogger";

export type TokenType = {
  id: string;
  user_id?: string; // Added user_id for logging purposes
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
  addToken: (token: Omit<TokenType, "id" | "currentCode" | "createdAt" | "user_id">) => void;
  removeToken: (id: string) => void;
  updateToken: (id: string, token: Partial<TokenType>) => void;
  sortTokens: (sortBy: "name" | "issuer" | "createdAt") => void;
  filterTokens: (searchTerm: string) => TokenType[];
  viewToken: (token: TokenType) => void;
  copyToken: (token: TokenType) => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [sortOption, setSortOption] = useState<"name" | "issuer" | "createdAt">("name");
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // New utility functions for logging token access
  const viewToken = (token: TokenType) => {
    if (!user) return;
    
    // Store the user_id in the token object for logging
    const tokenWithUserId = {
      ...token,
      user_id: user.id
    };
    
    // Log that the token was viewed
    logTokenAccess(tokenWithUserId, 'view');
  };
  
  const copyToken = (token: TokenType) => {
    if (!user) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(token.currentCode);
    
    // Show toast
    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
    });
    
    // Store the user_id in the token object for logging
    const tokenWithUserId = {
      ...token,
      user_id: user.id
    };
    
    // Log that the token was copied
    logTokenAccess(tokenWithUserId, 'copy');
  };

  // Fetch tokens from Supabase when user changes
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

        if (error) {
          throw error;
        }

        // Transform database tokens to TokenType format
        const transformedTokens = data.map((token) => ({
          id: token.id,
          user_id: token.user_id,
          name: token.name,
          issuer: token.issuer,
          secret: token.secret,
          period: token.period,
          digits: token.digits,
          algorithm: token.algorithm,
          currentCode: "------", // Will be generated in the next useEffect
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

  // Add a token to Supabase
  const addToken = async (newToken: Omit<TokenType, "id" | "currentCode" | "createdAt" | "user_id">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add tokens.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clean up the secret (remove spaces and convert to uppercase)
      const cleanSecret = newToken.secret.replace(/\s+/g, '').toUpperCase();

      // Insert the token into Supabase
      const { data, error } = await supabase.from("user_tokens").insert({
        user_id: user.id,
        name: newToken.name,
        issuer: newToken.issuer,
        secret: cleanSecret,
        period: newToken.period,
        digits: newToken.digits,
        algorithm: newToken.algorithm,
      }).select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from insert operation");
      }

      // Generate current code
      const currentCode = await generateTOTP(cleanSecret, {
        period: newToken.period,
        digits: newToken.digits,
        algorithm: newToken.algorithm as "SHA1" | "SHA256" | "SHA512",
      });

      // Add the new token to the local state
      const addedToken: TokenType = {
        id: data[0].id,
        user_id: data[0].user_id,
        name: newToken.name,
        issuer: newToken.issuer,
        secret: cleanSecret,
        period: newToken.period,
        digits: newToken.digits,
        algorithm: newToken.algorithm,
        currentCode,
        createdAt: new Date(data[0].created_at),
      };

      setTokens(prevTokens => [...prevTokens, addedToken]);
      
      toast({
        title: "Token added",
        description: `${newToken.issuer || 'New token'} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding token:", error);
      toast({
        title: "Error adding token",
        description: "There was a problem adding the token. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  // Remove a token from Supabase
  const removeToken = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_tokens")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setTokens(prevTokens => prevTokens.filter(token => token.id !== id));
      
      toast({
        title: "Token removed",
        description: "The token has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing token:", error);
      toast({
        title: "Error removing token",
        description: "There was a problem removing the token. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update a token in Supabase
  const updateToken = async (id: string, updatedFields: Partial<TokenType>) => {
    if (!user) return;
    
    try {
      // Create an object with only the fields that can be updated in the database
      const dbUpdateFields: any = {};
      if (updatedFields.name) dbUpdateFields.name = updatedFields.name;
      if (updatedFields.issuer) dbUpdateFields.issuer = updatedFields.issuer;
      if (updatedFields.secret) dbUpdateFields.secret = updatedFields.secret.replace(/\s+/g, '').toUpperCase();
      if (updatedFields.period) dbUpdateFields.period = updatedFields.period;
      if (updatedFields.digits) dbUpdateFields.digits = updatedFields.digits;
      if (updatedFields.algorithm) dbUpdateFields.algorithm = updatedFields.algorithm;
      
      // Only update if there are fields to update
      if (Object.keys(dbUpdateFields).length > 0) {
        const { error } = await supabase
          .from("user_tokens")
          .update(dbUpdateFields)
          .eq("id", id);
          
        if (error) {
          throw error;
        }
      }
      
      // Update local state
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.id === id ? { ...token, ...updatedFields } : token
        )
      );
      
      toast({
        title: "Token updated",
        description: "The token has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating token:", error);
      toast({
        title: "Error updating token",
        description: "There was a problem updating the token. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sortTokens = (sortBy: "name" | "issuer" | "createdAt") => {
    setSortOption(sortBy);
    // The actual sorting will happen when we fetch from Supabase in the useEffect
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
        viewToken,
        copyToken,
      }}
    >
      {isLoading && user ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
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
