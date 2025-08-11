import React, { useState, useEffect } from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useAuth } from '@/hooks/useAuth';

const TestHooks: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  const { user, isAuthenticated } = useAuth();
  const [testState, setTestState] = useState('Test State');

  useEffect(() => {
    console.log('TestHooks mounted successfully');
    console.log('isDarkMode:', isDarkMode);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
  }, [isDarkMode, isAuthenticated, user]);

  return (
    <div className={`p-8 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}>
      <h1 className="text-2xl font-bold mb-4">Hooks Test Component</h1>
      <div className="space-y-2">
        <p>Dark Mode: {isDarkMode ? 'Yes' : 'No'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? `${user.first_name} ${user.last_name}` : 'None'}</p>
        <p>Test State: {testState}</p>
        <button 
          onClick={() => setTestState('Updated State')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update State
        </button>
      </div>
    </div>
  );
};

export default TestHooks; 