import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import ClassroomService from '@/services/ClassroomService';
import { toast } from 'react-toastify';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  User,
  GraduationCap,
  BookOpen,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Grid3X3,
  List
} from 'lucide-react';

interface Student {
  id: number;
  full_name: string;
  registration_number: string;
  profile_picture?: string;
  gender: string;
  age: number;
  education_level: string;
  student_class: string;
  admission_date: string;
  parent_contact?: string;
  emergency_contact?: string;
  classroom?: string;
  address?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  nationality?: string;
  religion?: string;
  blood_group?: string;
  medical_conditions?: string;
  allergies?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  guardian_address?: string;
  guardian_occupation?: string;
  // Additional fields for teacher assignment context
  class_name?: string;
  section_name?: string;
  grade_level_name?: string;
  subject_name?: string;
}

interface TeacherAssignment {
  id: number;
  classroom_name: string;
  section_name: string;
  grade_level_name: string;
  education_level: string;
  subject_name: string;
  subject_code: string;
  is_primary_teacher: boolean;
  periods_per_week: number;
}

const StudentsList: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Load teacher assignments and students
  useEffect(() => {
    if (user && !isLoading) {
      loadTeacherData();
    }
  }, [user, isLoading]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 loadTeacherData - Starting with user:', user);

      // Get teacher ID
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }

      // Get teacher assignments
      const assignmentsResponse = await TeacherDashboardService.getTeacherClasses(teacherId);
      const assignments = assignmentsResponse || [];
      setTeacherAssignments(assignments);

      // Extract unique classes and subjects for filters
      const classes = [...new Set(assignments.map(a => a.classroom_name))];
      const subjects = [...new Set(assignments.map(a => a.subject_name))];
      setAvailableClasses(classes);
      setAvailableSubjects(subjects);

      console.log('🔍 Teacher assignments:', assignments);
      console.log('🔍 Available classes:', classes);
      console.log('🔍 Available subjects:', subjects);

      // Load students based on assignments
      await loadStudentsByAssignments(teacherId, assignments);

    } catch (error) {
      console.error('Error loading teacher data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load teacher data');
      toast.error('Failed to load teacher data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByAssignments = async (teacherId: number, assignments: TeacherAssignment[]) => {
    try {
      let allStudents: Student[] = [];

      // For each assignment, get students
      for (const assignment of assignments) {
        try {
          // Get students for this classroom/section
          const studentsResponse = await ClassroomService.getClassroomStudents(assignment.id);
          const studentsData = studentsResponse.data || studentsResponse || [];
          
          // Add assignment context to each student
          const studentsWithContext = studentsData.map((student: any) => ({
            ...student,
            class_name: assignment.classroom_name,
            section_name: assignment.section_name,
            grade_level_name: assignment.grade_level_name,
            subject_name: assignment.subject_name,
            education_level: assignment.education_level
          }));

          allStudents = [...allStudents, ...studentsWithContext];
        } catch (error) {
          console.warn(`Failed to load students for assignment ${assignment.id}:`, error);
        }
      }

      // Remove duplicates based on student ID
      const uniqueStudents = allStudents.filter((student, index, self) => 
        index === self.findIndex(s => s.id === student.id)
      );

      setStudents(uniqueStudents);
      console.log('🔍 Loaded students:', uniqueStudents);

    } catch (error) {
      console.error('Error loading students by assignments:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    await loadTeacherData();
    toast.success('Students list refreshed!');
  };

  const handleViewProfile = (studentId: number) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const handleSendMessage = (studentId: number) => {
    toast.info('Student messaging feature coming soon!');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesGender = true;
    if (filterGender !== 'all' && student.gender) {
      const studentGender = student.gender.toLowerCase();
      const filterGenderLower = filterGender.toLowerCase();
      matchesGender = studentGender === filterGenderLower || 
                     (studentGender === 'f' && filterGenderLower === 'female') ||
                     (studentGender === 'm' && filterGenderLower === 'male');
    }

    const matchesClass = filterClass === 'all' || student.class_name === filterClass;
    const matchesSubject = filterSubject === 'all' || student.subject_name === filterSubject;
    
    return matchesSearch && matchesGender && matchesClass && matchesSubject;
  });

  const getGenderColor = (gender: string | undefined | null) => {
    if (!gender) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
    
    switch (gender.toLowerCase()) {
      case 'male':
      case 'm':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'female':
      case 'f':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatGenderDisplay = (gender: string | undefined | null) => {
    if (!gender) return 'Not specified';
    
    switch (gender.toLowerCase()) {
      case 'male':
      case 'm':
        return 'Male';
      case 'female':
      case 'f':
        return 'Female';
      default:
        return gender;
    }
  };

  const getEducationLevelColor = (level: string | undefined | null) => {
    if (!level) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
    
    switch (level.toUpperCase()) {
      case 'SENIOR_SECONDARY':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'JUNIOR_SECONDARY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PRIMARY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'NURSERY':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Show loading state while auth is loading or data is loading
  if (isLoading || loading) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-slate-600 dark:text-slate-400">
                {isLoading ? 'Loading authentication...' : 'Loading students...'}
              </p>
            </div>
          </div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Please log in to view students.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Go to Login
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
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              My Students
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              View and manage students assigned to your classes and subjects
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <Grid3X3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {availableClasses.length > 0 && (
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              {availableClasses.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          )}
          {availableSubjects.length > 0 && (
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((subjectName) => (
                <option key={subjectName} value={subjectName}>{subjectName}</option>
              ))}
            </select>
          )}
        </div>

        {/* Students Count */}
        <div className="flex items-center justify-between">
          <p className="text-slate-600 dark:text-slate-400">
            Showing {filteredStudents.length} of {students.length} students
          </p>
          {students.length === 0 && (
            <p className="text-orange-600 dark:text-orange-400 text-sm">
              No students assigned to your classes yet.
            </p>
          )}
        </div>

        {/* Students Display */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No students found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || filterGender !== 'all' || filterClass !== 'all' || filterSubject !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No students are currently assigned to your classes.'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {student.profile_picture ? (
                      <img 
                        src={student.profile_picture} 
                        alt={student.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{student.full_name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{student.registration_number}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Age: {student.age} years</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                    <span>{student.class_name || student.student_class}</span>
                  </div>
                  {student.subject_name && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{student.subject_name}</span>
                    </div>
                  )}
                  {student.parent_contact && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4" />
                      <span>{student.parent_contact}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getGenderColor(student.gender)}`}>
                    {formatGenderDisplay(student.gender)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEducationLevelColor(student.education_level)}`}>
                    {student.education_level ? student.education_level.replace('_', ' ') : 'Not specified'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProfile(student.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleSendMessage(student.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Class/Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
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
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {student.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {student.registration_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        <div>
                          <div className="font-medium">{student.class_name || student.student_class}</div>
                          {student.subject_name && (
                            <div className="text-xs text-slate-500">{student.subject_name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{student.age} years</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getGenderColor(student.gender)}`}>
                            {formatGenderDisplay(student.gender)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {student.parent_contact || 'Not provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProfile(student.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleSendMessage(student.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                          >
                            Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default StudentsList;
