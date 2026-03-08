import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AnimatedBackground from "@/components/ui/animated-background";
import PageTransition from "@/components/ui/page-transition";
import { AnimatePresence } from "framer-motion";
import React, { Suspense } from "react";
import { motion } from "framer-motion";

const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center h-screen bg-background">
    <motion.div
      className="h-10 w-10 rounded-full border-2 border-border border-t-primary"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

const ProtectedRoute = React.memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
});
ProtectedRoute.displayName = "ProtectedRoute";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<ProtectedRoute><PageTransition><Index /></PageTransition></ProtectedRoute>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <Router>
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background gpu-accelerated overflow-hidden">
          <AnimatedBackground />
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatedRoutes />
          </Suspense>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);

export default App;
