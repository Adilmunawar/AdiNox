
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/5 text-foreground relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Header for authenticated users */}
      {user && (
        <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/25">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  AdiNox
                </h1>
                <p className="text-sm text-muted-foreground">Enterprise Security Portal</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>
      )}

      {/* Main content - flex-1 to push footer down */}
      <main className="relative z-10 flex items-center justify-center flex-1 p-4 sm:p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="relative z-10 py-6 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Proudly Developed by{" "}
            <span className="font-semibold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              Adil Munawar
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthContainer;
