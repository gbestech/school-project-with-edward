import { useState, useEffect } from 'react';
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
import ExamsResultTab from '@/components/dashboards/admin/settingtab/components/tabs/ExamsResultTab';
import AcademicTab from '@/components/dashboards/admin/settingtab/components/tabs/AcademicTab';
import AcademicCalendarTab from '@/components/dashboards/admin/settingtab/components/tabs/AcademicCalendarTab';
import FinanceTab from '@/components/dashboards/admin/settingtab/components/tabs/Finance';
import SecurityTab from '@/components/dashboards/admin/settingtab/components/tabs/Security';
import AdvancedTab from '@/components/dashboards/admin/settingtab/components/tabs/Advanced';
import { useSettings } from '@/contexts/SettingsContext';


const SettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { refreshSettings } = useSettings();

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/school-settings/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          setError('Failed to load settings');
        }
      } catch (err) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsUpdate = async (updatedSettings: any) => {
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('Sending settings to backend:', updatedSettings);
      
      const response = await fetch('/api/school-settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        const savedSettings = await response.json();
        console.log('Backend response:', savedSettings);
        setSettings(savedSettings);
        setSuccessMessage('Settings saved successfully!');
        setError(null);
        console.log('Settings saved to backend successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
        refreshSettings(); // Refresh settings in context
      } else {
        const errorData = await response.json();
        console.error('Failed to save settings to backend:', errorData);
        setError('Failed to save settings');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      setSuccessMessage(null);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, component: GeneralTab },
    { id: 'design', label: 'Design', icon: Palette, component: DesignTab },
    { id: 'communication', label: 'Communication', icon: MessageSquare, component: CommunicationTab },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield, component: RolesPermissionsTab },
    { id: 'academic', label: 'Academic', icon: GraduationCap, component: AcademicTab },
    { id: 'exams', label: 'Exams & Result', icon: FileText, component: ExamsResultTab },
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
              <p className="text-red-600 dark:text-red-400 transition-colors duration-300">{error}</p>
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