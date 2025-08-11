import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { isDarkMode, toggleTheme, isUserOverride, resetToAdminDefault } = useGlobalTheme();

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          rounded-full transition-all duration-300 hover:scale-110
          ${isDarkMode 
            ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }
          shadow-md hover:shadow-lg
        `}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <Sun className={iconSizes[size]} />
        ) : (
          <Moon className={iconSizes[size]} />
        )}
      </button>
      
      {showLabel && (
        <span className="text-sm font-medium">
          {isDarkMode ? 'Light' : 'Dark'} Mode
        </span>
      )}
      
      {isUserOverride && (
        <button
          onClick={resetToAdminDefault}
          className="text-xs text-blue-500 hover:text-blue-700 underline"
          title="Reset to Admin Default"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default ThemeToggle; 