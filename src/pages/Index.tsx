
import { PageHeader } from "@/components/ui/page-header";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, ScaleIn, RevealOnScroll, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { motion } from "framer-motion";
import { ThreeDToken } from "@/components/ui/three-d-token";
import { AmbientAssistant } from "@/components/ui/ambient-assistant";
import { Key } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 overflow-x-hidden">
      <PageHeader 
        title="Authentication Tokens" 
        description="Manage your two-factor authentication tokens securely"
        icon={<Key className="h-5 w-5 text-primary" />}
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
        
        <StaggerItem>
          <RevealOnScroll>
            <div className="mt-12 mb-16 flex flex-col items-center">
              <p className="text-center text-sm text-muted-foreground mb-6">
                Your tokens are protected with advanced encryption
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <ThreeDToken 
                  token="SecureToken" 
                  size="md"
                  className="mx-auto"
                />
                
                <div className="max-w-xs text-center md:text-left">
                  <h3 className="text-lg font-medium mb-2 bg-clip-text text-transparent bg-gradient-to-r from-adinox-purple to-adinox-red">
                    Interactive Token Visualization
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Hover and interact with this 3D visualization of your security token.
                    Each token in AdiNox is protected with multiple layers of encryption.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
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
      
      {/* Ambient AI Assistant */}
      <AmbientAssistant />
    </div>
  );
};

export default Index;
