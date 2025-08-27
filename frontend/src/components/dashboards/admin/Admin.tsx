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
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
  Key,
  AlertTriangle
} from 'lucide-react';
import {
  UserProfile,  
 
  AdminDashboardStats, 
  AdminUserManagement, 
  UserRole, 
  FullUserData,
  StudentUserData,
  TeacherUserData,
  ParentUserData,
  Student,
  Teacher,
  CustomUser,
  Parent,
  Message,
  Classroom,
  DashboardStats,
  AttendanceData,
  DailyAttendance} from '@/types/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '@/contexts/DesignContext';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getAbsoluteUrl } from '@/utils/urlUtils';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useAuthLostContext } from '@/components/common/AuthLostProvider';
import { 
  StudentsPermissionGate, 
  TeachersPermissionGate, 
  AttendancePermissionGate,
  SettingsPermissionGate 
} from '@/components/common/PermissionGate';

// Define proper typescript interface
interface AdminDashboardProps {
  dashboardStats: DashboardStats | null;
  students: Student[] | null;
  teachers: Teacher[] | null;
  parents: any[] | null;
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
  parents,
  attendanceData,
  classrooms,
  messages,
  userProfile,
  notificationCount,
  messageCount,
  onRefresh,
  currentUser,
  onLogout,
  isAdmin,
  adminMethods,
  children
}) => {
  const { settings: designSettings } = useDesign();
  const { isDarkMode, toggleTheme } = useGlobalTheme();
  const [activeItem, setActiveItem] = useState('Home');
  const [currentDate] = useState(new Date());
  const [showMessageDropdown, setShowMessageDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
   const { settings } = useSettings();
  // Add state for dropdowns and selected subtab
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [selectedStudentTab, setSelectedStudentTab] = useState('Students');
  const [selectedTeacherTab, setSelectedTeacherTab] = useState('Teachers');
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { canViewStudents, canViewTeachers, canViewAttendance, canViewSettings } = usePermissions();
  const { user } = useAuth();
  const { showAuthLost } = useAuthLostContext();
  
  // Super admin access check
  const isSuperAdmin = user?.is_superuser && user?.is_staff;
  


const navigate = useNavigate();
console.log('Here is the userprofile', userProfile)

  console.log("This is the user profile", userProfile);
  console.log("Dashboard Stats:", dashboardStats);
  console.log("Students:", students);
  console.log("Teachers:", teachers);
  console.log("Parents:", parents);
  console.log("Attendance Data:", attendanceData);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowMessageDropdown(false);
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get real data from props with proper validation
  const totalStudents = dashboardStats?.totalStudents || (Array.isArray(students) ? students.length : 0);
  const totalTeachers = dashboardStats?.totalTeachers || (Array.isArray(teachers) ? teachers.length : 0);
  const totalClasses = dashboardStats?.totalClasses || (Array.isArray(classrooms) ? classrooms.length : 0);
  const totalUsers = dashboardStats?.totalUsers || 0;
  const activeUsers = dashboardStats?.activeUsers || 0;
  const inactiveUsers = dashboardStats?.inactiveUsers || 0;
  const pendingVerifications = dashboardStats?.pendingVerifications || 0;
  const recentRegistrations = dashboardStats?.recentRegistrations || 0;
console.log("Total Students:", totalStudents);
  console.log("Total Teachers:", totalTeachers);
  console.log("Total Classes:", totalClasses);
  console.log("Total Users:", totalUsers); 
  console.log("Active Users:", activeUsers);
  console.log("Inactive Users:", inactiveUsers);
  console.log("Pending Verfification:", pendingVerifications);
  console.log("Recent Registrations:", recentRegistrations);
  // Calculate gender distribution from real data with validation
  const maleStudents = Array.isArray(students) ? students.filter(s => s.gender === 'male').length : 0;
  const femaleStudents = Array.isArray(students) ? students.filter(s => s.gender === 'female').length : 0;
  const totalStudentsForGender = maleStudents + femaleStudents;
  console.log(totalStudentsForGender);

  // Validate processedAttendanceData
  const processedAttendanceData = Array.isArray(attendanceData?.dailyAttendance) 
    ? attendanceData.dailyAttendance.map((entry) => ({
        date: entry.date,
        present: entry.present || 0,
        absent: entry.absent || 0
      }))
    : [];

  const totalPresent = processedAttendanceData.reduce((sum, entry) => sum + (entry.present || 0), 0);
  const totalAbsent = processedAttendanceData.reduce((sum, entry) => sum + (entry.absent || 0), 0);

  // Get user display name from real data
  const getUserDisplayName = () => {
    if (userProfile?.user?.first_name) {
      const firstName = userProfile.user.first_name || '';
      const middleName = userProfile.user_middle_name || '';
      const lastName = userProfile.user.last_name || '';
      return `${firstName} ${middleName} ${lastName}`.trim() || userProfile.user.username || 'User';
    }
    if (currentUser?.first_name) {
      return `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() || currentUser.email || 'User';
    }
    return 'Admin User';
  };

  // Dummy messages and notifications for demonstration
  const dummyMessages = [
    {
      id: 1,
      title: 'New Student Registration',
      content: 'A new student has registered for Grade 10. Please review their application.',
      created_at: '2024-01-15T10:30:00Z',
      is_read: false,
      sender: 'System'
    },
    {
      id: 2,
      title: 'Teacher Meeting Reminder',
      content: 'Staff meeting scheduled for tomorrow at 3 PM in the conference room.',
      created_at: '2024-01-15T09:15:00Z',
      is_read: false,
      sender: 'Principal'
    },
    {
      id: 3,
      title: 'Exam Schedule Update',
      content: 'Mid-term examinations have been rescheduled. Check the updated timetable.',
      created_at: '2024-01-15T08:45:00Z',
      is_read: true,
      sender: 'Academic Department'
    }
  ];

  const dummyNotifications = [
    {
      id: 1,
      title: 'Attendance Alert',
      content: '5 students have been absent for 3 consecutive days',
      type: 'warning',
      created_at: '2024-01-15T11:00:00Z',
      is_read: false
    },
    {
      id: 2,
      title: 'Fee Payment Due',
      content: 'Monthly fee collection deadline is approaching',
      type: 'info',
      created_at: '2024-01-15T10:30:00Z',
      is_read: false
    },
    {
      id: 3,
      title: 'System Maintenance',
      content: 'Scheduled maintenance tonight from 10 PM to 2 AM',
      type: 'info',
      created_at: '2024-01-15T09:00:00Z',
      is_read: true
    }
  ];


  
  const navigationItems = [
    { name: 'Home', icon: Home, active: true, path: '/admin/dashboard' },
    // Show all items for super admins, or filter based on permissions for regular users
    ...(isSuperAdmin ? [
      { name: 'Teachers', icon: Users, path: '/admin/teachers' },
      { name: 'Students', icon: GraduationCap, path: '/admin/students' },
      { name: 'Attendance', icon: CheckSquare, path: '/admin/attendance' }
    ] : [
      ...(canViewTeachers() ? [{ name: 'Teachers', icon: Users, path: '/admin/teachers' }] : []),
      ...(canViewStudents() ? [{ name: 'Students', icon: GraduationCap, path: '/admin/students' }] : []),
      ...(canViewAttendance() ? [{ name: 'Attendance', icon: CheckSquare, path: '/admin/attendance' }] : [])
    ]),
    { name: 'Parents', icon: UserCheck, path: '/admin/parents' },
    { name: 'Admins', icon: User, path: '/admin/admins' },
    { name: 'Password Recovery', icon: Key, path: '/admin/password-recovery' },
    { name: 'Subjects', icon: BookOpen, path: '/admin/subjects' },
    { name: 'Classes', icon: School, path: '/admin/classes' },
    { name: 'Lessons', icon: Clock, path: '/admin/lessons' },
    { name: 'Exams', icon: FileText, path: '/admin/exams' },
    { name: 'Results', icon: BarChart3, path: '/admin/results' },
    { name: 'Messages', icon: MessageSquare, path: '/admin/messages' },
    { name: 'Announcements', icon: Bell, path: '/admin/announcements' },
    // Show Settings second to last for super admins, or based on permissions for regular users
    ...(isSuperAdmin ? [
      { name: 'Settings', icon: Settings, path: '/admin/settings' }
    ] : [
      ...(canViewSettings() ? [{ name: 'Settings', icon: Settings, path: '/admin/settings' }] : [])
    ]),
    { name: 'Profile', icon: User, path: '/admin/profile' },
    // { name: 'Logout', icon: LogOut, path: '/logout' }
  ];

  const noticeItems = [
    {
      title: 'School annual sports day celebration 2024',
      date: '20 January, 2024',
      views: '20k',
      image: '🏆'
    },
    {
      title: 'Annual Function celebration 2023-24',
      date: '05 January, 2024',
      views: '15k',
      image: '🎭'
    },
    {
      title: 'Mid term examination routine published',
      date: '15 December, 2023',
      views: '22k',
      image: '📚'
    },
    {
      title: 'Inter school annual painting competition',
      date: '18 December, 2023',
      views: '18k',
      image: '🎨'
    }
  ];

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Handle logout
  const handleLogout = async () => {
    console.log('🔄 Admin Dashboard: Starting logout process...');
    
    try {
      if (onLogout) {
        console.log('🔄 Admin Dashboard: Using provided logout function');
        await onLogout();
        console.log('✅ Admin Dashboard: Logout function completed successfully');
      } else {
        console.log('🔄 Admin Dashboard: Using fallback logout');
        // Fallback logout
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userProfile');
        console.log('✅ Admin Dashboard: Fallback logout completed');
      }
      
      console.log('🔄 Admin Dashboard: Navigating to home page...');
      navigate('/', { replace: true });
      console.log('✅ Admin Dashboard: Navigation to home page completed');
      
    } catch (error) {
      console.error('❌ Admin Dashboard: Logout failed:', error);
      // Even if logout fails, clear local data and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      navigate('/', { replace: true });
    }
  };

  // Handle navigation item click
  const handleNavigationClick = (itemName: string, path?: string) => {
      setActiveItem(itemName);
    if (path) navigate(path);
  };

  // Toggle dropdowns
  const toggleMessageDropdown = () => {
    setShowMessageDropdown(!showMessageDropdown);
    setShowNotificationDropdown(false);
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowMessageDropdown(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setStudentDropdownOpen(false);
    setTeacherDropdownOpen(false);
    setParentDropdownOpen(false);
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

  // Helper: Table for students/teachers with authentication checkbox
  const renderUserTable = (users: any[], type: 'student' | 'teacher') => (
    <table className="min-w-full bg-white rounded-lg overflow-hidden">
      <thead>
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2">Authenticated</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, idx) => (
          <tr key={user.id || idx} className="border-t">
            <td className="px-4 py-2">{user.user?.first_name} {user.user?.last_name}</td>
            <td className="px-4 py-2">{user.user?.email}</td>
            <td className="px-4 py-2 text-center">
              <input
                type="checkbox"
                checked={user.user?.is_active || false}
                onChange={() => { /* TODO: Implement backend update */ }}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Helper: Main content for dropdowns
  const renderDropdownContent = () => {
    if (activeItem === 'Students') {
      if (selectedStudentTab === 'Students') {
        return renderUserTable(Array.isArray(students) ? students : [], 'student');
      }
      return <div className="p-8 text-center text-gray-500">{selectedStudentTab} screen coming soon.</div>;
    }
    if (activeItem === 'Teachers') {
      if (selectedTeacherTab === 'Teachers') {
        return renderUserTable(Array.isArray(teachers) ? teachers : [], 'teacher');
      }
      return <div className="p-8 text-center text-gray-500">{selectedTeacherTab} screen coming soon.</div>;
    }
    return null;
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh'
      }}
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`transition-all duration-500 ease-out ${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-y-auto h-full`}>
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 relative">
            <div className="flex items-center overflow-hidden">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105">
                            {settings?.logo_url ? (
                              <img 
                                src={getAbsoluteUrl(settings.logo_url)} 
                                alt={`${settings.school_name} logo`}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  console.error('Navbar logo failed to load:', getAbsoluteUrl(settings.logo_url));
                                  e.currentTarget.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Navbar logo loaded successfully:', getAbsoluteUrl(settings.logo_url));
                                }}
                              />
                            ) : (
                              <GraduationCap className="w-6 h-6 text-white" />
                            )}
                          </div>
              {!isSidebarCollapsed && (
                <div className="ml-3 transition-all duration-300 overflow-hidden opacity-100 w-auto">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">God's Treasure Schools</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Admin Portal</p>
                </div>
              )}
            </div>
            
            {/* Toggle Button - Perfect Circle at the edge */}
            <button
              onClick={toggleSidebar}
              className="
                absolute top-1/2 -translate-y-1/2 -right-5 z-50
                w-10 h-10 flex items-center justify-center rounded-full 
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
                ${isSidebarCollapsed 
                  ? 'w-10 h-10' 
                  : 'w-10 h-10 mr-3'
                }
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
          <div className="p-6 pt-8">
            {children}
          </div>
        </div>
        
        {/* Floating Action Button for Password Recovery */}
        <button
          onClick={() => navigate('/admin/password-recovery')}
          className="
            fixed bottom-6 right-6 z-50
            w-14 h-14 flex items-center justify-center rounded-full 
            transition-all duration-300 hover:scale-110 active:scale-95
            bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
            text-white shadow-xl hover:shadow-2xl
            border-2 border-white dark:border-slate-800
          "
          title="Password Recovery"
        >
          <Key className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;