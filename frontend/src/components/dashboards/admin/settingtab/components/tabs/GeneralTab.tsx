import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Upload,
  Users,
  Save
} from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';
import SettingsService from '@/services/SettingsService';

interface GeneralTabProps {
  settings?: any;
  onSettingsUpdate?: (settings: any) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ settings, onSettingsUpdate }) => {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const [formData, setFormData] = useState({
    school_name: '',
    school_address: '',
    school_phone: '',
    school_email: '',
    school_website: '',
    school_motto: '',
    academic_year: '',
    current_term: '',
    timezone: 'Africa/Lagos',
    maintenance_mode: false,
    notifications_enabled: true,
    student_portal_enabled: true,
    parent_portal_enabled: true,
    teacher_portal_enabled: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        school_name: settings.school_name || '',
        school_address: settings.address || settings.school_address || '',
        school_phone: settings.phone || settings.school_phone || '',
        school_email: settings.email || settings.school_email || '',
        school_website: settings.school_website || settings.website || '',
        school_motto: settings.motto || settings.school_motto || '',
        academic_year: settings.academicYearStart || settings.academic_year || '',
        current_term: settings.current_term || 'First Term',
        timezone: settings.timezone || 'Africa/Lagos',
        maintenance_mode: settings.maintenance_mode || false,
        notifications_enabled: settings.notifications_enabled !== false,
        student_portal_enabled: settings.student_portal_enabled !== false,
        parent_portal_enabled: settings.parent_portal_enabled !== false,
        teacher_portal_enabled: settings.teacher_portal_enabled !== false,
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Upload logo separately using SettingsService
      await SettingsService.uploadLogo(file);
      
      // Refresh settings to get updated logo URL
      await onSettingsUpdate?.({});
      
      showSuccess('School logo uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload logo. Please try again.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    try {
      const allowedTypes = ['image/x-icon', 'image/png', 'image/vnd.microsoft.icon'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid favicon file (ICO or PNG)');
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }

      // Upload favicon separately using SettingsService
      await SettingsService.uploadFavicon(file);
      
      // Refresh settings to get updated favicon URL
      await onSettingsUpdate?.({});
      
      showSuccess('School favicon uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload favicon:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload favicon. Please try again.');
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving settings:', formData);
      
      // Transform to match SettingsService expected format
      const settingsUpdate = {
        school_name: formData.school_name,
        address: formData.school_address,
        phone: formData.school_phone,
        email: formData.school_email,
        school_website: formData.school_website,
        motto: formData.school_motto,
        academicYearStart: formData.academic_year,
        current_term: formData.current_term,
        timezone: formData.timezone,
        maintenance_mode: formData.maintenance_mode,
        notifications_enabled: formData.notifications_enabled,
        student_portal_enabled: formData.student_portal_enabled,
        parent_portal_enabled: formData.parent_portal_enabled,
        teacher_portal_enabled: formData.teacher_portal_enabled,
      };
      
      await onSettingsUpdate?.(settingsUpdate);
      showSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right">
          {successMessage}
        </div>
      )}

      {/* School Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          School Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={formData.school_name}
              onChange={(e) => handleChange('school_name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              School Motto
            </label>
            <input
              type="text"
              value={formData.school_motto}
              onChange={(e) => handleChange('school_motto', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter school motto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={formData.academic_year}
              onChange={(e) => handleChange('academic_year', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2024-2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Term
            </label>
            <select
              value={formData.current_term}
              onChange={(e) => handleChange('current_term', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.school_email}
              onChange={(e) => handleChange('school_email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.school_phone}
              onChange={(e) => handleChange('school_phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Address
            </label>
            <textarea
              value={formData.school_address}
              onChange={(e) => handleChange('school_address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter school address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.school_website}
              onChange={(e) => handleChange('school_website', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Africa/Lagos">West African Time (WAT) - GMT+1</option>
              <option value="Africa/Accra">Ghana Time (GMT) - GMT+0</option>
              <option value="Europe/London">British Time (GMT/BST) - GMT+0/+1</option>
              <option value="America/New_York">Eastern Time (ET) - GMT-5/-4</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          System Settings
        </h3>

        <div className="space-y-6">
          <ToggleSwitch
            id="maintenance-mode"
            checked={formData.maintenance_mode}
            onChange={(checked) => handleChange('maintenance_mode', checked)}
            label="Maintenance Mode"
            description="Temporarily disable the system for maintenance"
          />

          <ToggleSwitch
            id="enable-notifications"
            checked={formData.notifications_enabled}
            onChange={(checked) => handleChange('notifications_enabled', checked)}
            label="Enable Notifications"
            description="Send email and in-app notifications to users"
          />
        </div>
      </div>

      {/* Portal Access Control */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          Portal Access Control
        </h3>

        <div className="space-y-6">
          <ToggleSwitch
            id="student-portal-enabled"
            checked={formData.student_portal_enabled}
            onChange={(checked) => handleChange('student_portal_enabled', checked)}
            label="Student Portal Access"
            description="Allow students to access their portal and view results"
          />

          <ToggleSwitch
            id="parent-portal-enabled"
            checked={formData.parent_portal_enabled}
            onChange={(checked) => handleChange('parent_portal_enabled', checked)}
            label="Parent Portal Access"
            description="Allow parents to access their portal and view their children's information"
          />

          <ToggleSwitch
            id="teacher-portal-enabled"
            checked={formData.teacher_portal_enabled}
            onChange={(checked) => handleChange('teacher_portal_enabled', checked)}
            label="Teacher Portal Access"
            description="Allow teachers to access their portal and manage classes"
          />
        </div>
      </div>

      {/* Logo and Branding */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          Logo and Branding
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              School Logo
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={isUploadingLogo}
              />
              <label htmlFor="logo-upload" className={`cursor-pointer ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                {settings?.logo || settings?.logo_url ? (
                  <div className="mb-4">
                    <img 
                      src={settings.logo || settings.logo_url} 
                      alt="School Logo" 
                      className="w-24 h-24 mx-auto object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-2">Current Logo</p>
                  </div>
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                )}
                {isUploadingLogo ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Click to upload logo</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">Supports JPG, PNG, GIF (Max 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Favicon
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/x-icon,image/png,image/vnd.microsoft.icon"
                onChange={handleFaviconUpload}
                className="hidden"
                id="favicon-upload"
                disabled={isUploadingFavicon}
              />
              <label htmlFor="favicon-upload" className={`cursor-pointer ${isUploadingFavicon ? 'opacity-50 pointer-events-none' : ''}`}>
                {settings?.favicon || settings?.favicon_url ? (
                  <div className="mb-4">
                    <img 
                      src={settings.favicon || settings.favicon_url} 
                      alt="Favicon" 
                      className="w-16 h-16 mx-auto object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-2">Current Favicon</p>
                  </div>
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                )}
                {isUploadingFavicon ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Click to upload favicon</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">Supports ICO, PNG (Max 1MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
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