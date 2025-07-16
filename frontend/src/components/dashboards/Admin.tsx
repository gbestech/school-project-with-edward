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
  ChevronDown
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

// Define proper typescript interface
interface AdminDashboardProps {
  dashboardStats: DashboardStats | null;
  students: Student[] | null;
  teachers: Teacher[] | null;
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
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dashboardStats,
  students,
  teachers,
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
  adminMethods
}) => {
  const [activeItem, setActiveItem] = useState('Home');
  const [currentDate] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMessageDropdown, setShowMessageDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  console.log("This is the user profile", userProfile);
  console.log("Dashboard Stats:", dashboardStats);
  console.log("Students:", students);
  console.log("Teachers:", teachers);
  console.log("Attendance Data:", attendanceData);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get real data from props with proper validation
  const totalStudents = dashboardStats?.totalStudents || (Array.isArray(students) ? students.length : 0);
  const totalTeachers = dashboardStats?.totalTeachers || (Array.isArray(teachers) ? teachers.length : 0);
  const totalClasses = dashboardStats?.totalClasses || (Array.isArray(classrooms) ? classrooms.length : 0);
  const totalUsers = dashboardStats?.totalUsers || 0;
  const activeUsers = dashboardStats?.activeUsers || 0;
  const inactiveUsers = dashboardStats?.inactiveUsers || 0;
  const pendingVerifications = dashboardStats?.pendingVerifications || 0;
  const recentRegistrations = dashboardStats?.recentRegistrations || 0;

  // Calculate gender distribution from real data with validation
  const maleStudents = Array.isArray(students) ? students.filter(s => s.gender === 'male').length : 0;
  const femaleStudents = Array.isArray(students) ? students.filter(s => s.gender === 'female').length : 0;
  const totalStudentsForGender = maleStudents + femaleStudents;

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
      return `${firstName} ${middleName} ${lastName}`.trim() || userProfile.user.email || 'User';
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
    { name: 'Teachers', icon: Users, path: '/admin/teachers' },
    { name: 'Students', icon: GraduationCap, path: '/admin/students' },
    { name: 'Parents', icon: UserCheck, path: '/admin/parents' },
    { name: 'Subjects', icon: BookOpen, path: '/admin/subjects' },
    { name: 'Classes', icon: School, path: '/admin/classes' },
    { name: 'Lessons', icon: Clock, path: '/admin/lessons' },
    { name: 'Exams', icon: FileText, path: '/admin/exams' },
    { name: 'Results', icon: BarChart3, path: '/admin/results' },
    { name: 'Attendance', icon: CheckSquare, path: '/admin/attendance' },
    { name: 'Messages', icon: MessageSquare, path: '/admin/messages' },
    { name: 'Announcements', icon: Bell, path: '/admin/announcements' },
    { name: 'Profile', icon: User, path: '/admin/profile' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
    { name: 'Logout', icon: LogOut, path: '/logout' }
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
  const handleLogout = () => {
    console.log('Logging out...');
    if (onLogout) {
      onLogout();
    } else {
      // Fallback logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  };

  // Handle navigation item click
  const handleNavigationClick = (itemName: string, path?: string) => {
    if (itemName === 'Logout') {
      handleLogout();
    } else if (path) {
      // For now, just update the active item
      // In a real app, you'd use React Router to navigate
      setActiveItem(itemName);
      console.log(`Navigating to: ${path}`);
      // window.location.href = path; // Uncomment for actual navigation
    } else {
      setActiveItem(itemName);
    }
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

  return (
    <div style={{
      background: 'var(--background-secondary)',
      color: 'var(--primary-text)',
      minHeight: '100vh'
    }}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div style={{
          background: 'var(--background)',
          borderRight: '1px solid var(--border)',
          boxShadow: '0 10px 15px -3px var(--shadow)'
        }} className="w-64">
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center">
              <div style={{ backgroundColor: 'var(--accent)' }} className="w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--primary-text)' }}>Educo</h1>
            </div>
          </div>

          <nav className="p-4">
            {Array.isArray(navigationItems) && navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigationClick(item.name, item.path)}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg text-left transition-all duration-200 ${activeItem === item.name
                    ? 'text-white shadow-lg'
                    : 'hover:shadow-md'
                  }`}
                style={{
                  backgroundColor: activeItem === item.name ? 'var(--accent)' : 'transparent',
                  color: activeItem === item.name ? '#ffffff' : 'var(--secondary-text)'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (activeItem !== item.name) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--surface)';
                    (e.target as HTMLButtonElement).style.color = 'var(--primary-text)';
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (activeItem !== item.name) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = 'var(--secondary-text)';
                  }
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            ))}
            {!Array.isArray(navigationItems) && (
              <p className="text-sm text-secondary-text">Navigation items not available</p>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header style={{
            background: 'var(--background)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 1px 3px var(--shadow)'
          }} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>
                  Welcome Back {getUserDisplayName().split(' ')[0]}👋
                </h2>
                <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                  Here's what's happening with your school today
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={onRefresh}
                  className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--secondary-text)' }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--surface)',
                      color: 'var(--primary-text)',
                      border: '1px solid var(--border)',

                    }}
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${isDarkMode ? '#3b82f6' : '#3b82f6'}40`}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--primary-text)'
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent)';
                    (e.target as HTMLButtonElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--surface)';
                    (e.target as HTMLButtonElement).style.color = 'var(--primary-text)';
                  }}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative dropdown-container">
                  <Bell 
                    className="w-6 h-6 cursor-pointer transition-colors hover:opacity-80" 
                    style={{ color: 'var(--secondary-text)' }}
                    onClick={toggleNotificationDropdown}
                  />
                  {dummyNotifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
                      style={{ backgroundColor: 'var(--error)' }}>
                      {dummyNotifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                  
                  {/* Notification Dropdown */}
                  {showNotificationDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="font-semibold" style={{ color: 'var(--primary-text)' }}>Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {dummyNotifications.map((notification) => (
                          <div key={notification.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                            style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm" style={{ color: 'var(--primary-text)' }}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                                  {notification.content}
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                        <button className="text-sm text-blue-500 hover:text-blue-700">View All Notifications</button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative dropdown-container">
                  <MessageSquare 
                    className="w-6 h-6 cursor-pointer transition-colors hover:opacity-80" 
                    style={{ color: 'var(--secondary-text)' }}
                    onClick={toggleMessageDropdown}
                  />
                  {dummyMessages.filter(m => !m.is_read).length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
                      style={{ backgroundColor: 'var(--error)' }}>
                      {dummyMessages.filter(m => !m.is_read).length}
                    </span>
                  )}
                  
                  {/* Message Dropdown */}
                  {showMessageDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="font-semibold" style={{ color: 'var(--primary-text)' }}>Messages</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {dummyMessages.map((message) => (
                          <div key={message.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                            style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {message.sender.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm" style={{ color: 'var(--primary-text)' }}>
                                  {message.title}
                                </h4>
                                <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                                  {message.content.substring(0, 60)}...
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                                  {new Date(message.created_at).toLocaleString()}
                                </p>
                              </div>
                              {!message.is_read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                        <button className="text-sm text-blue-500 hover:text-blue-700">View All Messages</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: 'var(--surface)' }}>
                    <User className="w-6 h-6" style={{ color: 'var(--secondary-text)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>{getUserDisplayName()}</p>
                    <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Students</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${isDarkMode ? '#3b82f6' : '#dbeafe'}` }}>
                    <GraduationCap className="w-6 h-6" style={{ color: isDarkMode ? '#ffffff' : '#3b82f6' }} />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Teachers</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalTeachers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${isDarkMode ? '#10b981' : '#d1fae5'}` }}>
                    <Users className="w-6 h-6" style={{ color: isDarkMode ? '#ffffff' : '#059669' }} />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Employee</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${isDarkMode ? '#8b5cf6' : '#ede9fe'}` }}>
                    <UserCheck className="w-6 h-6" style={{ color: isDarkMode ? '#ffffff' : '#7c3aed' }} />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Classes</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalClasses}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${isDarkMode ? '#f59e0b' : '#fef3c7'}` }}>
                    <School className="w-6 h-6" style={{ color: isDarkMode ? '#ffffff' : '#d97706' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)'
              }}>
              <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Weekly Attendance Chart</h3>
              <div className="h-64">
                {processedAttendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedAttendanceData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="present" fill="#3b82f6" name="Present" />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-secondary-text">No attendance data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gender Distribution */}
              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Total Students by Gender</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="20"
                        strokeDasharray="150.8 100.5"
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="var(--success)"
                        strokeWidth="20"
                        strokeDasharray="100.5 150.8"
                        strokeDashoffset="-150.8"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalStudentsForGender}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--accent)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--secondary-text)' }}>Boys: {maleStudents}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--success)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--secondary-text)' }}>Girls: {femaleStudents}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>Attendance</h3>
                  <div className="flex items-center space-x-4">
                    <select className="text-sm border rounded px-3 py-1 transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--primary-text)'
                      }}>
                         <option>Today</option>
                      <option>This week</option>
                      <option>Last week</option>
                      <option>This month</option>
                      <option>Last month</option>
                    </select>
                    <select className="text-sm border rounded px-3 py-1 transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--primary-text)'
                      }}>
                      <option>Pre Nursery</option>
                      <option>Nursery 1</option>
                      <option>Nursery 2</option>
                       <option>Primary 1</option>
                      <option>Primary 2</option>
                      <option>Primary 3</option>
                       <option>Primary 4</option>
                      <option>Primary 5</option>
                      <option>JSS 1</option>
                      <option>JSS 2</option>
                      <option>JSS 3</option>
                      <option>SSS 1</option>
                      <option>SSS 2</option>
                      <option>SSS 3</option>
                    </select>
                  </div>
                </div>
                <div className="h-64">
                  <div className="flex items-end justify-between h-full">
                    {Array.isArray(processedAttendanceData) && processedAttendanceData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="flex flex-col items-center mb-2">
                          <div
                            className="w-8 rounded-t transition-all duration-300 hover:scale-105"
                            style={{
                              height: `${(item.present / 300) * 120}px`,
                              backgroundColor: 'var(--accent)'
                            }}
                          ></div>
                          <div
                            className="w-8 rounded-b transition-all duration-300 hover:scale-105"
                            style={{
                              height: `${(item.absent / 300) * 120}px`,
                              backgroundColor: 'var(--success)'
                            }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2" style={{ color: 'var(--secondary-text)' }}>{item.date}</span>
                      </div>
                    ))}
                    {!Array.isArray(processedAttendanceData) && (
                      <div className="flex items-center justify-center w-full h-full">
                        <p className="text-sm text-secondary-text">No attendance data available</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--accent)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--secondary-text)' }}>{totalPresent}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--success)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--secondary-text)' }}>{totalAbsent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Students and Teachers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Recent Students</h3>
                <div className="space-y-4">
                  {Array.isArray(students) && students.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 mr-3 text-accent" />
                        <span className="font-medium" style={{ color: 'var(--primary-text)' }}>{student.user?.first_name} {student.user?.last_name}</span>
                      </div>
                      <span className="text-sm text-secondary-text">{student.user?.email}</span>
                    </div>
                  ))}
                  {!Array.isArray(students) && (
                    <p className="text-sm text-secondary-text">No students data available</p>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Recent Teachers</h3>
                <div className="space-y-4">
                  {Array.isArray(teachers) && teachers.slice(0, 5).map((teacher, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-3 text-accent" />
                        <span className="font-medium" style={{ color: 'var(--primary-text)' }}>{teacher.user?.first_name} {teacher.user?.last_name}</span>
                      </div>
                      <span className="text-sm text-secondary-text">{teacher.user?.email}</span>
                    </div>
                  ))}
                  {!Array.isArray(teachers) && (
                    <p className="text-sm text-secondary-text">No teachers data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Classroom Data */}
            <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)'
              }}>
              <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Classroom Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(classrooms) && classrooms.map((classroom, index) => (
                  <div key={index} className="p-4 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                    style={{ borderColor: 'var(--border)' }}>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--primary-text)' }}>{classroom.name}</h4>
                    <p className="text-sm text-secondary-text">Capacity: {classroom.capacity || 'N/A'}</p>
                    <p className="text-sm text-secondary-text">Subjects: {classroom.subjects?.join(', ') || 'N/A'}</p>
                    <p className="text-sm text-secondary-text">Building: {classroom.building || 'N/A'}</p>
                  </div>
                ))}
                {!Array.isArray(classrooms) && (
                  <p className="text-sm text-secondary-text col-span-full">No classroom data available</p>
                )}
              </div>
            </div>

            {/* Notice Board and Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notice Board */}
              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>Notice Board</h3>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="space-y-4">
                  {Array.isArray(noticeItems) && noticeItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: 'var(--surface)' }}>
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1" style={{ color: 'var(--primary-text)' }}>{item.title}</h4>
                        <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>{item.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--accent)' }}>
                            <span className="text-xs text-white">👁</span>
                          </div>
                          <span className="text-sm" style={{ color: 'var(--secondary-text)' }}>{item.views}</span>
                        </div>
                        <button className="transition-colors hover:opacity-70">
                          <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--secondary-text)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!Array.isArray(noticeItems) && (
                    <p className="text-sm text-secondary-text">No notice items available</p>
                  )}
                </div>
              </div>

              {/* Event Calendar */}
              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>Event Calendar</h3>
                  <button className="transition-colors hover:opacity-70">
                    <MoreHorizontal className="w-5 h-5" style={{ color: 'var(--secondary-text)' }} />
                  </button>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium" style={{ color: 'var(--primary-text)' }}>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 rounded transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: 'var(--surface)' }}>
                        <ChevronLeft className="w-4 h-4" style={{ color: 'var(--secondary-text)' }} />
                      </button>
                      <button className="p-1 rounded transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: 'var(--surface)' }}>
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--secondary-text)' }} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                      <div key={day} className="p-2 font-medium" style={{ color: 'var(--secondary-text)' }}>{day}</div>
                    ))}
                    {Array.isArray(generateCalendar()) && generateCalendar().map((day, index) => (
                      <div key={index} className="p-2">
                        {day && (
                          <button
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 hover:scale-110`}
                            style={{
                              backgroundColor: day === 20 ? 'var(--accent)' : 'transparent',
                              color: day === 20 ? '#ffffff' : 'var(--primary-text)'
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                              if (day !== 20) {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'var(--surface)';
                              }
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                              if (day !== 20) {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {day}
                          </button>
                        )}
                      </div>
                    ))}
                    {!Array.isArray(generateCalendar()) && (
                      <div className="p-2 text-sm text-secondary-text">No calendar data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages and System Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Recent Messages</h3>
                <div className="space-y-4">
                  {dummyMessages.slice(0, 5).map((message, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                      style={{ borderColor: 'var(--border)' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: 'var(--surface)' }}>
                        💬
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1" style={{ color: 'var(--primary-text)' }}>{message.title}</h4>
                        <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>{message.content.substring(0, 100)}...</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>{new Date(message.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!message.is_read && (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)'
                }}>
                <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>System Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--primary-text)' }}>Active Users</span>
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>{activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--primary-text)' }}>Inactive Users</span>
                    <span className="font-semibold" style={{ color: 'var(--secondary-text)' }}>{inactiveUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--primary-text)' }}>Pending Verifications</span>
                    <span className="font-semibold" style={{ color: 'var(--error)' }}>{pendingVerifications}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--primary-text)' }}>Recent Registrations</span>
                    <span className="font-semibold" style={{ color: 'var(--success)' }}>{recentRegistrations}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;