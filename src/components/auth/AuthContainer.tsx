
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/logo';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/Adil-Munawar-Uploads/diagram (2).png')`
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" showText={true} />
          
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
      <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/30 py-4 text-center text-muted-foreground">
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
