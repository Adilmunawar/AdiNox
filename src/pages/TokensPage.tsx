import React from "react";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { motion } from "framer-motion";

const TokensPage = React.memo(() => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Authentication Tokens</h1>
        <p className="text-sm text-muted-foreground/60 mt-1">Manage your two-factor authentication tokens securely.</p>
      </motion.div>

      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <TokenProvider>
          <TokenList />
        </TokenProvider>
      </motion.div>
    </div>
  );
});

TokensPage.displayName = "TokensPage";
export default TokensPage;
