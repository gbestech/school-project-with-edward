import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  User,
  Clock,
  MapPin,
  BarChart3
} from 'lucide-react';

const Classes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');

  // Mock data for demonstration
  const classes = [
    {
      id: 1,
      name: 'Class 5A',
      section: 'Primary',
      grade: '5',
      totalStudents: 25,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
      schedule: 'Monday - Friday, 8:00 AM - 3:00 PM',
      room: 'Room 101',
      attendanceRate: 96.5,
      lastAttendance: 'Today',
      isPrimaryTeacher: true
    },
    {
      id: 2,
      name: 'Class 4B',
      section: 'Primary',
      grade: '4',
      totalStudents: 28,
      subjects: ['Mathematics', 'English'],
      schedule: 'Monday - Friday, 8:00 AM - 3:00 PM',
      room: 'Room 102',
      attendanceRate: 94.2,
      lastAttendance: 'Yesterday',
      isPrimaryTeacher: true
    },
    {
      id: 3,
      name: 'Class 6A',
      section: 'Primary',
      grade: '6',
      totalStudents: 22,
      subjects: ['Mathematics'],
      schedule: 'Monday, Wednesday, Friday, 10:00 AM - 11:00 AM',
      room: 'Room 103',
      attendanceRate: 98.1,
      lastAttendance: 'Today',
      isPrimaryTeacher: false
    }
  ];

  const students = [
    { id: 1, name: 'John Doe', rollNumber: '001', attendance: 'Present', lastSeen: 'Today' },
    { id: 2, name: 'Jane Smith', rollNumber: '002', attendance: 'Present', lastSeen: 'Today' },
    { id: 3, name: 'Mike Johnson', rollNumber: '003', attendance: 'Absent', lastSeen: 'Yesterday' },
    { id: 4, name: 'Sarah Wilson', rollNumber: '004', attendance: 'Present', lastSeen: 'Today' },
    { id: 5, name: 'David Brown', rollNumber: '005', attendance: 'Present', lastSeen: 'Today' },
  ];

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSection === 'all' || cls.section.toLowerCase() === filterSection.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleClassSelect = (cls: any) => {
    setSelectedClass(cls);
  };

  const handleMarkAttendance = (classId: number) => {
    navigate(`/teacher/attendance/${classId}`);
  };

  const handleViewStudents = (classId: number) => {
    navigate(`/teacher/students/${classId}`);
  };

  const handleSendMessage = (classId: number) => {
    navigate(`/teacher/messages/class/${classId}`);
  };

  return (
    <TeacherDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Classes</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your assigned classes and view student information
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sections</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="nursery">Nursery</option>
          </select>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer ${
                selectedClass?.id === cls.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleClassSelect(cls)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{cls.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{cls.section} • Grade {cls.grade}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {cls.isPrimaryTeacher && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                      Primary Teacher
                    </span>
                  )}
                  <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{cls.totalStudents} students</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{cls.room}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckSquare className="w-4 h-4" />
                  <span>{cls.attendanceRate}% attendance</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-1">
                  {cls.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-md"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAttendance(cls.id);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Mark Attendance
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewStudents(cls.id);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  View Students
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Class Details */}
        {selectedClass && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedClass.name} - Class Details
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSendMessage(selectedClass.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
                  <BarChart3 className="w-4 h-4" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Class Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Section:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedClass.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Grade:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedClass.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Room:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedClass.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Schedule:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedClass.schedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Attendance Rate:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{selectedClass.attendanceRate}%</span>
                  </div>
                </div>
              </div>

              {/* Recent Students */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Students</h3>
                <div className="space-y-3">
                  {students.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Roll: {student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          student.attendance === 'Present' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        }`}>
                          {student.attendance}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{student.lastSeen}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                  View All Students →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default Classes;
