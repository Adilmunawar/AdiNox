
import { PageHeader } from "@/components/ui/page-header";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { useAuth } from "@/context/AuthContext";
import { PerformantFadeIn, PerformantStagger } from "@/components/ui/performance-animations";
import { motion } from "framer-motion";
import React from "react";

const Index = React.memo(() => {
  const { user } = useAuth();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 overflow-x-hidden">
      <PageHeader 
        title="Authentication Tokens" 
        description="Manage your two-factor authentication tokens securely"
      />
      
      <PerformantStagger delayChildren={0.3} staggerChildren={0.1}>
        <div className="mb-6">
          <motion.div 
            className="h-1 bg-gradient-to-r from-adinox-purple via-adinox-light-purple to-adinox-red rounded-full gpu-accelerated"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
          />
        </div>
        
        <TokenProvider>
          <TokenList />
        </TokenProvider>
      </PerformantStagger>
      
      <PerformantFadeIn delay={0.8}>
        <div className="mt-12 text-center text-sm text-muted-foreground opacity-70">
          <motion.p 
            className="inline-block"
            whileHover={{ 
              scale: 1.05, 
              color: "var(--primary)",
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
          >
            Secured with AdiNox authentication technology
          </motion.p>
        </div>
      </PerformantFadeIn>
    </div>
  );
});

Index.displayName = "Index";

export default Index;
