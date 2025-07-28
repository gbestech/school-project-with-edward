import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Clock, 
  Bell, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Settings,
  GraduationCap,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  ChevronRight,
  Home,
  BarChart3,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  School,
  Users
} from 'lucide-react';

const StudentPortal = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  const [showPortalLogin, setShowPortalLogin] = useState(false);
  const [portalCredentials, setPortalCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIntoPortal, setIsLoggedIntoPortal] = useState(false);
  const [studentLevel, setStudentLevel] = useState<'nursery' | 'primary' | 'secondary'>('primary'); // nursery, primary, secondary
  const [showReportSheet, setShowReportSheet] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'portal', label: 'Portal', icon: Shield },
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

  const upcomingAssignments = [
    { subject: 'Mathematics', title: 'Calculus Problem Set', due: '2 days', priority: 'high' },
    { subject: 'Physics', title: 'Lab Report #3', due: '5 days', priority: 'medium' },
    { subject: 'Literature', title: 'Essay on Shakespeare', due: '1 week', priority: 'low' }
  ];

  const recentGrades = [
    { subject: 'Mathematics', grade: 'A+', percentage: 95, trend: 'up' },
    { subject: 'Physics', grade: 'A', percentage: 89, trend: 'up' },
    { subject: 'Chemistry', grade: 'B+', percentage: 85, trend: 'stable' },
    { subject: 'Literature', grade: 'A-', percentage: 91, trend: 'up' }
  ];

  // Sample report data for different levels
  const reportSheets = {
    nursery: {
      subjects: [
        { name: 'Play & Learn', grade: 'Excellent', score: '95%', teacher: 'Miss Sarah', comment: 'Shows great creativity and enthusiasm in learning activities.' },
        { name: 'Story Time', grade: 'Very Good', score: '88%', teacher: 'Miss Emma', comment: 'Listens well and participates actively in story sessions.' },
        { name: 'Art & Craft', grade: 'Excellent', score: '92%', teacher: 'Miss Lisa', comment: 'Demonstrates wonderful artistic skills and imagination.' },
        { name: 'Music & Movement', grade: 'Good', score: '85%', teacher: 'Mr. James', comment: 'Enjoys music activities and follows rhythm well.' },
        { name: 'Social Skills', grade: 'Excellent', score: '94%', teacher: 'Miss Sarah', comment: 'Plays well with others and shows kindness to friends.' }
      ],
      overall: { grade: 'Excellent', percentage: '90.8%', position: '3rd out of 25', conduct: 'Excellent' }
    },
    primary: {
      subjects: [
        { name: 'Mathematics', grade: 'A', score: '89%', teacher: 'Mrs. Johnson', comment: 'Strong problem-solving skills, needs practice in multiplication tables.' },
        { name: 'English Language', grade: 'A+', score: '95%', teacher: 'Miss Williams', comment: 'Excellent reading comprehension and creative writing abilities.' },
        { name: 'Science', grade: 'A', score: '87%', teacher: 'Mr. Davis', comment: 'Shows curiosity in experiments, good understanding of concepts.' },
        { name: 'Social Studies', grade: 'B+', score: '82%', teacher: 'Mrs. Brown', comment: 'Good knowledge of history and geography, participates well in discussions.' },
        { name: 'Art', grade: 'A', score: '91%', teacher: 'Miss Taylor', comment: 'Creative and imaginative artwork, excellent use of colors.' },
        { name: 'Physical Education', grade: 'A', score: '88%', teacher: 'Coach Wilson', comment: 'Good sportsmanship and athletic abilities.' }
      ],
      overall: { grade: 'A', percentage: '88.7%', position: '5th out of 35', conduct: 'Very Good' }
    },
    secondary: {
      subjects: [
        { name: 'Mathematics', grade: 'A', score: '85%', teacher: 'Dr. Anderson', comment: 'Strong analytical skills in algebra, needs improvement in geometry.' },
        { name: 'English Literature', grade: 'A+', score: '92%', teacher: 'Prof. Martinez', comment: 'Exceptional essay writing and literary analysis skills.' },
        { name: 'Physics', grade: 'B+', score: '78%', teacher: 'Dr. Thompson', comment: 'Good understanding of concepts, practice more numerical problems.' },
        { name: 'Chemistry', grade: 'A', score: '88%', teacher: 'Dr. Lee', comment: 'Excellent lab work and chemical equation balancing.' },
        { name: 'Biology', grade: 'A', score: '90%', teacher: 'Mrs. Garcia', comment: 'Outstanding knowledge of life sciences and practical work.' },
        { name: 'History', grade: 'A-', score: '83%', teacher: 'Mr. Roberts', comment: 'Good historical analysis, improve timeline knowledge.' },
        { name: 'Geography', grade: 'B+', score: '80%', teacher: 'Ms. Clark', comment: 'Solid understanding of physical geography, work on map skills.' },
        { name: 'Computer Science', grade: 'A+', score: '94%', teacher: 'Mr. Kumar', comment: 'Excellent programming skills and logical thinking.' }
      ],
      overall: { grade: 'A', percentage: '86.3%', position: '8th out of 45', conduct: 'Excellent' }
    }
  };

  // Fix: Move todaySchedule definition here, not inside a function
  const todaySchedule = [
    { time: '09:00 AM', subject: 'Mathematics', room: 'Room 201', status: 'completed' },
    { time: '10:30 AM', subject: 'Physics', room: 'Lab 103', status: 'current' },
    { time: '12:00 PM', subject: 'Lunch Break', room: 'Cafeteria', status: 'upcoming' },
    { time: '01:30 PM', subject: 'Literature', room: 'Room 105', status: 'upcoming' },
    { time: '03:00 PM', subject: 'Chemistry', room: 'Lab 204', status: 'upcoming' }
  ];

  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation (in real app, this would be secure authentication)
    if (portalCredentials.username && portalCredentials.password) {
      setIsLoggedIntoPortal(true);
      setShowPortalLogin(false);
      setShowReportSheet(true);
      // Determine student level based on username pattern (demo purposes)
      if (portalCredentials.username.includes('nursery')) setStudentLevel('nursery');
      else if (portalCredentials.username.includes('secondary')) setStudentLevel('secondary');
      else setStudentLevel('primary');
    }
  };

  const handlePortalLogout = () => {
    setIsLoggedIntoPortal(false);
    setShowReportSheet(false);
    setPortalCredentials({ username: '', password: '' });
    setActiveSection('dashboard');
  };

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

  const DashboardContent = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Alex! 🎓</h1>
          <p className="text-xl opacity-90">Ready to conquer another amazing day of learning?</p>
          <div className="mt-4 text-sm opacity-80">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Current GPA" 
          value="3.85" 
          subtitle="↑ 0.12 this semester"
          icon={Trophy} 
          gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
          trend={true}
        />
        <StatCard 
          title="Attendance" 
          value="94%" 
          subtitle="Excellent record"
          icon={Clock} 
          gradient="bg-gradient-to-br from-green-400 to-emerald-500"
        />
        <StatCard 
          title="Assignments" 
          value="12" 
          subtitle="3 due this week"
          icon={BookOpen} 
          gradient="bg-gradient-to-br from-blue-400 to-cyan-500"
        />
        <StatCard 
          title="Credits" 
          value="18" 
          subtitle="This semester"
          icon={Award} 
          gradient="bg-gradient-to-br from-purple-400 to-pink-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Today's Schedule</h2>
            <Calendar className="text-blue-500" size={24} />
          </div>
          <div className="space-y-4">
            {todaySchedule.map((item, index) => (
              <div key={index} className={`flex items-center p-4 rounded-2xl transition-all duration-300 hover:transform hover:translate-x-2 ${
                item.status === 'current' ? 'bg-blue-50 border-2 border-blue-200 shadow-lg' :
                item.status === 'completed' ? 'bg-green-50 border border-green-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-3 h-3 rounded-full mr-4 ${
                  item.status === 'current' ? 'bg-blue-500 animate-pulse' :
                  item.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{item.subject}</h3>
                    <span className="text-sm text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.room}</p>
                </div>
                {item.status === 'current' && (
                  <div className="ml-4 px-3 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse">
                    Live Now
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
              <div className="relative">
                <Bell className="text-orange-500" size={20} />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {notifications}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                <p className="text-sm font-medium text-blue-800">New assignment posted</p>
                <p className="text-xs text-blue-600">Mathematics • 2 hours ago</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl border-l-4 border-green-400">
                <p className="text-sm font-medium text-green-800">Grade updated</p>
                <p className="text-xs text-green-600">Physics Lab • 1 day ago</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border-l-4 border-purple-400">
                <p className="text-sm font-medium text-purple-800">Event reminder</p>
                <p className="text-xs text-purple-600">Science Fair • Tomorrow</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">This Week</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Classes Attended</span>
                <span className="font-bold">18/20</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Assignments Completed</span>
                <span className="font-bold">8/12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Study Hours</span>
                <span className="font-bold">24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Assignments</h2>
          <Target className="text-red-500" size={24} />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingAssignments.map((assignment, index) => (
            <div key={index} className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 ${
              assignment.priority === 'high' ? 'border-red-200 bg-red-50' :
              assignment.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{assignment.subject}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  assignment.priority === 'high' ? 'bg-red-200 text-red-800' :
                  assignment.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {assignment.priority}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{assignment.title}</h3>
              <p className="text-sm text-gray-600">Due in {assignment.due}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grades */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Grades</h2>
          <BarChart3 className="text-green-500" size={24} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentGrades.map((grade, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{grade.subject}</span>
                {grade.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{grade.grade}</div>
              <div className="text-sm text-gray-600">{grade.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ReportSheet = () => {
    const currentReport = reportSheets[studentLevel];
    const levelNames = { nursery: 'Nursery', primary: 'Primary', secondary: 'Secondary' };
    
    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">📋 Term Report Sheet</h1>
                <p className="text-xl opacity-90">{levelNames[studentLevel]} Level • Term 2, 2025</p>
                <p className="text-lg opacity-80 mt-2">Alex Johnson • Student ID: 2024001</p>
              </div>
              <div className="text-right">
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-300">
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  {/* <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-300">
                    <Print size={16} />
                    <span>Print</span>
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Trophy className="mr-3 text-yellow-500" />
            Overall Performance
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{currentReport.overall.grade}</div>
              <p className="text-sm text-gray-700">Overall Grade</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{currentReport.overall.percentage}</div>
              <p className="text-sm text-gray-700">Average Score</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{currentReport.overall.position}</div>
              <p className="text-sm text-gray-700">Class Position</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{currentReport.overall.conduct}</div>
              <p className="text-sm text-gray-700">Conduct</p>
            </div>
          </div>
        </div>

        {/* Subject Grades */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <BookOpen className="mr-3 text-blue-500" />
            Subject Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Subject</th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-700">Grade</th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-700">Score</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Teacher</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-700">Comments</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.subjects.map((subject, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-3 font-medium text-gray-800">{subject.name}</td>
                    <td className="py-4 px-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        subject.grade.includes('A') || subject.grade === 'Excellent' ? 'bg-green-100 text-green-800' :
                        subject.grade.includes('B') || subject.grade === 'Very Good' ? 'bg-blue-100 text-blue-800' :
                        subject.grade.includes('C') || subject.grade === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {subject.grade}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center font-semibold text-gray-700">{subject.score}</td>
                    <td className="py-4 px-3 text-gray-600">{subject.teacher}</td>
                    <td className="py-4 px-3 text-gray-600 text-sm">{subject.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Level-specific insights */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Users className="mr-3 text-purple-500" />
            {studentLevel === 'nursery' ? '🌟 Development Milestones' : 
             studentLevel === 'primary' ? '📚 Learning Progress' : 
             '🎯 Academic Analysis'}
          </h2>
          
          {studentLevel === 'nursery' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
                <h3 className="font-semibold text-pink-800 mb-2">🎨 Creative Development</h3>
                <p className="text-sm text-gray-700">Shows excellent imagination in art and storytelling activities. Loves experimenting with colors and shapes.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">🤝 Social Skills</h3>
                <p className="text-sm text-gray-700">Plays well with others, shares toys willingly, and shows empathy towards classmates.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🧠 Cognitive Growth</h3>
                <p className="text-sm text-gray-700">Demonstrates good memory skills and follows multi-step instructions well.</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">🏃 Physical Development</h3>
                <p className="text-sm text-gray-700">Good fine and gross motor skills development. Enjoys physical activities and playground games.</p>
              </div>
            </div>
          )}

          {studentLevel === 'primary' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">📈 Strengths</h3>
                <p className="text-sm text-gray-700">Excellent in creative writing and reading comprehension. Shows strong leadership qualities in group activities.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">🎯 Areas for Improvement</h3>
                <p className="text-sm text-gray-700">Focus on multiplication tables practice and participate more actively in science experiments.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">💡 Recommendations</h3>
                <p className="text-sm text-gray-700">Continue encouraging reading habits at home. Consider joining the school's creative writing club.</p>
              </div>
            </div>
          )}

          {studentLevel === 'secondary' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">🏆 Academic Strengths</h3>
                <p className="text-sm text-gray-700">Outstanding performance in Computer Science and English Literature. Shows exceptional analytical and programming skills.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">⚡ Challenge Areas</h3>
                <p className="text-sm text-gray-700">Physics numerical problems need more practice. Geography map skills require additional attention.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200">
                <h3 className="font-semibold text-teal-800 mb-2">🚀 Future Pathways</h3>
                <p className="text-sm text-gray-700">Strong candidate for STEM programs. Consider advanced computer science courses and coding competitions.</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePortalLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Logout from Portal
          </button>
        </div>
      </div>
    );
  };

  const PortalLogin = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 opacity-5 rounded-full transform translate-x-16 -translate-y-16"></div>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Secure Portal Access</h2>
          <p className="text-gray-600">Enter your credentials to view your report sheet</p>
        </div>

        <form onSubmit={handlePortalLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={portalCredentials.username}
                onChange={(e) => setPortalCredentials({...portalCredentials, username: e.target.value})}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="Enter your username"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Try: nursery_alex, primary_alex, or secondary_alex</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={portalCredentials.password}
                onChange={(e) => setPortalCredentials({...portalCredentials, password: e.target.value})}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Demo password: password123</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Shield size={20} />
            <span>Access Portal</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {setShowPortalLogin(false); setActiveSection('dashboard');}}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
        
  // Main return for StudentPortal
  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
                  {item.id === 'messages' && notifications > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{notifications}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Main Content */}
        <main className="flex-1">
          {activeSection === 'dashboard' && <DashboardContent />}
          {activeSection === 'portal' && !isLoggedIntoPortal && <PortalLogin />}
          {activeSection === 'portal' && isLoggedIntoPortal && showReportSheet && <ReportSheet />}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="text-white" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Alex Johnson</h2>
                <p className="text-gray-600 mb-6">Computer Science Major • Class of 2026</p>
                <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                  <div className="space-y-3">
                    <div><span className="font-semibold">Student ID:</span> 2024001</div>
                    <div><span className="font-semibold">Email:</span> alex.johnson@university.edu</div>
                    <div><span className="font-semibold">Phone:</span> +1 (555) 123-4567</div>
                  </div>
                  <div className="space-y-3">
                    <div><span className="font-semibold">Year:</span> Sophomore</div>
                    <div><span className="font-semibold">Major:</span> Computer Science</div>
                    <div><span className="font-semibold">Minor:</span> Mathematics</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Other sections would be implemented similarly with rich, interactive content */}
          {activeSection !== 'dashboard' && activeSection !== 'profile' && activeSection !== 'portal' && (
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