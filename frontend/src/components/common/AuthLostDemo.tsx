import React from 'react';
import { useAuthLostContext } from './AuthLostProvider';
import { Button } from '@/components/ui/button';

const AuthLostDemo: React.FC = () => {
  const { showAuthLost, handleAuthLost } = useAuthLostContext();

  const handleTestAuthLost = () => {
    showAuthLost('This is a test message for authentication lost.');
  };

  const handleTestAuthLostWithLogout = () => {
    handleAuthLost('This is a test message with automatic logout.');
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Auth Lost Demo</h3>
      <div className="space-y-2">
        <Button 
          onClick={handleTestAuthLost}
          variant="outline"
          className="w-full"
        >
          Test Auth Lost Modal (Show Only)
        </Button>
        <Button 
          onClick={handleTestAuthLostWithLogout}
          variant="destructive"
          className="w-full"
        >
          Test Auth Lost Modal (With Logout)
        </Button>
      </div>
    </div>
  );
};

export default AuthLostDemo;













