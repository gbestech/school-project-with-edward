
import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  School,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  User,
  CheckSquare,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
  Clock,
  BookOpen,
  Award,
  Users2,
  UserPlus,
  Activity,
  RefreshCw,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface EnhancedDashboardProps {
  dashboardStats: any;
  students: any;
  teachers: any;
  attendanceData: any;
  classrooms: any;
  parents: any;
  onRefresh?: () => void;
  onUserStatusUpdate?: (userId: number, userType: 'student' | 'teacher' | 'parent', isActive: boolean) => void;
  user?: any;
  activateStudent?: (studentId: number) => Promise<void>;
  activateTeacher?: (teacherId: number) => Promise<void>;
  activateParent?: (parentId: number) => Promise<void>;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  dashboardStats: _dashboardStats,
  students: _students,
  teachers: _teachers,
  attendanceData: _attendanceData,
  classrooms: _classrooms,
  parents: _parents,
  onRefresh,
  onUserStatusUpdate,
  user,
  activateStudent,
  activateTeacher,
  activateParent
}) => {
  const [currentDate] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Extract arrays from paginated data structure
  const studentsArray = _students?.results || (Array.isArray(_students) ? _students : []);
  const teachersArray = _teachers?.results || (Array.isArray(_teachers) ? _teachers : []);
  const parentsArray = _parents?.results || (Array.isArray(_parents) ? _parents : []);
  const classroomsArray = Array.isArray(_classrooms) ? _classrooms : [];
  
  const currentUser = user || null;
  
  // State for filters and UI
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showMessageDropdown, setShowMessageDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activatingStudentId, setActivatingStudentId] = useState<number | null>(null);
  const [activatingTeacherId, setActivatingTeacherId] = useState<number | null>(null);
  const [activatingParentId, setActivatingParentId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear] = useState(currentDate.getFullYear());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Dummy data
  const dummyNotifications = [
    { id: 1, title: 'Attendance Alert', content: '5 students absent for 3 days', is_read: false },
    { id: 2, title: 'Fee Payment Due', content: 'Monthly fee deadline approaching', is_read: false },
    { id: 3, title: 'System Maintenance', content: 'Maintenance tonight 10PM-2AM', is_read: true }
  ];
  
  const dummyMessages = [
    { id: 1, title: 'New Student Registration', content: 'A new student has registered.', is_read: false, sender: 'System' },
    { id: 2, title: 'Teacher Meeting', content: 'Staff meeting tomorrow at 3 PM.', is_read: false, sender: 'Principal' }
  ];

  const events = [
    { id: 1, title: 'Parent-Teacher Meeting', date: '2024-01-20', type: 'meeting' },
    { id: 2, title: 'Annual Sports Day', date: '2024-01-25', type: 'event' },
    { id: 3, title: 'Mid-term Exams', date: '2024-01-30', type: 'exam' },
    { id: 4, title: 'School Assembly', date: '2024-01-22', type: 'assembly' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { month: 'Apr', revenue: 55000, expenses: 38000, profit: 17000 },
    { month: 'May', revenue: 51000, expenses: 36000, profit: 15000 },
    { month: 'Jun', revenue: 58000, expenses: 40000, profit: 18000 }
  ];

  const calculateGradeDistribution = () => {
    if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
      return [
        { name: 'Nursery', value: 25, color: '#10b981' },
        { name: 'Primary', value: 30, color: '#3b82f6' },
        { name: 'Junior Secondary', value: 20, color: '#f59e0b' },
        { name: 'Senior Secondary', value: 15, color: '#ef4444' }
      ];
    }

    const educationLevelMapping: { [key: string]: string } = {
      'NURSERY': 'Nursery',
      'PRIMARY': 'Primary',
      'JUNIOR_SECONDARY': 'Junior Secondary',
      'SENIOR_SECONDARY': 'Senior Secondary',
      'SECONDARY': 'Secondary'
    };

    const colors = {
      'Nursery': '#10b981',
      'Primary': '#3b82f6', 
      'Junior Secondary': '#f59e0b',
      'Senior Secondary': '#ef4444',
      'Secondary': '#8b5cf6',
      'Unknown': '#6b7280'
    };

    const levelCounts = studentsArray.reduce((acc: Record<string, number>, student: any) => {
      try {
        const educationLevel = student.education_level || student.education_level_display || 'Unknown';
        let displayName = educationLevelMapping[educationLevel] || educationLevel;
        
        if (educationLevel === 'SECONDARY' || displayName === 'Secondary') {
          const studentClass = student.student_class || student.grade || '';
          if (['JSS_1', 'JSS_2', 'JSS_3'].includes(studentClass)) {
            displayName = 'Junior Secondary';
          } else if (['SS_1', 'SS_2', 'SS_3'].includes(studentClass)) {
            displayName = 'Senior Secondary';
          }
        }
        
        acc[displayName] = (acc[displayName] || 0) + 1;
      } catch (error) {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(levelCounts)
      .map(([level, count]) => ({
        name: level,
        value: count as number,
        color: colors[level as keyof typeof colors] || '#6b7280'
      }))
      .sort((a, b) => b.value - a.value);
  };

  const calculateGenderDistribution = () => {
    if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
      return [
        { name: 'Male', value: 55, color: '#3b82f6' },
        { name: 'Female', value: 45, color: '#ec4899' }
      ];
    }

    const genderCounts = studentsArray.reduce((acc: Record<string, number>, student: any) => {
      const gender = student.gender || 'not_specified';
      const genderKey = typeof gender === 'string' ? gender.toUpperCase() : gender;
      acc[genderKey] = (acc[genderKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = [
      { name: 'Male', value: genderCounts.M || genderCounts.MALE || 0, color: '#3b82f6' },
      { name: 'Female', value: genderCounts.F || genderCounts.FEMALE || 0, color: '#ec4899' },
      { name: 'Other', value: genderCounts.O || genderCounts.OTHER || 0, color: '#f59e0b' },
      { name: 'Not Specified', value: genderCounts.NOT_SPECIFIED || genderCounts.not_specified || 0, color: '#6b7280' }
    ].filter(item => item.value > 0);

    return result.length > 0 ? result : [
      { name: 'Male', value: 55, color: '#3b82f6' },
      { name: 'Female', value: 45, color: '#ec4899' }
    ];
  };

  const gradeDistribution = calculateGradeDistribution();
  const genderDistribution = calculateGenderDistribution();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        notificationRef.current && !notificationRef.current.contains(e.target as Node) &&
        messageRef.current && !messageRef.current.contains(e.target as Node)
      ) {
        setShowNotificationDropdown(false);
        setShowMessageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleActivateStudent = async (student: any) => {
    if (!student?.id || !activateStudent) return;
    
    setActivatingStudentId(student.id);
    try {
      await activateStudent(student.id);
      if (onUserStatusUpdate) {
        onUserStatusUpdate(student.id, 'student', !student.is_active);
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error toggling student status:', error);
    } finally {
      setActivatingStudentId(null);
    }
  };

  const handleToggleTeacherActive = async (teacher: any) => {
    const teacherId = teacher?.id;
    const userId = teacher?.user?.id || teacher?.user_id || teacher?.id;
    if (!teacherId || !userId || !activateTeacher) return;
    
    setActivatingTeacherId(teacherId);
    try {
      await activateTeacher(userId);
      const newStatus = !(teacher?.user?.is_active ?? teacher?.is_active ?? true);
      if (onUserStatusUpdate) {
        onUserStatusUpdate(userId, 'teacher', newStatus);
      }
    } catch (error) {
      console.error('Error toggling teacher status:', error);
    } finally {
      setActivatingTeacherId(null);
    }
  };

  const handleToggleParentActive = async (parent: any) => {
    const parentId = parent?.id;
    const userId = parent?.user?.id || parent?.user_id || parent?.id;
    if (!parentId || !userId || !activateParent) return;
    
    setActivatingParentId(parentId);
    try {
      await activateParent(userId);
      const newStatus = !(parent?.user?.is_active ?? parent?.is_active ?? true);
      if (onUserStatusUpdate) {
        onUserStatusUpdate(userId, 'parent', newStatus);
      }
    } catch (error) {
      console.error('Error toggling parent status:', error);
    } finally {
      setActivatingParentId(null);
    }
  };

  const getUserDisplayName = () => {
    if (currentUser?.first_name || currentUser?.last_name) {
      return `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    }
    return currentUser?.email || currentUser?.username || 'Admin User';
  };

  const totalStudents = _students?.count || studentsArray.length || 0;
  const totalTeachers = _teachers?.count || teachersArray.length || 0;
  const totalParents = _parents?.count || parentsArray.length || 0;
  const totalClasses = classroomsArray.length || 0;

  const stats = {
    totalStudents,
    totalTeachers,
    totalParents,
    totalClassrooms: totalClasses,
    activeStudents: studentsArray.filter((s: any) => s.is_active || s.user?.is_active)?.length || 0,
    activeTeachers: teachersArray.filter((t: any) => t.is_active || t.user?.is_active)?.length || 0,
  };

  const recentStudents = studentsArray
    .sort((a: any, b: any) => new Date(b.user?.date_joined || b.created_at || '').getTime() - new Date(a.user?.date_joined || a.created_at || '').getTime())
    .slice(0, 5);

  const recentTeachers = teachersArray
    .sort((a: any, b: any) => new Date(b.user?.date_joined || b.created_at || '').getTime() - new Date(a.user?.date_joined || a.created_at || '').getTime())
    .slice(0, 5);

  const recentParents = parentsArray
    .sort((a: any, b: any) => new Date(b.user?.date_joined || b.created_at || '').getTime() - new Date(a.user?.date_joined || a.created_at || '').getTime())
    .slice(0, 5);

  const generateCalendarDays = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Header - Mobile & Desktop Responsive */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome back, {getUserDisplayName()}! 👋
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Here's what's happening in your school today</p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200 border border-blue-200 dark:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`w-5 h-5 text-blue-600 dark:text-blue-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 border border-slate-200 dark:border-slate-600"
                title="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 relative border border-slate-200 dark:border-slate-600"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  {dummyNotifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {dummyNotifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>
                
                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        {dummyNotifications.map(notification => (
                          <div key={notification.id} className={`p-3 rounded-lg border ${notification.is_read ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{notification.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{notification.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages - Hidden on small screens */}
              <div className="hidden sm:block relative" ref={messageRef}>
                <button
                  onClick={() => setShowMessageDropdown(!showMessageDropdown)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 relative border border-slate-200 dark:border-slate-600"
                >
                  <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  {dummyMessages.filter(m => !m.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {dummyMessages.filter(m => !m.is_read).length}
                    </span>
                  )}
                </button>
                
                {showMessageDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Messages</h3>
                      <div className="space-y-3">
                        {dummyMessages.map(message => (
                          <div key={message.id} className={`p-3 rounded-lg border ${message.is_read ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{message.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{message.content}</p>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{message.sender}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">+12%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalStudents}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{stats.activeStudents} active</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">+5%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Teachers</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTeachers}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{stats.activeTeachers} active</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">+8%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Parents</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalParents}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Registered guardians</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Active</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Classrooms</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalClassrooms}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Across all levels</p>
          </div>
        </div>

        {/* Charts Section - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Grade Distribution */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Educational Level Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Users2 className="w-5 h-5 mr-2 text-purple-600" />
              Gender Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={window.innerWidth < 640 ? 40 : 60}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Overview - Responsive */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-green-600" />
              Attendance Overview
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Classes</option>
                <option value="1A">Class 1A</option>
                <option value="1B">Class 1B</option>
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Levels</option>
                <option value="nursery">Nursery</option>
                <option value="primary">Primary</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { day: 'Mon', present: 95, absent: 5 },
              { day: 'Tue', present: 92, absent: 8 },
              { day: 'Wed', present: 98, absent: 2 },
              { day: 'Thu', present: 89, absent: 11 },
              { day: 'Fri', present: 94, absent: 6 }
            ]}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue and Calendar - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Event Calendar */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Event Calendar
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 p-2">
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`text-center text-sm p-2 rounded ${
                    day ? 'hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-900 dark:text-slate-100' : ''
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Upcoming Events */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Upcoming Events</h4>
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex-1">{event.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{event.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity - Responsive 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Students */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Students
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentStudents.length > 0 ? (
                recentStudents.map((student: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-semibold text-sm">
                          {student?.full_name?.[0] || student?.user?.first_name?.[0] || 'S'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                          {student?.full_name || `${student?.user?.first_name || ''} ${student?.user?.last_name || ''}`.trim() || 'Unknown'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {student?.parent_contact || student?.user?.email || 'No contact'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (student.is_active || student.user?.is_active)
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {(student.is_active || student.user?.is_active) ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleActivateStudent(student)}
                        disabled={activatingStudentId === student.id}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                          activatingStudentId === student.id
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : (student.is_active || student.user?.is_active)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}
                      >
                        {activatingStudentId === student.id ? (
                          <Clock className="w-3 h-3" />
                        ) : (student.is_active || student.user?.is_active) ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm">No students yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Teachers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-emerald-600" />
                  Recent Teachers
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-emerald-600 dark:text-emerald-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentTeachers.length > 0 ? (
                recentTeachers.map((teacher: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-semibold text-sm">
                          {teacher.user?.first_name?.[0] || teacher.full_name?.[0] || 'T'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                          {teacher.full_name || `${teacher.user?.first_name || ''} ${teacher.user?.last_name || ''}`.trim() || 'Unknown'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {teacher.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (teacher.user?.is_active ?? teacher?.is_active ?? true)
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {(teacher.user?.is_active ?? teacher?.is_active ?? true) ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleTeacherActive(teacher)}
                        disabled={activatingTeacherId === teacher.id}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                          activatingTeacherId === teacher.id
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : (teacher.user?.is_active ?? teacher?.is_active ?? true)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                        }`}
                      >
                        {activatingTeacherId === teacher.id ? (
                          <Clock className="w-3 h-3" />
                        ) : (teacher.user?.is_active ?? teacher?.is_active ?? true) ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm">No teachers yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Parents */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Parents
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-purple-600 dark:text-purple-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentParents.length > 0 ? (
                recentParents.map((parent: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-semibold text-sm">
                          {parent.user?.first_name?.[0] || parent.full_name?.[0] || 'P'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                          {parent.full_name || `${parent.user?.first_name || ''} ${parent.user?.last_name || ''}`.trim() || 'Unknown'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {parent.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (parent.user?.is_active ?? parent?.is_active ?? true)
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {(parent.user?.is_active ?? parent?.is_active ?? true) ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleParentActive(parent)}
                        disabled={activatingParentId === parent.id}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                          activatingParentId === parent.id
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : (parent.user?.is_active ?? parent?.is_active ?? true)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}
                      >
                        {activatingParentId === parent.id ? (
                          <Clock className="w-3 h-3" />
                        ) : (parent.user?.is_active ?? parent?.is_active ?? true) ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm">No parents yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;