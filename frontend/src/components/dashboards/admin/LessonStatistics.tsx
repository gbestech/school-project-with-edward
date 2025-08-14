import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  Target,
  Award,
  Star,
  Activity,
  PieChart,
  LineChart,
  Target as TargetIcon,
  Zap,
  Heart,
  Trophy,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { Lesson, LessonStatistics as LessonStats } from '../../../services/LessonService';

interface LessonStatisticsProps {
  statistics: LessonStats;
  lessons: Lesson[];
}

const LessonStatistics: React.FC<LessonStatisticsProps> = ({ statistics, lessons }) => {
  const { isDarkMode } = useGlobalTheme();

  // Ensure statistics is not null/undefined
  const safeStats = statistics || {
    total_lessons: 0,
    completed_lessons: 0,
    scheduled_lessons: 0,
    in_progress_lessons: 0,
    cancelled_lessons: 0,
    avg_completion_percentage: 0,
    upcoming_lessons: 0,
    overdue_lessons: 0,
    lessons_by_type: [],
    lessons_by_status: []
  };

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    iconSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };

  // Calculate additional metrics
  const completionRate = safeStats.total_lessons > 0
    ? Math.round((safeStats.completed_lessons / safeStats.total_lessons) * 100)
    : 0;

  const averageAttendance = lessons.length > 0
    ? Math.round(lessons.reduce((sum, lesson) => sum + (lesson.attendance_count || 0), 0) / lessons.length)
    : 0;

  const averageParticipation = lessons.length > 0
    ? Math.round(lessons.reduce((sum, lesson) => sum + (lesson.participation_score || 0), 0) / lessons.length)
    : 0;

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'text-blue-600 bg-blue-100',
      in_progress: 'text-orange-600 bg-orange-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      postponed: 'text-purple-600 bg-purple-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  // Get lesson type color
  const getTypeColor = (type: string) => {
    const colors = {
      lecture: 'text-blue-600 bg-blue-100',
      practical: 'text-green-600 bg-green-100',
      assessment: 'text-purple-600 bg-purple-100',
      discussion: 'text-orange-600 bg-orange-100',
      workshop: 'text-red-600 bg-red-100',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{safeStats.total_lessons}</span>
          </div>
          <h3 className="font-semibold mb-1">Total Lessons</h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>All time lessons</p>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{safeStats.completed_lessons}</span>
          </div>
          <h3 className="font-semibold mb-1">Completed</h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>{completionRate}% success rate</p>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock size={24} className="text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{safeStats.scheduled_lessons}</span>
          </div>
          <h3 className="font-semibold mb-1">Scheduled</h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Upcoming lessons</p>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity size={24} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{safeStats.in_progress_lessons}</span>
          </div>
          <h3 className="font-semibold mb-1">In Progress</h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Currently active</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border}`}>
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp size={20} className={themeClasses.iconPrimary} />
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Completion Rate</span>
                <span className="font-bold text-blue-600">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Average Attendance</span>
                <span className="font-bold text-green-600">{averageAttendance}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(averageAttendance * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Participation Score</span>
                <span className="font-bold text-orange-600">{averageParticipation}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${averageParticipation}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border}`}>
          <div className="flex items-center space-x-2 mb-6">
            <PieChart size={20} className={themeClasses.iconPrimary} />
            <h3 className="text-lg font-semibold">Status Distribution</h3>
          </div>

          <div className="space-y-4">
            {safeStats.lessons_by_status && safeStats.lessons_by_status.length > 0 ? (
              safeStats.lessons_by_status.map((status, index) => {
                const percentage = safeStats.total_lessons > 0
                  ? Math.round((status.count / safeStats.total_lessons) * 100)
                  : 0;

                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status).split(' ')[1]}`}></div>
                      <span className="font-medium capitalize">{status.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{status.count}</span>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>({percentage}%)</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <PieChart size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                <p className={`${themeClasses.textSecondary}`}>No status data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Types and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border}`}>
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 size={20} className={themeClasses.iconPrimary} />
            <h3 className="text-lg font-semibold">Lesson Types</h3>
          </div>

          <div className="space-y-4">
            {safeStats.lessons_by_type && safeStats.lessons_by_type.length > 0 ? (
              safeStats.lessons_by_type.map((type, index) => {
                const percentage = safeStats.total_lessons > 0
                  ? Math.round((type.count / safeStats.total_lessons) * 100)
                  : 0;

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(type.lesson_type).split(' ')[1]}`}></div>
                      <span className="font-medium capitalize">{type.lesson_type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{type.count}</span>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>({percentage}%)</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BarChart3 size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                <p className={`${themeClasses.textSecondary}`}>No type data available</p>
              </div>
            )}
          </div>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border}`}>
          <div className="flex items-center space-x-2 mb-6">
            <Activity size={20} className={themeClasses.iconPrimary} />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {Array.isArray(lessons) && lessons.length > 0 ? (
              lessons.slice(0, 5).map((lesson, index) => (
                <div key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${getStatusColor(lesson.status).split(' ')[1]}`}>
                    {lesson.status === 'completed' && <CheckCircle size={16} className="text-green-600" />}
                    {lesson.status === 'in_progress' && <Activity size={16} className="text-orange-600" />}
                    {lesson.status === 'scheduled' && <Clock size={16} className="text-blue-600" />}
                    {lesson.status === 'cancelled' && <AlertTriangle size={16} className="text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium truncate">{lesson.title}</div>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      {new Date(lesson.date).toLocaleDateString()} • {lesson.time_slot}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lesson.status)}`}>
                    {lesson.status_display}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                <p className={`${themeClasses.textSecondary}`}>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} text-center hover:shadow-xl transition-all duration-300`}>
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-fit mx-auto mb-4">
            <Trophy size={24} className="text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Success Rate</h3>
          <p className="text-2xl font-bold text-blue-600 mb-1">{completionRate}%</p>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Lesson completion</p>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} text-center hover:shadow-xl transition-all duration-300`}>
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-full w-fit mx-auto mb-4">
            <Heart size={24} className="text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Engagement</h3>
          <p className="text-2xl font-bold text-green-600 mb-1">{averageParticipation}%</p>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Student participation</p>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} text-center hover:shadow-xl transition-all duration-300`}>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full w-fit mx-auto mb-4">
            <Sparkles size={24} className="text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Attendance</h3>
          <p className="text-2xl font-bold text-purple-600 mb-1">{averageAttendance}</p>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Average students</p>
        </div>

        <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border} text-center hover:shadow-xl transition-all duration-300`}>
          <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full w-fit mx-auto mb-4">
            <GraduationCap size={24} className="text-orange-600" />
          </div>
          <h3 className="font-semibold mb-2">Efficiency</h3>
          <p className="text-2xl font-bold text-orange-600 mb-1">{safeStats.avg_completion_percentage}%</p>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Average completion</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={`${themeClasses.bgCard} rounded-2xl p-6 shadow-lg border ${themeClasses.border}`}>
        <div className="flex items-center space-x-2 mb-6">
          <TargetIcon size={20} className={themeClasses.iconPrimary} />
          <h3 className="text-lg font-semibold">Summary Statistics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{safeStats.upcoming_lessons}</div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">{safeStats.overdue_lessons}</div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">{safeStats.in_progress_lessons}</div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{safeStats.cancelled_lessons}</div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonStatistics;
