import React, { useState } from 'react';
import { Palette } from 'lucide-react';

// TypeScript interfaces
interface DesignSettings {
  primaryColor: string;
  theme: string;
  animations: boolean;
  compactMode: boolean;
}

interface Theme {
  id: string;
  name: string;
  preview: string;
}

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

// ToggleSwitch component implementation
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-slate-900 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${checked ? 'bg-blue-600' : 'bg-slate-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

const DesignTab = () => {
  const [settings, setSettings] = useState<DesignSettings>({
    primaryColor: '#3B82F6',
    theme: 'modern',
    animations: true,
    compactMode: false
  });

  const themes: Theme[] = [
    { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-br from-blue-500 to-purple-600' },
    { id: 'classic', name: 'Classic', preview: 'bg-gradient-to-br from-slate-600 to-slate-800' },
    { id: 'vibrant', name: 'Vibrant', preview: 'bg-gradient-to-br from-pink-500 to-orange-500' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          Theme & Colors
        </h3>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-4">Theme Selection</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSettings({...settings, theme: theme.id})}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  settings.theme === theme.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-full h-20 rounded-lg mb-3 ${theme.preview}`} />
                <p className="font-medium text-slate-900">{theme.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Typography</label>
            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200">
              <option>Inter (Recommended)</option>
              <option>Roboto</option>
              <option>Open Sans</option>
              <option>Poppins</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6">
          <h4 className="font-medium text-slate-900 mb-4">Display Preferences</h4>
          <div className="space-y-1">
            <ToggleSwitch
              id="animations"
              checked={settings.animations}
              onChange={(checked) => setSettings({...settings, animations: checked})}
              label="Enable animations"
              description="Smooth transitions and micro-interactions"
            />
            <ToggleSwitch
              id="compact-mode"
              checked={settings.compactMode}
              onChange={(checked) => setSettings({...settings, compactMode: checked})}
              label="Compact mode"
              description="Reduce spacing for more content density"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTab;