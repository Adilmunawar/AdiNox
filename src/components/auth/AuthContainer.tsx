
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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-5"
        style={{
          backgroundImage: `url('/Adil-Munawar-Uploads/diagram (2).png')`
        }}
      />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 py-4 shadow-md">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold text-gray-800 dark:text-white">
              AdiNox
            </a>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 dark:text-gray-300">
                  Welcome, {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>

        {/* Footer with the requested quote */}
        <footer className="bg-gray-100 dark:bg-gray-900 py-6 text-center text-gray-600 dark:text-gray-400">
          <div className="space-y-2">
            <p>&copy; {new Date().getFullYear()} AdiNox. All rights reserved.</p>
            <p className="text-sm font-medium text-primary">
              Proudly Developed by Adil Munawar
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthContainer;
