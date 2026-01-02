
import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  School,
  Clock,
  FileText,
  BarChart3,
  CheckSquare,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Key,
  Calendar,
  Menu,
  X,
  PenTool
} from 'lucide-react';
import StudentResultChecker from './StudentResultChecker';
import TokenGenerator from '@/pages/admin/TokenGenerator';
import {
  UserProfile,
  AdminDashboardStats,
  AdminUserManagement,
  UserRole,
  FullUserData,
  Student,
  Teacher,
  Parent,
  Message,
  Classroom,
  DashboardStats,
  AttendanceData
} from '@/types/types';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '@/contexts/DesignContext';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getAbsoluteUrl } from '@/utils/urlUtils';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

interface AdminDashboardProps {
  dashboardStats: DashboardStats | null;
  students: Student[] | null;
  teachers: Teacher[] | null;
  parents: Parent[] | null;
  attendanceData: AttendanceData | null;
  classrooms: Classroom[] | null;
  messages: Message[] | null;
  userProfile: UserProfile | null;
  notificationCount: number;
  messageCount: number;
  onRefresh: () => void;
  currentUser?: FullUserData | null;
  onLogout?: () => void;
  isAdmin?: boolean;
  adminMethods?: {
    getUsers: (params?: {
      page?: number;
      limit?: number;
      role?: UserRole;
      search?: string;
      is_active?: boolean;
      is_verified?: boolean;
    }) => Promise<{
      users: AdminUserManagement[];
      total: number;
      page: number;
      total_pages: number;
    }>;
    getDashboardStats: () => Promise<AdminDashboardStats>;
    getUserProfile: (userId: number) => Promise<UserProfile>;
  };
  children?: React.ReactNode;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dashboardStats,
  students,
  teachers,
  classrooms,
  userProfile,
  currentUser,
  onLogout,
  children
}) => {
  const { settings: designSettings } = useDesign();
  const { isDarkMode } = useGlobalTheme();
  const [activeItem, setActiveItem] = useState('Home');
  const { settings } = useSettings();
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  const [showStudentResultChecker, setShowStudentResultChecker] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    canViewStudents, 
    canViewTeachers, 
    canViewAttendance, 
    canViewSettings,
    canViewAdminList,
    canAccessPasswordRecovery,
    isSuperAdmin,
    isSectionAdmin
  } = usePermissions();
  const { user } = useAuth();

  const navigate = useNavigate();

  // Get real data from props with proper validation
  const totalStudents = dashboardStats?.totalStudents || (Array.isArray(students) ? students.length : 0);
  const totalTeachers = dashboardStats?.totalTeachers || (Array.isArray(teachers) ? teachers.length : 0);
  const totalClasses = dashboardStats?.totalClasses || (Array.isArray(classrooms) ? classrooms.length : 0);

  // Calculate gender distribution from real data with proper type checking
  const maleStudents = Array.isArray(students) 
    ? students.filter(s => s.gender && s.gender.toLowerCase() === 'male').length 
    : 0;
  const femaleStudents = Array.isArray(students) 
    ? students.filter(s => s.gender && s.gender.toLowerCase() === 'female').length 
    : 0;

  // Handle window resize - close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // goodBuild navigation items with proper permission checks
  const buildNavigationItems = () => {
    const items: Array<{
      name: string;
      icon: any;
      path: string;
      active?: boolean;
      hasDropdown?: boolean;
    }> = [
      { name: 'Home', icon: Home, active: true, path: '/admin/dashboard' },
    ];

    // Teachers - visible to all admins
    if (canViewTeachers()) {
      items.push({ name: 'Teachers', icon: Users, path: '/admin/teachers' });
    }

    // goodStudents - visible to all admins
    if (canViewStudents()) {
      items.push({ name: 'Students', icon: GraduationCap, path: '/admin/students' });
    }

    // goodAttendance - visible to all admins
    if (canViewAttendance()) {
      items.push({ name: 'Attendance', icon: CheckSquare, path: '/admin/attendance' });
    }

    // Parents - visible to all admins
    items.push({ name: 'Parents', icon: UserCheck, path: '/admin/parents' });

    // goodAdmins - ONLY visible to superadmin and admin roles
    if (canViewAdminList()) {
      items.push({ name: 'Admins', icon: User, path: '/admin/admins' });
    }

    // goodPassword Recovery - ONLY visible to superadmin and admin roles
    if (canAccessPasswordRecovery()) {
      items.push({ name: 'Password Recovery', icon: Key, path: '/admin/password-recovery' });
    }

    // Academic modules - visible to all admins
    items.push(
      { name: 'Subjects', icon: BookOpen, path: '/admin/subjects' },
      { name: 'Classes', icon: School, path: '/admin/classes' },
      { name: 'Lessons', icon: Clock, path: '/admin/lessons' },
      { name: 'Exams', icon: FileText, path: '/admin/exams' },
      { name: 'Exam Schedules', icon: Calendar, path: '/admin/exam-schedules' },
      { name: 'Results', icon: BarChart3, path: '/admin/results' },
      { name: 'Result Checker', icon: Search, path: '/admin/result-checker' },
      { name: 'Admin Remarks', icon: PenTool, path: '/admin/admin-remarks' },
      { name: 'Student Result Checker', icon: Search, path: '/admin/student-result-checker' },
      { name: 'Token-Generator', icon: Key, path: '/admin/token-generator' }
    );

    // Communication modules - visible to all admins
    items.push(
      { name: 'Messages', icon: MessageSquare, path: '/admin/messages' },
      { name: 'Announcements', icon: Bell, path: '/admin/announcements' }
    );

    // goodSettings - ONLY visible to superadmin and admin roles
    if (canViewSettings()) {
      items.push({ name: 'Settings', icon: Settings, path: '/admin/settings' });
    }

    // Profile - visible to all
    items.push({ name: 'Profile', icon: User, path: '/admin/profile' });

    return items;
  };
  

  const navigationItems = buildNavigationItems();

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userProfile');
      }
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      navigate('/', { replace: true });
    }
  };

  const [showTokenGenerator, setShowTokenGenerator] = useState(false);


  const handleNavigationClick = (itemName: string, path?: string) => {
    setActiveItem(itemName);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
    
    if (itemName === 'Student Result Checker') {
      setShowStudentResultChecker(true);
      return;
    }

    if (itemName === 'Result Token Generator') {
    setShowTokenGenerator(true);
    return;
  }
     
    if (path) navigate(path);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setStudentDropdownOpen(false);
    setTeacherDropdownOpen(false);
    setParentDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderNavItem = (item: any) => {
    const isActive = activeItem === item.name;
    if (item.hasDropdown) {
      const isDropdownOpen =
        (item.name === 'Students' && studentDropdownOpen) ||
        (item.name === 'Teachers' && teacherDropdownOpen) ||
        (item.name === 'Parents' && parentDropdownOpen);
      return (
        <div key={item.name} className="relative">
          <button
            onClick={() => {
              handleNavigationClick(item.name, item.path);
              if (item.name === 'Students') setStudentDropdownOpen(!studentDropdownOpen);
              else if (item.name === 'Teachers') setTeacherDropdownOpen(!teacherDropdownOpen);
              else if (item.name === 'Parents') setParentDropdownOpen(!parentDropdownOpen);
            }}
            className={`
              group w-full flex items-center mb-1 rounded-xl text-left 
              transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]
              ${isSidebarCollapsed ? 'h-14 px-2 py-2 justify-center' : 'h-14 px-3 py-2'}
              ${isActive 
                ? 'text-white shadow-lg' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
              }
            `}
            style={isActive ? {
              background: designSettings?.theme === 'premium'
                ? 'linear-gradient(135deg, #dc2626 0%, #1e3a8a 50%, #1e40af 100%)'
                : `linear-gradient(135deg, ${designSettings?.primary_color || '#3B82F6'} 0%, ${designSettings?.primary_color || '#3B82F6'}80 100%)`,
              boxShadow: designSettings?.theme === 'premium'
                ? '0 10px 15px -3px rgba(220, 38, 38, 0.25)'
                : `0 10px 15px -3px ${designSettings?.primary_color || '#3B82F6'}25`
            } : {}}
            title={isSidebarCollapsed ? item.name : ''}
          >
            <div
              className={`
                flex items-center justify-center rounded-lg transition-all duration-300
                w-10 h-10
                ${!isSidebarCollapsed ? 'mr-3' : ''}
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="font-medium truncate">{item.name}</span>
                <ChevronDown className={`
                  w-4 h-4 transition-transform duration-300 ease-out flex-shrink-0 ml-2
                  ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}
                `} />
              </div>
            )}
          </button>
          {isDropdownOpen && !isSidebarCollapsed && (
            <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-1">
                <button className="block w-full text-left px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  View {item.name}
                </button>
                <button className="block w-full text-left px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  {item.name} Details
                </button>
                <button className="block w-full text-left px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  Add {item.name.slice(0, -1)}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <button
        key={item.name}
        onClick={() => handleNavigationClick(item.name, item.path)}
        className={`
          group w-full flex items-center mb-1 rounded-xl text-left 
          transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]
          ${isSidebarCollapsed ? 'h-14 px-2 py-2 justify-center' : 'h-14 px-3 py-2'}
          ${isActive 
            ? 'text-white shadow-lg' 
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
          }
        `}
        style={isActive ? {
          background: designSettings?.theme === 'premium'
            ? 'linear-gradient(135deg, #dc2626 0%, #1e3a8a 50%, #1e40af 100%)'
            : `linear-gradient(135deg, ${designSettings?.primary_color || '#3B82F6'} 0%, ${designSettings?.primary_color || '#3B82F6'}80 100%)`,
          boxShadow: designSettings?.theme === 'premium'
            ? '0 10px 15px -3px rgba(220, 38, 38, 0.25)'
            : `0 10px 15px -3px ${designSettings?.primary_color || '#3B82F6'}25`
        } : {}}
        title={isSidebarCollapsed ? item.name : ''}
      >
        <div
          className={`
            flex items-center justify-center rounded-lg transition-all duration-300
            w-10 h-10
            ${!isSidebarCollapsed ? 'mr-3' : ''}
            ${isActive 
              ? 'bg-white/20 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'
            }
          `}
        >
          <item.icon className="w-5 h-5" />
        </div>
        {!isSidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <span className="font-medium truncate block">{item.name}</span>
          </div>
        )}
      </button>
    );
  };

  // goodGet admin role display name
  const getAdminRoleDisplay = () => {
    if (isSuperAdmin()) return 'Super Admin';
    if (isSectionAdmin()) {
      const role = user?.role || '';
      if (role === 'primary_admin') return 'Primary Section Admin';
      if (role === 'nursery_admin') return 'Nursery Section Admin';
      if (role === 'secondary_admin') return 'Secondary Section Admin';
      if (role === 'senior_secondary_admin') return 'Senior Secondary Admin';
      if (role === 'junior_secondary_admin') return 'Junior Secondary Admin';
    }
    return 'Admin';
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}
    >
      <div className="flex h-screen">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          transition-all duration-500 ease-out bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-y-auto h-full
          ${isSidebarCollapsed ? 'w-20' : 'w-72'}
          md:relative md:translate-x-0
          fixed z-50 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 relative">
            <div className="flex items-center overflow-hidden">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105">
                {settings?.logo ? (
                  <img 
                    src={getAbsoluteUrl(settings.logo)} 
                    alt={`${settings.school_name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <GraduationCap className="w-6 h-6 text-white" />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="ml-3 transition-all duration-300 overflow-hidden opacity-100 w-auto">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {settings?.school_name || "God's Treasure Schools"}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{getAdminRoleDisplay()}</p>
                </div>
              )}
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="
                md:hidden absolute top-6 right-6
                w-8 h-8 flex items-center justify-center rounded-lg
                text-slate-600 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-all duration-200
              "
            >
              <X className="w-5 h-5" />
            </button>

            {/* Toggle Button (Desktop only) */}
            <button
              onClick={toggleSidebar}
              className="
                hidden md:flex
                absolute top-1/2 -translate-y-1/2 -right-5 z-50
                w-10 h-10 items-center justify-center rounded-full 
                transition-all duration-300 hover:scale-110 active:scale-95
                bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                text-white shadow-xl hover:shadow-2xl
                border-2 border-white dark:border-slate-800
              "
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" strokeWidth={3} />
              ) : (
                <ChevronLeft className="w-5 h-5" strokeWidth={3} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navigationItems.map(renderNavItem)}
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center mb-1 rounded-xl text-left 
                transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] 
                text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50
                ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'}
              `}
              title={isSidebarCollapsed ? 'Logout now' : ''}
            >
              <div className={`
                flex items-center justify-center rounded-lg transition-all duration-300
                ${isSidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-3'}
                bg-slate-100 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/30
              `}>
                <LogOut className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate block">Logout now</span>
                </div>
              )}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              onClick={toggleMobileMenu}
              className="
                w-10 h-10 flex items-center justify-center rounded-lg
                text-slate-600 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-all duration-200
              "
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {settings?.school_name || getAdminRoleDisplay()}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          <div className="p-4 md:p-6 pt-4 md:pt-8">
            {children}
          </div>
        </div>
        
        {/* goodFloating Action Button for Password Recovery - Only show if user has permission */}
        {canAccessPasswordRecovery() && (
          <button
            onClick={() => navigate('/admin/password-recovery')}
            className={`
              fixed bottom-6 right-6 z-40
              w-14 h-14 flex items-center justify-center rounded-full 
              transition-all duration-300 hover:scale-110 active:scale-95
              bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
              text-white shadow-xl hover:shadow-2xl
              border-2 border-white dark:border-slate-800
              ${isMobileMenuOpen ? 'md:flex hidden' : 'flex'}
            `}
            title="Password Recovery"
          >
            <Key className="w-6 h-6" strokeWidth={2} />
          </button>
        )}

        {/* Student Result Checker Modal */}
        {showStudentResultChecker && (
          <StudentResultChecker onClose={() => setShowStudentResultChecker(false)} />
        )}
          {showTokenGenerator && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
          <div className="min-h-screen flex items-start justify-center pt-8 pb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4">
             {/* Close Button */}
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Result Token Generator</h2>
                  <button
                     onClick={() => setShowTokenGenerator(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-slate-400" />
                  </button>
              </div>

            {/* Component Content */}
            <div className="p-6">
            <TokenGenerator />
            </div>

      </div>
      
    </div>
    
  </div>
)}        
      </div>
    </div>
  );
};

export default AdminDashboard;