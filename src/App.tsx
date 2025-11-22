import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AnimatedBackground from "@/components/ui/animated-background";
import { motion } from "framer-motion";
import React, { Suspense } from "react";
// High-performance loading component with enhanced visuals
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-primary/5">
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
      
      {/* Spinner */}
      <motion.div
        className="relative h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary shadow-glow-lg"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner pulse */}
      <motion.div
        className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-primary/10"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";
// Optimized protected route component
const ProtectedRoute = React.memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
});

ProtectedRoute.displayName = "ProtectedRoute";

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background gpu-accelerated">
            <AnimatedBackground />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
