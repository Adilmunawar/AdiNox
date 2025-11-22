
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FadeIn, ScaleIn } from "@/components/ui/animations";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/AuthContext";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 relative z-10">
        <PageHeader showAuth={isAuthenticated} />
        
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <ScaleIn delay={0.2}>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative glass-morphism rounded-3xl p-12">
                <div className="text-8xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-shimmer">
                  404
                </div>
              </div>
            </div>
          </ScaleIn>
          
          <FadeIn delay={0.4}>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Page Not Found
            </h1>
            <p className="text-muted-foreground mb-8 text-lg max-w-md">
              The page you are looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex gap-4 flex-wrap justify-center">
              <Button asChild size="lg" className="btn-premium shadow-glow-md hover:shadow-glow-lg transition-all duration-300">
                <Link to={isAuthenticated ? "/" : "/auth"}>
                  <Home className="mr-2 h-5 w-5" />
                  {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
