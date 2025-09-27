import React from 'react';
import { X, BookOpen, Calendar, UserCheck, Trash2, Phone, Clock, Award, GraduationCap } from 'lucide-react';
import { Classroom } from '@/services/ClassroomService';

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
  if (!isOpen || !classroom) return null;
  


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

  // Helper function to determine if education level uses class teachers
  const usesClassTeachers = (educationLevel: string) => {
    return educationLevel === 'NURSERY' || educationLevel === 'PRIMARY';
  };

  // Helper function to get teacher role label
  const getTeacherRoleLabel = (educationLevel: string) => {
    return usesClassTeachers(educationLevel) ? 'Class Teacher' : 'Subject Teacher';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
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
            {/* Basic Information */}
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
                    <span className="font-medium">{classroom.academic_year_name}</span>
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

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                  {getTeacherRoleLabel(classroom.education_level)}
                  {!usesClassTeachers(classroom.education_level) && 's'}
                </h3>
                <div className="space-y-4">
                  {/* For Nursery and Primary: Show class teacher if available */}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone size={16} className="text-gray-400" />
                          <span>Phone: {classroom.class_teacher_phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Award size={16} className="text-gray-400" />
                          <span>Employee ID: {classroom.class_teacher_employee_id || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <BookOpen size={16} className="text-gray-400" />
                          <span>All Subjects</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock size={16} className="text-gray-400" />
                          <span>Full Time</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          This teacher handles all subjects for this {classroom.education_level.toLowerCase()} class
                        </p>
                      </div>
                    </div>
                  ) : classroom.teacher_assignments && classroom.teacher_assignments.length > 0 ? (
                    /* For Secondary: Show all subject teachers */
                    <div className="space-y-4">
                      {classroom.teacher_assignments.map((assignment, index) => (
                        <div key={assignment.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                     <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center space-x-3">
                               <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                 <GraduationCap size={20} className="text-white" />
                               </div>
                               <div>
                                 <h4 className="font-semibold text-gray-900 text-lg">
                                   {assignment.teacher_first_name} {assignment.teacher_last_name}
                                 </h4>
                                 <div className="flex items-center space-x-2 mt-1">
                                   <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                     {getTeacherRoleLabel(classroom.education_level)}
                                   </span>
                                   {assignment.is_primary_teacher && (
                                     <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                       Primary
                                     </span>
                                   )}
                                 </div>
                               </div>
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
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                             <div className="flex items-center space-x-2 text-gray-600">
                               <Phone size={16} className="text-gray-400" />
                               <span>Phone: {assignment.teacher_phone || 'Not provided'}</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <Award size={16} className="text-gray-400" />
                               <span>Employee ID: {assignment.teacher_employee_id || 'Not provided'}</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <BookOpen size={16} className="text-gray-400" />
                               <span>Subject: {assignment.subject_name} ({assignment.subject_code})</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600">
                               <Clock size={16} className="text-gray-400" />
                               <span>Periods: {assignment.periods_per_week} per week</span>
                             </div>
                             <div className="flex items-center space-x-2 text-gray-600 md:col-span-2">
                               <Calendar size={16} className="text-gray-400" />
                               <span>Assigned: {new Date(assignment.assigned_date).toLocaleDateString('en-US', {
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric'
                               })}</span>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCheck size={24} className="text-gray-400" />
                      </div>
                      <h4 className="text-gray-900 font-medium mb-2">No {getTeacherRoleLabel(classroom.education_level).toLowerCase()} assigned</h4>
                      <p className="text-gray-500 text-sm mb-4">
                        This {classroom.education_level.toLowerCase()} class doesn't have any {getTeacherRoleLabel(classroom.education_level).toLowerCase()} yet
                      </p>
                      <div className="inline-flex items-center space-x-2 text-xs text-gray-400">
                        <BookOpen size={14} />
                        <span>Use the Assign button to add teachers</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Teacher Statistics */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-orange-600 rounded-full mr-3"></div>
                  Assignment Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {classroom.teacher_assignments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Subject Teachers</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {classroom.current_enrollment}
                    </div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomViewModal;
