
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import { AuthProvider } from "@/context/AuthContext";
import AnimatedBackground from "@/components/ui/animated-background";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AnimatedBackground />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
