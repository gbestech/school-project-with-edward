import React, { useState, useEffect } from 'react';
import { Settings, Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';
import { useSettings } from '../../../../../../contexts/SettingsContext';

// TypeScript interfaces
interface SchoolSettings {
  id: string;
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  school_website: string;
  academic_year: string;
  current_term: string;
  school_motto: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
  logo?: string;
  favicon?: string;
  logo_url?: string;
  favicon_url?: string;
  auto_save: boolean;
  notifications_enabled: boolean;
  dark_mode: boolean;
  maintenance_mode: boolean;
  session_timeout: number;
  max_login_attempts: number;
  created_at: string;
  updated_at: string;
}

interface GeneralTabProps {}

const GeneralTab: React.FC<GeneralTabProps> = () => {
  const { settings, loading, error, updateSettings, refreshSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [localSettings, setLocalSettings] = useState<SchoolSettings | null>(null);

  // Update local settings when global settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Remove fetchSettings as it's handled by the context

  const saveSettings = async () => {
    if (!localSettings) return;

    try {
      setSaving(true);
      setSuccess(null);

      await updateSettings(localSettings);
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // Error is handled by the context
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/school-settings/upload-${type}/`, {
        method: 'POST',
        headers: {
          // Temporarily removed authentication for testing
          // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload ${type}`);
      }

      const data = await response.json();
      
      // Update local settings with new file URL
      if (localSettings) {
        setLocalSettings({
          ...localSettings,
          [`${type}_url`]: data[`${type}Url`]
        });
      }

      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // Error will be handled by the context
      console.error(`Failed to upload ${type}:`, err);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      handleFileUpload(file, 'logo');
    }
  };

  const handleFaviconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      handleFileUpload(file, 'favicon');
    }
  };

  const handleInputChange = (field: keyof SchoolSettings, value: any) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [field]: value
      });
    }
  };

  const handleNumberInput = (field: keyof SchoolSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [field]: numValue
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!localSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            School Information
          </h3>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Name *
            </label>
            <input
              type="text"
              value={localSettings.school_name}
              onChange={(e) => handleInputChange('school_name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="Enter school name"
              aria-label="School name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <select 
              value={localSettings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              aria-label="Timezone selection"
            >
              <option value="UTC">UTC</option>
              <option value="UTC-05:00">UTC-05:00 (Eastern Time)</option>
              <option value="UTC-08:00">UTC-08:00 (Pacific Time)</option>
              <option value="UTC+01:00">UTC+01:00 (West Africa Time)</option>
              <option value="UTC+02:00">UTC+02:00 (Central Africa Time)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Address
            </label>
            <textarea
              value={localSettings.school_address || ''}
              onChange={(e) => handleInputChange('school_address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="Enter school address"
              aria-label="School address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={localSettings.academic_year}
              onChange={(e) => handleInputChange('academic_year', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="e.g., 2024-2025"
              aria-label="Academic year"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Phone
            </label>
            <input
              type="tel"
              value={localSettings.school_phone || ''}
              onChange={(e) => handleInputChange('school_phone', e.target.value.trim())}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="Enter school phone number"
              aria-label="School phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Email
            </label>
            <input
              type="email"
              value={localSettings.school_email || ''}
              onChange={(e) => handleInputChange('school_email', e.target.value.trim())}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="Enter school email"
              aria-label="School email address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Website
            </label>
            <input
              type="url"
              value={localSettings.school_website || ''}
              onChange={(e) => handleInputChange('school_website', e.target.value.trim())}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="Enter school website"
              aria-label="School website"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Term
            </label>
            <input
              type="text"
              value={localSettings.current_term}
              onChange={(e) => handleInputChange('current_term', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="e.g., First Term"
              aria-label="Current term"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Motto
            </label>
            <input
              type="text"
              value={localSettings.school_motto || ''}
              onChange={(e) => handleInputChange('school_motto', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              placeholder="Enter school motto"
              aria-label="School motto"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Format
            </label>
            <select 
              value={localSettings.date_format}
              onChange={(e) => handleInputChange('date_format', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              aria-label="Date format selection"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Time Format
            </label>
            <select 
              value={localSettings.time_format}
              onChange={(e) => handleInputChange('time_format', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              aria-label="Time format selection"
            >
              <option value="12">12-hour</option>
              <option value="24">24-hour</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Language
            </label>
            <select 
              value={localSettings.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              aria-label="Language selection"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Logo Upload
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors duration-200">
              {localSettings.logo_url ? (
                <div className="mb-4">
                  <img 
                    src={localSettings.logo_url} 
                    alt="School logo" 
                    className="w-16 h-16 mx-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <p className="text-sm text-slate-600 mb-2">Drop your logo here or click to browse</p>
              <p className="text-xs text-slate-400 mb-4">PNG, JPG, GIF up to 2MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
                aria-label="Upload logo"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Favicon Upload
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors duration-200">
              {localSettings.favicon_url ? (
                <div className="mb-4">
                  <img 
                    src={localSettings.favicon_url} 
                    alt="School favicon" 
                    className="w-8 h-8 mx-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-slate-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <p className="text-sm text-slate-600 mb-2">Drop your favicon here or click to browse</p>
              <p className="text-xs text-slate-400 mb-4">ICO, PNG up to 1MB</p>
              <input
                type="file"
                accept=".ico,image/png"
                onChange={handleFaviconChange}
                className="hidden"
                id="favicon-upload"
                aria-label="Upload favicon"
              />
              <label
                htmlFor="favicon-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6">
          <h4 className="font-medium text-slate-900 mb-4">General Preferences</h4>
          <div className="space-y-1">
            <ToggleSwitch
              id="auto-save"
              checked={localSettings.auto_save}
              onChange={(checked: boolean) => handleInputChange('auto_save', checked)}
              label="Auto-save changes"
              description="Automatically save changes without manual confirmation"
            />
            <ToggleSwitch
              id="notifications"
              checked={localSettings.notifications_enabled}
              onChange={(checked: boolean) => handleInputChange('notifications_enabled', checked)}
              label="Enable notifications"
              description="Receive system notifications and updates"
            />
            <ToggleSwitch
              id="dark-mode"
              checked={localSettings.dark_mode}
              onChange={(checked: boolean) => handleInputChange('dark_mode', checked)}
              label="Dark mode"
              description="Use dark theme across the application"
            />
            <ToggleSwitch
              id="maintenance-mode"
              checked={localSettings.maintenance_mode}
              onChange={(checked: boolean) => handleInputChange('maintenance_mode', checked)}
              label="Maintenance mode"
              description="Put the system in maintenance mode (admin only access)"
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 mt-6">
          <h4 className="font-medium text-slate-900 mb-4">Session Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={localSettings.session_timeout}
                onChange={(e) => handleNumberInput('session_timeout', e.target.value)}
                min="5"
                max="480"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                aria-label="Session timeout in minutes"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={localSettings.max_login_attempts}
                onChange={(e) => handleNumberInput('max_login_attempts', e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                aria-label="Maximum login attempts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;