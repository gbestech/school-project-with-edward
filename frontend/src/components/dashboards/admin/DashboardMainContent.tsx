import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  School,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  User,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import { useAdminAuth } from '@/services/AuthServiceAdmin';
import { toast } from 'react-toastify';

interface DashboardMainContentProps {
  dashboardStats: any;
  students: any;
  teachers: any;
  attendanceData: any;
  classrooms: any;
  parents: any;
  onRefresh?: () => void;
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({
  dashboardStats: _dashboardStats,
  students: _students,
  teachers: _teachers,
  attendanceData: _attendanceData,
  classrooms: _classrooms,
  parents: _parents,
  onRefresh
}) => {
  const { user, activateStudent, activateTeacher } = useAdminAuth();
  const [currentDate] = useState(new Date());
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Dropdown state
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showMessageDropdown, setShowMessageDropdown] = useState(false);
  const notificationRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLSpanElement>(null);
  const [activatingStudentId, setActivatingStudentId] = useState<number | null>(null);
  const [activatingTeacherId, setActivatingTeacherId] = useState<number | null>(null);
  const [activatingParentId, setActivatingParentId] = useState<number | null>(null);

  // Use parents from props directly, no need for local state since refresh will update props

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

  // Fix: Only main content scrolls, layout uses 100vh
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const getUserDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'Admin User';
  };
  const getUserRole = () => user?.role || 'Admin';

  const handleActivateStudent = async (student: any) => {
    setActivatingStudentId(student.id);
    try {
      await activateStudent(student.id, student.user.id);
      if (onRefresh) onRefresh();
      toast.success('Student activated successfully');
    } catch (e) {
      toast.error('Student activation failed');
    } finally {
      setActivatingStudentId(null);
    }
  };



  // Fix: Teacher activation with toast
  const handleToggleTeacherActive = async (teacher: any) => {
    setActivatingTeacherId(teacher.user.id);
    try {
      const endpoint = teacher.user.is_active
        ? `/api/teachers/${teacher.id}/deactivate/`
        : `/api/teachers/${teacher.id}/activate/`;
      const method = 'POST';
      const res = await fetch(endpoint, { 
        method,
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Request failed');
      if (onRefresh) onRefresh();
      toast.success(`Teacher ${teacher.user.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (e) {
      toast.error('Teacher activation failed');
    } finally {
      setActivatingTeacherId(null);
    }
  };

  // Fixed: Parent activation with proper endpoint, auth headers, and real-time refresh
  const handleToggleParentActive = async (parent: any) => {
    setActivatingParentId(parent.id);
    
    // Get current active status from the parent data
    const currentIsActive = parent.is_active;
    
    try {
      // Use the correct endpoint based on the backend URL structure
      const endpoint = `/api/parents/${parent.id}/${currentIsActive ? 'deactivate' : 'activate'}/`;
      
      const res = await fetch(endpoint, { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Trigger refresh to update the parent data in real-time
      if (onRefresh) onRefresh();
      toast.success(`Parent ${currentIsActive ? 'deactivated' : 'activated'} successfully`);
    } catch (e: any) {
      console.error('Parent activation error:', e);
      
      // Show specific error message
      if (e.message.includes('401')) {
        toast.error('Authentication failed. Please login again.');
      } else if (e.message.includes('403')) {
        toast.error('You do not have permission to perform this action.');
      } else if (e.message.includes('404')) {
        toast.error('Parent activation endpoint not found. Please contact administrator.');
      } else {
        toast.error(`Parent activation failed: ${e.message}`);
      }
    } finally {
      setActivatingParentId(null);
    }
  };

  console.log("Students", _students);
  
  // Example calculations (adapt as needed)
  const totalStudents = _dashboardStats?.totalStudents || (Array.isArray(_students) ? _students.length : 0);
  const totalTeachers = _dashboardStats?.totalTeachers || (Array.isArray(_teachers) ? _teachers.length : 0);
  const totalClasses = _dashboardStats?.totalClasses || (Array.isArray(_classrooms) ? _classrooms.length : 0);
  const totalUsers = _dashboardStats?.totalUsers || 0;
  const maleStudents = Array.isArray(_students) ? _students.filter((s: any) => s.gender === 'M').length : 0;
  const femaleStudents = Array.isArray(_students) ? _students.filter((s: any) => s.gender === 'F').length : 0;
  const totalStudentsForGender = maleStudents + femaleStudents;
  
  const processedAttendanceData = Array.isArray(_attendanceData?.dailyAttendance)
    ? _attendanceData.dailyAttendance.map((entry: any) => ({
        date: entry.date,
        present: entry.present || 0,
        absent: entry.absent || 0
      }))
    : [];
  const totalPresent = processedAttendanceData.reduce((sum: number, entry: any) => sum + (entry.present || 0), 0);
  const totalAbsent = processedAttendanceData.reduce((sum: number, entry: any) => sum + (entry.absent || 0), 0);
  
  const noticeItems = [
    { title: 'School annual sports day celebration 2024', date: '20 January, 2024', views: '20k', image: '🏆' },
    { title: 'Annual Function celebration 2023-24', date: '05 January, 2024', views: '15k', image: '🎭' },
    { title: 'Mid term examination routine published', date: '15 December, 2023', views: '22k', image: '📚' },
    { title: 'Inter school annual painting competition', date: '18 December, 2023', views: '18k', image: '🎨' }
  ];
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  // Helper function to get parent display name
  const getParentDisplayName = (parent: any) => {
    if (parent.user?.first_name || parent.user?.last_name) {
      return `${parent.user.first_name || ''} ${parent.user.last_name || ''}`.trim();
    }
    return parent.user?.email || parent.user?.username || `Parent #${parent.id}`;
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="flex-1 overflow-auto" style={{ height: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 3px var(--shadow)'
      }} className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>
              Welcome {getUserDisplayName().split(' ')[0]}
            </h2>
            <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
              Here's what's happening with your school today
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Refresh Icon */}
            <span title="Refresh" className="cursor-pointer" onClick={onRefresh}>
              <RefreshCw className="w-6 h-6 text-blue-500 hover:text-blue-700 transition-colors" />
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--primary-text)', border: '1px solid var(--border)' }}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--secondary-text)' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--primary-text)' }}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {/* Notification Icon with Dropdown */}
            <span ref={notificationRef} className="relative">
              <Bell
                className="w-6 h-6 cursor-pointer transition-colors hover:opacity-80"
                style={{ color: 'var(--secondary-text)' }}
                onClick={() => {
                  setShowNotificationDropdown((v) => !v);
                  setShowMessageDropdown(false);
                }}
              />
              {dummyNotifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--error)' }}>
                  {dummyNotifications.filter(n => !n.is_read).length}
                </span>
              )}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50" style={{ borderColor: 'var(--border)' }}>
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--primary-text)' }}>Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {(dummyNotifications.length > 0 ? dummyNotifications : [{ id: 0, title: 'No notifications', content: '', is_read: true }]).map((notification) => (
                      <div key={notification.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                        <h4 className="font-medium text-sm" style={{ color: 'var(--primary-text)' }}>{notification.title}</h4>
                        <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>{notification.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </span>
            {/* Message Icon with Dropdown */}
            <span ref={messageRef} className="relative">
              <MessageSquare
                className="w-6 h-6 cursor-pointer transition-colors hover:opacity-80"
                style={{ color: 'var(--secondary-text)' }}
                onClick={() => {
                  setShowMessageDropdown((v) => !v);
                  setShowNotificationDropdown(false);
                }}
              />
              {dummyMessages.filter(m => !m.is_read).length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--error)' }}>
                  {dummyMessages.filter(m => !m.is_read).length}
                </span>
              )}
              {showMessageDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50" style={{ borderColor: 'var(--border)' }}>
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--primary-text)' }}>Messages</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {(dummyMessages.length > 0 ? dummyMessages : [{ id: 0, title: 'No messages', content: '', is_read: true, sender: '' }]).map((message) => (
                      <div key={message.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                        <h4 className="font-medium text-sm" style={{ color: 'var(--primary-text)' }}>{message.title}</h4>
                        <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </span>
            {/* User Avatar and Info */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-200 hover:scale-105" style={{ backgroundColor: 'var(--surface)' }}>
                <User className="w-6 h-6" style={{ color: 'var(--secondary-text)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>{getUserDisplayName()}</p>
                <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>{getUserRole()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Students</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
              <GraduationCap className="w-6 h-6" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Teachers</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalTeachers}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
              <Users className="w-6 h-6" style={{ color: '#059669' }} />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Employee</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ede9fe' }}>
              <UserCheck className="w-6 h-6" style={{ color: '#7c3aed' }} />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>Total Classes</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>{totalClasses}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
              <School className="w-6 h-6" style={{ color: '#d97706' }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance Chart */}
      <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
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
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Total Students by Gender</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" strokeWidth="20" strokeDasharray="150.8 100.5" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--success)" strokeWidth="20" strokeDasharray="100.5 150.8" strokeDashoffset="-150.8" transform="rotate(-90 50 50)" />
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
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>Attendance</h3>
            <div className="flex items-center space-x-4">
              <select className="text-sm border rounded px-3 py-1 transition-all duration-200" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--primary-text)' }}>
                <option>Today</option>
                <option>This week</option>
                <option>Last week</option>
                <option>This month</option>
                <option>Last month</option>
              </select>
              <select className="text-sm border rounded px-3 py-1 transition-all duration-200" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--primary-text)' }}>
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
              {Array.isArray(processedAttendanceData) && processedAttendanceData.map((item: any, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex flex-col items-center mb-2">
                    <div className="w-8 rounded-t transition-all duration-300 hover:scale-105" style={{ height: `${(item.present / 300) * 120}px`, backgroundColor: 'var(--accent)' }}></div>
                    <div className="w-8 rounded-b transition-all duration-300 hover:scale-105" style={{ height: `${(item.absent / 300) * 120}px`, backgroundColor: 'var(--success)' }}></div>
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
          {/* Recent Students */}
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Recent Students</h3>
          <div className="space-y-4">
              {Array.isArray(_students) && _students.slice(0, 5).map((student: any, index: number) => {
                console.log('Student data:', student);
                const studentName =
                  (student?.first_name && student?.last_name && `${student?.first_name} ${student?.last_name}`) ||
                  student?.first_name ||
                  student?.last_name ||
                  student?.email ||
                  student?.id ||
                  'Unknown';
                return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
                  <GraduationCap className="w-5 h-5 mr-3 text-accent" />
                    <span className="font-medium" style={{ color: 'var(--primary-text)' }}>{student.full_name}</span>
                  {!student.is_active && (
                    <span className="ml-2 px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending Activation</span>
                  )}
                    <span className="text-sm text-secondary-text">{student?.email || student?.id || ''}</span>
                {!student.is_active && (
                  <button
                    className="ml-4 px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                    onClick={() => handleActivateStudent(student)}
                    disabled={activatingStudentId === student.id}
                  >
                    {activatingStudentId === student.id ? 'Activating...' : 'Activate'}
                  </button>
                )}
              </div>
                );
              })}
            {!Array.isArray(_students) && (
              <p className="text-sm text-secondary-text">No students data available</p>
            )}
          </div>
        </div>
        {/* Recent Teachers */}
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Recent Teachers</h3>
          <div className="space-y-4">
            {Array.isArray(_teachers) && _teachers.slice(0, 5).map((teacher: any, index: number) => {
                 console.log('Teacher data:', teacher);
                const teacherName =
                  (teacher.user?.first_name && teacher.user?.last_name && `${teacher.user.first_name} ${teacher.user.last_name}`) ||
                  teacher.user?.first_name ||
                  teacher.user?.last_name ||
                  teacher.user?.email ||
                  teacher.user?.id ||
                  'Unknown';
              const isStaff = teacher.user?.is_staff;
              const isActive = teacher.user?.is_active;
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-accent" />
                      <span className="font-medium" style={{ color: 'var(--primary-text)' }}>{teacherName}</span>
                    {(!isStaff || !isActive) && (
                      <span className="ml-2 px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending Staff Activation</span>
                    )}
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                    <span className="text-sm text-secondary-text">{teacher.user?.email || teacher.user?.id || ''}</span>
                  <button
                    className={`ml-4 px-3 py-1 text-xs rounded ${isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors disabled:opacity-50`}
                    onClick={() => handleToggleTeacherActive(teacher)}
                    disabled={activatingTeacherId === teacher.user.id}
                  >
                    {activatingTeacherId === teacher.user.id ? (isActive ? 'Deactivating...' : 'Activating...') : (isActive ? 'Deactivate' : 'Activate')}
                  </button>
                </div>
              );
            })}
            {!Array.isArray(_teachers) && (
              <p className="text-sm text-secondary-text">No teachers data available</p>
            )}
          </div>
        </div>
      </div>
      {/* Add a Recent Parents section with activate/deactivate controls */}
      <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Recent Parents</h3>
        <div className="space-y-4">
          {Array.isArray(_parents) && _parents.slice(0, 5).map((parent: any, index: number) => {
              console.log('Parent data:', parent);
            const isActive = parent.is_active;
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-accent" />
                    <span className="font-medium" style={{ color: 'var(--primary-text)' }}>{getParentDisplayName(parent)}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                </div>
                  <span className="text-sm text-secondary-text">{parent.user}</span>
                <button
                  className={`ml-4 px-3 py-1 text-xs rounded ${isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors disabled:opacity-50`}
                  onClick={() => handleToggleParentActive(parent)}
                  disabled={activatingParentId === parent.id}
                >
                  {activatingParentId === parent.id ? (isActive ? 'Deactivating...' : 'Activating...') : (isActive ? 'Deactivate' : 'Activate')}
                </button>
              </div>
            );
          })}
          {!Array.isArray(_parents) && (
            <p className="text-sm text-secondary-text">No parents data available</p>
          )}
        </div>
      </div>
      {/* Classroom Data */}
      <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--primary-text)' }}>Classroom Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(_classrooms) && _classrooms.map((classroom: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--primary-text)' }}>{classroom.name}</h4>
              <p className="text-sm text-secondary-text">Capacity: {classroom.capacity || 'N/A'}</p>
              <p className="text-sm text-secondary-text">Subjects: {classroom.subjects?.join(', ') || 'N/A'}</p>
              <p className="text-sm text-secondary-text">Building: {classroom.building || 'N/A'}</p>
            </div>
          ))}
          {!Array.isArray(_classrooms) && (
            <p className="text-sm text-secondary-text col-span-full">No classroom data available</p>
          )}
        </div>
      </div>
      {/* Notice Board and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board */}
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>Notice Board</h3>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110" style={{ backgroundColor: 'var(--accent)' }}>
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="space-y-4">
            {Array.isArray(noticeItems) && noticeItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--surface)' }}>{item.image}</div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1" style={{ color: 'var(--primary-text)' }}>{item.title}</h4>
                  <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>{item.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
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
          </div>
        </div>
        {/* Event Calendar */}
        <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
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
                <button className="p-1 rounded transition-all duration-200 hover:scale-110" style={{ backgroundColor: 'var(--surface)' }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: 'var(--secondary-text)' }} />
                </button>
                <button className="p-1 rounded transition-all duration-200 hover:scale-110" style={{ backgroundColor: 'var(--surface)' }}>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--secondary-text)' }} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                <div key={day} className="p-2 font-medium" style={{ color: 'var(--secondary-text)' }}>{day}</div>
              ))}
              {generateCalendar().map((day, index) => (
                <div key={index} className="p-2">
                  {day && (
                    <button
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 hover:scale-110`}
                      style={{ backgroundColor: day === 20 ? 'var(--accent)' : 'transparent', color: day === 20 ? '#ffffff' : 'var(--primary-text)' }}
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
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DashboardMainContent; 