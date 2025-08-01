
import React from 'react';
import { useAuth } from '@/context/AuthContext';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10 relative">
      {/* Header */}
      <header className="relative z-10 bg-background/90 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/Adil-Munawar-Uploads/1e18899e-2160-4944-9175-794607679d04.png" 
              alt="AdiNox Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-semibold text-foreground">AdiNox</span>
          </div>
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-3 rounded-lg text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-background/60 backdrop-blur-sm border-t border-border/30 py-4 text-center text-muted-foreground">
        <div className="space-y-1">
          <p className="text-xs">&copy; {new Date().getFullYear()} AdiNox. All rights reserved.</p>
          <p className="text-xs font-medium text-primary">
            Proudly Developed by Adil Munawar
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthContainer;
