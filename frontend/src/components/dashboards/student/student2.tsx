import { useState, useEffect } from "react";
import { 
  User, Calendar, BookOpen, Trophy, Clock, CreditCard, MessageSquare, Settings,
  GraduationCap, Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
// import StudentService from '@/services/StudentService';
// import api from '@/services/api';
// import { useSettings } from '@/contexts/SettingsContext';
// import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import ResultSelection from './ResultSelection';
import ResultDisplay from './ResultDisplay';
import PortalLogin from './PortalLogin';
import DashboardContent from './DashboardContent';
import ProfileTab from './ProfileTab';
import StudentLessons from '@/pages/student/StudentLessons';

const StudentPortal = () => {
  const { user } = useAuth();
  const [portalAuthenticated, setPortalAuthenticated] = useState(false);
  
  // Get the active section from localStorage or default to 'dashboard'
  const getInitialActiveSection = () => {
    const savedSection = localStorage.getItem('studentActiveTab');
    return savedSection || 'dashboard';
  };
  
  const [activeSection, setActiveSection] = useState(getInitialActiveSection);
  const [selections, setSelections] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  // Save active section to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studentActiveTab', activeSection);
  }, [activeSection]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveSection(tabId);
  };

  // Define menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'portal', label: 'Portal', icon: GraduationCap },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'grades', label: 'Grades', icon: Trophy },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 pt-16 mt-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="md:w-64 w-full mb-8 md:mb-0">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${
                    activeSection === item.id 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600'
                  }`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <item.icon className="mr-3" size={22} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {activeSection === 'portal' && (
            !portalAuthenticated ? (
              <PortalLogin onSuccess={() => setPortalAuthenticated(true)} />
            ) : showResult ? (
              <ResultDisplay 
                selections={selections}
                studentName={user?.full_name || ''}
                onBack={() => setShowResult(false)}
              />
            ) : (
              <ResultSelection 
                onSelectionComplete={(data) => {
                  setSelections(data);
                  setShowResult(true);
                }}
                studentName={user?.full_name || ''}
              />
            )
          )}
          {activeSection === 'dashboard' && <DashboardContent />}
          {activeSection === 'profile' && <ProfileTab />}
          {activeSection === 'schedule' && (<StudentLessons/>)}
          {activeSection !== 'portal' && activeSection !== 'dashboard' && activeSection !== 'profile' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 text-center transition-colors duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Settings className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2">Coming Soon</h2>
              <p className="text-gray-600 dark:text-slate-400">The {menuItems.find(item => item.id === activeSection)?.label} section is under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;