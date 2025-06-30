// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { CustomUser, LoginCredentials } from '@/types/types';

interface AuthContextType {
  user: CustomUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: CustomUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<CustomUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData: CustomUser) => {
    try {
      setIsLoading(true);
      
      // Here you would typically make an API call to authenticate
      // For now, we'll simulate it
      const mockToken = `mock_token_${Date.now()}`;
      
      // Store auth data
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Here you would typically make an API call to logout
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<CustomUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};