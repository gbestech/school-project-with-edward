import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock,
  TrendingUp,
  Award,
  CheckSquare,
  Eye,
  BarChart3,
  Bell,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TeacherUserData } from '@/types/types';

interface TeacherDashboardContentProps {
  dashboardData: any;
  onRefresh: () => void;
  error?: string | null;
}

const TeacherDashboardContent: React.FC<TeacherDashboardContentProps> = ({ 
  dashboardData, 
  onRefresh,
  error 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const teacher = user as TeacherUserData;
  const teacherData = teacher?.teacher_data;

  // Use real data from dashboardData or fallback to mock data
  const stats = dashboardData?.stats || {
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    attendanceRate: 0,
    pendingExams: 0,
    unreadMessages: 0,
    upcomingLessons: 0,
    recentResults: 0
  };

  const recentActivities = dashboardData?.activities || [];

  const quickActions = [
    {
      id: 'attendance',
      title: 'Mark Attendance',
      description: 'Record student attendance',
      icon: CheckSquare,
      color: 'bg-green-500',
      path: '/teacher/attendance'
    },
    {
      id: 'exam',
      title: 'Create Exam',
      description: 'Set up new examination',
      icon: FileText,
      color: 'bg-blue-500',
      path: '/teacher/exams'
    },
    {
      id: 'result',
      title: 'Record Results',
      description: 'Enter student results',
      icon: Award,
      color: 'bg-purple-500',
      path: '/teacher/results'
    },
    {
      id: 'message',
      title: 'Send Message',
      description: 'Communicate with students/parents',
      icon: MessageSquare,
      color: 'bg-orange-500',
      path: '/teacher/messages'
    },
    {
      id: 'schedule',
      title: 'View Schedule',
      description: 'Check your teaching schedule',
      icon: Calendar,
      color: 'bg-indigo-500',
      path: '/teacher/schedule'
    },
    {
      id: 'reports',
      title: 'Generate Reports',
      description: 'Create performance reports',
      icon: BarChart3,
      color: 'bg-teal-500',
      path: '/teacher/reports'
    }
  ];

  const upcomingEvents = dashboardData?.events || [];

  const handleQuickAction = (action: any) => {
    navigate(action.path);
  };

  // Helper function to get teacher profile picture
  const getTeacherProfilePicture = () => {
    // Check for different possible photo field names
    const teacherData = (user as any)?.profile?.teacher_data; // Fixed: check profile.teacher_data
    const profileData = (user as any)?.profile;
    let photoUrl = null;
    
    // First check teacher_data (if it exists)
    if (teacherData && Object.keys(teacherData).length > 0) {
      if (teacherData.photo) {
        photoUrl = teacherData.photo;
      } else if (teacherData.profile_picture) {
        photoUrl = teacherData.profile_picture;
      } else if (teacherData.avatar) {
        photoUrl = teacherData.avatar;
      } else if (teacherData.avatar_url) {
        photoUrl = teacherData.avatar_url;
      } else if (teacherData.image) {
        photoUrl = teacherData.image;
      }
    }
    
    // If no photo found in teacher_data, check profile object
    if (!photoUrl && profileData) {
      if (profileData.profile_image_url) {
        photoUrl = profileData.profile_image_url;
      } else if (profileData.profile_picture) {
        photoUrl = profileData.profile_picture;
      } else if (profileData.avatar_url) {
        photoUrl = profileData.avatar_url;
      } else if (profileData.avatar) {
        photoUrl = profileData.avatar;
      }
    }
    
    // If still no photo found, check user object directly
    if (!photoUrl) {
      if ((user as any)?.avatar_url) {
        photoUrl = (user as any).avatar_url;
      } else if ((user as any)?.profile_picture) {
        photoUrl = (user as any).profile_picture;
      } else if ((user as any)?.photo) {
        photoUrl = (user as any).photo;
      }
    }
    
    if (photoUrl) {
      // Check if it's a full URL or just a path
      const finalUrl = photoUrl.startsWith('http') 
        ? photoUrl 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${photoUrl}`;
      
      return finalUrl;
    }
    
    return null;
  };

  // Helper function to get teacher initials
  const getTeacherInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    return 'T';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-sm">!</span>
            </div>
            <p className="text-red-800 dark:text-red-200 text-sm">
              {error} - Showing fallback data. Please refresh to try again.
            </p>
            <button
              onClick={onRefresh}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {teacherData?.user?.first_name || user?.first_name}!
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to inspire and educate today?
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Active Teacher</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {getTeacherProfilePicture() ? (
                <img 
                  src={getTeacherProfilePicture()!} 
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${getTeacherProfilePicture() ? 'hidden' : ''}`}>
                <span className="text-2xl font-bold text-white">
                  {getTeacherInitials()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">My Classes</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalClasses}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.attendanceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingExams}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-md group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-slate-900 dark:text-white">{action.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity: any) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event: any) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{event.time}</p>
                </div>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};

export default TeacherDashboardContent;
