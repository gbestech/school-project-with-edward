import { useState, useEffect } from 'react';
import { 
  User, Calendar, BookOpen, Trophy, Clock, Bell, CreditCard, MessageSquare, Settings,
  GraduationCap, TrendingUp, CheckCircle, AlertCircle, Award, Home,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import StudentService from '@/services/StudentService';
import api from '@/services/api';
import { useSettings } from '@/contexts/SettingsContext';

const StudentPortal = () => {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
const [profileError, setProfileError] = useState<string | null>(null);
const [userProfile, setUserProfile] = useState<any>(null);


  useEffect(() => {
    setLoading(true);
    setError(null);
    StudentService.getStudentDashboard()
      .then(data => setDashboardData(data))
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setProfileLoading(true);
    setProfileError(null);
    // Try to get student ID from user.student_data or dashboardData
    let studentId: number | undefined = undefined;
    if (user && user.role === 'student' && user.student_data?.id) {
      studentId = Number(user.student_data.id);
    } else if (dashboardData && dashboardData.id) {
      studentId = Number(dashboardData.id);
    }
    if (studentId && !isNaN(studentId)) {
      StudentService.getStudent(studentId)
        .then((profile) => {
          setStudentProfile(profile);
        })
        .catch(() => {
          setProfileError('Failed to load student profile');
        })
        .finally(() => setProfileLoading(false));
    } else {
      setProfileError('User data not available');
      setProfileLoading(false);
    }
  }, [user, dashboardData]);

  useEffect(() => {
    // Fetch user profile on dashboard load
    api.get('/api/profiles/me/')
      .then(setUserProfile)
      .catch(() => setUserProfile(null));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
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

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend }: any) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl ${gradient}`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon size={128} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Icon size={24} className="opacity-80" />
          {trend && <TrendingUp size={16} className="text-green-300" />}
        </div>
        <h3 className="text-3xl font-bold mb-1">{value}</h3>
        <p className="text-sm opacity-90">{title}</p>
        {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const DashboardContent = () => {
    if (loading) return <div className="p-8 text-center text-lg">Loading dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!dashboardData) return <div className="p-8 text-center text-red-500">No dashboard data available.</div>;

    return (
    <div className="space-y-8">
      {/* Welcome Section */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden flex items-center gap-8">
          {dashboardData.profile_picture && (
            <img src={dashboardData.profile_picture} alt="Profile" className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover mr-8" />
          )}
          <div className="relative z-10 flex-1">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {dashboardData.student_name || 'Student'}! 🎓</h1>
            <p className="text-xl opacity-90">Class: {dashboardData.student_class_display || 'N/A'} • Level: {dashboardData.education_level_display || 'N/A'}</p>
            <div className="mt-2 text-sm opacity-80">
              Admission Date: {dashboardData.admission_date ? new Date(dashboardData.admission_date).toLocaleDateString() : 'N/A'}
            </div>
            <div className="mt-2 text-sm opacity-80">
            {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Fees" 
            value={dashboardData.total_fees ?? '0'}
            subtitle="This session"
            icon={CreditCard} 
          gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
        />
        <StatCard 
            title="Total Paid" 
            value={dashboardData.total_paid ?? '0'}
            subtitle="This session"
            icon={CheckCircle} 
          gradient="bg-gradient-to-br from-green-400 to-emerald-500"
        />
        <StatCard 
            title="Balance" 
            value={dashboardData.total_balance ?? '0'}
            subtitle="Outstanding"
            icon={Award} 
          gradient="bg-gradient-to-br from-blue-400 to-cyan-500"
        />
        <StatCard 
            title="Overdue Fees" 
            value={dashboardData.overdue_count ?? '0'}
            subtitle=""
            icon={AlertCircle} 
            gradient="bg-gradient-to-br from-red-400 to-pink-500"
          />
        </div>

        {/* Attendance Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Clock className="mr-3 text-blue-500" /> Attendance Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{dashboardData.attendance_summary?.present ?? 0}</div>
              <div className="text-sm text-gray-700">Present</div>
              </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{dashboardData.attendance_summary?.absent ?? 0}</div>
              <div className="text-sm text-gray-700">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{dashboardData.attendance_summary?.late ?? 0}</div>
              <div className="text-sm text-gray-700">Late</div>
              </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{dashboardData.attendance_summary?.excused ?? 0}</div>
              <div className="text-sm text-gray-700">Excused</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData.attendance_summary?.total ?? 0}</div>
              <div className="text-sm text-gray-700">Total</div>
          </div>
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Assignments</h2>
            <BookOpen className="text-blue-500" size={24} />
        </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Lesson</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardData.upcoming_assignments ?? []).length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-gray-400">No upcoming assignments</td></tr>
                )}
                {(dashboardData.upcoming_assignments ?? []).map((a: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-800">{a.title}</td>
                    <td className="py-4 px-3 text-gray-700">{a.lesson}</td>
                    <td className="py-4 px-3 text-gray-700">{a.assessment_type}</td>
                    <td className="py-4 px-3 text-gray-700">{a.due_date ? new Date(a.due_date).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Recent Grades */}
     
        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Today's Schedule</h2>
            <Calendar className="text-blue-500" size={24} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Start Time</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">End Time</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardData.today_schedule ?? []).length === 0 && (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-400">No lessons scheduled for today</td></tr>
                )}
                {(dashboardData.today_schedule ?? []).map((l: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-800">{l.title}</td>
                    <td className="py-4 px-3 text-gray-700">{l.subject}</td>
                    <td className="py-4 px-3 text-gray-700">{l.start_time}</td>
                    <td className="py-4 px-3 text-gray-700">{l.end_time}</td>
                    <td className="py-4 px-3 text-gray-700">{l.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
            <Bell className="text-blue-500" size={24} />
              </div>
          <ul className="divide-y divide-gray-100">
            {(dashboardData.notifications ?? []).length === 0 && (
              <li className="py-4 text-gray-400 text-center">No notifications</li>
            )}
            {(dashboardData.notifications ?? []).map((n: any, idx: number) => (
              <li key={idx} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{n.title}</div>
                  <div className="text-gray-600 text-sm mt-1">{n.content}</div>
                  <div className="text-xs text-gray-400 mt-1">{n.announcement_type} • {n.start_date ? new Date(n.start_date).toLocaleString() : ''}</div>
              </div>
                {n.end_date && <div className="text-xs text-gray-500 mt-2 md:mt-0">Ends: {new Date(n.end_date).toLocaleString()}</div>}
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Payments (already wired) */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Payments</h2>
            <CreditCard className="text-blue-500" size={24} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardData.recent_payments ?? []).length === 0 && (
                  <tr><td colSpan={3} className="text-center py-4 text-gray-400">No recent payments</td></tr>
                )}
                {(dashboardData.recent_payments ?? []).map((payment: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-800">{payment.payment_date ? new Date(payment.payment_date).toLocaleString() : 'N/A'}</td>
                    <td className="py-4 px-3 text-gray-700">{payment.amount ?? 'N/A'}</td>
                    <td className="py-4 px-3 text-gray-700">{payment.status_display ?? payment.status ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ProfileTab = () => {
    const profileData = studentProfile || (user?.role === 'student' ? dashboardData : null);
    const { settings } = useSettings();
    if (profileLoading && !profileData) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-500 text-lg">Loading profile...</div>
          </div>
        </div>
      );
    }

    if (profileError && !profileData) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center text-red-500 text-lg">
            <AlertCircle size={48} className="mx-auto mb-4" />
            Error: {profileError}
          </div>
        </div>
      );
    }

    if (!profileData) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center text-gray-500 text-lg">
            No student profile data available.
            <br />
            <small>Check console for debugging information.</small>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-full max-w-2xl bg-white/60 backdrop-blur-lg shadow-2xl rounded-3xl p-10 border border-slate-200 overflow-hidden">
          {/* Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-3xl" />
          {/* Subtle background pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('${settings?.logo_url || '/vite.svg'}')] bg-no-repeat bg-right-bottom bg-contain" />
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-36 h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 blur-xl opacity-60 animate-pulse" />
              {profileData.profile_picture ? (
                <img src={profileData.profile_picture} alt="Profile" className="w-36 h-36 object-cover rounded-full border-4 border-white shadow-xl relative z-10" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 text-white text-5xl font-bold border-4 border-white shadow-xl relative z-10">
                  <User size={64} />
                </div>
              )}
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-1 drop-shadow-lg tracking-tight">{profileData.full_name || profileData.student_name || 'Student'}</h2>
            <div className="flex items-center gap-2 text-slate-700"><Trophy size={18} className="text-yellow-500" /> {(userProfile?.user?.username || profileData.profile?.user?.username || profileData.registration_number || 'N/A')}</div>
            <div className="text-lg text-slate-600 font-medium mb-2">{profileData.student_class_display || profileData.student_class || 'N/A'} • {profileData.education_level_display || profileData.education_level || 'N/A'}</div>
            
          </div>
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700"><BookOpen size={18} className="text-blue-500" /><span className="font-semibold">Class:</span> {profileData.student_class_display || profileData.student_class || 'N/A'}</div>
              <div className="flex items-center gap-2 text-slate-700"><Calendar size={18} className="text-purple-500" /><span className="font-semibold">Admission Date:</span> {profileData.admission_date ? new Date(profileData.admission_date).toLocaleDateString() : 'N/A'}</div>
              <div className="flex items-center gap-2 text-slate-700"><Award size={18} className="text-pink-500" /><span className="font-semibold">Email:</span> {profileData.email || user?.email || 'N/A'}</div>
            </div>
            <div className="space-y-3">
              {profileData.gender && (
              <div className="text-base text-slate-500 font-medium mb-2">Gender: {profileData.gender}</div>
            )}
              <div className="flex items-center gap-2 text-slate-700"><BarChart3 size={18} className="text-green-500" /><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${(profileData.verification_status?.is_active ?? profileData.is_active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{(profileData.verification_status?.is_active ?? profileData.is_active) ? 'Active' : 'Inactive'}</span></div>
            </div>
        </div>
      </div>
    </div>
  );
  };
        
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-16 mt-8">
      {/* Sidebar/Menu */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="md:w-64 w-full mb-8 md:mb-0">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-lg font-medium transition-colors duration-200 ${activeSection === item.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-blue-50'}`}
                  onClick={() => setActiveSection(item.id)}
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
          {activeSection === 'dashboard' && <DashboardContent />}
          {activeSection === 'profile' && <ProfileTab />}
          {activeSection !== 'dashboard' && activeSection !== 'profile' && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
              <p className="text-gray-600">The {menuItems.find(item => item.id === activeSection)?.label} section is under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;