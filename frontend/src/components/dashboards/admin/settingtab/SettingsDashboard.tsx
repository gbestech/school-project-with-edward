import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  MessageSquare, 
  Shield, 
  GraduationCap, 
  FileText, 
  CreditCard, 
  Lock, 
  Zap,
  ChevronRight
} from 'lucide-react';
import GeneralTab from '@/components/dashboards/admin/settingtab/components/tabs/GeneralTab';
import DesignTab from '@/components/dashboards/admin/settingtab/components/tabs/DesignTab';
import CommunicationTab from '@/components/dashboards/admin/settingtab/components/tabs/CommunicationTab';
import RolesPermissionsTab from '@/components/dashboards/admin/settingtab/components/tabs/RolesPermissions';
import AcademicTab from '@/components/dashboards/admin/settingtab/components/tabs/Academic';
import ExamsResultTab from '@/components/dashboards/admin/settingtab/components/tabs/ExamsResultTab';
import FinanceTab from '@/components/dashboards/admin/settingtab/components/tabs/Finance';
import SecurityTab from '@/components/dashboards/admin/settingtab/components/tabs/Security';
import AdvancedTab from '@/components/dashboards/admin/settingtab/components/tabs/Advanced';


const SettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, component: GeneralTab },
    { id: 'design', label: 'Design', icon: Palette, component: DesignTab },
    { id: 'communication', label: 'Communication', icon: MessageSquare, component: CommunicationTab },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield, component: RolesPermissionsTab },
    { id: 'academic', label: 'Academic', icon: GraduationCap, component: AcademicTab },
    { id: 'exams', label: 'Exams & Result', icon: FileText, component: ExamsResultTab },
    { id: 'finance', label: 'Finance', icon: CreditCard, component: FinanceTab },
    { id: 'security', label: 'Security', icon: Lock, component: SecurityTab },
    { id: 'advanced', label: 'Advanced', icon: Zap, component: AdvancedTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || GeneralTab;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your application preferences and configurations</p>
        </div>

        {/* Header Bar with Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;