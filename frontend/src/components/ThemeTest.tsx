import React from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useDesign } from '@/contexts/DesignContext';
import ThemeToggle from './ThemeToggle';

const ThemeTest: React.FC = () => {
  const { isDarkMode, theme, isUserOverride, resetToAdminDefault } = useGlobalTheme();
  const { settings: designSettings } = useDesign();

  return (
    <div className={`p-8 ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Theme System Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current State */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current State</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Theme:</strong> {theme}</p>
                <p><strong>Dark Mode:</strong> {isDarkMode ? 'Yes' : 'No'}</p>
                <p><strong>User Override:</strong> {isUserOverride ? 'Yes' : 'No'}</p>
                <p><strong>Admin Theme:</strong> {designSettings?.theme || 'Not set'}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Controls</h3>
              <div className="space-y-4">
                <ThemeToggle showLabel={true} />
                
                {isUserOverride && (
                  <button
                    onClick={resetToAdminDefault}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Reset to Admin Default
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cards */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Card Test</h3>
            <p className="text-gray-700 dark:text-gray-300">
              This card should adapt to the current theme.
            </p>
          </div>

          {/* Buttons */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Button Test</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Primary Button
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                Secondary Button
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Input Test</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Enter text..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* CSS Variables Display */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">CSS Variables</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <strong>--bg-primary:</strong>
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--bg-primary)' }}></div>
            </div>
            <div>
              <strong>--bg-secondary:</strong>
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
            </div>
            <div>
              <strong>--text-primary:</strong>
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--text-primary)' }}></div>
            </div>
            <div>
              <strong>--border-color:</strong>
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--border-color)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest; 