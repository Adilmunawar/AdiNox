
import { PageHeader } from "@/components/ui/page-header";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { useAuth } from "@/context/AuthContext";
import { PerformantFadeIn } from "@/components/ui/performance-animations";
import { motion } from "framer-motion";
import React from "react";
import { Zap } from "lucide-react";

const Index = React.memo(() => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container max-w-5xl mx-auto px-4 py-8 relative z-10">
        <PerformantFadeIn delay={0.1}>
          <PageHeader 
            title="Authentication Tokens" 
            description="Manage your two-factor authentication tokens securely"
          />
        </PerformantFadeIn>
        
        <PerformantFadeIn delay={0.3}>
          <div className="mb-8">
            <motion.div 
              className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
            />
          </div>
        </PerformantFadeIn>
        
        <PerformantFadeIn delay={0.5}>
          <TokenProvider>
            <TokenList />
          </TokenProvider>
        </PerformantFadeIn>
        
        <PerformantFadeIn delay={0.8}>
          <div className="mt-16 mb-8 text-center">
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-card/50 backdrop-blur-sm border border-border/30 rounded-full"
              whileHover={{ 
                scale: 1.03,
                borderColor: 'hsl(var(--primary) / 0.3)',
                transition: { type: "spring", stiffness: 400, damping: 20 }
              }}
            >
              <Zap className="w-3 h-3 text-primary/70" />
              <p className="text-xs font-medium text-muted-foreground">
                Secured with <span className="text-primary/90 font-semibold">AdiNox</span> Enterprise Technology
              </p>
            </motion.div>
          </div>
        </PerformantFadeIn>
      </div>
    </div>
  );
});

Index.displayName = "Index";

export default Index;
