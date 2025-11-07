import { useState } from 'react';
import { 
  Settings, 
  Palette, 
  MessageSquare, 
  Shield, 
  FileText, 
  CreditCard, 
  Lock, 
  Zap,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import GeneralTab from '@/components/dashboards/admin/settingtab/components/tabs/GeneralTab';
import DesignTab from '@/components/dashboards/admin/settingtab/components/tabs/DesignTab';
import CommunicationTab from '@/components/dashboards/admin/settingtab/components/tabs/CommunicationTab';
import RolesPermissionsTab from '@/components/dashboards/admin/settingtab/components/tabs/RolesPermissions';
import ExamsResult2 from '@/components/dashboards/admin/settingtab/components/tabs/ExamsResultTab';
import AcademicTab from '@/components/dashboards/admin/settingtab/components/tabs/AcademicTab';
import AcademicCalendarTab from '@/components/dashboards/admin/settingtab/components/tabs/AcademicCalendarTab';
import FinanceTab from '@/components/dashboards/admin/settingtab/components/tabs/Finance';
import SecurityTab from '@/components/dashboards/admin/settingtab/components/tabs/Security';
import AdvancedTab from '@/components/dashboards/admin/settingtab/components/tabs/Advanced';
import { useSettings } from '@/contexts/SettingsContext';
import SettingsService from '@/services/SettingsService';

const SettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { settings, loading, error, setError, refreshSettings } = useSettings();

  const handleSettingsUpdate = async (updatedSettings: any) => {
    try {
      console.log('Dashboard: Updating settings:', updatedSettings);
      
      const savedSettings = await SettingsService.updateSettings(updatedSettings);
      
      console.log('Dashboard: Settings updated successfully:', savedSettings);
      setSuccessMessage('Settings saved successfully!');
      setError(null);
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Refresh context to sync across the entire application
      await refreshSettings();
    } catch (err: any) {
      console.error('Dashboard: Error saving settings:', err);
      const errorMessage = err.message || 'Failed to save settings';
      setError(errorMessage);
      setSuccessMessage(null);
    }
  };

  const handleRetry = async () => {
    setError(null);
    await refreshSettings();
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, component: GeneralTab },
    { id: 'design', label: 'Design', icon: Palette, component: DesignTab },
    { id: 'communication', label: 'Communication', icon: MessageSquare, component: CommunicationTab },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield, component: RolesPermissionsTab },
    { id: 'academic', label: 'Academic', icon: GraduationCap, component: AcademicTab },
    { id: 'exams', label: 'Exams & Result', icon: FileText, component: ExamsResult2 },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar, component: AcademicCalendarTab },
    { id: 'finance', label: 'Finance', icon: CreditCard, component: FinanceTab },
    { id: 'security', label: 'Security', icon: Lock, component: SecurityTab },
    { id: 'advanced', label: 'Advanced', icon: Zap, component: AdvancedTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || GeneralTab;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right">
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors duration-300">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Manage your application preferences and configurations</p>
        </div>
        
        {/* Header Bar with Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 mb-6 transition-colors duration-300">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors duration-200 ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`} />
                  <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-2 text-slate-600 dark:text-slate-400 transition-colors duration-300">Loading settings...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 transition-colors duration-300 mb-2">{error}</p>
                <div className="flex gap-2 justify-center mt-4">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                  >
                    Refresh Page
                  </button>
                  <button 
                    onClick={handleRetry}
                    className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ActiveComponent 
              settings={settings} 
              onSettingsUpdate={handleSettingsUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;