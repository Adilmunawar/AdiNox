
import { PageHeader } from "@/components/ui/page-header";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import React from "react";
import { Shield } from "lucide-react";

const Index = React.memo(() => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PageHeader 
            title="Authentication Tokens" 
            description="Manage your two-factor authentication tokens securely"
          />
        </motion.div>
        
        <motion.div 
          className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mb-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <TokenProvider>
            <TokenList />
          </TokenProvider>
        </motion.div>
        
        <motion.div 
          className="mt-12 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/40 border border-border/20 rounded-full">
            <Shield className="w-3 h-3 text-primary/50" />
            <p className="text-[11px] text-muted-foreground/50 font-medium">
              Secured with <span className="text-primary/70">AdiNox</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

Index.displayName = "Index";
export default Index;
