import { PageHeader } from "@/components/ui/page-header";
import { TokenProvider } from "@/context/TokenContext";
import TokenList from "@/components/tokens/TokenList";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FadeIn } from "@/components/ui/animations";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <PageHeader 
        title="Authentication Tokens" 
        description="Manage your two-factor authentication tokens securely"
      />
      
      <FadeIn delay={0.3}>
        <TokenProvider>
          <TokenList />
        </TokenProvider>
      </FadeIn>
    </div>
  );
};

export default Index;
