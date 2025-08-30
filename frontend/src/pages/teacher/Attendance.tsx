import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import ClassroomService from '@/services/ClassroomService';
import { getAttendance, addAttendance, updateAttendance, AttendanceStatusMap, AttendanceCodeToStatusMap } from '@/services/AttendanceService';
import { toast } from 'react-toastify';
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
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Student {
  id: number;
  full_name: string;
  registration_number: string;
  profile_picture?: string;
  gender: string;
  age: number;
}

interface ClassData {
  id: number;
  name: string;
  section_id: number;
  section_name: string;
  grade_level_name: string;
  education_level: string;
  student_count: number;
  max_capacity: number;
  subject_name: string;
  subject_code: string;
  room_number: string;
  is_class_teacher: boolean;
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { classId } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load class and students data
  useEffect(() => {
    if (classId) {
      loadClassAndStudents();
    }
  }, [classId]);

  const loadClassAndStudents = async () => {
    try {
      setLoadingStudents(true);
      setError(null);

      // Get teacher ID
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }

      // Get teacher classes to find the specific class
      const teacherClasses = await TeacherDashboardService.getTeacherClasses(teacherId);
      const classData = teacherClasses.find(cls => cls.id === parseInt(classId!));
      
      if (!classData) {
        throw new Error('Class not found or you are not assigned to this class');
      }

      setSelectedClass(classData);

      // Get students for this class
      let studentsData: Student[] = [];
      let studentsResponse: any = null;
      if (classId) {
        studentsResponse = await ClassroomService.getClassroomStudents(parseInt(classId));
        // Handle both response.data and direct array response
        studentsData = studentsResponse.data || studentsResponse || [];
        setStudents(studentsData);
      }

      // Initialize attendance data
      const initialAttendance: Record<number, string> = {};
      studentsData.forEach((student: Student) => {
        initialAttendance[student.id] = 'present'; // Default to present
      });
      setAttendanceData(initialAttendance);

      // Load existing attendance for today if any
      if (classId) {
        await loadExistingAttendance(parseInt(classId), selectedDate);
      }

      console.log('🔍 Loaded class and students:', { classData, studentsData });
      console.log('🔍 Raw students response:', studentsResponse);
    } catch (error) {
      console.error('Error loading class and students:', error);
      setError(error instanceof Error ? error.message : 'Failed to load class data');
      toast.error('Failed to load class data. Please try again.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadExistingAttendance = async (classroomId: number, date: string) => {
    try {
      const existingAttendance = await getAttendance({
        classroom: classroomId,
        date: date
      });

      if (existingAttendance && existingAttendance.length > 0) {
        const attendanceMap: Record<number, string> = {};
        existingAttendance.forEach((record: any) => {
          // Convert backend status code to frontend status value
          const frontendStatus = AttendanceCodeToStatusMap[record.status as keyof typeof AttendanceCodeToStatusMap];
          attendanceMap[record.student] = frontendStatus || 'present'; // Default to present if mapping fails
        });
        setAttendanceData(prev => ({ ...prev, ...attendanceMap }));
      }
    } catch (error) {
      console.error('Error loading existing attendance:', error);
      // Don't show error for this as it's optional
    }
  };

  // Function to find existing attendance record
  const findExistingAttendance = async (studentId: number, date: string, sectionId: number) => {
    try {
      const existingRecords = await getAttendance({
        student: studentId,
        date: date,
        section: sectionId
      });
      
      if (existingRecords && existingRecords.length > 0) {
        return existingRecords[0]; // Return the first matching record
      }
      return null;
    } catch (error) {
      console.error('Error finding existing attendance:', error);
      return null;
    }
  };

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !classId) {
      toast.error('No class selected');
      return;
    }

    setIsLoading(true);
    try {
      // Get teacher ID
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }

