import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import { 
  CheckSquare, 
  XSquare, 
  Clock, 
  Calendar, 
  Users, 
  Save, 
  ArrowLeft,
  Filter,
  Search,
  Download,
  BarChart3,
  Eye,
  Edit,
  Plus,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { classId } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark');

  // Mock data for demonstration
  const classes = [
    {
      id: 1,
      name: 'Class 5A',
      section: 'Primary',
      grade: '5',
      totalStudents: 25,
      room: 'Room 101'
    },
    {
      id: 2,
      name: 'Class 4B',
      section: 'Primary',
      grade: '4',
      totalStudents: 28,
      room: 'Room 102'
    }
  ];

  const mockStudents = [
    { id: 1, name: 'John Doe', rollNumber: '001', status: 'present' },
    { id: 2, name: 'Jane Smith', rollNumber: '002', status: 'present' },
    { id: 3, name: 'Mike Johnson', rollNumber: '003', status: 'absent' },
    { id: 4, name: 'Sarah Wilson', rollNumber: '004', status: 'present' },
    { id: 5, name: 'David Brown', rollNumber: '005', status: 'late' },
    { id: 6, name: 'Emily Davis', rollNumber: '006', status: 'present' },
    { id: 7, name: 'Michael Wilson', rollNumber: '007', status: 'present' },
    { id: 8, name: 'Lisa Anderson', rollNumber: '008', status: 'absent' },
  ];

  useEffect(() => {
    if (classId) {
      const classData = classes.find(c => c.id === parseInt(classId));
      setSelectedClass(classData);
      setStudents(mockStudents);
      
      // Initialize attendance data
      const initialAttendance = {};
      mockStudents.forEach(student => {
        initialAttendance[student.id] = student.status;
      });
      setAttendanceData(initialAttendance);
    }
  }, [classId]);

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save attendance
      console.log('Saving attendance:', {
        classId,
        date: selectedDate,
        attendance: attendanceData
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendanceData).filter(status => status === 'present').length;
    const absent = Object.values(attendanceData).filter(status => status === 'absent').length;
    const late = Object.values(attendanceData).filter(status => status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, percentage };
  };

  const stats = getAttendanceStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'absent':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'late':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'late':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!selectedClass) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading class information...</p>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/teacher/classes')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Attendance - {selectedClass.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Mark and view student attendance
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('view')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'view'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              View
            </button>
            <button
              onClick={() => setViewMode('mark')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'mark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Edit className="w-4 h-4 inline mr-2" />
              Mark
            </button>
          </div>
        </div>

        {/* Class Info and Date Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Class Information</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><span className="font-medium">Class:</span> {selectedClass.name}</p>
                <p><span className="font-medium">Section:</span> {selectedClass.section}</p>
                <p><span className="font-medium">Room:</span> {selectedClass.room}</p>
                <p><span className="font-medium">Total Students:</span> {selectedClass.totalStudents}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Date Selection</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-slate-600 dark:text-slate-400">Present: {stats.present}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-slate-600 dark:text-slate-400">Absent: {stats.absent}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-slate-600 dark:text-slate-400">Late: {stats.late}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-600 dark:text-slate-400">{stats.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Student Attendance - {new Date(selectedDate).toLocaleDateString()}
              </h2>
              {viewMode === 'mark' && (
                <button
                  onClick={handleSaveAttendance}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  {viewMode === 'mark' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {viewMode === 'mark' ? (
                        <select
                          value={attendanceData[student.id] || 'present'}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attendanceData[student.id] || 'present')}`}>
                          {getStatusIcon(attendanceData[student.id] || 'present')}
                          <span className="ml-1 capitalize">{attendanceData[student.id] || 'present'}</span>
                        </span>
                      )}
                    </td>
                    {viewMode === 'mark' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className={`p-1 rounded ${attendanceData[student.id] === 'present' ? 'bg-green-100 dark:bg-green-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className={`p-1 rounded ${attendanceData[student.id] === 'absent' ? 'bg-red-100 dark:bg-red-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          >
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'late')}
                            className={`p-1 rounded ${attendanceData[student.id] === 'late' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          >
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </button>
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default Attendance;
