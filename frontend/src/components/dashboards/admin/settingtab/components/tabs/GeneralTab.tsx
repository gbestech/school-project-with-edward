import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Building2, Globe, Calendar, Check, X } from 'lucide-react';
import SettingsService from '@/services/SettingsService';

interface GeneralTabProps {
  settings?: any;
  onSettingsUpdate?: (settings: any) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ settings: initialSettings, onSettingsUpdate }) => {
  const [formData, setFormData] = useState({
    school_name: '',
    site_name: '',
    address: '',
    phone: '',
    email: '',
    motto: '',
    timezone: 'UTC-5',
    dateFormat: 'dd/mm/yyyy',
    language: 'English',
    academicYearStart: '',
    academicYearEnd: '',
    logo: '',
    favicon: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');

  useEffect(() => {
    if (initialSettings) {
      console.log('GeneralTab: Initializing with settings:', initialSettings);
      setFormData({
        school_name: initialSettings.school_name || '',
        site_name: initialSettings.site_name || '',
        address: initialSettings.address || '',
        phone: initialSettings.phone || '',
        email: initialSettings.email || '',
        motto: initialSettings.motto || '',
        timezone: initialSettings.timezone || 'UTC-5',
        dateFormat: initialSettings.dateFormat || 'dd/mm/yyyy',
        language: initialSettings.language || 'English',
        academicYearStart: initialSettings.academicYearStart || '',
        academicYearEnd: initialSettings.academicYearEnd || '',
        logo: initialSettings.logo || '',
        favicon: initialSettings.favicon || ''
      });
      
      if (initialSettings.logo) {
        setLogoPreview(initialSettings.logo);
      }
      if (initialSettings.favicon) {
        setFaviconPreview(initialSettings.favicon);
      }
    }
  }, [initialSettings]);

  const handleInputChange = (field: string, value: string) => {
    console.log(`GeneralTab: Field "${field}" changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await SettingsService.uploadLogo(file);
      
      setFormData(prev => ({
        ...prev,
        logo: result.logoUrl
      }));
      setLogoPreview(result.logoUrl);
      setSuccess('Logo uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to upload logo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setError('Favicon file size must be less than 1MB');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await SettingsService.uploadFavicon(file);
      
      setFormData(prev => ({
        ...prev,
        favicon: result.faviconUrl
      }));
      setFaviconPreview(result.faviconUrl);
      setSuccess('Favicon uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to upload favicon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData.school_name || !formData.email) {
      setError('School name and email are required fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('GeneralTab: Saving settings:', formData);
      
      // Call parent's update handler which uses SettingsContext
      if (onSettingsUpdate) {
        await onSettingsUpdate(formData);
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('GeneralTab: Save error:', err);
      const errorMessage = err.message || 'Failed to save settings';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC',
    'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6',
    'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];

  const dateFormats = ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd', 'dd-mm-yyyy'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic'];

  return (
    <div className="p-8 space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <X className="w-5 h-5 text-red-600" />
          <p className="text-red-800 text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* School Information Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          School Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Name *
            </label>
            <input
              type="text"
              value={formData.school_name}
              onChange={(e) => handleInputChange('school_name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => handleInputChange('site_name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="Enter site name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="Enter school address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="school@example.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Motto
            </label>
            <input
              type="text"
              value={formData.motto}
              onChange={(e) => handleInputChange('motto', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              placeholder="Excellence in Education"
            />
          </div>
        </div>
      </div>

      {/* Localization Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          Localization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Format
            </label>
            <select
              value={formData.dateFormat}
              onChange={(e) => handleInputChange('dateFormat', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            >
              {dateFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Academic Year Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Academic Year
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.academicYearStart}
              onChange={(e) => handleInputChange('academicYearStart', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.academicYearEnd}
              onChange={(e) => handleInputChange('academicYearEnd', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Branding Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Branding</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Logo
            </label>
            {logoPreview && (
              <div className="mb-4">
                <img src={logoPreview} alt="Logo" className="h-20 object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">Max file size: 2MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Favicon
            </label>
            {faviconPreview && (
              <div className="mb-4">
                <img src={faviconPreview} alt="Favicon" className="h-8 object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFaviconUpload}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">Max file size: 1MB</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default GeneralTab;