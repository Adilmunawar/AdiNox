
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
    <div className="min-h-screen bg-slate-50 text-slate-900 relative">
      {/* Simple header for authenticated users */}
      {user && (
        <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">AdiNox</h1>
                <p className="text-xs text-slate-600">Authentication Portal</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthContainer;
