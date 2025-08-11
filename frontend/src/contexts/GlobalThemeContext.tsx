import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDesign } from './DesignContext';

interface GlobalThemeContextType {
  isDarkMode: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isUserOverride: boolean;
  resetToAdminDefault: () => void;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export const useGlobalTheme = () => {
  const context = useContext(GlobalThemeContext);
  if (!context) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
};

interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

export const GlobalThemeProvider: React.FC<GlobalThemeProviderProps> = ({ children }) => {
  const { settings: designSettings } = useDesign();
  const [isUserOverride, setIsUserOverride] = useState(false);
  
  // Initialize theme based on admin settings or user preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check if user has set their own preference
    const userTheme = localStorage.getItem('userTheme');
    if (userTheme === 'dark' || userTheme === 'light') {
      setIsUserOverride(true);
      return userTheme;
    }
    
    // Check admin default theme
    const adminTheme = localStorage.getItem('adminDefaultTheme');
    if (adminTheme === 'dark' || adminTheme === 'light') {
      return adminTheme;
    }
    
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const isDarkMode = theme === 'dark';

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'dark-mode');
    body.classList.remove('light', 'dark', 'dark-mode');

    // Add current theme class
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Add dark-mode class for CSS overrides
    if (isDarkMode) {
      root.classList.add('dark-mode');
      body.classList.add('dark-mode');
      // Add Tailwind dark class
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply professional dark mode CSS variables
    if (isDarkMode) {
      // Professional dark mode color scheme
      root.style.setProperty('--bg-primary', '#0f172a'); // slate-950
      root.style.setProperty('--bg-secondary', '#1e293b'); // slate-800
      root.style.setProperty('--bg-tertiary', '#334155'); // slate-700
      root.style.setProperty('--bg-card', '#1e293b'); // slate-800
      root.style.setProperty('--bg-card-hover', '#334155'); // slate-700
      root.style.setProperty('--text-primary', '#f8fafc'); // slate-50
      root.style.setProperty('--text-secondary', '#e2e8f0'); // slate-200
      root.style.setProperty('--text-muted', '#94a3b8'); // slate-400
      root.style.setProperty('--text-accent', '#60a5fa'); // blue-400
      root.style.setProperty('--border-color', '#334155'); // slate-700
      root.style.setProperty('--border-light', '#475569'); // slate-600
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-color-light', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--button-bg', '#3b82f6'); // blue-500
      root.style.setProperty('--button-text', '#ffffff');
      root.style.setProperty('--button-hover-bg', '#2563eb'); // blue-600
      root.style.setProperty('--input-bg', '#1e293b'); // slate-800
      root.style.setProperty('--input-border', '#475569'); // slate-600
      root.style.setProperty('--input-focus-border', '#60a5fa'); // blue-400
      root.style.setProperty('--card-bg', '#1e293b'); // slate-800
      root.style.setProperty('--card-border', '#334155'); // slate-700
      root.style.setProperty('--success-bg', '#065f46'); // emerald-800
      root.style.setProperty('--success-text', '#6ee7b7'); // emerald-300
      root.style.setProperty('--warning-bg', '#92400e'); // amber-800
      root.style.setProperty('--warning-text', '#fcd34d'); // amber-300
      root.style.setProperty('--error-bg', '#991b1b'); // red-800
      root.style.setProperty('--error-text', '#fca5a5'); // red-300
      root.style.setProperty('--info-bg', '#1e40af'); // blue-800
      root.style.setProperty('--info-text', '#93c5fd'); // blue-300
    } else {
      // Professional light mode color scheme
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc'); // slate-50
      root.style.setProperty('--bg-tertiary', '#f1f5f9'); // slate-100
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-card-hover', '#f8fafc'); // slate-50
      root.style.setProperty('--text-primary', '#0f172a'); // slate-950
      root.style.setProperty('--text-secondary', '#334155'); // slate-700
      root.style.setProperty('--text-muted', '#64748b'); // slate-500
      root.style.setProperty('--text-accent', '#2563eb'); // blue-600
      root.style.setProperty('--border-color', '#e2e8f0'); // slate-200
      root.style.setProperty('--border-light', '#f1f5f9'); // slate-100
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-color-light', 'rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--button-bg', '#3b82f6'); // blue-500
      root.style.setProperty('--button-text', '#ffffff');
      root.style.setProperty('--button-hover-bg', '#2563eb'); // blue-600
      root.style.setProperty('--input-bg', '#ffffff');
      root.style.setProperty('--input-border', '#e2e8f0'); // slate-200
      root.style.setProperty('--input-focus-border', '#3b82f6'); // blue-500
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--card-border', '#e2e8f0'); // slate-200
      root.style.setProperty('--success-bg', '#ecfdf5'); // emerald-50
      root.style.setProperty('--success-text', '#065f46'); // emerald-800
      root.style.setProperty('--warning-bg', '#fffbeb'); // amber-50
      root.style.setProperty('--warning-text', '#92400e'); // amber-800
      root.style.setProperty('--error-bg', '#fef2f2'); // red-50
      root.style.setProperty('--error-text', '#991b1b'); // red-800
      root.style.setProperty('--info-bg', '#eff6ff'); // blue-50
      root.style.setProperty('--info-text', '#1e40af'); // blue-800
    }

    // Store user preference
    if (isUserOverride) {
      localStorage.setItem('userTheme', theme);
    }
  }, [theme, isDarkMode, isUserOverride]);

  // Update admin default theme when design settings change
  useEffect(() => {
    if (designSettings?.theme) {
      // Map admin theme to light/dark
      let adminTheme: 'light' | 'dark' = 'light';
      
      if (designSettings.theme === 'dark' || 
          designSettings.theme === 'premium' || 
          designSettings.theme === 'ultra-premium' ||
          designSettings.theme === 'obsidian' ||
          designSettings.theme === 'aurora' ||
          designSettings.theme === 'midnight' ||
          designSettings.theme === 'crimson' ||
          designSettings.theme === 'forest' ||
          designSettings.theme === 'golden') {
        adminTheme = 'dark';
      }
      
      localStorage.setItem('adminDefaultTheme', adminTheme);
      
      // Only apply admin default if user hasn't set their own preference
      if (!isUserOverride) {
        setTheme(adminTheme);
      }
    }
  }, [designSettings?.theme, isUserOverride]);

  const setUserTheme = (newTheme: 'light' | 'dark') => {
    setIsUserOverride(true);
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setIsUserOverride(true);
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const resetToAdminDefault = () => {
    setIsUserOverride(false);
    localStorage.removeItem('userTheme');
    
    // Get admin default
    const adminTheme = localStorage.getItem('adminDefaultTheme') as 'light' | 'dark' || 'light';
    setTheme(adminTheme);
  };

  return (
    <GlobalThemeContext.Provider 
      value={{ 
        isDarkMode, 
        theme, 
        setTheme: setUserTheme, 
        toggleTheme, 
        isUserOverride,
        resetToAdminDefault 
      }}
    >
      {children}
    </GlobalThemeContext.Provider>
  );
}; 