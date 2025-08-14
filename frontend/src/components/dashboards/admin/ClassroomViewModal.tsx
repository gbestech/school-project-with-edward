import React from 'react';
import { X, Users, BookOpen, MapPin, Calendar, UserCheck, Trash2 } from 'lucide-react';
import { Classroom, TeacherAssignment } from '@/services/ClassroomService';

interface ClassroomViewModalProps {
  classroom: Classroom | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveAssignment?: (teacherId: number, subjectId: number) => void;
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
                   {classroom.education_level === 'NURSERY' || classroom.education_level === 'PRIMARY' ? 'Class Teacher' : 'Subject Teachers'}
                 </h3>
                 <div className="space-y-3">
                   {/* For Nursery and Primary: Show class teacher if available */}
                   {(classroom.education_level === 'NURSERY' || classroom.education_level === 'PRIMARY') && classroom.class_teacher_name ? (
                     <div className="bg-white rounded-lg p-4 border border-gray-200">
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center space-x-2">
                           <UserCheck size={18} className="text-blue-500" />
                           <span className="font-medium">{classroom.class_teacher_name}</span>
                           <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                             Class Teacher
                           </span>
                         </div>
                       </div>
                       <div className="text-sm text-gray-600">
                         <p>This teacher handles all subjects for this class</p>
                       </div>
                     </div>
                   ) : classroom.teacher_assignments && classroom.teacher_assignments.length > 0 ? (
                     /* For Secondary: Show all subject teachers */
                     <div className="space-y-3">
                       {classroom.teacher_assignments.map((assignment, index) => (
                         <div key={assignment.id} className="bg-white rounded-lg p-3 border border-gray-200">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center space-x-2">
                               <UserCheck size={16} className="text-blue-500" />
                               <span className="font-medium text-sm">{assignment.teacher_name}</span>
                             </div>
                             {onRemoveAssignment && (
                               <button
                                 onClick={() => onRemoveAssignment(assignment.teacher, assignment.subject)}
                                 className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                 title="Remove assignment"
                               >
                                 <Trash2 size={14} />
                               </button>
                             )}
                           </div>
                           <div className="text-xs text-gray-500 space-y-1">
                             <div>Email: {assignment.teacher_email || 'Not provided'}</div>
                             <div>Phone: {assignment.teacher_phone || 'Not provided'}</div>
                             <div>Subject: {assignment.subject_name}</div>
                             <div>Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-4">
                       <UserCheck size={24} className="mx-auto text-gray-400 mb-2" />
                       <p className="text-gray-500 text-sm">No teachers assigned</p>
                       <p className="text-xs text-gray-400 mt-1">Use the Assign button to add teachers</p>
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
