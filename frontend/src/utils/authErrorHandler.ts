import { useAuthLostContext } from '@/components/common/AuthLostProvider';

// Function to handle API errors and show auth lost modal if needed
export const handleApiError = (error: any, showAuthLost?: (message?: string) => void) => {
  console.error('API Error:', error);
  
  // Check if it's an authentication error
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    const message = error?.response?.data?.detail || 
                   error?.response?.data?.message || 
                   'Your session has expired. Please log in again to continue.';
    
    if (showAuthLost) {
      showAuthLost(message);
    }
    return true; // Indicates auth error was handled
  }
  
  return false; // No auth error
};

// Hook to get auth error handler with context
export const useAuthErrorHandler = () => {
  const { showAuthLost } = useAuthLostContext();
  
  return {
    handleAuthError: (error: any) => handleApiError(error, showAuthLost),
  };
};













