import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, UserCheck, Trash2, Phone, Clock, Award, GraduationCap, Users, Search, AlertCircle } from 'lucide-react';
import { Classroom, classroomService } from '@/services/ClassroomService';

interface ClassroomViewModalProps {
  classroom: Classroom | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveAssignment?: (assignmentId: number) => void;
}

const ClassroomViewModal: React.FC<ClassroomViewModalProps> = ({
  classroom,
  isOpen,
  onClose,
  onRemoveAssignment
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students when modal opens
  useEffect(() => {
    if (isOpen && classroom) {
      fetchClassroomStudents();
    }
  }, [isOpen, classroom?.id]);

  const fetchClassroomStudents = async () => {
    if (!classroom) return;

    try {
      setLoadingStudents(true);
      setStudentError(null);
      
      console.log('Fetching students for classroom:', classroom.id);
      const response = await classroomService.getClassroomStudents(classroom.id);
      
      console.log('Students response:', response);
      
      // Handle different response formats
      const studentList = Array.isArray(response) 
        ? response 
        : (response?.results || response?.students || []);
      
      setStudents(studentList);
      
      if (studentList.length === 0) {
        setStudentError('No students found in this classroom.');
      }
    } catch (error: any) {
      console.error('Error fetching classroom students:', error);
      setStudentError(error.message || 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  if (!isOpen || !classroom) return null;

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'NURSERY': return <BookOpen size={20} className="text-pink-500" />;
      case 'PRIMARY': return <BookOpen size={20} className="text-blue-500" />;
      case 'JUNIOR_SECONDARY':
      case 'SENIOR_SECONDARY': return <BookOpen size={20} className="text-purple-500" />;
      default: return <BookOpen size={20} className="text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'NURSERY': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'PRIMARY': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'JUNIOR_SECONDARY':
      case 'SENIOR_SECONDARY': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const usesClassTeachers = (educationLevel: string) => {
    return educationLevel === 'NURSERY' || educationLevel === 'PRIMARY';
  };

  const getTeacherRoleLabel = (educationLevel: string) => {
    return usesClassTeachers(educationLevel) ? 'Class Teacher' : 'Subject Teacher';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Classroom Details</h2>
              <p className="text-indigo-100 mt-1">{classroom.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
            >
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information - Left Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Class Name:</span>
                    <span className="font-medium">{classroom.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Education Level:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(classroom.education_level)}`}>
                      {classroom.grade_level_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Section:</span>
                    <span className="font-medium">{classroom.section_name}</span>
                  </div>
                  {classroom.stream && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Stream:</span>
                      <span className="font-medium">{classroom.stream_name || 'Stream'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Room Number:</span>
                    <span className="font-medium">{classroom.room_number || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Academic Year:</span>
                    <span className="font-medium">{classroom.academic_session_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Term:</span>
                    <span className="font-medium">{classroom.term_name}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
                  Enrollment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Enrollment:</span>
                    <span className="font-medium">{classroom.current_enrollment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Max Capacity:</span>
                    <span className="font-medium">{classroom.max_capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Available Spots:</span>
                    <span className="font-medium">{classroom.available_spots}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Enrollment %:</span>
                    <span className="font-medium">{classroom.enrollment_percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      classroom.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {classroom.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Teachers Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                  {getTeacherRoleLabel(classroom.education_level)}
                  {!usesClassTeachers(classroom.education_level) && 's'}
                </h3>
                <div className="space-y-4">
                  {usesClassTeachers(classroom.education_level) && classroom.class_teacher_name ? (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserCheck size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{classroom.class_teacher_name}</h4>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                              {getTeacherRoleLabel(classroom.education_level)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">All subjects - Full time</div>
                    </div>
                  ) : classroom.teacher_assignments && classroom.teacher_assignments.length > 0 ? (
                    <div className="space-y-4 max-h-48 overflow-y-auto">
                      {classroom.teacher_assignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {assignment.teacher_first_name} {assignment.teacher_last_name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{assignment.subject_name} ({assignment.subject_code})</p>
                              <p className="text-xs text-gray-500 mt-1">{assignment.periods_per_week} periods/week</p>
                            </div>
                            {onRemoveAssignment && (
                              <button
                                onClick={() => onRemoveAssignment(assignment.id)}
                                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                title="Remove assignment"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-lg">
                      <UserCheck size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No teachers assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Roster - Right Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
                  Student Roster ({filteredStudents.length}/{classroom.current_enrollment})
                </h3>

                {/* Search Bar */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Loading State */}
                {loadingStudents && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading students...</p>
                  </div>
                )}

                {/* Error State */}
                {studentError && !loadingStudents && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Note</p>
                      <p className="text-sm text-yellow-700">{studentError}</p>
                    </div>
                  </div>
                )}

                {/* Students Table */}
                {!loadingStudents && filteredStudents.length > 0 && (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0">
                        <tr className="border-b border-gray-300 bg-gray-100">
                          <th className="text-left px-3 py-2 font-semibold text-gray-700">#</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-700">Name</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-700">Reg. No.</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student, index) => (
                          <tr key={student.id} className="border-b border-gray-200 hover:bg-blue-50">
                            <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{student.full_name}</td>
                            <td className="px-3 py-2 text-gray-600">{student.username || 'N/A'}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {student.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empty State */}
                {!loadingStudents && filteredStudents.length === 0 && !studentError && (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-600 font-medium">No Students Found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm ? "No students match your search." : "This classroom has no students yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomViewModal;