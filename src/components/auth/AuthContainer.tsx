
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Shield, Zap } from 'lucide-react';
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
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -20, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 30, 0],
            scale: [1, 1.15, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[80px]"
          animate={{ 
            x: [0, 40, 0], 
            y: [0, -40, 0] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      {/* Scan line effect */}
      <motion.div 
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none"
        animate={{ y: [0, typeof window !== 'undefined' ? window.innerHeight : 1000] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Header for authenticated users */}
      {user && (
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 border-b border-border/30 bg-card/30 backdrop-blur-xl px-4 sm:px-6 py-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/25">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  AdiNox
                </h1>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Enterprise Security</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary/80 border border-border/50 rounded-xl text-sm font-medium transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </motion.button>
          </div>
        </motion.header>
      )}

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center flex-1 p-4 sm:p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* Professional Footer */}
      <footer className="relative z-10 py-5 border-t border-border/20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Zap className="h-3 w-3 text-primary/60" />
            <p className="text-center text-xs text-muted-foreground/80 tracking-wide">
              Proudly Developed by{" "}
              <span className="font-semibold text-primary/90">
                Adil Munawar
              </span>
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default AuthContainer;
