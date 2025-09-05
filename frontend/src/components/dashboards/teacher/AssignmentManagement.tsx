import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, Check, Clock, BookOpen, Users, GraduationCap } from 'lucide-react';
import TeacherService, { 
  AssignmentRequest, 
  TeacherSchedule, 
  CreateAssignmentRequestData,
  CreateScheduleData 
} from '@/services/TeacherService';

interface AssignmentManagementProps {
  teacherId: number;
  profileData: any;
  onRefresh: () => void;
}

interface AssignmentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssignmentRequestData) => void;
  loading: boolean;
}

const AssignmentRequestModal: React.FC<AssignmentRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<CreateAssignmentRequestData>({
    request_type: 'subject',
    title: '',
    description: '',
    reason: '',
    requested_subjects: [],
    requested_grade_levels: [],
    requested_sections: []
  });

  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [availableGradeLevels, setAvailableGradeLevels] = useState<any[]>([]);
  const [availableSections, setAvailableSections] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableData();
    }
  }, [isOpen]);

  const loadAvailableData = async () => {
    try {
      const [subjects, gradeLevels, sections] = await Promise.all([
        TeacherService.getAvailableSubjects(),
        TeacherService.getAvailableGradeLevels(),
        TeacherService.getAvailableSections()
      ]);
      setAvailableSubjects(subjects);
      setAvailableGradeLevels(gradeLevels);
      setAvailableSections(sections);
    } catch (error) {
      console.error('Error loading available data:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Request Assignment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Request Type
            </label>
            <select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="subject">Subject Assignment</option>
              <option value="class">Class Assignment</option>
              <option value="schedule">Schedule Change</option>
              <option value="additional">Additional Assignment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Enter request title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Describe your request"
              required
            />
          </div>

          {formData.request_type === 'subject' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Requested Subjects
              </label>
              <select
                multiple
                value={formData.requested_subjects?.map(String) || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                  setFormData({ ...formData, requested_subjects: selected });
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                {availableSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Explain why you need this assignment"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignmentManagement: React.FC<AssignmentManagementProps> = ({
  teacherId,
  profileData,
  onRefresh
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignmentRequests, setAssignmentRequests] = useState<AssignmentRequest[]>([]);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);

  useEffect(() => {
    loadAssignmentData();
  }, [teacherId]);

  const loadAssignmentData = async () => {
    try {
      const [requests, teacherSchedules] = await Promise.all([
        TeacherService.getAssignmentRequests({ teacher_id: teacherId }),
        TeacherService.getTeacherSchedules({ teacher_id: teacherId })
      ]);
      setAssignmentRequests(requests);
      setSchedules(teacherSchedules);
    } catch (error) {
      console.error('Error loading assignment data:', error);
    }
  };

  const handleCreateRequest = async (data: CreateAssignmentRequestData) => {
    setLoading(true);
    try {
      await TeacherService.createAssignmentRequest(data);
      setShowRequestModal(false);
      await loadAssignmentData();
      onRefresh();
      // Show success message
      alert('Assignment request submitted successfully!');
    } catch (error) {
      console.error('Error creating assignment request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    setShowRequestModal(true);
  };

  const handleAddClass = () => {
    setShowRequestModal(true);
  };

  const handleRequestAssignment = () => {
    setShowRequestModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Assignment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Subjects</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {profileData?.assigned_subjects?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Classes</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {profileData?.classroom_assignments?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Students</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {profileData?.classroom_assignments?.reduce((sum: number, assignment: any) => sum + (assignment.student_count || 0), 0) || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Teaching Hours</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {schedules.length * 5} {/* Estimate based on schedule entries */}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Assignments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Subject Assignments</h2>
          <button 
            onClick={handleAddSubject}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileData?.assigned_subjects?.length > 0 ? (
            profileData.assigned_subjects.map((subject: any, index: number) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900 dark:text-white">{subject.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                      {subject.assignments?.[0]?.grade_level || 'N/A'}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {subject.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Credits: {subject.credits || 3}</span>
                  <span>Students: {subject.student_count || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Subject Assignments</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't been assigned to any subjects yet.</p>
              <button 
                onClick={handleRequestAssignment}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Request Assignment</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Class Assignments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Class Assignments</h2>
          <button 
            onClick={handleAddClass}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileData?.classroom_assignments?.length > 0 ? (
            profileData.classroom_assignments.map((assignment: any, index: number) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900 dark:text-white">{assignment.classroom_name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                      {assignment.student_count || 0} students
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Subject:</span> {assignment.subject_name || "Not specified"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Room:</span> {assignment.room_number || "TBD"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Grade:</span> {assignment.grade_level_name || "Not specified"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {assignment.academic_year} • {assignment.term}
                  </span>
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Class Assignments</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't been assigned to any classes yet.</p>
              <button 
                onClick={handleRequestAssignment}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Request Assignment</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Requests */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Assignment Requests</h2>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {assignmentRequests.length > 0 ? (
            assignmentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{request.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{request.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Submitted: {formatDate(request.submitted_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.admin_notes && (
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      View Notes
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No assignment requests yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Request Modal */}
      <AssignmentRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleCreateRequest}
        loading={loading}
      />
    </div>
  );
};

export default AssignmentManagement;











