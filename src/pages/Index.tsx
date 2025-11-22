
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-float" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 relative z-10">
        <PerformantFadeIn delay={0.1}>
          <PageHeader 
            title="Authentication Tokens" 
            description="Manage your two-factor authentication tokens securely"
          />
        </PerformantFadeIn>
        
        <PerformantStagger delayChildren={0.3} staggerChildren={0.1}>
          <div className="mb-8">
            <motion.div 
              className="h-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full shadow-glow"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
            />
          </div>
          
          <TokenProvider>
            <TokenList />
          </TokenProvider>
        </PerformantStagger>
        
        <PerformantFadeIn delay={0.8}>
          <div className="mt-16 mb-8 text-center">
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-3 glass-morphism rounded-full"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(155, 135, 245, 0.3)",
                transition: { type: "spring", stiffness: 400, damping: 20 }
              }}
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Secured with AdiNox Enterprise Technology
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
