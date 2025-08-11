// Example usage in your JSX component
import React, { useState, useEffect } from 'react';
import { GoogleAuthButton } from "./../home/GoogleAuthButton";
// import { GoogleAuthService, GoogleAuthResponse } from './../../services/GoogleAuthService';
// import { AuthService } from './../../services/AuthService2';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export const AuthPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const googleAuthService = GoogleAuthService.getInstance();
  const authService = new AuthService();

  useEffect(() => {
    // Initialize Google Auth on component mount
    const initializeAuth = async () => {
      try {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
          throw new Error('Google Client ID not configured');
        }
        await googleAuthService.initialize(clientId);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        setError('Failed to initialize authentication');
      }
    };

    initializeAuth();
  }, []);

  const handleGoogleSuccess = async (response: GoogleAuthResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send Google access token to your backend for sign-in
      const result = await authService.googleSignIn(response.access_token);
      
      if (result.success && result.data) {
        setUser(result.data.user);
        setSuccess('Successfully signed in with Google!');
      } else {
        setError(result.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      setError('An error occurred during Google authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (response: GoogleAuthResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send Google access token to your backend for sign-up
      const result = await authService.googleSignUp(response.access_token, {
        role: 'user' // Optional additional data
      });
      
      if (result.success && result.data) {
        setUser(result.data.user);
        setSuccess('Successfully signed up with Google!');
      } else {
        setError(result.message || 'Google sign-up failed');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setError('An error occurred during Google sign-up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // Sign out from Google
      await googleAuthService.signOut();
      
      // Sign out from your backend
      await authService.signOut();
      
      setUser(null);
      setSuccess('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome
          </h2>
          
          {/* Display success message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          
          {/* Display error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Show user info if signed in */}
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900">
                  Welcome, {user.name}!
                </h3>
                <p className="text-gray-600">{user.email}</p>
                {user.role && (
                  <p className="text-sm text-gray-500">Role: {user.role}</p>
                )}
              </div>
              
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          ) : (
            /* Show auth buttons if not signed in */
            <div className="space-y-4">
              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                mode="signin"
                disabled={loading}
                googleAuthService={googleAuthService}
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
              
              <GoogleAuthButton
                onSuccess={handleGoogleSignUp}
                onError={handleGoogleError}
                mode="signup"
                disabled={loading}
                googleAuthService={googleAuthService}
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Alternative usage with custom button
export const CustomGoogleAuthExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const googleAuthService = GoogleAuthService.getInstance();
  const authService = new AuthService();

  const handleCustomGoogleAuth = async () => {
    setLoading(true);
    try {
      // Initialize if not already done
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID!;
      await googleAuthService.initialize(clientId);
      
      // Sign in with Google
      const googleResponse = await googleAuthService.signIn();
      
      // Send to your backend
      const result = await authService.googleSignIn(googleResponse.access_token);
      
      if (result.success) {
        console.log('User signed in:', result.data?.user);
      } else {
        console.error('Sign-in failed:', result.message);
      }
    } catch (error) {
      console.error('Custom Google auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCustomGoogleAuth}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Authenticating...' : 'Custom Google Sign In'}
    </button>
  );
};