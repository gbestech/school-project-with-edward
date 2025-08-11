import React from 'react';
import { useDesign } from '@/contexts/DesignContext';

const TestDesignSettings: React.FC = () => {
  const { settings } = useDesign();

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Design Settings Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Current Settings:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Typography Test:</h3>
          <p className="text-lg mb-2">This text should use the selected font family.</p>
          <p className="text-sm text-gray-600">This is a smaller text to test the font.</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Color Test:</h3>
          <div className="flex gap-4">
            <div 
              className="w-16 h-16 rounded-lg"
              style={{ backgroundColor: settings?.primary_color || '#3B82F6' }}
            ></div>
            <div className="flex flex-col justify-center">
              <p className="text-sm">Primary Color: {settings?.primary_color || '#3B82F6'}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Theme Test:</h3>
          <p className="text-sm">Current theme: {settings?.theme || 'modern'}</p>
          <div className="mt-2 p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            This should show the theme gradient
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDesignSettings; 