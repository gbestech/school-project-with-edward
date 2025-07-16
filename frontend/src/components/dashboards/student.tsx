import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  FileText, 
  BookOpen, 
  Calendar, 
  Bell, 
  MessageSquare, 
  Award,
  Download,
  Search,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Eye,
  Lock,
  DollarSign,
  Users,
  Activity,
  MapPin,
  Shield,
  Heart,
  Bus,
  Library,
  UserCheck,
  Phone,
  Mail,
  CreditCard,
  Calendar as CalendarIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  Trophy,
  Bookmark,
  ClipboardList
} from 'lucide-react';

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultCode, setResultCode] = useState('');
  const [profileImage, setProfileImage] = useState('/api/placeholder/120/120');
  const [selectedGrade, setSelectedGrade] = useState('Secondary');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Grade-level adaptive subjects
  const subjectsByGrade = {
    'Pre-nursery': [
      { name: "Play Activities", teacher: "Ms. Johnson", grade: "Excellent", progress: 95, color: "from-pink-500 to-rose-600" },
      { name: "Basic Colors", teacher: "Ms. Johnson", grade: "Good", progress: 88, color: "from-blue-500 to-cyan-600" },
      { name: "Shapes Recognition", teacher: "Ms. Johnson", grade: "Excellent", progress: 92, color: "from-green-500 to-emerald-600" },
      { name: "Nursery Rhymes", teacher: "Ms. Johnson", grade: "Good", progress: 85, color: "from-purple-500 to-pink-600" }
    ],
    'Nursery': [
      { name: "Pre-Reading", teacher: "Ms. Smith", grade: "A", progress: 90, color: "from-blue-500 to-cyan-600" },
      { name: "Number Recognition", teacher: "Ms. Smith", grade: "B+", progress: 85, color: "from-green-500 to-emerald-600" },
      { name: "Art & Craft", teacher: "Ms. Davis", grade: "A", progress: 95, color: "from-pink-500 to-rose-600" },
      { name: "Physical Activities", teacher: "Mr. Wilson", grade: "A-", progress: 88, color: "from-orange-500 to-red-600" },
      { name: "Social Skills", teacher: "Ms. Brown", grade: "B+", progress: 87, color: "from-purple-500 to-pink-600" }
    ],
    'Primary': [
      { name: "English", teacher: "Mrs. Davis", grade: "A", progress: 92, color: "from-blue-500 to-cyan-600" },
      { name: "Mathematics", teacher: "Mr. Smith", grade: "B+", progress: 88, color: "from-green-500 to-emerald-600" },
      { name: "Science", teacher: "Dr. Wilson", grade: "A-", progress: 90, color: "from-purple-500 to-pink-600" },
      { name: "Social Studies", teacher: "Ms. Brown", grade: "B", progress: 85, color: "from-orange-500 to-red-600" },
      { name: "Art", teacher: "Ms. Clark", grade: "A", progress: 94, color: "from-pink-500 to-rose-600" },
      { name: "Physical Education", teacher: "Mr. Taylor", grade: "B+", progress: 87, color: "from-indigo-500 to-blue-600" }
    ],
    'Secondary': [
      { name: "Mathematics", teacher: "Mr. Smith", grade: "A", progress: 92, color: "from-blue-500 to-cyan-600" },
      { name: "English Literature", teacher: "Mrs. Davis", grade: "B+", progress: 88, color: "from-green-500 to-emerald-600" },
      { name: "Physics", teacher: "Dr. Wilson", grade: "A-", progress: 90, color: "from-purple-500 to-pink-600" },
      { name: "Chemistry", teacher: "Ms. Brown", grade: "B", progress: 85, color: "from-orange-500 to-red-600" },
      { name: "Biology", teacher: "Mr. Taylor", grade: "A", progress: 94, color: "from-pink-500 to-rose-600" },
      { name: "History", teacher: "Mrs. Clark", grade: "B+", progress: 87, color: "from-indigo-500 to-blue-600" }
    ]
  };

  // Enhanced student data with all features
  const studentData = {
    name: "Sarah Johnson",
    class: "Grade 10A",
    studentId: "STU001",
    level: selectedGrade,
    profilePicture: profileImage,
    subjects: subjectsByGrade[selectedGrade as keyof typeof subjectsByGrade],
    
    // Fee Management
    fees: {
      totalFees: 15000,
      paidAmount: 12000,
      pendingAmount: 3000,
      dueDate: "2024-08-15",
      status: "Partially Paid",
      history: [
        { date: "2024-06-15", amount: 5000, type: "Tuition Fee", status: "Paid" },
        { date: "2024-07-15", amount: 4000, type: "Activity Fee", status: "Paid" },
        { date: "2024-08-15", amount: 3000, type: "Lab Fee", status: "Pending" }
      ]
    },

    // Attendance
    attendance: {
      overall: 96,
      thisMonth: 94,
      subjects: [
        { name: "Mathematics", attendance: 98, absences: 1 },
        { name: "English", attendance: 95, absences: 2 },
        { name: "Physics", attendance: 97, absences: 1 }
      ],
      recentAbsences: [
        { date: "2024-07-10", reason: "Sick Leave", approved: true },
        { date: "2024-07-08", reason: "Medical Appointment", approved: true }
      ]
    },

    // Library
    library: {
      borrowedBooks: [
        { title: "To Kill a Mockingbird", author: "Harper Lee", dueDate: "2024-07-25", fine: 0 },
        { title: "1984", author: "George Orwell", dueDate: "2024-07-20", fine: 5 },
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", dueDate: "2024-07-30", fine: 0 }
      ],
      totalFines: 5,
      booksRead: 12,
      readingGoal: 20
    },

    // Timetable
    timetable: {
      monday: [
        { time: "09:00-10:00", subject: "Mathematics", room: "Room 201", teacher: "Mr. Smith" },
        { time: "10:00-11:00", subject: "English", room: "Room 105", teacher: "Mrs. Davis" },
        { time: "11:15-12:15", subject: "Physics", room: "Lab 1", teacher: "Dr. Wilson" },
        { time: "12:15-13:15", subject: "Lunch Break", room: "Cafeteria", teacher: "" },
        { time: "13:15-14:15", subject: "Chemistry", room: "Lab 2", teacher: "Ms. Brown" }
      ]
    },

    // Parent Information
    parent: {
      name: "Michael Johnson",
      email: "michael.johnson@email.com",
      phone: "+1 (555) 123-4567",
      relationship: "Father",
      emergencyContact: "+1 (555) 987-6543",
      lastMeeting: "2024-06-15",
      nextMeeting: "2024-08-20"
    },

    // Health Records
    health: {
      bloodGroup: "A+",
      allergies: ["Peanuts", "Shellfish"],
      medications: ["Inhaler for Asthma"],
      lastCheckup: "2024-06-01",
      vaccinations: ["COVID-19", "Flu Shot 2024"],
      incidents: [
        { date: "2024-07-05", type: "Minor Injury", description: "Scraped knee during sports", action: "First aid applied" }
      ]
    },

    // Extracurricular Activities
    activities: [
      { name: "Basketball Team", role: "Team Member", schedule: "Mon, Wed, Fri 4:00-5:00 PM", coach: "Mr. Anderson" },
      { name: "Science Club", role: "Secretary", schedule: "Tue 3:00-4:00 PM", coach: "Dr. Wilson" },
      { name: "Drama Club", role: "Member", schedule: "Thu 3:30-4:30 PM", coach: "Ms. Parker" }
    ],

    // Transport
    transport: {
      busRoute: "Route 5",
      busNumber: "SB-105",
      pickupTime: "07:30 AM",
      dropoffTime: "03:45 PM",
      driver: "Mr. Robert",
      driverPhone: "+1 (555) 234-5678",
      fee: 2000,
      feeStatus: "Paid"
    },

    // Disciplinary Records
    discipline: {
      warnings: 0,
      suspensions: 0,
      counselingSessions: 1,
      behaviorGrade: "Excellent",
      incidents: [
        { date: "2024-06-20", type: "Counseling", reason: "Academic Stress", action: "Referred to school counselor" }
      ]
    },

    assignments: [
      { title: "Math Quiz Chapter 5", subject: "Mathematics", dueDate: "2024-07-20", status: "pending", priority: "high" },
      { title: "English Essay - Shakespeare", subject: "English Literature", dueDate: "2024-07-22", status: "completed", priority: "medium" },
      { title: "Physics Lab Report", subject: "Physics", dueDate: "2024-07-25", status: "pending", priority: "high" },
      { title: "Chemistry Project", subject: "Chemistry", dueDate: "2024-07-28", status: "pending", priority: "low" }
    ],

    notifications: [
      { title: "Fee Payment Reminder", message: "Lab fee payment due on August 15th", time: "1 hour ago", type: "fee" },
      { title: "New Assignment Posted", message: "Math Quiz Chapter 5 has been posted", time: "2 hours ago", type: "assignment" },
      { title: "Library Book Due", message: "1984 by George Orwell is due tomorrow", time: "1 day ago", type: "library" },
      { title: "Parent Meeting Scheduled", message: "Parent-teacher meeting scheduled for Aug 20th", time: "2 days ago", type: "meeting" }
    ],

    messages: [
      { from: "Mr. Smith", subject: "Math Assignment Help", preview: "I noticed you might need help with the recent assignment...", time: "3 hours ago", unread: true },
      { from: "School Admin", subject: "Fee Payment Reminder", preview: "This is a reminder about the upcoming fee payment...", time: "1 day ago", unread: false },
      { from: "Mrs. Davis", subject: "Great Essay!", preview: "Your Shakespeare essay was excellent...", time: "2 days ago", unread: false }
    ]
  };

  // Helper components
  type TabButtonProps = {
    id: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: (id: string) => void;
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }: TabButtonProps) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
          : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
      }`}
    >
      <Icon size={16} />
      <span className="font-medium">{label}</span>
    </button>
  );

  type StatCardProps = {
    icon: React.ElementType;
    title: string;
    value: string;
    change?: string;
    color: string;
    onClick?: () => void;
  };

  const StatCard = ({ icon: Icon, title, value, change, color, onClick }: StatCardProps) => (
    <div 
      className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-300 text-sm">{title}</p>
      {change && (
        <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
          <Sparkles size={10} />
          {change}
        </p>
      )}
    </div>
  );

  interface Subject {
    name: string;
    teacher: string;
    grade: string;
    progress: number;
    color: string;
  }

  type SubjectCardProps = { subject: Subject };

  const SubjectCard = ({ subject }: SubjectCardProps) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">{subject.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          subject.grade.includes('A') || subject.grade === 'Excellent' ? 'bg-green-500/20 text-green-400' :
          subject.grade.includes('B') || subject.grade === 'Good' ? 'bg-blue-500/20 text-blue-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {subject.grade}
        </span>
      </div>
      <p className="text-gray-300 text-sm mb-3">Teacher: {subject.teacher}</p>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div 
          className={`bg-gradient-to-r ${subject.color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${subject.progress}%` }}
        />
      </div>
      <p className="text-gray-400 text-xs">{subject.progress}% Complete</p>
    </div>
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResultCheck = () => {
    if (resultCode.trim()) {
      alert(`Generating PDF report for code: ${resultCode}`);
      setShowResultModal(false);
      setResultCode('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard 
                icon={Award} 
                title="Overall Grade" 
                value="A-" 
                change="+0.2 from last term"
                color="from-green-500 to-emerald-600"
              />
              <StatCard 
                icon={UserCheck} 
                title="Attendance" 
                value={`${studentData.attendance.overall}%`}
                change="Excellent"
                color="from-blue-500 to-cyan-600"
              />
              <StatCard 
                icon={DollarSign} 
                title="Fee Status" 
                value={`$${studentData.fees.pendingAmount}`}
                change="Pending"
                color="from-red-500 to-orange-600"
                onClick={() => setActiveTab('fees')}
              />
              <StatCard 
                icon={Library} 
                title="Library Books" 
                value={`${studentData.library.borrowedBooks.length}`}
                change={`$${studentData.library.totalFines} fine`}
                color="from-purple-500 to-pink-600"
                onClick={() => setActiveTab('library')}
              />
              <StatCard 
                icon={Activity} 
                title="Activities" 
                value={`${studentData.activities.length}`}
                change="Active"
                color="from-indigo-500 to-blue-600"
                onClick={() => setActiveTab('activities')}
              />
              <StatCard 
                icon={Shield} 
                title="Behavior" 
                value={studentData.discipline.behaviorGrade}
                change="No incidents"
                color="from-green-500 to-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Pending Assignments
                </h2>
                <div className="space-y-3">
                  {studentData.assignments.filter(a => a.status === 'pending').slice(0, 3).map((assignment, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-medium mb-1">{assignment.title}</h3>
                          <p className="text-gray-300 text-sm">{assignment.subject}</p>
                          <p className="text-gray-400 text-xs mt-1">Due: {assignment.dueDate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          assignment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          assignment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {assignment.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  Recent Notifications
                </h2>
                <div className="space-y-3">
                  {studentData.notifications.slice(0, 3).map((notification, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'fee' ? 'bg-red-400' :
                          notification.type === 'assignment' ? 'bg-blue-400' :
                          notification.type === 'library' ? 'bg-purple-400' :
                          'bg-green-400'
                        }`} />
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-sm mb-1">{notification.title}</h3>
                          <p className="text-gray-300 text-xs mb-1">{notification.message}</p>
                          <p className="text-gray-400 text-xs">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'fees':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign size={24} />
              Fee Management
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={DollarSign} 
                title="Total Fees" 
                value={`$${studentData.fees.totalFees}`}
                color="from-blue-500 to-cyan-600"
              />
              <StatCard 
                icon={CheckCircle} 
                title="Paid Amount" 
                value={`$${studentData.fees.paidAmount}`}
                color="from-green-500 to-emerald-600"
              />
              <StatCard 
                icon={AlertCircle} 
                title="Pending Amount" 
                value={`$${studentData.fees.pendingAmount}`}
                color="from-red-500 to-orange-600"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Payment History</h3>
              <div className="space-y-3">
                {studentData.fees.history.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{payment.type}</p>
                      <p className="text-gray-300 text-sm">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${payment.amount}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <UserCheck size={24} />
              Attendance Records
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                icon={TrendingUp} 
                title="Overall Attendance" 
                value={`${studentData.attendance.overall}%`}
                change="Above average"
                color="from-green-500 to-emerald-600"
              />
              <StatCard 
                icon={Calendar} 
                title="This Month" 
                value={`${studentData.attendance.thisMonth}%`}
                change="Good performance"
                color="from-blue-500 to-cyan-600"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Subject-wise Attendance</h3>
              <div className="space-y-4">
                {studentData.attendance.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{subject.name}</p>
                      <p className="text-gray-300 text-sm">{subject.absences} absence(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{subject.attendance}%</p>
                      <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          style={{ width: `${subject.attendance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'library':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Library size={24} />
              Library Management
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={BookOpen} 
                title="Borrowed Books" 
                value={`${studentData.library.borrowedBooks.length}`}
                color="from-purple-500 to-pink-600"
              />
              <StatCard 
                icon={Target} 
                title="Reading Progress" 
                value={`${studentData.library.booksRead}/${studentData.library.readingGoal}`}
                color="from-blue-500 to-cyan-600"
              />
              <StatCard 
                icon={AlertTriangle} 
                title="Total Fines" 
                value={`$${studentData.library.totalFines}`}
                color="from-red-500 to-orange-600"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Currently Borrowed</h3>
              <div className="space-y-4">
                {studentData.library.borrowedBooks.map((book, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{book.title}</p>
                      <p className="text-gray-300 text-sm">by {book.author}</p>
                      <p className="text-gray-400 text-xs mt-1">Due: {book.dueDate}</p>
                    </div>
                    <div className="text-right">
                      {book.fine > 0 && (
                        <p className="text-red-400 font-bold">${book.fine} fine</p>
                      )}
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                        Renew
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'timetable':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar size={24} />
              Class Timetable
            </h2>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Monday Schedule</h3>
              <div className="space-y-3">
                {studentData.timetable.monday.map((period, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl ${
                    period.subject === 'Lunch Break' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-white/5'
                  }`}>
                    <div>
                      <p className="text-white font-medium">{period.subject}</p>
                      <p className="text-gray-300 text-sm">{period.teacher}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{period.time}</p>
                      <p className="text-gray-300 text-sm">{period.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'parent':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users size={24} />
              Parent Information
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Parent Details</h3>
                  <p className="text-gray-300 text-sm mb-1">Name: {studentData.parent.name}</p>
                  <p className="text-gray-300 text-sm mb-1">Email: {studentData.parent.email}</p>
                  <p className="text-gray-300 text-sm mb-1">Phone: {studentData.parent.phone}</p>
                  <p className="text-gray-300 text-sm mb-1">Relationship: {studentData.parent.relationship}</p>
                  <p className="text-gray-300 text-sm mb-1">Emergency Contact: {studentData.parent.emergencyContact}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Meetings</h3>
                  <p className="text-gray-300 text-sm mb-1">Last Meeting: {studentData.parent.lastMeeting}</p>
                  <p className="text-gray-300 text-sm mb-1">Next Meeting: {studentData.parent.nextMeeting}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Welcome Back Johnson</h1>
          <div className="flex gap-2">
            <TabButton id="dashboard" icon={User} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={setActiveTab} />
            <TabButton id="fees" icon={DollarSign} label="Fees" isActive={activeTab === 'fees'} onClick={setActiveTab} />
            <TabButton id="attendance" icon={UserCheck} label="Attendance" isActive={activeTab === 'attendance'} onClick={setActiveTab} />
            <TabButton id="library" icon={Library} label="Library" isActive={activeTab === 'library'} onClick={setActiveTab} />
            <TabButton id="timetable" icon={Calendar} label="Timetable" isActive={activeTab === 'timetable'} onClick={setActiveTab} />
            <TabButton id="parent" icon={Users} label="Parent" isActive={activeTab === 'parent'} onClick={setActiveTab} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            {activeTab === 'dashboard' && (
              <button 
                onClick={() => setShowResultModal(true)} 
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
              >
                Generate Report
              </button>
            )}
          </div>
          {renderContent()}
        </div>

        {showResultModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">Generate Report</h3>
              <input 
                type="text" 
                placeholder="Enter result code" 
                value={resultCode} 
                onChange={(e) => setResultCode(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg mb-4"
              />
              <button 
                onClick={handleResultCheck} 
                className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
              >
                Generate
              </button>
              <button 
                onClick={() => setShowResultModal(false)} 
                className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;