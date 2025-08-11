import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, LogIn } from 'lucide-react';

interface AuthCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this page. Please log in to continue.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            <LogIn size={20} />
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthCheck; 