      // Prepare attendance data
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => {
        // Map the status to the correct backend format
        const mappedStatus = AttendanceStatusMap[status as keyof typeof AttendanceStatusMap];
        if (!mappedStatus) {
          throw new Error(`Invalid status: ${status}. Valid statuses are: present, absent, late, excused`);
        }
        
        const record = {
          student: parseInt(studentId),
          teacher: teacherId,
          section: selectedClass.section_id,
          date: selectedDate,
          status: mappedStatus
        };
        console.log('🔍 Created attendance record:', record);
        return record;
      });

      console.log('🔍 Attendance records to save:', attendanceRecords);
      console.log('🔍 Selected class data:', selectedClass);

      // Save attendance records
      for (const record of attendanceRecords) {
        console.log('🔍 Processing attendance record:', record);
        
        try {
          // First, try to find existing attendance record
          const existingRecord = await findExistingAttendance(record.student, record.date, record.section);
          
          if (existingRecord) {
            console.log('🔍 Found existing attendance record:', existingRecord);
            // Update existing record
            await updateAttendance(existingRecord.id, {
              status: record.status,
              teacher: record.teacher
            });
            console.log('🔍 Updated existing attendance record');
          } else {
            console.log('🔍 No existing record found, creating new one');
            // Create new record
            await addAttendance(record);
            console.log('🔍 Created new attendance record');
          }
        } catch (error: any) {
          console.error('🔍 Error processing record:', record, 'Error:', error);
          console.log('🔍 Error response:', error.response?.data);
          
          // Check if it's a unique constraint error
          if (error.response?.data?.non_field_errors) {
            console.log('🔍 Non-field errors:', error.response.data.non_field_errors);
            const errorMessage = error.response.data.non_field_errors[0] || 'Attendance record already exists';
            
            // If it's a unique constraint error, try to find and update the existing record
            if (errorMessage.includes('already exists') || errorMessage.includes('unique')) {
              console.log('🔍 Attempting to find existing record for update...');
              try {
                // Try to get all attendance records for this date and section
                const allRecords = await getAttendance({
                  date: record.date,
                  section: record.section
                });
                
                const existingRecord = allRecords.find((r: any) => r.student === record.student);
                if (existingRecord) {
                  console.log('🔍 Found existing record via fallback method:', existingRecord);
                  await updateAttendance(existingRecord.id, {
                    status: record.status,
                    teacher: record.teacher
                  });
                  console.log('🔍 Updated existing attendance record via fallback');
                  continue; // Skip to next record
                }
              } catch (fallbackError) {
                console.error('🔍 Fallback method also failed:', fallbackError);
              }
            }
            
            throw new Error(errorMessage);
          }
          
          throw error;
        }
      }

      toast.success('Attendance saved successfully!');
      setViewMode('view');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance. Please try again.');
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

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingStudents) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading class and students...</p>
            </div>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (!selectedClass) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Class Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error || 'The requested class could not be found or you are not assigned to it.'}
            </p>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Back to Classes
            </button>
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
                {selectedClass.subject_name} • {selectedClass.grade_level_name} {selectedClass.section_name}
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
              <CheckSquare className="w-4 h-4 inline mr-2" />
              Mark
            </button>
          </div>
        </div>

        {/* Date Selection and Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={loadClassAndStudents}
                className="mt-6 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Attendance Statistics */}
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Late</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.percentage}%</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name or registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Students ({filteredStudents.length})
            </h2>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm ? 'No students found matching your search.' : 'No students enrolled in this class.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {student.profile_picture ? (
                          <img 
                            src={student.profile_picture} 
                            alt={student.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{student.full_name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {student.registration_number} • {student.gender} • Age {student.age}
                        </p>
                      </div>
                    </div>

                    {viewMode === 'mark' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'present')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            attendanceData[student.id] === 'present'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'late')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            attendanceData[student.id] === 'late'
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'absent')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            attendanceData[student.id] === 'absent'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(attendanceData[student.id] || '')}`}>
                          {getStatusIcon(attendanceData[student.id] || '')}
                          <span className="ml-1 capitalize">{attendanceData[student.id] || 'Not marked'}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        {viewMode === 'mark' && filteredStudents.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default Attendance;
