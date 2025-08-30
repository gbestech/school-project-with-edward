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
  Filter,
  Eye,
  EyeOff,
  Clock,
  BookOpen,
  Award,
  Users2,
  UserPlus,
  Activity,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { StudentService as StudentServiceClass } from '@/services/StudentService';
import { toast } from 'react-toastify';
// import { usePermissions } from '@/hooks/usePermissions';
import { 
  StudentsPermissionGate, 
  TeachersPermissionGate
} from '@/components/common/PermissionGate';

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
  activateTeacher,
  activateParent
}) => {
  const [currentDate] = useState(new Date());
  const { isDarkMode, toggleTheme } = useGlobalTheme();
  // const { canViewStudents, canViewTeachers } = usePermissions();
  
  // Use provided user or fallback to null
  const currentUser = user || null;
  
  // Create fallback activation functions if not provided
  const fallbackActivateTeacher = activateTeacher || (async (_teacherId: number) => {
    console.warn('activateTeacher function not provided');
    return Promise.resolve();
  });
  
  const fallbackActivateParent = activateParent || (async (_parentId: number) => {
    console.warn('activateParent function not provided');
    return Promise.resolve();
  });
  
  // Debug logging for received props
  console.log('🎯 EnhancedDashboard: Received props:', {
    dashboardStats: _dashboardStats,
    students: _students,
    teachers: _teachers,
    attendanceData: _attendanceData,
    classrooms: _classrooms,
    parents: _parents
  });
  
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

  // Handle refresh with loading state and toast notification
  const handleRefresh = () => {
    console.log('🔄 EnhancedDashboard: handleRefresh called, onRefresh:', !!onRefresh);
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      toast.success('Dashboard data refreshed successfully!');
      // Reset loading state after a short delay
      setTimeout(() => setIsRefreshing(false), 1000);
    } else {
      console.warn('⚠️ EnhancedDashboard: onRefresh prop is not provided');
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

  // Event calendar data
  const events = [
    { id: 1, title: 'Parent-Teacher Meeting', date: '2024-01-20', type: 'meeting' },
    { id: 2, title: 'Annual Sports Day', date: '2024-01-25', type: 'event' },
    { id: 3, title: 'Mid-term Exams', date: '2024-01-30', type: 'exam' },
    { id: 4, title: 'School Assembly', date: '2024-01-22', type: 'assembly' }
  ];

  // Revenue data
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { month: 'Apr', revenue: 55000, expenses: 38000, profit: 17000 },
    { month: 'May', revenue: 51000, expenses: 36000, profit: 15000 },
    { month: 'Jun', revenue: 58000, expenses: 40000, profit: 18000 }
  ];

  // Calculate real educational level distribution from students data
  const calculateGradeDistribution = () => {
    if (!Array.isArray(_students) || _students.length === 0) {
      // Mock data fallback when no students exist
      return [
        { name: 'Nursery', value: 25, color: '#10b981' },
        { name: 'Primary', value: 30, color: '#3b82f6' },
        { name: 'Junior Secondary', value: 20, color: '#f59e0b' },
        { name: 'Senior Secondary', value: 15, color: '#ef4444' }
      ];
    }

    // Define education level mapping and colors
    const educationLevelMapping: { [key: string]: string } = {
      'NURSERY': 'Nursery',
      'PRIMARY': 'Primary',
      'JUNIOR_SECONDARY': 'Junior Secondary',
      'SENIOR_SECONDARY': 'Senior Secondary',
      'SECONDARY': 'Secondary' // Fallback for older data
    };

    const colors = {
      'Nursery': '#10b981',
      'Primary': '#3b82f6', 
      'Junior Secondary': '#f59e0b',
      'Senior Secondary': '#ef4444',
      'Secondary': '#8b5cf6',
      'Unknown': '#6b7280'
    };

    const levelCounts = _students.reduce((acc: Record<string, number>, student: any) => {
      try {
        // Use education_level field from student data
        const educationLevel = student.education_level || student.education_level_display || 'Unknown';
        let displayName = educationLevelMapping[educationLevel] || educationLevel;
        
        // If it's secondary level, determine if it's junior or senior based on grade
        if (educationLevel === 'SECONDARY' || displayName === 'Secondary') {
          const studentClass = student.student_class || student.grade || '';
          if (['JSS_1', 'JSS_2', 'JSS_3'].includes(studentClass)) {
            displayName = 'Junior Secondary';
          } else if (['SS_1', 'SS_2', 'SS_3'].includes(studentClass)) {
            displayName = 'Senior Secondary';
          } else {
            // Fallback to Secondary if we can't determine
            displayName = 'Secondary';
          }
        }
        
        acc[displayName] = (acc[displayName] || 0) + 1;
      } catch (error) {
        console.error('Error processing student for grade distribution:', error, student);
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
      .sort((a, b) => b.value - a.value); // Sort by count descending
  };

  const gradeDistribution = calculateGradeDistribution();
  
  // Debug logging for grade distribution
  console.log('🎯 Grade Distribution Data:', {
    studentsCount: Array.isArray(_students) ? _students.length : 0,
    studentsData: Array.isArray(_students) ? _students.slice(0, 3).map(s => ({
      id: s.id,
      education_level: s.education_level,
      education_level_display: s.education_level_display,
      student_class: s.student_class,
      grade: s.grade
    })) : [],
    calculatedDistribution: gradeDistribution
  });

  // Calculate real gender distribution from students data
  const calculateGenderDistribution = () => {
    if (!Array.isArray(_students) || _students.length === 0) {
      // Mock data fallback when no students exist
      return [
        { name: 'Male', value: 55, color: '#3b82f6' },
        { name: 'Female', value: 45, color: '#ec4899' }
      ];
    }

    const genderCounts = _students.reduce((acc: Record<string, number>, student: any) => {
      const gender = student.gender || 'not_specified';
      // Handle both string and enum values
      const genderKey = typeof gender === 'string' ? gender.toUpperCase() : gender;
      acc[genderKey] = (acc[genderKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Map backend gender values to display names
    const result = [
      { name: 'Male', value: genderCounts.M || genderCounts.MALE || 0, color: '#3b82f6' },
      { name: 'Female', value: genderCounts.F || genderCounts.FEMALE || 0, color: '#ec4899' },
      { name: 'Other', value: genderCounts.O || genderCounts.OTHER || 0, color: '#f59e0b' },
      { name: 'Not Specified', value: genderCounts.NOT_SPECIFIED || genderCounts.not_specified || 0, color: '#6b7280' }
    ].filter(item => item.value > 0); // Only show categories with data

    // Debug logging for gender distribution
    console.log('🎯 Gender Distribution Data:', {
      studentsCount: _students.length,
      genderCounts: genderCounts,
      calculatedResult: result,
      sampleStudents: _students.slice(0, 3).map(s => ({
        id: s.id,
        name: s.full_name,
        gender: s.gender
      }))
    });

    // If no real data, return mock data
    return result.length > 0 ? result : [
      { name: 'Male', value: 55, color: '#3b82f6' },
      { name: 'Female', value: 45, color: '#ec4899' }
    ];
  };

  const genderDistribution = calculateGenderDistribution();

  // Close dropdowns on outside click
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

  // Helper function to get auth headers (unused but kept for future use)
  // const getAuthHeaders = () => {
  //   const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  //   return {
  //     'Content-Type': 'application/json',
  //     'Authorization': token ? `Bearer ${token}` : '',
  //   };
  // };

  const getUserDisplayName = () => {
    if (currentUser?.first_name || currentUser?.last_name) {
      return `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    }
    return currentUser?.email || currentUser?.username || 'Admin User';
  };

  const getUserRole = () => currentUser?.role || 'Admin';

  const handleActivateStudent = async (student: any) => {
    console.log('🎯 handleActivateStudent called with:', student);
    
    if (!student?.id) {
      console.error('❌ Missing student ID:', student);
      toast.error('Invalid student data');
      return;
    }
    
    setActivatingStudentId(student.id);
    try {
      // Use the new StudentService
      const result = await StudentServiceClass.toggleStudentStatus(student.id);
      
      console.log('✅ Student activation result:', result);
      
      // Update the student's status in the local state
      if (student.user) {
        student.user.is_active = !student.user.is_active;
      }
      student.is_active = !student.is_active;
      
      toast.success(`Student ${student.is_active ? 'activated' : 'deactivated'} successfully`);
      
      // Call the parent callback if provided
      if (onUserStatusUpdate) {
        onUserStatusUpdate(student.id, 'student', student.is_active);
      }
      
      // Refresh the data
      if (onRefresh) onRefresh();
    } catch (error: unknown) {
      console.error('❌ Error toggling student status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student status';
      toast.error(errorMessage);
    } finally {
      setActivatingStudentId(null);
    }
  };

  const handleToggleTeacherActive = async (teacher: any) => {
    console.log('🎯 handleToggleTeacherActive called with:', teacher);
    console.log('🔍 Full teacher object:', JSON.stringify(teacher, null, 2));
    
    // Handle different data structures
    const teacherId = teacher?.id;
    const userId = teacher?.user?.id || teacher?.user_id || teacher?.id;
    const isCurrentlyActive = teacher?.user?.is_active ?? teacher?.is_active ?? true;
    
    if (!teacherId || !userId) {
      console.error('❌ Missing teacher ID or user ID:', teacher);
      toast.error('Invalid teacher data');
      return;
    }
    
    const newStatus = !isCurrentlyActive;
    console.log(`🔄 Toggling teacher ${userId} to ${newStatus ? 'active' : 'inactive'}`);
    console.log(`🔍 Teacher data structure:`, {
      teacherId,
      userId,
      teacherUser: teacher?.user,
      teacherUserId: teacher?.user?.id,
      teacherUserId2: teacher?.user_id,
      teacherId2: teacher?.id,
      isCurrentlyActive
    });
    
    setActivatingTeacherId(teacherId);
    try {
      await fallbackActivateTeacher(userId);
      toast.success(`Teacher ${newStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Update the parent component's state immediately
      if (onUserStatusUpdate) {
        onUserStatusUpdate(userId, 'teacher', newStatus);
      }
    } catch (error: unknown) {
      console.error('❌ Error toggling teacher status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update teacher status';
      toast.error(errorMessage);
    } finally {
      setActivatingTeacherId(null);
    }
  };

  const handleToggleParentActive = async (parent: any) => {
    console.log('🎯 handleToggleParentActive called with:', parent);
    console.log('🔍 Full parent object:', JSON.stringify(parent, null, 2));
    
    // Handle different data structures
    const parentId = parent?.id;
    const userId = parent?.user?.id || parent?.user_id || parent?.id;
    const isCurrentlyActive = parent?.user?.is_active ?? parent?.is_active ?? true;
    
    if (!parentId || !userId) {
      console.error('❌ Missing parent ID or user ID:', parent);
      toast.error('Invalid parent data');
      return;
    }
    
    const newStatus = !isCurrentlyActive;
    console.log(`🔄 Toggling parent ${userId} to ${newStatus ? 'active' : 'inactive'}`);
    console.log(`🔍 Parent data structure:`, {
      parentId,
      userId,
      parentUser: parent?.user,
      parentUserId: parent?.user?.id,
      parentUserId2: parent?.user_id,
      parentId2: parent?.id,
      isCurrentlyActive
    });
    
    setActivatingParentId(parentId);
    try {
      await fallbackActivateParent(userId);
      toast.success(`Parent ${newStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Update the parent component's state immediately
      if (onUserStatusUpdate) {
        onUserStatusUpdate(userId, 'parent', newStatus);
      }
    } catch (error: unknown) {
      console.error('❌ Error toggling parent status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update parent status';
      toast.error(errorMessage);
    } finally {
      setActivatingParentId(null);
    }
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowMessageDropdown(false);
  };

  const toggleMessageDropdown = () => {
    setShowMessageDropdown(!showMessageDropdown);
    setShowNotificationDropdown(false);
  };

  // Calculate stats from real data
  const totalStudents = _dashboardStats?.totalStudents || Array.isArray(_students) ? _students.length : 0;
  const totalTeachers = _dashboardStats?.totalTeachers || Array.isArray(_teachers) ? _teachers.length : 0;
  const totalParents = _dashboardStats?.totalParents || Array.isArray(_parents) ? _parents.length : 0;
  const totalClasses = _dashboardStats?.totalClasses || Array.isArray(_classrooms) ? _classrooms.length : 0;
  const totalUsers = totalStudents + totalTeachers + totalParents;

  // Debug logging for calculated stats
  console.log('📈 EnhancedDashboard: Calculated stats:', {
    totalStudents,
    totalTeachers,
    totalUsers,
    totalClasses,
    studentsArray: Array.isArray(_students) ? _students : 'Not an array',
    teachersArray: Array.isArray(_teachers) ? _teachers : 'Not an array',
    classroomsArray: Array.isArray(_classrooms) ? _classrooms : 'Not an array'
  });

  // Filter recent students (last 5) - show all recent registrations
  const recentStudents = Array.isArray(_students) 
    ? _students
        .sort((a, b) => new Date(b.user?.date_joined || '').getTime() - new Date(a.user?.date_joined || '').getTime())
        .slice(0, 5)
    : [];

  // Filter recent teachers (last 5) - show all recent registrations
  const recentTeachers = Array.isArray(_teachers) 
    ? _teachers
        .sort((a, b) => new Date(b.user?.date_joined || '').getTime() - new Date(a.user?.date_joined || '').getTime())
        .slice(0, 5)
    : [];

  // Filter recent parents (last 5) - show all recent registrations
  const recentParents = Array.isArray(_parents) 
    ? _parents
        .sort((a, b) => new Date(b.user?.date_joined || '').getTime() - new Date(a.user?.date_joined || '').getTime())
        .slice(0, 5)
    : [];

  // Debug logging for recent data
  console.log('🎯 Recent Data Debug:', {
    students: _students,
    teachers: _teachers,
    parents: _parents,
    recentStudents,
    recentTeachers,
    recentParents
  });
  
  // Log individual student data for debugging
  if (recentStudents && recentStudents.length > 0) {
    console.log('🔍 First student data structure:', {
      student: recentStudents[0],
      studentId: recentStudents[0]?.id,
      studentUserId: recentStudents[0]?.user?.id,
      studentDateJoined: recentStudents[0]?.user?.date_joined,
      studentName: recentStudents[0]?.user?.first_name + ' ' + recentStudents[0]?.user?.last_name
    });
  }
  
  // Log individual teacher data for debugging
  if (recentTeachers && recentTeachers.length > 0) {
    console.log('🔍 First teacher data structure:', {
      teacher: recentTeachers[0],
      teacherId: recentTeachers[0]?.id,
      teacherUserId: recentTeachers[0]?.user?.id,
      teacherUserId2: recentTeachers[0]?.user_id,
      teacherIsActive: recentTeachers[0]?.user?.is_active,
      teacherIsActive2: recentTeachers[0]?.is_active,
      teacherFirstName: recentTeachers[0]?.user?.first_name,
      teacherLastName: recentTeachers[0]?.user?.last_name,
      teacherFullName: recentTeachers[0]?.full_name,
      teacherEmail: recentTeachers[0]?.user?.email
    });
  }
  
  // Log individual parent data for debugging
  if (recentParents && recentParents.length > 0) {
    console.log('🔍 First parent data structure:', {
      parent: recentParents[0],
      parentId: recentParents[0]?.id,
      parentUserId: recentParents[0]?.user?.id,
      parentUserId2: recentParents[0]?.user_id,
      parentIsActive: recentParents[0]?.user?.is_active,
      parentIsActive2: recentParents[0]?.is_active
    });
  }

  // Generate calendar days
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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Enhanced Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Welcome back, {getUserDisplayName()}</p>
          </div>
          
          <div className="flex items-center space-x-4">
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
              {isDarkMode ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotificationDropdown}
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
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
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

            {/* Messages */}
            <div className="relative" ref={messageRef}>
              <button
                onClick={toggleMessageDropdown}
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
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
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

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{getUserDisplayName()}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{getUserRole()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StudentsPermissionGate permission="read">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStudents}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {Array.isArray(_students) ? `${_students.filter(s => s.is_active).length} active` : '0 active'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </StudentsPermissionGate>

          <TeachersPermissionGate permission="read">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Teachers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalTeachers}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {Array.isArray(_teachers) ? `${_teachers.filter(t => t.is_active).length} active` : '0 active'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </TeachersPermissionGate>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Parents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalParents}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {Array.isArray(_parents) ? `${_parents.filter(p => p.is_active).length} active` : '0 active'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Classes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalClasses}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {Array.isArray(_classrooms) ? `${_classrooms.length} active` : '0 active'}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <School className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Grade Distribution Pie Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Educational Level Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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

          {/* Gender Distribution Doughnut Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Users2 className="w-5 h-5 mr-2 text-purple-600" />
              Gender Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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

        {/* Attendance Filters and Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-green-600" />
              Attendance Overview
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Classes</option>
                  <option value="1A">Class 1A</option>
                  <option value="1B">Class 1B</option>
                  <option value="2A">Class 2A</option>
                  <option value="2B">Class 2B</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Levels</option>
                  <option value="nursery">Nursery</option>
                  <option value="primary">Primary</option>
                  <option value="junior_secondary">Junior Secondary</option>
                  <option value="senior_secondary">Senior Secondary</option>
                  <option value="secondary">Secondary (Legacy)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Subjects</option>
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="history">History</option>
                </select>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
              <Bar dataKey="present" fill="#10b981" />
              <Bar dataKey="absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue and Event Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Event Calendar */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
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
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
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
                    day ? 'hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer' : ''
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
                <div key={event.id} className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-900 dark:text-slate-100">{event.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{event.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Enrollments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                Recent Students
              </h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh recent students"
              >
                <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-3">
              {recentStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const profileUrl = StudentServiceClass.getProfilePictureUrl(student);
                      return profileUrl ? (
                        <img 
                          src={profileUrl} 
                          alt={`${student?.full_name}`}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null;
                    })()}
                    <div className={`w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center ${(() => {
                      const profileUrl = StudentServiceClass.getProfilePictureUrl(student);
                      return profileUrl ? 'hidden' : '';
                    })()}`}>
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {student?.full_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{student?.parent_contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      student.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleActivateStudent(student)}
                      disabled={activatingStudentId === student.id}
                      className={`px-2 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap ${
                        activatingStudentId === student.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : student.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                      }`}
                      title={student.is_active ? "Deactivate student" : "Activate student"}
                    >
                      {activatingStudentId === student.id ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Processing...</span>
                        </div>
                      ) : student.is_active ? (
                        <div className="flex items-center space-x-1">
                          <EyeOff className="w-3 h-3" />
                         
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {recentStudents.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No recent student registrations
                </p>
              )}
            </div>
          </div>

          {/* Recent Teachers */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Recent Teachers
              </h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh recent teachers"
              >
                <RefreshCw className={`w-4 h-4 text-green-600 dark:text-green-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-3">
              {recentTeachers.map((teacher, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {teacher.user?.first_name} {teacher.user?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{teacher.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      (teacher.user?.is_active ?? teacher?.is_active ?? true)
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {(teacher.user?.is_active ?? teacher?.is_active ?? true) ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleTeacherActive(teacher)}
                      disabled={activatingTeacherId === teacher.id}
                      className={`px-2 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap ${
                        activatingTeacherId === teacher.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : (teacher.user?.is_active ?? teacher?.is_active ?? true)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                      }`}
                      title={(teacher.user?.is_active ?? teacher?.is_active ?? true) ? "Deactivate teacher" : "Activate teacher"}
                    >
                      {activatingTeacherId === teacher.id ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Processing...</span>
                        </div>
                      ) : (teacher.user?.is_active ?? teacher?.is_active ?? true) ? (
                        <div className="flex items-center space-x-1">
                          <EyeOff className="w-3 h-3" />
                         
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {recentTeachers.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No recent teacher registrations
                </p>
              )}
            </div>
          </div>

          {/* Recent Parents */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
                Recent Parents
              </h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh recent parents"
              >
                <RefreshCw className={`w-4 h-4 text-purple-600 dark:text-purple-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-3">
              {recentParents.map((parent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {parent.user?.first_name} {parent.user?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{parent.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      (parent.user?.is_active ?? parent?.is_active ?? true)
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {(parent.user?.is_active ?? parent?.is_active ?? true) ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleParentActive(parent)}
                      disabled={activatingParentId === parent.id}
                      className={`px-2 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap ${
                        activatingParentId === parent.id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : (parent.user?.is_active ?? parent?.is_active ?? true)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30'
                      }`}
                      title={(parent.user?.is_active ?? parent?.is_active ?? true) ? "Deactivate parent" : "Activate parent"}
                    >
                      {activatingParentId === parent.id ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Processing...</span>
                        </div>
                      ) : (parent.user?.is_active ?? parent?.is_active ?? true) ? (
                        <div className="flex items-center space-x-1">
                          <EyeOff className="w-3 h-3" />
                          
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                         
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {recentParents.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No recent parent registrations
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard; 