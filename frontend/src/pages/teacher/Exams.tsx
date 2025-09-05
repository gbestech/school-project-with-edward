import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import { ExamService, Exam, ExamCreateData } from '@/services/ExamService';
import { toast } from 'react-toastify';
import ExamCreationForm from '@/components/teacher/ExamCreationForm';
import TestCreationForm from '@/components/teacher/TestCreationForm';
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
  X,
  GraduationCap,
  Target,
  CheckCircle,
  Clock3
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
  updated_at: string;
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
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingTest, setEditingTest] = useState<Exam | null>(null);
  const [selectedExam, setSelectedExam] = useState<TeacherExamData | null>(null);
  const [activeTab, setActiveTab] = useState<'exams' | 'tests'>('exams');

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
        created_at: exam.created_at,
        updated_at: exam.updated_at || exam.created_at
      }));

      setTeacherAssignments(transformedAssignments);
      setExams(transformedExams);

      console.log('🔍 Teacher assignments:', assignments);
      console.log('🔍 Teacher exams:', examsData);
      console.log('🔍 Teacher ID:', teacherId);
      console.log('🔍 API endpoint called: /api/exams/by-teacher/' + teacherId + '/');

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
    toast.success('Data refreshed successfully!');
  };

  const handleCreateExam = () => {
    setShowCreateModal(true);
    setEditingExam(null);
  };

  const handleCreateTest = () => {
    setShowTestModal(true);
    setEditingTest(null);
  };

  const handleEditExam = (exam: TeacherExamData) => {
    // Convert to full Exam object for editing
    const fullExam: Exam = {
      id: exam.id,
      title: exam.title,
      code: exam.code,
      subject: { id: 0, name: exam.subject_name },
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

  const handleEditTest = (exam: TeacherExamData) => {
    // Convert to full Exam object for editing
    const fullExam: Exam = {
      id: exam.id,
      title: exam.title,
      code: exam.code,
      subject: { id: 0, name: exam.subject_name },
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
      objective_questions: [],
      theory_questions: [],
      practical_questions: [],
      custom_sections: [],
      objective_instructions: '',
      theory_instructions: '',
      practical_instructions: ''
    };

    setEditingTest(fullExam);
    setShowTestModal(true);
  };

  const handleDeleteExam = async (examId: number) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
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

  const handleViewExam = (exam: TeacherExamData) => {
    setSelectedExam(exam);
  };

  const closeExamModal = () => {
    setShowCreateModal(false);
    setEditingExam(null);
  };

  const closeTestModal = () => {
    setShowTestModal(false);
    setEditingTest(null);
  };

  const closeViewModal = () => {
    setSelectedExam(null);
  };

  const handleExamCreated = () => {
    loadTeacherData();
  };

  const handleTestCreated = () => {
    loadTeacherData();
  };

  // Filter exams based on current tab and filters
  const filteredExams = useMemo(() => {
    let filtered = exams;

    // Filter by tab (exams vs tests)
    if (activeTab === 'exams') {
      filtered = filtered.filter(exam => 
        exam.exam_type === 'mid_term' || exam.exam_type === 'final_exam' || exam.exam_type === 'practical' || exam.exam_type === 'oral_exam'
      );
    } else {
      filtered = filtered.filter(exam => 
        exam.exam_type === 'test' || exam.exam_type === 'quiz'
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.grade_level_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (filterSubject !== 'all') {
      filtered = filtered.filter(exam => exam.subject_name === filterSubject);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(exam => exam.exam_type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(exam => exam.status === filterStatus);
    }

    return filtered;
  }, [exams, activeTab, searchTerm, filterSubject, filterType, filterStatus]);

  // Get unique subjects and types for filters
  const uniqueSubjects = useMemo(() => {
    const subjects = Array.from(new Set(exams.map(exam => exam.subject_name)));
    return subjects.sort();
  }, [exams]);

  const uniqueTypes = useMemo(() => {
    const types = Array.from(new Set(exams.map(exam => exam.exam_type)));
    return types.sort();
  }, [exams]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar, text: 'Scheduled' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, text: 'Cancelled' },
      postponed: { color: 'bg-orange-100 text-orange-800', icon: Clock3, text: 'Postponed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = {
      test: { icon: Target, color: 'text-green-600' },
      quiz: { icon: CheckSquare, color: 'text-purple-600' },
      mid_term: { icon: Calendar, color: 'text-indigo-600' },
      final_exam: { icon: Award, color: 'text-red-600' },
      practical: { icon: GraduationCap, color: 'text-blue-600' },
      oral_exam: { icon: Users, color: 'text-orange-600' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.test;
    const Icon = config.icon;

    return <Icon className={`w-5 h-5 ${config.color}`} />;
  };

  if (isLoading) {
    return (
      <TeacherDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Exam & Test Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create and manage exams, tests, and assessments for your classes
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Exam Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Exams</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{exams.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{exams.filter(e => e.status === 'scheduled').length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{exams.filter(e => e.status === 'in_progress').length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{exams.filter(e => e.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tests & Quizzes</p>
                <p className="text-2xl font-bold text-purple-600">{exams.filter(e => e.exam_type === 'test' || e.exam_type === 'quiz').length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'exams'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Exams</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Tests & Quizzes</span>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            {activeTab === 'exams' ? (
              <button
                onClick={handleCreateExam}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Exam</span>
              </button>
            ) : (
              <button
                onClick={handleCreateTest}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Test</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="test">Class Test</option>
              <option value="quiz">Quiz</option>
              <option value="mid_term">Mid-Term</option>
              <option value="final_exam">Final Exam</option>
              <option value="practical">Practical</option>
              <option value="oral_exam">Oral Exam</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={loadTeacherData}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No {activeTab === 'exams' ? 'exams' : 'tests'} found
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {activeTab === 'exams' 
                ? 'Create your first exam to get started'
                : 'Create your first test or quiz to get started'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getTypeIcon(exam.exam_type)}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {exam.code}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {exam.subject_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {exam.grade_level_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {exam.total_marks} marks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      {getStatusBadge(exam.status)}
                      <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{exam.duration_minutes} min</span>
                      </div>
                      {exam.exam_date && (
                        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock3 className="w-4 h-4" />
                        <span>Created: {new Date(exam.created_at).toLocaleDateString()}</span>
                      </div>
                      {exam.updated_at !== exam.created_at && (
                        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                          <RefreshCw className="w-4 h-4" />
                          <span>Updated: {new Date(exam.updated_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewExam(exam)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    {(exam.status === 'scheduled' || exam.status === 'draft') && (
                      <button
                        onClick={() => activeTab === 'exams' ? handleEditExam(exam) : handleEditTest(exam)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                    
                    {(exam.status === 'scheduled' || exam.status === 'draft') && (
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Creation Modal */}
      {showCreateModal && (
        <ExamCreationForm
          isOpen={showCreateModal}
          onClose={closeExamModal}
          onExamCreated={handleExamCreated}
          editingExam={editingExam}
        />
      )}

      {/* Test Creation Modal */}
      {showTestModal && (
        <TestCreationForm
          isOpen={showTestModal}
          onClose={closeTestModal}
          onTestCreated={handleTestCreated}
          editingTest={editingTest}
        />
      )}

      {/* Exam View Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Exam Details
              </h2>
              <button
                onClick={closeViewModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Title</label>
                  <p className="text-slate-900 dark:text-white">{selectedExam.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Code</label>
                  <p className="text-slate-900 dark:text-white">{selectedExam.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Subject</label>
                  <p className="text-slate-900 dark:text-white">{selectedExam.subject_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Grade Level</label>
                  <p className="text-slate-900 dark:text-white">{selectedExam.grade_level_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Type</label>
                  <p className="text-slate-900 dark:text-white">{selectedExam.exam_type_display}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Marks</label>
                  <p className="text-slate-900 dark:text-white">{selectedExam.total_marks}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Duration</label>
                  <p className="text-slate-900 dark:text-white">{selectedExam.duration_minutes} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedExam.status)}</div>
                </div>
              </div>

              {selectedExam.exam_date && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Schedule</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Date</label>
                      <p className="text-slate-900 dark:text-white">
                        {new Date(selectedExam.exam_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Start Time</label>
                      <p className="text-slate-900 dark:text-white">{selectedExam.start_time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">End Time</label>
                      <p className="text-slate-900 dark:text-white">{selectedExam.end_time}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TeacherDashboardLayout>
  );
};

export default TeacherExams;
