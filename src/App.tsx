import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AnimatedBackground from "@/components/ui/animated-background";
import PageTransition from "@/components/ui/page-transition";
import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TokensPage = lazy(() => import("@/pages/TokensPage"));
const CardsPage = lazy(() => import("@/pages/CardsPage"));
const PasswordsPage = lazy(() => import("@/pages/PasswordsPage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

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

const AuthRoute = React.memo(() => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <PageTransition><AuthPage /></PageTransition>;
});
AuthRoute.displayName = "AuthRoute";

const App = () => (
  <Router>
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background gpu-accelerated">
          <AnimatedBackground />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/tokens" element={<TokensPage />} />
                <Route path="/cards" element={<CardsPage />} />
                <Route path="/passwords" element={<PasswordsPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </Suspense>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);

export default App;
