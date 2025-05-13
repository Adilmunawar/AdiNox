
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
    <div className="container max-w-md mx-auto px-4 py-6">
      <PageHeader showAuth={isAuthenticated} />
      
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <ScaleIn delay={0.2}>
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <div className="text-6xl font-bold text-primary">404</div>
          </div>
        </ScaleIn>
        
        <FadeIn delay={0.4}>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <Button asChild size="lg" className="mr-4">
            <Link to={isAuthenticated ? "/" : "/auth"}>
              <Home className="mr-2 h-4 w-4" />
              {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
            </Link>
          </Button>
        </FadeIn>
      </div>
    </div>
  );
};

export default NotFound;
