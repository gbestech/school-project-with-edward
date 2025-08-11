import React from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Sun, Moon, Settings, User, Bell, MessageSquare } from 'lucide-react';

const ThemeTestPage: React.FC = () => {
  const { isDarkMode, toggleTheme, theme, setTheme } = useGlobalTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Dark Mode Test Page
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Testing professional dark mode implementation
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 border border-slate-200 dark:border-slate-600"
                  title="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                </button>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Current: {theme}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Theme Controls</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`w-full p-3 rounded-lg border transition-colors duration-200 ${
                    theme === 'light'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Light Mode
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`w-full p-3 rounded-lg border transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Dark Mode
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Color Palette</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-8 bg-blue-500 rounded"></div>
                  <div className="h-8 bg-green-500 rounded"></div>
                  <div className="h-8 bg-purple-500 rounded"></div>
                  <div className="h-8 bg-amber-500 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600"></div>
                  <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded border border-slate-200 dark:border-slate-600"></div>
                  <div className="h-8 bg-slate-400 dark:bg-slate-500 rounded border border-slate-200 dark:border-slate-600"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Component Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Cards */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">User Card</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This is an example card component with professional dark mode styling.
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-200">
                Action Button
              </button>
            </div>

            {/* Form Elements */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Form Elements</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Select an option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Status Indicators</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">Success</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">Warning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">Error</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">Info</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Example */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Table Example</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3 text-slate-900 dark:text-slate-100 font-semibold">Name</th>
                    <th className="text-left p-3 text-slate-900 dark:text-slate-100 font-semibold">Email</th>
                    <th className="text-left p-3 text-slate-900 dark:text-slate-100 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-3 text-slate-700 dark:text-slate-300">John Doe</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">john@example.com</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-xs">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-3 text-slate-700 dark:text-slate-300">Jane Smith</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">jane@example.com</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-full text-xs">
                        Pending
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Success</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Operation completed successfully.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">Warning</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Please review your settings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTestPage; 