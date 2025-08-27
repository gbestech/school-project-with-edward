import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useAuthLost = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthLost, setIsAuthLost] = useState(false);
  const [authLostMessage, setAuthLostMessage] = useState('');

  // Function to show auth lost modal
  const showAuthLost = useCallback((message?: string) => {
    setAuthLostMessage(message || 'Your session has expired. Please log in again to continue.');
    setIsAuthLost(true);
  }, []);

  // Function to hide auth lost modal
  const hideAuthLost = useCallback(() => {
    setIsAuthLost(false);
    setAuthLostMessage('');
  }, []);

  // Function to handle auth lost and redirect to login
  const handleAuthLost = useCallback((message?: string) => {
    showAuthLost(message);
    // Automatically logout after showing the modal
    logout();
  }, [showAuthLost, logout]);

  // Check for token expiration on mount and periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('authToken');
      if (token && isAuthenticated) {
        try {
          // Decode JWT token to check expiration
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = payload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          
          // If token expires in less than 5 minutes, show warning
          if (expirationTime - currentTime < 5 * 60 * 1000) {
            showAuthLost('Your session will expire soon. Please log in again to continue.');
          }
        } catch (error) {
          // If token is malformed, treat as expired
          handleAuthLost('Invalid session. Please log in again.');
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, showAuthLost, handleAuthLost]);

  return {
    isAuthLost,
    authLostMessage,
    showAuthLost,
    hideAuthLost,
    handleAuthLost,
  };
};
