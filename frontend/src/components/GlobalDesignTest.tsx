import React from 'react';
import { useDesign } from '@/contexts/DesignContext';

const GlobalDesignTest: React.FC = () => {
  const { settings } = useDesign();

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg" style={{ fontFamily: 'var(--font-family)' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-color)' }}>
        Global Design Settings Test
      </h2>
      
      <div className="space-y-6">
        {/* Current Settings Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Current Settings:</h3>
          <pre className="bg-white p-3 rounded border text-sm overflow-auto">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
        
        {/* Typography Test */}
        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Typography Test:</h3>
          <p className="text-lg mb-2">This text should use the selected font family globally.</p>
          <p className="text-sm text-gray-600 mb-2">This is smaller text to test the font scaling.</p>
          <p className="text-xs text-gray-500">This is very small text to test font rendering.</p>
          <p className="text-2xl font-bold">This is large bold text.</p>
        </div>
        
        {/* Color Test */}
        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Primary Color Test:</h3>
          <div className="flex gap-4 items-center mb-4">
            <div 
              className="w-16 h-16 rounded-lg border"
              style={{ backgroundColor: 'var(--primary-color)' }}
            ></div>
            <div>
              <p className="text-sm font-medium">Primary Color: {settings?.primary_color || '#3B82F6'}</p>
              <p className="text-xs text-gray-500">Applied via CSS variable</p>
            </div>
          </div>
          
          {/* Button Test */}
          <div className="space-y-2">
            <button 
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--primary-color)', 
                color: 'white' 
              }}
            >
              Button with Primary Color
            </button>
            <button 
              className="px-4 py-2 rounded-lg font-medium border transition-all duration-200"
              style={{ 
                borderColor: 'var(--primary-color)', 
                color: 'var(--primary-color)' 
              }}
            >
              Button with Primary Color Border
            </button>
          </div>
        </div>
        
        {/* Theme Test */}
        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Theme Test:</h3>
          <p className="text-sm mb-2">Current theme: <span className="font-medium">{settings?.theme || 'modern'}</span></p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Modern Theme Gradient
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-slate-600 to-slate-800 text-white">
              Classic Theme Gradient
            </div>
          </div>
        </div>
        
        {/* CSS Variables Test */}
        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">CSS Variables Test:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>--primary-color:</strong> <span style={{ color: 'var(--primary-color)' }}>{settings?.primary_color || '#3B82F6'}</span></p>
              <p><strong>--font-family:</strong> <span style={{ fontFamily: 'var(--font-family)' }}>{settings?.typography || 'Inter'}</span></p>
            </div>
            <div>
              <p><strong>--border-radius:</strong> {settings?.border_radius || 'rounded-lg'}</p>
              <p><strong>--shadow-style:</strong> {settings?.shadow_style || 'shadow-md'}</p>
            </div>
          </div>
        </div>
        
        {/* Animation Test */}
        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Animation Test:</h3>
          <p className="text-sm mb-2">Animations enabled: <span className="font-medium">{settings?.animations_enabled ? 'Yes' : 'No'}</span></p>
          <button 
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white' 
            }}
          >
            Hover me to test animations
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalDesignTest; 