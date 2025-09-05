import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthLost } from '@/hooks/useAuthLost';
import AuthLostModal from './AuthLostModal';

interface AuthLostContextType {
  showAuthLost: (message?: string) => void;
  hideAuthLost: () => void;
  handleAuthLost: (message?: string) => void;
}

const AuthLostContext = createContext<AuthLostContextType | undefined>(undefined);

export const useAuthLostContext = () => {
  const context = useContext(AuthLostContext);
  if (!context) {
    throw new Error('useAuthLostContext must be used within an AuthLostProvider');
  }
  return context;
};

interface AuthLostProviderProps {
  children: ReactNode;
}

export const AuthLostProvider: React.FC<AuthLostProviderProps> = ({ children }) => {
  const { isAuthLost, authLostMessage, showAuthLost, hideAuthLost, handleAuthLost } = useAuthLost();

  const contextValue: AuthLostContextType = {
    showAuthLost,
    hideAuthLost,
    handleAuthLost,
  };

  return (
    <AuthLostContext.Provider value={contextValue}>
      {children}
      <AuthLostModal 
        isOpen={isAuthLost} 
        onClose={hideAuthLost}
        message={authLostMessage}
      />
    </AuthLostContext.Provider>
  );
};














