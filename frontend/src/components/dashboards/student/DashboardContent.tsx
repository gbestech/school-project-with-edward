import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Loader2, Trophy, Clock, AlertCircle, DollarSign, TrendingUp, Bell, CheckCircle, XCircle, Target, GraduationCap, BookA, MessageSquare } from 'lucide-react';
import StudentService from '@/services/StudentService';

interface DashboardData {
  student_info: {
    name: string;
    class: string;
    education_level: string;
    registration_number: string;
    admission_date: string;
  };
  statistics: {
    performance: {
      average_score: number;
      label: string;
    };
    attendance: {
      rate: number;
      present: number;
      total: number;
      label: string;
    };
    subjects: {
      count: number;
      label: string;
    };
    schedule: {
      classes_today: number;
      label: string;
    };
  };
  recent_activities: Array<{
    type: string;
    title: string;
    description: string;
    date: string;
    time_ago: string;
  }>;
  announcements: Array<{
    id: number;
    title: string;
    content: string;
    type: string;
    is_pinned: boolean;
    created_at: string;
    time_ago: string;
  }>;
  upcoming_events: Array<{
    id: number;
    title: string;
    subtitle: string;
    description: string;
    type: string;
    start_date: string;
    end_date: string;
    days_until: number;
  }>;
  academic_calendar: Array<{
    id: number;
    title: string;
    description: string;
    type: string;
    start_date: string;
    end_date: string;
    location: string;
    days_until: number;
  }>;
  quick_stats: {
    total_results: number;
    this_term_results: number;
    attendance_this_month: number;
  };
}

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await StudentService.getDashboardData();
        console.log("Dashboard API response:", data);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'result':
        return <div className="w-2 h-2 bg-blue-600 rounded-full"></div>;
      case 'attendance':
        return <div className="w-2 h-2 bg-green-600 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-purple-600 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {dashboardData.student_info.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              {dashboardData.student_info.class} • {dashboardData.student_info.education_level}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Admitted: {new Date(dashboardData.student_info.admission_date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Student ID</p>
            <p className="text-xl font-semibold">{dashboardData.student_info.registration_number}</p>
            <div className="mt-4 text-center">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-100">Today</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Trophy className="text-blue-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">↗ +5.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{dashboardData.statistics.performance.average_score}%</h3>
          <p className="text-sm text-gray-600">Overall GPA</p>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${dashboardData.statistics.performance.average_score}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
            <span className="text-red-600 text-sm font-medium">↓ -2.1%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{dashboardData.statistics.attendance.rate}%</h3>
          <p className="text-sm text-gray-600">Attendance Rate</p>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${dashboardData.statistics.attendance.rate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="text-purple-600" size={24} />
            </div>
            <span className="text-blue-600 text-sm font-medium">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{dashboardData.statistics.subjects.count}</h3>
          <p className="text-sm text-gray-600">Enrolled Subjects</p>
          <p className="text-xs text-purple-600 mt-1">3 pending assignments</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="text-orange-600" size={24} />
            </div>
            <span className="text-orange-600 text-sm font-medium">Rank #12</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">8.5/10</h3>
          <p className="text-sm text-gray-600">Class Position</p>
          <p className="text-xs text-orange-600 mt-1">Top 15% of class</p>
        </div>
      </div>

      {/* Today's Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="mr-2 text-blue-600" size={20} />
              Today's Schedule
            </h3>
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {dashboardData.statistics.schedule.classes_today} classes
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                08:00
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-800">Mathematics</p>
                <p className="text-sm text-gray-600">Room 301 • Mr. Johnson</p>
              </div>
              <div className="text-green-600">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-semibold">
                10:00
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-800">Physics</p>
                <p className="text-sm text-gray-600">Lab 101 • Dr. Smith</p>
              </div>
              <div className="text-yellow-600">
                <Clock size={20} />
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                14:00
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-800">Chemistry</p>
                <p className="text-sm text-gray-600">Lab 102 • Mrs. Brown</p>
              </div>
              <div className="text-gray-400">
                <XCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Announcements & Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Bell className="mr-2 text-orange-600" size={20} />
              Announcements
            </h3>
            <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              {dashboardData.announcements?.length || 0} new
            </span>
          </div>
          <div className="space-y-4">
            {dashboardData.announcements && dashboardData.announcements.length > 0 ? (
              dashboardData.announcements.map((announcement) => {
                const getTypeColor = (type: string) => {
                  switch (type) {
                    case 'emergency':
                      return 'border-red-500 bg-red-50 text-red-700';
                    case 'academic':
                      return 'border-blue-500 bg-blue-50 text-blue-700';
                    case 'event':
                      return 'border-green-500 bg-green-50 text-green-700';
                    default:
                      return 'border-gray-500 bg-gray-50 text-gray-700';
                  }
                };
                
                const getTypeIcon = (type: string) => {
                  switch (type) {
                    case 'emergency':
                      return <AlertCircle className="text-red-500 mr-2" size={16} />;
                    case 'academic':
                      return <BookA className="text-blue-500 mr-2" size={16} />;
                    case 'event':
                      return <Trophy className="text-green-500 mr-2" size={16} />;
                    default:
                      return <Bell className="text-gray-500 mr-2" size={16} />;
                  }
                };
                
                const getTypeLabel = (type: string) => {
                  switch (type) {
                    case 'emergency':
                      return 'Important';
                    case 'academic':
                      return 'Academic';
                    case 'event':
                      return 'Event';
                    default:
                      return 'General';
                  }
                };
                
                return (
                  <div key={announcement.id} className={`border-l-4 p-4 rounded-r-lg ${getTypeColor(announcement.type)}`}>
                    <div className="flex items-center mb-2">
                      {getTypeIcon(announcement.type)}
                      <span className="text-sm font-medium">{getTypeLabel(announcement.type)}</span>
                      {announcement.is_pinned && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-1">{announcement.content}</p>
                    <p className="text-xs opacity-75">{announcement.time_ago}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No announcements at the moment</p>
                <p className="text-sm text-gray-400">Check back later for updates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Academic Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <GraduationCap className="text-blue-600 mr-3" size={20} />
              <span className="text-blue-800 font-medium">View Results (Portal)</span>
            </button>
            <button className="w-full flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Calendar className="text-green-600 mr-3" size={20} />
              <span className="text-green-800 font-medium">Check Attendance</span>
            </button>
            <button className="w-full flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <BookOpen className="text-purple-600 mr-3" size={20} />
              <span className="text-purple-800 font-medium">Assignments</span>
            </button>
            <button className="w-full flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <DollarSign className="text-orange-600 mr-3" size={20} />
              <span className="text-orange-800 font-medium">Fee Payment</span>
            </button>
          </div>
        </div>

        {/* Academic Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={20} />
              Academic Progress
            </h3>
            <span className="text-sm text-gray-500">Current Term</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Mathematics</p>
                <p className="text-sm text-gray-600">Latest: 95% | Assignment due in 2 days</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <span className="text-sm font-medium text-green-600">A+</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Physics</p>
                <p className="text-sm text-gray-600">Latest: 88% | Lab report pending</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
                <span className="text-sm font-medium text-blue-600">B+</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Chemistry</p>
                <p className="text-sm text-gray-600">Latest: 91% | Next test: Friday</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                </div>
                <span className="text-sm font-medium text-purple-600">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Calendar */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Calendar className="mr-2 text-purple-600" size={20} />
            Academic Calendar
          </h3>
          <span className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            {dashboardData.academic_calendar?.length || 0} upcoming events
          </span>
        </div>
        <div className="space-y-4">
          {dashboardData.academic_calendar && dashboardData.academic_calendar.length > 0 ? (
            dashboardData.academic_calendar.map((event) => {
              const getEventTypeColor = (type: string) => {
                switch (type) {
                  case 'EXAM':
                    return 'bg-red-100 text-red-800 border-red-200';
                  case 'HOLIDAY':
                    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  case 'SPORTS':
                    return 'bg-green-100 text-green-800 border-green-200';
                  case 'CULTURAL':
                    return 'bg-purple-100 text-purple-800 border-purple-200';
                  case 'MEETING':
                    return 'bg-blue-100 text-blue-800 border-blue-200';
                  default:
                    return 'bg-gray-100 text-gray-800 border-gray-200';
                }
              };
              
              const getEventTypeIcon = (type: string) => {
                switch (type) {
                  case 'EXAM':
                    return <BookOpen className="w-4 h-4" />;
                  case 'HOLIDAY':
                    return <Calendar className="w-4 h-4" />;
                  case 'SPORTS':
                    return <Trophy className="w-4 h-4" />;
                  case 'CULTURAL':
                    return <Users className="w-4 h-4" />;
                  case 'MEETING':
                    return <MessageSquare className="w-4 h-4" />;
                  default:
                    return <Calendar className="w-4 h-4" />;
                }
              };
              
              return (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg border ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      {event.location && (
                        <p className="text-xs text-gray-500">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.days_until > 0 ? `in ${event.days_until} days` : 'Today'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No upcoming academic events</p>
              <p className="text-sm text-gray-400">Check back for calendar updates</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Academic Activities</h3>
        {dashboardData.recent_activities.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recent_activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{activity.time_ago}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No recent activities</p>
            <p className="text-sm text-gray-400">Your academic activities will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
