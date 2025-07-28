import React, { useState } from 'react';
import { Settings, Palette, Shield, GraduationCap, FileText, DollarSign, Lock, MessageSquare, Wrench, Save, Bell, Users, Globe, Database, Zap, Eye, EyeOff, BarChart3, UserCheck } from 'lucide-react';

const settingsTabs = [
  'General',
  'Design',
  'Roles & Permissions',
  'Academic',
  'Exam',
  'Finance',
  'Security',
  'Communication',
  'Advanced',
];

const tabIcons: Record<string, React.ReactNode> = {
  'General': <Settings className="w-5 h-5" />,
  'Design': <Palette className="w-5 h-5" />,
  'Roles & Permissions': <Shield className="w-5 h-5" />,
  'Academic': <GraduationCap className="w-5 h-5" />,
  'Exam': <FileText className="w-5 h-5" />,
  'Finance': <DollarSign className="w-5 h-5" />,
  'Security': <Lock className="w-5 h-5" />,
  'Communication': <MessageSquare className="w-5 h-5" />,
  'Advanced': <Wrench className="w-5 h-5" />,
};

const modules = [
  { key: 'dashboard', name: 'Dashboard', icon: Settings, description: 'Access dashboard overview' },
  { key: 'students', name: 'Students', icon: GraduationCap, description: 'Manage student records' },
  { key: 'teachers', name: 'Teachers', icon: Users, description: 'Manage teacher records' },
  { key: 'attendance', name: 'Attendance', icon: FileText, description: 'Track attendance' },
  { key: 'results', name: 'Results', icon: BarChart3, description: 'View and manage results' },
  { key: 'messaging', name: 'Messaging', icon: MessageSquare, description: 'Send messages' },
  { key: 'finance', name: 'Finance', icon: DollarSign, description: 'Manage fees and payments' },
  { key: 'reports', name: 'Reports', icon: BarChart3, description: 'View reports' },
  { key: 'settings', name: 'Settings', icon: Settings, description: 'System settings' },
];
const permissionLevels = [
  { key: 'read', name: 'Read', description: 'View only' },
  { key: 'write', name: 'Write', description: 'Create/Edit' },
  { key: 'delete', name: 'Delete', description: 'Remove' },
  { key: 'admin', name: 'Admin', description: 'Full access' },
];

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  // Extend formData state
  const [formData, setFormData] = useState({
    siteName: 'EduAdmin Pro',
    schoolName: 'Springfield Elementary School',
    address: '',
    contactInfo: '',
    logo: '',
    favicon: '',
    academicYearStart: '',
    academicYearEnd: '',
    motto: 'Excellence in Education',
    timezone: 'UTC-5',
    dateFormat: 'dd/mm/yyyy',
    language: 'English',
    theme: 'light',
    primaryColor: '#3B82F6',
    secondaryColor: '#6366F1',
    fontFamily: 'Inter',
    fontSize: 'medium',
    showPassword: false,
    notifications: true,
    autoSave: true,
    // Homepage customization
    showAnnouncements: true,
    showCalendar: true,
    showQuickLinks: true,
    announcements: [
      { id: 1, title: 'Welcome to New Academic Year', content: 'Academic year 2024-2025 begins next week', active: true },
      { id: 2, title: 'Parent-Teacher Conference', content: 'Schedule your meetings for next month', active: true }
    ],
    quickLinks: [
      { id: 1, title: 'Student Portal', url: '/students', icon: 'GraduationCap', active: true },
      { id: 2, title: 'Teacher Dashboard', url: '/teachers', icon: 'Users', active: true },
      { id: 3, title: 'Library', url: '/library', icon: 'FileText', active: true },
      { id: 4, title: 'Cafeteria Menu', url: '/cafeteria', icon: 'DollarSign', active: true }
    ],
    // Add state for roles, selectedRole, showCreateRole, newRole, modules, permissionLevels, colorOptions
    showCreateRole: false,
    selectedRole: null,
    newRole: {
      name: '',
      description: '',
      color: 'blue',
      permissions: {
        dashboard: { read: false, write: false, delete: false, admin: false },
        students: { read: false, write: false, delete: false, admin: false },
        teachers: { read: false, write: false, delete: false, admin: false },
        attendance: { read: false, write: false, delete: false, admin: false },
        results: { read: false, write: false, delete: false, admin: false },
        messaging: { read: false, write: false, delete: false, admin: false },
        finance: { read: false, write: false, delete: false, admin: false },
        reports: { read: false, write: false, delete: false, admin: false },
        settings: { read: false, write: false, delete: false, admin: false }
      }
    },
    roles: [
      {
        id: 1,
        name: 'Administrator',
        description: 'Full access to all modules',
        color: 'blue',
        isSystem: true,
        userCount: 2,
        permissions: {
          dashboard: { read: true, write: true, delete: true, admin: true },
          students: { read: true, write: true, delete: true, admin: true },
          teachers: { read: true, write: true, delete: true, admin: true },
          attendance: { read: true, write: true, delete: true, admin: true },
          results: { read: true, write: true, delete: true, admin: true },
          messaging: { read: true, write: true, delete: true, admin: true },
          finance: { read: true, write: true, delete: true, admin: true },
          reports: { read: true, write: true, delete: true, admin: true },
          settings: { read: true, write: true, delete: true, admin: true }
        }
      },
      {
        id: 2,
        name: 'Teacher',
        description: 'Manage classes and students',
        color: 'green',
        isSystem: true,
        userCount: 10,
        permissions: {
          dashboard: { read: true, write: false, delete: false, admin: false },
          students: { read: true, write: true, delete: false, admin: false },
          teachers: { read: true, write: false, delete: false, admin: false },
          attendance: { read: true, write: true, delete: false, admin: false },
          results: { read: true, write: true, delete: false, admin: false },
          messaging: { read: true, write: true, delete: false, admin: false },
          finance: { read: false, write: false, delete: false, admin: false },
          reports: { read: true, write: false, delete: false, admin: false },
          settings: { read: false, write: false, delete: false, admin: false }
        }
      },
      {
        id: 3,
        name: 'Student',
        description: 'Access own records and results',
        color: 'yellow',
        isSystem: true,
        userCount: 200,
        permissions: {
          dashboard: { read: true, write: false, delete: false, admin: false },
          students: { read: false, write: false, delete: false, admin: false },
          teachers: { read: false, write: false, delete: false, admin: false },
          attendance: { read: true, write: false, delete: false, admin: false },
          results: { read: true, write: false, delete: false, admin: false },
          messaging: { read: true, write: false, delete: false, admin: false },
          finance: { read: false, write: false, delete: false, admin: false },
          reports: { read: false, write: false, delete: false, admin: false },
          settings: { read: false, write: false, delete: false, admin: false }
        }
      },
      {
        id: 4,
        name: 'Parent',
        description: 'View child progress and communicate',
        color: 'purple',
        isSystem: true,
        userCount: 80,
        permissions: {
          dashboard: { read: true, write: false, delete: false, admin: false },
          students: { read: true, write: false, delete: false, admin: false },
          teachers: { read: true, write: false, delete: false, admin: false },
          attendance: { read: true, write: false, delete: false, admin: false },
          results: { read: true, write: false, delete: false, admin: false },
          messaging: { read: true, write: false, delete: false, admin: false },
          finance: { read: false, write: false, delete: false, admin: false },
          reports: { read: false, write: false, delete: false, admin: false },
          settings: { read: false, write: false, delete: false, admin: false }
        }
      }
    ],
    // Academic tab fields
    allowSelfRegistration: true,
    emailVerificationRequired: true,
    registrationApprovalRequired: false,
    defaultUserRole: 'student',
    passwordMinLength: 8,
    passwordResetInterval: 90,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    passwordRequireUppercase: false,
    defaultAvatar: '',
    allowProfileImageUpload: true,
    profileImageMaxSize: 2,
    classLevels: [
      { id: 1, name: 'Grade 1' },
      { id: 2, name: 'Grade 2' },
      { id: 3, name: 'Grade 3' },
    ],
    subjects: [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'English' },
      { id: 3, name: 'Science' },
    ],
    sessions: [
      { id: 1, name: '2023/2024', terms: ['First Term', 'Second Term', 'Third Term'] },
    ],
    grading: {
      grades: [
        { letter: 'A', min: 70, max: 100 },
        { letter: 'B', min: 60, max: 69 },
        { letter: 'C', min: 50, max: 59 },
        { letter: 'D', min: 45, max: 49 },
        { letter: 'E', min: 40, max: 44 },
        { letter: 'F', min: 0, max: 39 },
      ],
      passMark: 40,
    },
    timetable: {
      maxPeriodsPerDay: 8,
      minBreakMinutes: 10,
    },
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Add file upload handlers
  const handleFileChange = (key: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateFormData(key, e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={e => updateFormData('schoolName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-base"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Info</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={e => updateFormData('contactInfo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-base"
                />
              </div>
              <div className="space-y-4 lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => updateFormData('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-base min-h-[60px]"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange('logo', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.logo && (
                  <img src={formData.logo} alt="Logo Preview" className="h-16 mt-2 rounded shadow border" />
                )}
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange('favicon', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.favicon && (
                  <img src={formData.favicon} alt="Favicon Preview" className="h-10 w-10 mt-2 rounded shadow border" />
                )}
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year Start</label>
                <input
                  type="date"
                  value={formData.academicYearStart}
                  onChange={e => updateFormData('academicYearStart', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-base"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year End</label>
                <input
                  type="date"
                  value={formData.academicYearEnd}
                  onChange={e => updateFormData('academicYearEnd', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-base"
                />
              </div>
              <div className="space-y-4 lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Motto or Tagline</label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={e => updateFormData('motto', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-base"
                />
              </div>
            </div>
            <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Timezone & Localization</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={e => updateFormData('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+1">West Africa Time (UTC+1)</option>
                    <option value="UTC+2">Central Africa Time (UTC+2)</option>
                    <option value="UTC+3">East Africa Time (UTC+3)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date Format</label>
                  <select
                    value={formData.dateFormat}
                    onChange={e => updateFormData('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="dd/mm/yyyy">dd/mm/yyyy</option>
                    <option value="mm/dd/yyyy">mm/dd/yyyy</option>
                    <option value="yyyy-mm-dd">yyyy-mm-dd</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Default Language</label>
                  <select
                    value={formData.language}
                    onChange={e => updateFormData('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Igbo">Igbo</option>
                    <option value="Hausa">Hausa</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Design':
        return (
          <div className="space-y-6 sm:space-y-8">
            {/* Theme & Appearance Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Theme & Appearance</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Theme Mode */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Theme Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'light', label: 'Light', bg: 'bg-yellow-400', icon: '☀️' },
                      { value: 'dark', label: 'Dark', bg: 'bg-gray-800', icon: '🌙' }
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => updateFormData('theme', theme.value)}
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${
                          formData.theme === theme.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{theme.icon}</div>
                        <span className="text-xs sm:text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Color */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => updateFormData('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                        <button
                          key={color}
                          onClick={() => updateFormData('primaryColor', color)}
                          className="w-8 h-8 rounded-md border-2 border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Customization */}
              <div className="mt-8 pt-6 border-t border-purple-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Typography</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Font Family</label>
                    <select
                      value={formData.fontFamily}
                      onChange={e => updateFormData('fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="Inter">Inter (Default)</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Font Size</label>
                    <select
                      value={formData.fontSize}
                      onChange={e => updateFormData('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium (Default)</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Homepage Customizer Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Homepage Customization</h3>
              </div>

              {/* Homepage Components Toggle */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Homepage Components</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'showAnnouncements', label: 'Announcement Carousel', icon: '📢' },
                    { key: 'showCalendar', label: 'School Calendar Preview', icon: '📅' },
                    { key: 'showQuickLinks', label: 'Quick Links Section', icon: '🔗' }
                  ].map(component => {
                    const key = component.key as keyof typeof formData;
                    return (
                      <div key={component.key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{component.icon}</span>
                          <span className="text-sm font-medium text-gray-700">{component.label}</span>
                        </div>
                        <button
                          onClick={() => updateFormData(component.key, !formData[key])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData[key] ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData[key] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Announcement Configuration */}
              {formData.showAnnouncements && (
                <div className="mb-8 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Announcement Carousel</h4>
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                      + Add Announcement
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.announcements.map((announcement, index) => (
                      <div key={announcement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={announcement.active}
                          onChange={() => {
                            const updated = [...formData.announcements];
                            updated[index].active = !updated[index].active;
                            updateFormData('announcements', updated);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={announcement.title}
                            onChange={(e) => {
                              const updated = [...formData.announcements];
                              updated[index].title = e.target.value;
                              updateFormData('announcements', updated);
                            }}
                            className="w-full text-sm font-medium text-gray-800 bg-transparent border-none focus:outline-none"
                          />
                          <input
                            type="text"
                            value={announcement.content}
                            onChange={(e) => {
                              const updated = [...formData.announcements];
                              updated[index].content = e.target.value;
                              updateFormData('announcements', updated);
                            }}
                            className="w-full text-xs text-gray-600 bg-transparent border-none focus:outline-none mt-1"
                          />
                        </div>
                        <button className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links Configuration */}
              {formData.showQuickLinks && (
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Quick Links Configuration</h4>
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                      + Add Link
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.quickLinks.map((link, index) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={link.active}
                          onChange={() => {
                            const updated = [...formData.quickLinks];
                            updated[index].active = !updated[index].active;
                            updateFormData('quickLinks', updated);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => {
                              const updated = [...formData.quickLinks];
                              updated[index].title = e.target.value;
                              updateFormData('quickLinks', updated);
                            }}
                            className="w-full text-sm font-medium text-gray-800 bg-transparent border-none focus:outline-none"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...formData.quickLinks];
                              updated[index].url = e.target.value;
                              updateFormData('quickLinks', updated);
                            }}
                            className="w-full text-xs text-gray-600 bg-transparent border-none focus:outline-none mt-1"
                            placeholder="URL or path"
                          />
                        </div>
                        <button className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brand Customization Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-2xl">🎨</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Brand Assets</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">School Logo</label>
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors duration-200">
                    {formData.logo ? (
                      <div className="space-y-3">
                        <img src={formData.logo} alt="Logo Preview" className="h-20 mx-auto rounded shadow" />
                        <button 
                          onClick={() => updateFormData('logo', '')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove Logo
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-3xl mb-2">📸</div>
                        <p className="text-sm">Upload your school logo</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange('logo', e.target.files?.[0] || null)}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="inline-block mt-3 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer hover:bg-emerald-200 text-sm"
                    >
                      Choose File
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Favicon</label>
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors duration-200">
                    {formData.favicon ? (
                      <div className="space-y-3">
                        <img src={formData.favicon} alt="Favicon Preview" className="h-12 w-12 mx-auto rounded shadow" />
                        <button 
                          onClick={() => updateFormData('favicon', '')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove Favicon
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-3xl mb-2">🔖</div>
                        <p className="text-sm">Upload favicon</p>
                        <p className="text-xs text-gray-400 mt-1">16x16 or 32x32 pixels</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange('favicon', e.target.files?.[0] || null)}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <label 
                      htmlFor="favicon-upload"
                      className="inline-block mt-3 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer hover:bg-emerald-200 text-sm"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl sm:rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-gray-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Live Preview</h3>
              </div>
              <div 
                className="bg-white rounded-lg p-6 border shadow-sm"
                style={{ 
                  fontFamily: formData.fontFamily,
                  fontSize: formData.fontSize === 'small' ? '14px' : formData.fontSize === 'large' ? '18px' : formData.fontSize === 'extra-large' ? '20px' : '16px'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {formData.logo && <img src={formData.logo} alt="Logo" className="h-8" />}
                  <h4 className="font-bold" style={{ color: formData.primaryColor }}>
                    {formData.schoolName || 'Your School Name'}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: formData.primaryColor + '20', color: formData.primaryColor }}
                  >
                    Primary Color Sample
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: formData.secondaryColor + '20', color: formData.secondaryColor }}
                  >
                    Secondary Color Sample
                  </div>
                </div>
                {formData.motto && (
                  <p className="mt-4 text-gray-600 italic">"{formData.motto}"</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'Academic':
        return (
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">User Account & Profile Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Configure user registration, profiles, and account policies</p>
            </div>
            {/* Registration & Account Settings */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Registration & Access Control</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Self Registration */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Allow Self Registration</label>
                    <button
                      onClick={() => updateFormData('allowSelfRegistration', !formData.allowSelfRegistration)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.allowSelfRegistration ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.allowSelfRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">Allow users to create their own accounts</p>
                </div>
                {/* Email Verification */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Email Verification Required</label>
                    <button
                      onClick={() => updateFormData('emailVerificationRequired', !formData.emailVerificationRequired)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.emailVerificationRequired ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.emailVerificationRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">Require email verification for new accounts</p>
                </div>
                {/* Registration Approval */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Admin Approval Required</label>
                    <button
                      onClick={() => updateFormData('registrationApprovalRequired', !formData.registrationApprovalRequired)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.registrationApprovalRequired ? 'bg-orange-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.registrationApprovalRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">Require admin approval for new registrations</p>
                </div>
                {/* Default User Role */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default User Role</label>
                  <select
                    value={formData.defaultUserRole}
                    onChange={e => updateFormData('defaultUserRole', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="staff">Staff</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">Default role assigned to new users</p>
                </div>
              </div>
            </div>
            {/* Password Policy */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl sm:rounded-2xl border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Password Policy</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Minimum Length */}
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Password Length</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="6"
                      max="20"
                      value={formData.passwordMinLength}
                      onChange={(e) => updateFormData('passwordMinLength', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 min-w-[60px]">{formData.passwordMinLength} chars</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Users must create passwords with at least this many characters</p>
                </div>
                {/* Reset Interval */}
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password Reset Interval</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="30"
                      max="365"
                      value={formData.passwordResetInterval}
                      onChange={(e) => updateFormData('passwordResetInterval', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                    <span className="text-sm text-gray-700">days</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Force password reset after this many days</p>
                </div>
                {/* Password Requirements */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Password Requirements</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Require Numbers</span>
                        <input
                          type="checkbox"
                          checked={formData.passwordRequireNumbers}
                          onChange={(e) => updateFormData('passwordRequireNumbers', e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Require Symbols</span>
                        <input
                          type="checkbox"
                          checked={formData.passwordRequireSymbols}
                          onChange={(e) => updateFormData('passwordRequireSymbols', e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Require Uppercase</span>
                        <input
                          type="checkbox"
                          checked={formData.passwordRequireUppercase}
                          onChange={(e) => updateFormData('passwordRequireUppercase', e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Profile Configuration */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Profile Configuration</h3>
              </div>
              {/* Default Avatar & Image Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Default Profile Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      {formData.defaultAvatar ? (
                        <img src={formData.defaultAvatar} alt="Default Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileChange('defaultAvatar', e.target.files?.[0] || null)}
                        className="hidden"
                        id="default-avatar-upload"
                      />
                      <label 
                        htmlFor="default-avatar-upload"
                        className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-md cursor-pointer hover:bg-green-200 text-sm"
                      >
                        Upload Avatar
                      </label>
                      <p className="text-xs text-gray-600 mt-1">Used when users don't upload their own photo</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Image Settings</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Allow Profile Image Upload</span>
                      <input
                        type="checkbox"
                        checked={formData.allowProfileImageUpload}
                        onChange={(e) => updateFormData('allowProfileImageUpload', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Max Size:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.profileImageMaxSize}
                        onChange={e => updateFormData('profileImageMaxSize', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                      />
                      <span className="text-sm text-gray-700">MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Academic Configuration */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl border border-indigo-100 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🗓️</span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Academic Configuration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class & Grade Levels */}
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🏫</span>
                    <h4 className="text-sm font-semibold text-gray-700">Class & Grade Levels</h4>
                  </div>
                  <ul className="mb-2 space-y-1">
                    {formData.classLevels.map((level: any, idx: number) => (
                      <li key={level.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={level.name}
                          onChange={e => {
                            const updated = [...formData.classLevels];
                            updated[idx].name = e.target.value;
                            updateFormData('classLevels', updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <button onClick={() => updateFormData('classLevels', formData.classLevels.filter((_: any, i: number) => i !== idx))} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => updateFormData('classLevels', [...formData.classLevels, { id: Date.now(), name: '' }])}
                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >+ Add Level</button>
                </div>
                {/* Subject Management */}
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📚</span>
                    <h4 className="text-sm font-semibold text-gray-700">Subject Management</h4>
                  </div>
                  <ul className="mb-2 space-y-1">
                    {formData.subjects.map((subject: any, idx: number) => (
                      <li key={subject.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={subject.name}
                          onChange={e => {
                            const updated = [...formData.subjects];
                            updated[idx].name = e.target.value;
                            updateFormData('subjects', updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <button onClick={() => updateFormData('subjects', formData.subjects.filter((_: any, i: number) => i !== idx))} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => updateFormData('subjects', [...formData.subjects, { id: Date.now(), name: '' }])}
                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >+ Add Subject</button>
                </div>
                {/* Session/Term Configuration */}
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📆</span>
                    <h4 className="text-sm font-semibold text-gray-700">Session/Term Configuration</h4>
                  </div>
                  <ul className="mb-2 space-y-2">
                    {formData.sessions.map((session: any, idx: number) => (
                      <li key={session.id} className="mb-1">
                        <input
                          type="text"
                          value={session.name}
                          onChange={e => {
                            const updated = [...formData.sessions];
                            updated[idx].name = e.target.value;
                            updateFormData('sessions', updated);
                          }}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-1"
                        />
                        <div className="flex flex-wrap gap-1">
                          {session.terms.map((term: string, tIdx: number) => (
                            <span key={tIdx} className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">
                              <input
                                type="text"
                                value={term}
                                onChange={e => {
                                  const updated = [...formData.sessions];
                                  updated[idx].terms[tIdx] = e.target.value;
                                  updateFormData('sessions', updated);
                                }}
                                className="w-20 px-1 py-0.5 border border-gray-200 rounded text-xs mr-1"
                              />
                              <button onClick={() => {
                                const updated = [...formData.sessions];
                                updated[idx].terms = updated[idx].terms.filter((_: any, i: number) => i !== tIdx);
                                updateFormData('sessions', updated);
                              }} className="text-red-400 ml-1">×</button>
                            </span>
                          ))}
                          <button onClick={() => {
                            const updated = [...formData.sessions];
                            updated[idx].terms.push('');
                            updateFormData('sessions', updated);
                          }} className="text-xs text-indigo-600 ml-2">+ Add Term</button>
                        </div>
                        <button onClick={() => updateFormData('sessions', formData.sessions.filter((_: any, i: number) => i !== idx))} className="text-red-500 hover:text-red-700 text-xs mt-1">Remove Session</button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => updateFormData('sessions', [...formData.sessions, { id: Date.now(), name: '', terms: [] }])}
                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >+ Add Session</button>
                </div>
                {/* Grading System */}
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📝</span>
                    <h4 className="text-sm font-semibold text-gray-700">Grading System</h4>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-gray-700">Pass Mark:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.grading.passMark}
                      onChange={e => updateFormData('grading', { ...formData.grading, passMark: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                  <table className="w-full text-xs mb-2">
                    <thead>
                      <tr>
                        <th className="text-left py-1">Grade</th>
                        <th className="text-center py-1">Min</th>
                        <th className="text-center py-1">Max</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.grading.grades.map((grade: any, idx: number) => (
                        <tr key={grade.letter}>
                          <td className="py-1 font-bold">{grade.letter}</td>
                          <td className="py-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grade.min}
                              onChange={e => {
                                const updated = [...formData.grading.grades];
                                updated[idx].min = parseInt(e.target.value);
                                updateFormData('grading', { ...formData.grading, grades: updated });
                              }}
                              className="w-12 px-1 py-0.5 border border-gray-200 rounded text-xs"
                            />
                          </td>
                          <td className="py-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grade.max}
                              onChange={e => {
                                const updated = [...formData.grading.grades];
                                updated[idx].max = parseInt(e.target.value);
                                updateFormData('grading', { ...formData.grading, grades: updated });
                              }}
                              className="w-12 px-1 py-0.5 border border-gray-200 rounded text-xs"
                            />
                          </td>
                          <td className="py-1 text-center">
                            <button onClick={() => {
                              const updated = formData.grading.grades.filter((_: any, i: number) => i !== idx);
                              updateFormData('grading', { ...formData.grading, grades: updated });
                            }} className="text-red-400 text-xs">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={() => updateFormData('grading', { ...formData.grading, grades: [...formData.grading.grades, { letter: '', min: 0, max: 0 }] })}
                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >+ Add Grade</button>
                </div>
                {/* Timetable Format & Rules */}
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📅</span>
                    <h4 className="text-sm font-semibold text-gray-700">Timetable Format & Rules</h4>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-700">Max Periods/Day:</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.timetable.maxPeriodsPerDay}
                      onChange={e => updateFormData('timetable', { ...formData.timetable, maxPeriodsPerDay: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                    <span className="text-xs text-gray-700">Min Break (min):</span>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={formData.timetable.minBreakMinutes}
                      onChange={e => updateFormData('timetable', { ...formData.timetable, minBreakMinutes: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <p className="text-xs text-gray-600">Set rules for daily periods and minimum break time</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Roles & Permissions':
        return (
          <div className="space-y-6">
            <div className="grid gap-6">
              {formData.roles.map((role, index) => (
                <div key={role.id} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-red-100 text-red-600' :
                        index === 1 ? 'bg-blue-100 text-blue-600' :
                        index === 2 ? 'bg-green-100 text-green-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      Edit Permissions
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {modules.map((module: typeof modules[number]) => (
                      <div key={module.key} className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">{module.name}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {permissionLevels.map((level: typeof permissionLevels[number]) => (
                            <label key={level.key} className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={role.permissions[module.key as keyof typeof role.permissions][level.key as keyof typeof role.permissions.dashboard]}
                                onChange={() => {
                                  const updatedPermissions = { ...role.permissions };
                                  updatedPermissions[module.key as keyof typeof role.permissions] = {
                                    ...updatedPermissions[module.key as keyof typeof role.permissions],
                                    [level.key as keyof typeof role.permissions.dashboard]: !updatedPermissions[module.key as keyof typeof role.permissions][level.key as keyof typeof role.permissions.dashboard]
                                  };
                                  updateFormData('roles', formData.roles.map(r => r.id === role.id ? { ...r, permissions: updatedPermissions } : r));
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{level.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Security':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">Password Policy</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Minimum Password Length</span>
                  <input
                    type="number"
                    defaultValue="8"
                    min="6"
                    max="20"
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Require Special Characters</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Password Expiry (days)</span>
                  <input
                    type="number"
                    defaultValue="90"
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type={formData.showPassword ? "text" : "password"}
                    placeholder="Current admin password"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => updateFormData('showPassword', !formData.showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {formData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  <p className="text-xs text-green-600 mt-1">✓ Currently enabled</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                  Configure
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {tabIcons[activeTab]}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{activeTab} Settings</h3>
            <p className="text-gray-600 mb-6">Configure your {activeTab.toLowerCase()} preferences and options.</p>
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Advanced configuration options for {activeTab.toLowerCase()} management will be available here.</p>
              </div>
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200">
                Configure {activeTab}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Admin Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your system configuration and preferences</p>
        </div>

        {/* Main Settings Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden mx-1 sm:mx-0">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
            <div className="flex overflow-x-auto custom-scrollbar">
              {settingsTabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap border-b-2 min-w-[120px] sm:min-w-[140px] ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 bg-blue-50/80'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  }`}
                  style={{
                    transform: activeTab === tab ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: activeTab === tab ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                  }}
                >
                  <span className={`transition-colors duration-300 ${activeTab === tab ? 'text-blue-500' : 'text-gray-400'} hidden sm:block`}>
                    {tabIcons[tab]}
                  </span>
                  <span className="truncate">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div 
              key={activeTab}
              className="animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {renderTabContent()}
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Changes are saved automatically</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Reset
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm">
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="mt-4 sm:mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-1 sm:px-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">System Status</h3>
                <p className="text-xs sm:text-sm text-green-600">All systems operational</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">Performance</h3>
                <p className="text-xs sm:text-sm text-blue-600">Optimal</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">Security</h3>
                <p className="text-xs sm:text-sm text-purple-600">High security level</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-right-4 {
          from { transform: translateX(1rem); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out, slide-in-from-right-4 0.3s ease-out;
        }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #3B82F6 #E5E7EB; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3B82F6; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #E5E7EB; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default AdminSettingsPage;