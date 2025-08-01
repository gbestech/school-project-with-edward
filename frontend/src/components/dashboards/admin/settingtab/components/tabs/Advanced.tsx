import React, { useState } from 'react';
import { Zap, Megaphone, Calendar, Users, Shield, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';

// TypeScript interfaces
interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  scheduledDate: string;
  isPinned: boolean;
  isActive: boolean;
}

interface AnnouncementForm {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  scheduledDate: string;
  isPinned: boolean;
}

interface PortalSettings {
  enabled: boolean;
  maintenanceMode: boolean;
  greeting: string;
  customWidgets: string[];
}

interface PortalSettingsState {
  studentPortal: PortalSettings;
  parentPortal: PortalSettings;
  teacherPortal: PortalSettings;
}

const Advanced: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: 'System Maintenance Scheduled',
      content: 'The system will be under maintenance on Sunday, 2-4 AM EST.',
      type: 'warning',
      scheduledDate: '2025-08-03',
      isPinned: true,
      isActive: true
    },
    {
      id: 2,
      title: 'New Features Available',
      content: 'Check out the new gradebook features in the teacher portal.',
      type: 'info',
      scheduledDate: '2025-07-28',
      isPinned: false,
      isActive: true
    }
  ]);

  const [portalSettings, setPortalSettings] = useState<PortalSettingsState>({
    studentPortal: {
      enabled: true,
      maintenanceMode: false,
      greeting: 'Welcome back, student!',
      customWidgets: ['assignments', 'grades', 'schedule']
    },
    parentPortal: {
      enabled: true,
      maintenanceMode: false,
      greeting: 'Welcome to the parent portal!',
      customWidgets: ['student-progress', 'announcements', 'calendar']
    },
    teacherPortal: {
      enabled: true,
      maintenanceMode: true,
      greeting: 'Hello, educator!',
      customWidgets: ['gradebook', 'class-roster', 'analytics']
    }
  });

  const [showAnnouncementForm, setShowAnnouncementForm] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: '',
    content: '',
    type: 'info',
    scheduledDate: '',
    isPinned: false
  });

  const handleAnnouncementSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { ...ann, ...announcementForm }
          : ann
      ));
      setEditingAnnouncement(null);
    } else {
      const newAnnouncement: Announcement = {
        ...announcementForm,
        id: Date.now(),
        isActive: true
      };
      setAnnouncements(prev => [...prev, newAnnouncement]);
    }
    setAnnouncementForm({ title: '', content: '', type: 'info', scheduledDate: '', isPinned: false });
    setShowAnnouncementForm(false);
  };

  const handleEditAnnouncement = (announcement: Announcement): void => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      scheduledDate: announcement.scheduledDate,
      isPinned: announcement.isPinned
    });
    setShowAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = (id: number): void => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  const toggleAnnouncementStatus = (id: number): void => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === id ? { ...ann, isActive: !ann.isActive } : ann
    ));
  };

  const updatePortalSetting = (portal: string, setting: keyof PortalSettings, value: any): void => {
    setPortalSettings(prev => ({
      ...prev,
      [portal]: {
        ...prev[portal as keyof PortalSettingsState],
        [setting]: value
      }
    }));
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8">
      <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        Advanced Settings
      </h3>

      {/* Announcements & Bulletin Board */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded flex items-center justify-center">
            <Megaphone className="w-3 h-3 text-white" />
          </div>
          <h4 className="text-lg font-semibold text-slate-800">Announcements & Bulletin Board</h4>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-slate-600">Manage system-wide announcements and notices</p>
          <button
            onClick={() => setShowAnnouncementForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            aria-label="Create new announcement"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        {/* Announcement Form */}
        {showAnnouncementForm && (
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h5 className="font-semibold text-slate-800 mb-4">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h5>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                  aria-label="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                  aria-label="Announcement content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={announcementForm.type}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, type: e.target.value as AnnouncementForm['type'] }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    aria-label="Announcement type"
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    value={announcementForm.scheduledDate}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    aria-label="Announcement scheduled date"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={announcementForm.isPinned}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                  aria-label="Pin announcement to dashboard"
                />
                <label htmlFor="isPinned" className="ml-2 text-sm text-slate-700">Pin to dashboard</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  aria-label={editingAnnouncement ? 'Update announcement' : 'Create announcement'}
                >
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementForm(false);
                    setEditingAnnouncement(null);
                    setAnnouncementForm({ title: '', content: '', type: 'info', scheduledDate: '', isPinned: false });
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  aria-label="Cancel announcement form"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-lg border ${getTypeColor(announcement.type)} ${
                !announcement.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h6 className="font-semibold">{announcement.title}</h6>
                    {announcement.isPinned && (
                      <span className="px-2 py-1 text-xs bg-violet-100 text-violet-700 rounded">Pinned</span>
                    )}
                    <span className="px-2 py-1 text-xs bg-white bg-opacity-50 rounded">
                      {announcement.type}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-xs opacity-75">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Scheduled: {announcement.scheduledDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleAnnouncementStatus(announcement.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    title={announcement.isActive ? 'Deactivate' : 'Activate'}
                    aria-label={announcement.isActive ? 'Deactivate announcement' : 'Activate announcement'}
                  >
                    {announcement.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditAnnouncement(announcement)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    title="Edit"
                    aria-label={`Edit ${announcement.title}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    title="Delete"
                    aria-label={`Delete ${announcement.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portal Access Control */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center">
            <Users className="w-3 h-3 text-white" />
          </div>
          <h4 className="text-lg font-semibold text-slate-800">Portal Access Control</h4>
        </div>

        <p className="text-slate-600">Configure access and settings for each user portal</p>

        <div className="space-y-6">
          {Object.entries(portalSettings).map(([portalKey, settings]) => {
            const portalName = portalKey.replace('Portal', '').replace(/([A-Z])/g, ' $1').trim();
            const capitalizedName = portalName.charAt(0).toUpperCase() + portalName.slice(1) + ' Portal';
            
            return (
              <div key={portalKey} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-slate-600" />
                  <h5 className="font-semibold text-slate-800">{capitalizedName}</h5>
                  <span className={`px-2 py-1 text-xs rounded ${
                    settings.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {settings.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  {settings.maintenanceMode && (
                    <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">
                      Maintenance Mode
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <ToggleSwitch
                    id={`${portalKey}-enabled`}
                    checked={settings.enabled}
                    onChange={(checked) => updatePortalSetting(portalKey, 'enabled', checked)}
                    label="Portal Access"
                    description="Enable or disable access to this portal"
                  />

                  <ToggleSwitch
                    id={`${portalKey}-maintenance`}
                    checked={settings.maintenanceMode}
                    onChange={(checked) => updatePortalSetting(portalKey, 'maintenanceMode', checked)}
                    label="Maintenance Mode"
                    description="Show maintenance message to users"
                  />

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Login Greeting</label>
                    <input
                      type="text"
                      value={settings.greeting}
                      onChange={(e) => updatePortalSetting(portalKey, 'greeting', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Enter greeting message..."
                      aria-label={`Login greeting for ${capitalizedName}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Dashboard Widgets</label>
                    <div className="flex flex-wrap gap-2">
                      {settings.customWidgets.map((widget: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full flex items-center gap-2"
                        >
                          {widget.replace(/-/g, ' ')}
                          <button
                            onClick={() => {
                              const newWidgets = settings.customWidgets.filter((_: string, i: number) => i !== index);
                              updatePortalSetting(portalKey, 'customWidgets', newWidgets);
                            }}
                            className="hover:bg-violet-200 rounded-full p-0.5"
                            aria-label={`Remove ${widget} widget`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          const newWidget = prompt('Enter widget name:');
                          if (newWidget && newWidget.trim()) {
                            updatePortalSetting(portalKey, 'customWidgets', [...settings.customWidgets, newWidget.trim()]);
                          }
                        }}
                        className="px-3 py-1 border border-slate-300 text-slate-600 text-sm rounded-full hover:bg-slate-100 transition-colors"
                        aria-label={`Add widget to ${capitalizedName}`}
                      >
                        + Add Widget
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Advanced;