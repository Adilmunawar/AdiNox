
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
      
      {/* Minimal geometric background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-slate-800/20 to-slate-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-slate-800/20 to-slate-700/20 rounded-full blur-3xl" />
      </div>

      {/* Header for authenticated users */}
      {user && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-50 border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50 px-6 py-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/Adil-Munawar-Uploads/1e18899e-2160-4944-9175-794607679d04.png" 
                alt="AdiNox Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-semibold text-white">AdiNox</span>
            </div>
            
            <motion.button
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </motion.button>
          </div>
        </motion.header>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthContainer;
