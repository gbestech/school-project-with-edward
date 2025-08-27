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
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl' 
            : 'bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 dark:text-slate-300 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-600'
          }
          backdrop-blur-sm
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
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {isDarkMode ? 'Light' : 'Dark'} Mode
        </span>
      )}
      
      {isUserOverride && (
        <button
          onClick={resetToAdminDefault}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200"
          title="Reset to Admin Default"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default ThemeToggle; 