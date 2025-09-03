import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import { ExamService, Exam, ExamCreateData } from '@/services/ExamService';
import { toast } from 'react-toastify';
import ExamCreationForm from '@/components/teacher/ExamCreationForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  CheckSquare,
  FileText,
  Award,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Printer,
  Play,
  Pause,
  X
} from 'lucide-react';

interface TeacherExamData {
  id: number;
  title: string;
  code: string;
  subject_name: string;
  grade_level_name: string;
  section_name?: string;
  exam_type: string;
  exam_type_display: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  status: string;
  status_display: string;
  student_count?: number;
  created_at: string;
}

interface TeacherAssignment {
  id: number;
  classroom_name: string;
  section_name: string;
  grade_level_name: string;
  education_level: string;
  subject_name: string;
  subject_code: string;
  subject_id: number;
  grade_level_id: number;
  section_id: number;
}

const TeacherExams: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<TeacherExamData[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExam, setSelectedExam] = useState<TeacherExamData | null>(null);

  // Load teacher data and exams
  useEffect(() => {
    if (user && !isLoading) {
      loadTeacherData();
    }
  }, [user, isLoading]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get teacher ID
      const teacherId = await TeacherDashboardService.getTeacherIdFromUser(user);
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }

      // Get teacher assignments and exams
      const [assignmentsResponse, examsResponse] = await Promise.all([
        TeacherDashboardService.getTeacherClasses(teacherId),
        ExamService.getExamsByTeacher(teacherId)
      ]);

      const assignments = assignmentsResponse || [];
      const examsData = examsResponse || [];

      // Transform assignments to match TeacherAssignment interface
      const transformedAssignments: TeacherAssignment[] = assignments.map((assignment: any) => ({
        id: assignment.id,
        classroom_name: assignment.classroom_name,
        section_name: assignment.section_name,
        grade_level_name: assignment.grade_level_name,
        education_level: assignment.education_level,
        subject_name: assignment.subject_name,
        subject_code: assignment.subject_code,
        subject_id: assignment.subject_id || 0,
        grade_level_id: assignment.grade_level_id || 0,
        section_id: assignment.section_id || 0
      }));

      // Transform exams to match TeacherExamData interface
      const transformedExams: TeacherExamData[] = examsData.map((exam: any) => ({
        id: exam.id,
        title: exam.title,
        code: exam.code,
        subject_name: exam.subject_name || exam.subject?.name || 'Unknown Subject',
        grade_level_name: exam.grade_level_name || exam.grade_level?.name || 'Unknown Class',
        section_name: exam.section_name || exam.section?.name,
        exam_type: exam.exam_type,
        exam_type_display: exam.exam_type_display,
        exam_date: exam.exam_date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        status: exam.status,
        status_display: exam.status_display,
        student_count: exam.student_count,
        created_at: exam.created_at
      }));

      setTeacherAssignments(transformedAssignments);
      setExams(transformedExams);

      console.log('🔍 Teacher assignments:', assignments);
      console.log('🔍 Teacher exams:', examsData);

    } catch (error) {
      console.error('Error loading teacher data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load teacher data');
      toast.error('Failed to load teacher data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadTeacherData();
    toast.success('Exams refreshed successfully!');
  };

  const handleCreateExam = () => {
    setShowCreateModal(true);
    setEditingExam(null);
  };

  const handleEditExam = (exam: TeacherExamData) => {
    // Convert to full Exam object for editing
    const fullExam: Exam = {
      id: exam.id,
      title: exam.title,
      code: exam.code,
      subject: { id: 0, name: exam.subject_name }, // Will be populated from assignment
      grade_level: { id: 0, name: exam.grade_level_name },
      section: null,
      exam_type: exam.exam_type,
      exam_type_display: exam.exam_type_display,
      exam_date: exam.exam_date,
      start_time: exam.start_time,
      end_time: exam.end_time,
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks,
      status: exam.status,
      status_display: exam.status_display,
      created_at: exam.created_at,
      updated_at: exam.created_at,
      difficulty_level: 'medium',
      difficulty_level_display: 'Medium',
      pass_percentage: 0,
      is_practical: false,
      requires_computer: false,
      is_online: false,
      description: '',
      venue: '',
      instructions: '',
      materials_allowed: '',
      materials_provided: '',
      pass_marks: undefined,
      max_students: undefined,
      stream: undefined,
      teacher: undefined,
      exam_schedule: undefined,
      objective_questions: [],
      theory_questions: [],
      practical_questions: [],
      custom_sections: [],
      objective_instructions: '',
      theory_instructions: '',
      practical_instructions: ''
    };
    
    setEditingExam(fullExam);
    setShowCreateModal(true);
  };

  const handleViewExam = (exam: TeacherExamData) => {
    setSelectedExam(exam);
  };

  const handleDeleteExam = async (examId: number) => {
    if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      try {
        await ExamService.deleteExam(examId);
        toast.success('Exam deleted successfully!');
        await loadTeacherData();
      } catch (error) {
        console.error('Error deleting exam:', error);
        toast.error('Failed to delete exam. Please try again.');
      }
    }
  };

  const handleStatusChange = async (examId: number, newStatus: string) => {
    try {
      // Update exam status using the general update method
      await ExamService.updateExam(examId, { status: newStatus });
      toast.success('Exam status updated successfully!');
      await loadTeacherData();
    } catch (error) {
      console.error('Error updating exam status:', error);
      toast.error('Failed to update exam status. Please try again.');
    }
  };

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = filterSubject === 'all' || exam.subject_name === filterSubject;
      const matchesType = filterType === 'all' || exam.exam_type === filterType;
      const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
      
      return matchesSearch && matchesSubject && matchesType && matchesStatus;
    });
  }, [exams, searchTerm, filterSubject, filterType, filterStatus]);

  const availableSubjects = useMemo(() => {
    return [...new Set(teacherAssignments.map(a => a.subject_name))];
  }, [teacherAssignments]);

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'test':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'mid_term':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'final_exam':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'practical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'postponed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show loading state
  if (isLoading || loading) {
    return (
      <TeacherDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-slate-600 dark:text-slate-400">
                {isLoading ? 'Loading authentication...' : 'Loading exams...'}
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
              Please log in to view exams.
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
              Exams & Tests
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create and manage exams for your assigned subjects and classes
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
              onClick={handleCreateExam}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Create Exam</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1">
                Exam Management Guidelines
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Create exams after completing each topic. Set appropriate difficulty levels and ensure questions cover the material taught. 
                You can create quizzes, tests, mid-terms, and final exams for your assigned subjects.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {availableSubjects.length > 0 && (
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          )}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="test">Class Test</option>
            <option value="mid_term">Mid-Term</option>
            <option value="final_exam">Final Exam</option>
            <option value="practical">Practical</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </div>

        {/* Exams Count */}
        <div className="flex items-center justify-between">
          <p className="text-slate-600 dark:text-slate-400">
            Showing {filteredExams.length} of {exams.length} exams
          </p>
          {exams.length === 0 && (
            <p className="text-orange-600 dark:text-orange-400 text-sm">
              No exams created yet. Create your first exam to get started.
            </p>
          )}
        </div>

        {/* Exams Display */}
        {filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No exams found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || filterSubject !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t created any exams yet.'
              }
            </p>
            {exams.length === 0 && (
              <button
                onClick={handleCreateExam}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Create Your First Exam
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{exam.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exam.code}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{exam.subject_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{exam.grade_level_name} {exam.section_name && `• ${exam.section_name}`}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(exam.exam_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(exam.start_time)} - {formatTime(exam.end_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Award className="w-4 h-4" />
                    <span>{exam.total_marks} marks</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getExamTypeColor(exam.exam_type)}`}>
                    {exam.exam_type_display}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(exam.status)}`}>
                    {exam.status_display}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewExam(exam)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditExam(exam)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex space-x-2">
                  {exam.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(exam.id, 'in_progress')}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                    >
                      <Play className="w-3 h-3 inline mr-1" />
                      Start
                    </button>
                  )}
                  {exam.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(exam.id, 'completed')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                    >
                      <CheckSquare className="w-3 h-3 inline mr-1" />
                      Complete
                    </button>
                  )}
                  <button className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200">
                    <Download className="w-3 h-3 inline mr-1" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Exam Modal */}
        {showCreateModal && (
          <ExamCreationForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onExamCreated={loadTeacherData}
            editingExam={editingExam}
          />
        )}

        {/* View Exam Modal */}
        {selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Exam Details: {selectedExam.title}
                </h2>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Title</label>
                        <p className="text-slate-900 dark:text-white">{selectedExam.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Code</label>
                        <p className="text-slate-900 dark:text-white">{selectedExam.code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Subject</label>
                        <p className="text-slate-900 dark:text-white">{selectedExam.subject_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Class</label>
                        <p className="text-slate-900 dark:text-white">{selectedExam.grade_level_name} {selectedExam.section_name && `• ${selectedExam.section_name}`}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Exam Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</label>
                        <p className="text-slate-900 dark:text-white">{selectedExam.exam_type_display}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date</label>
                        <p className="text-slate-900 dark:text-white">{formatDate(selectedExam.exam_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Time</label>
                        <p className="text-slate-900 dark:text-white">{formatTime(selectedExam.start_time)} - {formatTime(selectedExam.end_time)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Duration</label>
                        <p className="text-slate-900 dark:text-white">{selectedExam.duration_minutes} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Marks</label>
                        <p className="text-slate-900 dark:text-white">{selectedExam.total_marks}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedExam.status)}`}>
                          {selectedExam.status_display}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditExam(selectedExam)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Edit Exam
                  </button>
                  <button
                    onClick={() => setSelectedExam(null)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherExams;
