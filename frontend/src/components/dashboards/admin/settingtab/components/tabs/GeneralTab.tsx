import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Mail, 
  Phone, 
  Upload,
  Edit3,
  Trash2,
  Save
} from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';
import { useSettings } from '@/contexts/SettingsContext';

interface GeneralTabProps {
  settings?: any;
  onSettingsUpdate?: (settings: any) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ settings: parentSettings, onSettingsUpdate }) => {
  const { settings, loading, error, updateSettings, refreshSettings } = useSettings();
  
  // Use parent settings if available, otherwise use context settings
  const currentSettings = parentSettings || settings;
  const isLoading = parentSettings ? false : loading;
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Initialize local state with settings data
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: '',
    siteName: '',
    motto: '',
    academicYearStart: ''
  });

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    website: '',
    workingHours: '',
    timezone: 'Africa/Lagos'
  });

  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    allowPasswordReset: true,
    sessionTimeout: 30,
    maxFileUploadSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    enableNotifications: true,
    enableAuditLog: true
  });

  const [isSaving, setIsSaving] = useState(false);

  // Update local state when settings are loaded
  useEffect(() => {
    if (currentSettings) {
      // Update school info from settings
      setSchoolInfo({
        schoolName: currentSettings.school_name || '',
        siteName: currentSettings.site_name || '',
        motto: currentSettings.school_motto || '',
        academicYearStart: currentSettings.academic_year || ''
      });

      // Update contact info from settings
      setContactInfo({
        email: currentSettings.school_email || '',
        phone: currentSettings.school_phone || '',
        address: currentSettings.school_address || '',
        website: currentSettings.school_website || '',
        workingHours: currentSettings.working_hours || '',
        timezone: currentSettings.timezone || 'Africa/Lagos'
      });

      // Update system settings from settings
      setSystemSettings({
        maintenanceMode: false, // Add to settings if needed
        allowRegistration: currentSettings.allow_self_registration || true,
        requireEmailVerification: currentSettings.email_verification_required || true,
        allowPasswordReset: true, // Add to settings if needed
        sessionTimeout: 30, // Add to settings if needed
        maxFileUploadSize: currentSettings.profile_image_max_size || 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        enableNotifications: true, // Add to settings if needed
        enableAuditLog: true // Add to settings if needed
      });
    }
  }, [currentSettings]);

  const updateSchoolInfo = (field: string, value: string) => {
    setSchoolInfo(prev => ({ ...prev, [field]: value }));
    // Don't call backend immediately - only update local state
  };

  const updateContactInfo = (field: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
    // Don't call backend immediately - only update local state
  };

  const updateSocialMedia = (platform: string, url: string) => {
    setSocialMedia(prev => ({ ...prev, [platform]: url }));
    // Don't call backend immediately - only update local state
  };

  const updateSystemSetting = (field: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
    // Don't call backend immediately - only update local state
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid image file (JPG, PNG, or GIF)');
          return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('logo', file);

        // Upload logo to backend
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/upload-logo/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const logoUrl = result.logo_url || result.url;
          
          // Update settings with new logo URL
          if (onSettingsUpdate && currentSettings) {
            const updatedSettings = { ...currentSettings, logo: logoUrl };
            onSettingsUpdate(updatedSettings);
          } else {
            await updateSettings({ logo: logoUrl });
          }

          // Refresh settings to update all components
          await refreshSettings();
          
          showSuccess('School logo uploaded successfully!');
          console.log('Logo uploaded successfully:', logoUrl);
        } else {
          throw new Error('Failed to upload logo');
        }
        
      } catch (error) {
        console.error('Failed to upload logo:', error);
        alert('Failed to upload logo. Please try again.');
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingFavicon(true);
      try {
        // Validate file type
        const allowedTypes = ['image/x-icon', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid favicon file (ICO or PNG)');
          return;
        }

        // Validate file size (1MB limit)
        if (file.size > 1 * 1024 * 1024) {
          alert('File size must be less than 1MB');
          return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('favicon', file);

        // Upload favicon to backend
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/upload-favicon/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const faviconUrl = result.favicon_url || result.url;
          
          // Update settings with new favicon URL
          if (onSettingsUpdate && currentSettings) {
            const updatedSettings = { ...currentSettings, favicon: faviconUrl };
            onSettingsUpdate(updatedSettings);
          } else {
            await updateSettings({ favicon: faviconUrl });
          }

          // Refresh settings to update all components
          await refreshSettings();
          
          showSuccess('School favicon uploaded successfully!');
          console.log('Favicon uploaded successfully:', faviconUrl);
        } else {
          throw new Error('Failed to upload favicon');
        }
        
      } catch (error) {
        console.error('Failed to upload favicon:', error);
        alert('Failed to upload favicon. Please try again.');
      } finally {
        setIsUploadingFavicon(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Collect all current data and map to correct backend field names
      const allData = {
        // School information - using the correct field names for backend model
        school_name: schoolInfo.schoolName,
        school_address: contactInfo.address,
        school_phone: contactInfo.phone,
        school_email: contactInfo.email,
        school_website: contactInfo.website,
        school_motto: schoolInfo.motto,
        academic_year: schoolInfo.academicYearStart,
        timezone: contactInfo.timezone
      };

      console.log('Saving settings with data:', allData);

      if (onSettingsUpdate && currentSettings) {
        // Update parent settings
        const updatedSettings = { ...currentSettings, ...allData };
        onSettingsUpdate(updatedSettings);
      } else {
        // Use context updateSettings
        await updateSettings(allData);
      }

      // Refresh settings to update all components across the app
      await refreshSettings();
      
      showSuccess('Settings saved successfully!');
      console.log('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right">
          {successMessage}
        </div>
      )}

      {/* School Information */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          School Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={schoolInfo.schoolName}
              onChange={(e) => updateSchoolInfo('schoolName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={schoolInfo.siteName}
              onChange={(e) => updateSchoolInfo('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter site name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Motto
            </label>
            <input
              type="text"
              value={schoolInfo.motto}
              onChange={(e) => updateSchoolInfo('motto', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter school motto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Academic Year Start
            </label>
            <input
              type="text"
              value={schoolInfo.academicYearStart}
              onChange={(e) => updateSchoolInfo('academicYearStart', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter academic year start"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => updateContactInfo('email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => updateContactInfo('phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Address
            </label>
            <textarea
              value={contactInfo.address}
              onChange={(e) => updateContactInfo('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter school address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={contactInfo.website}
              onChange={(e) => updateContactInfo('website', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter website URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Working Hours
            </label>
            <input
              type="text"
              value={contactInfo.workingHours}
              onChange={(e) => updateContactInfo('workingHours', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter working hours"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <select
              value={contactInfo.timezone}
              onChange={(e) => updateContactInfo('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Africa/Lagos">West African Time (WAT) - GMT+1</option>
              <option value="Africa/Accra">Ghana Time (GMT) - GMT+0</option>
              <option value="Africa/Casablanca">Morocco Time (WET) - GMT+0</option>
              <option value="Europe/London">British Time (GMT/BST) - GMT+0/+1</option>
              <option value="America/New_York">Eastern Time (ET) - GMT-5/-4</option>
              <option value="America/Chicago">Central Time (CT) - GMT-6/-5</option>
              <option value="America/Denver">Mountain Time (MT) - GMT-7/-6</option>
              <option value="America/Los_Angeles">Pacific Time (PT) - GMT-8/-7</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          Social Media Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(socialMedia).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                {platform}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => updateSocialMedia(platform, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={`Enter ${platform} URL`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          System Settings
        </h3>

        <div className="space-y-6">
          <ToggleSwitch
            id="maintenance-mode"
            checked={systemSettings.maintenanceMode}
            onChange={(checked) => updateSystemSetting('maintenanceMode', checked)}
            label="Maintenance Mode"
            description="Temporarily disable the system for maintenance"
          />

          <ToggleSwitch
            id="allow-registration"
            checked={systemSettings.allowRegistration}
            onChange={(checked) => updateSystemSetting('allowRegistration', checked)}
            label="Allow User Registration"
            description="Allow new users to register accounts"
          />

          <ToggleSwitch
            id="require-email-verification"
            checked={systemSettings.requireEmailVerification}
            onChange={(checked) => updateSystemSetting('requireEmailVerification', checked)}
            label="Require Email Verification"
            description="Users must verify their email before accessing the system"
          />

          <ToggleSwitch
            id="allow-password-reset"
            checked={systemSettings.allowPasswordReset}
            onChange={(checked) => updateSystemSetting('allowPasswordReset', checked)}
            label="Allow Password Reset"
            description="Users can reset their passwords via email"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={systemSettings.sessionTimeout}
              onChange={(e) => updateSystemSetting('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="5"
              max="480"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum File Upload Size (MB)
            </label>
            <input
              type="number"
              value={systemSettings.maxFileUploadSize}
              onChange={(e) => updateSystemSetting('maxFileUploadSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              max="100"
            />
          </div>

          <ToggleSwitch
            id="enable-notifications"
            checked={systemSettings.enableNotifications}
            onChange={(checked) => updateSystemSetting('enableNotifications', checked)}
            label="Enable Notifications"
            description="Send email and in-app notifications to users"
          />

          <ToggleSwitch
            id="enable-audit-log"
            checked={systemSettings.enableAuditLog}
            onChange={(checked) => updateSystemSetting('enableAuditLog', checked)}
            label="Enable Audit Log"
            description="Log all system activities for security monitoring"
          />
        </div>
      </div>

      {/* Logo and Branding */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          Logo and Branding
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              School Logo
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={isUploadingLogo}
              />
              <label htmlFor="logo-upload" className={`cursor-pointer ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                {currentSettings?.logo ? (
                  <div className="mb-4">
                    <img 
                      src={currentSettings.logo} 
                      alt="School Logo" 
                      className="w-24 h-24 mx-auto object-contain rounded-lg border border-slate-200"
                    />
                    <p className="text-slate-600 font-medium mt-2">Current Logo</p>
                  </div>
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                )}
                {isUploadingLogo ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 font-medium">Click to upload logo</p>
                    <p className="text-slate-500 text-sm">Supports JPG, PNG, GIF (Max 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Favicon
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
                className="hidden"
                id="favicon-upload"
                disabled={isUploadingFavicon}
              />
              <label htmlFor="favicon-upload" className={`cursor-pointer ${isUploadingFavicon ? 'opacity-50 pointer-events-none' : ''}`}>
                {currentSettings?.favicon ? (
                  <div className="mb-4">
                    <img 
                      src={currentSettings.favicon} 
                      alt="Favicon" 
                      className="w-16 h-16 mx-auto object-contain rounded-lg border border-slate-200"
                    />
                    <p className="text-slate-600 font-medium mt-2">Current Favicon</p>
                  </div>
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                )}
                {isUploadingFavicon ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 font-medium">Click to upload favicon</p>
                    <p className="text-slate-500 text-sm">Supports ICO, PNG (Max 1MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;