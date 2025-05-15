
import { PageHeader } from "@/components/ui/page-header";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, ScaleIn, RevealOnScroll, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { motion } from "framer-motion";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 overflow-x-hidden">
      <PageHeader 
        title="Authentication Tokens" 
        description="Manage your two-factor authentication tokens securely"
      />
      
      <StaggerContainer delayChildren={0.3} staggerChildren={0.1}>
        <StaggerItem>
          <div className="mb-6">
            <motion.div 
              className="h-1 bg-gradient-to-r from-adinox-purple via-adinox-light-purple to-adinox-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            />
          </div>
        </StaggerItem>
        
        <StaggerItem>
          <TokenProvider>
            <TokenList />
          </TokenProvider>
        </StaggerItem>
      </StaggerContainer>
      
      <RevealOnScroll>
        <div className="mt-12 text-center text-sm text-muted-foreground opacity-70">
          <motion.p 
            className="inline-block"
            whileHover={{ scale: 1.05, color: "var(--primary)" }}
          >
            Secured with AdiNox authentication technology
          </motion.p>
        </div>
      </RevealOnScroll>
    </div>
  );
};

export default Index;
