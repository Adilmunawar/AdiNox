import React from "react";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const TokensPage = React.memo(() => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/12 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Authentication Tokens</h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">Manage your two-factor authentication tokens securely.</p>
        </div>
      </motion.div>

      <motion.div
        className="h-px bg-gradient-to-r from-primary/20 via-border/40 to-transparent"
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
