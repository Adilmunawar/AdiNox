
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Ambient light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)' }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.05), transparent 70%)' }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Header for authenticated users */}
      {user && (
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 border-b border-border/40 bg-card/40 backdrop-blur-xl px-4 sm:px-6 py-3.5"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/15 rounded-xl border border-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">
                  Adi<span className="text-primary">Nox</span>
                </h1>
                <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Security Portal</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3.5 py-2 bg-secondary/60 hover:bg-secondary border border-border/40 hover:border-border/60 rounded-lg text-xs font-medium transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </motion.button>
          </div>
        </motion.header>
      )}

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center flex-1 p-4 sm:p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 border-t border-border/20">
        <motion.p 
          className="text-center text-[11px] text-muted-foreground/50 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Proudly Developed by{" "}
          <span className="font-medium text-primary/70">Adil Munawar</span>
        </motion.p>
      </footer>
    </div>
  );
};

export default AuthContainer;
