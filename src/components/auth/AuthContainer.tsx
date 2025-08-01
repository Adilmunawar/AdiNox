import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

const AuthContainer: React.FC = ({ children }) => {
  const navigate = useNavigate();
  const { route, signOut } = useAuthenticator((context) => [
    context.route,
    context.signOut,
  ]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const authUser = await Auth.currentAuthenticatedUser();
        setUser(authUser);
      } catch (error) {
        setUser(null);
      }
    };

    checkUser();
  }, [route]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login');
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
                Lovable
              </a>
              {user && (
                <div>
                  <span className="text-gray-700 dark:text-gray-300 mr-4">
                    Welcome, {user.username}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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

          {/* Footer */}
          <footer className="bg-gray-100 dark:bg-gray-900 py-4 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Lovable. All rights reserved.</p>
          </footer>
        </div>
      </div>
    
  );
};

export default AuthContainer;
