import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
 
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import { ExamService, Exam } from '@/services/ExamService';
import { toast } from 'react-toastify';
import ExamCreationForm from '@/components/dashboards/teacher/ExamCreationForm';
import TestCreationForm from '@/components/dashboards/teacher/TestCreationForm';
import { normalizeExamDataForDisplay } from '@/utils/examDataNormalizer';
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
  CheckCircle,
  Award,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  GraduationCap,
  Target,
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

const TeacherExams: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState<TeacherExamData[]>([]);
  // const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
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
  const [selectedExamDetail, setSelectedExamDetail] = useState<Exam | null>(null);
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
    console.log('🔍 STEP 1: Teacher ID loaded:', teacherId);
    console.log('🔍 User object:', user);
    
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }

    // Get teacher assignments and exams
    console.log('🔍 STEP 2: Fetching assignments and exams for teacher:', teacherId);
    const [assignmentsResponse, examsResponse] = await Promise.all([
      TeacherDashboardService.getTeacherClasses(teacherId),
      ExamService.getExamsByTeacher(teacherId)
    ]);

    const assignments = assignmentsResponse || [];
    let examsData = examsResponse || [];

    
    // Extract subject IDs for fallback
    const subjectIds = Array.from(new Set(
      (assignments || []).map((a: any) => a.subject_id).filter((id: any) => !!id)
    ));
    console.log('🔍 STEP 4: Subject IDs from assignments:', subjectIds);

    // Fallback: Get exams by subjects
    if (subjectIds.length > 0) {
      try {
        console.log('🔍 STEP 5: Fetching exams by subjects...');
        const bySubjectLists = await Promise.all(
          subjectIds.map((sid: number) => ExamService.getExamsBySubject(sid))
        );
        const bySubject = bySubjectLists.flat();
        
        
        // Merge and deduplicate
        const examMap = new Map();
        [...examsData, ...bySubject].forEach((e: any) => {
          if (e && e.id) {
            examMap.set(e.id, e);
          }
        });
        examsData = Array.from(examMap.values());
        
        console.log('🔍 STEP 6: After merging and deduplication:', examsData.length, 'exams');
      } catch (e) {
        console.warn('⚠️ Fallback by subject failed:', e);
      }
    }

    // Validate exam data
    console.log('🔍 STEP 7: Validating exam data...');
    const validExamsData = examsData.filter((exam: any) => {
      if (!exam || !exam.id || exam.id <= 0) {
        console.warn('   ⚠️ Filtering out exam with invalid ID:', exam);
        return false;
      }
      
      if (!exam.title || !exam.exam_type) {
        console.warn('   ⚠️ Filtering out exam missing required fields:', exam);
        return false;
      }
      
      console.log('   ✅ Valid exam:', exam.id, '-', exam.title);
      return true;
    });

    console.log('🔍 STEP 8: Valid exams after filtering:', validExamsData.length);
    
    // Transform exams
    const transformedExams: TeacherExamData[] = validExamsData.map((exam: any) => {
      const transformed = {
        id: exam.id,
        title: exam.title,
        code: exam.code || `EX-${exam.id}`,
        subject_name: exam.subject_name || exam.subject?.name || 'Unknown Subject',
        grade_level_name: exam.grade_level_name || exam.grade_level?.name || 'Unknown Class',
        section_name: exam.section_name || exam.section?.name,
        exam_type: exam.exam_type,
        exam_type_display: exam.exam_type_display || exam.exam_type,
        exam_date: exam.exam_date || '',
        start_time: exam.start_time || '',
        end_time: exam.end_time || '',
        duration_minutes: exam.duration_minutes || 0,
        total_marks: exam.total_marks || 0,
        status: exam.status || 'scheduled',
        status_display: exam.status_display || exam.status || 'Scheduled',
        student_count: exam.student_count || 0,
        created_at: exam.created_at,
        updated_at: exam.updated_at || exam.created_at
      };
      console.log('   📋 Transformed exam:', transformed.id, '-', transformed.title);
      return transformed;
    });

    console.log('✅ STEP 9: Final transformed exams:', transformedExams.length);
    console.log('✅ Exam details:', transformedExams.map(e => ({ 
      id: e.id, 
      title: e.title, 
      subject: e.subject_name,
      grade: e.grade_level_name,
      type: e.exam_type
    })));

    setExams(transformedExams);

    if (transformedExams.length === 0) {
      console.warn('⚠️ NO EXAMS FOUND for this teacher!');
      console.warn('⚠️ This could mean:');
      console.warn('   1. No exams have been created yet');
      console.warn('   2. Exams were created but teacher ID was not saved');
      console.warn('   3. Exams exist but are for different subjects/teachers');
    }

  } catch (error) {
    console.error('❌ FATAL ERROR loading teacher data:', error);
    console.error('❌ Error stack:', error);
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

  const handleEditExam = async (exam: TeacherExamData) => {
    console.log('🔍 Attempting to edit exam with ID:', exam.id);
    
    try {
      const full = await ExamService.getExam(exam.id);
      setEditingExam(full);
      setShowCreateModal(true);
    } catch (e) {
      console.error('Error loading exam for editing:', e);
      
      // Check if it's a 404 error (exam doesn't exist)
      const is404Error = e instanceof Error && (
        e.message.includes('404') || 
        e.message.includes('Not Found') ||
        e.message.includes('No Exam matches')
      );
      
      if (is404Error) {
        toast.info('This exam no longer exists. Removing from list...');
        // Remove the phantom exam from the UI and reload data
        setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
        await loadTeacherData();
      } else {
        // Open create modal with prefill so user can correct and save as new
        setEditingExam(null);
        setShowCreateModal(true);
        toast.warning('Exam not found in database. Opened form to correct and re-save.');
      }
    }
  };

  const handleEditTest = async (exam: TeacherExamData) => {
    console.log('🔍 Attempting to edit test with ID:', exam.id);
    
    try {
      const full = await ExamService.getExam(exam.id);
      setEditingTest(full);
      setShowTestModal(true);
    } catch (e) {
      console.error('Error loading test for editing:', e);
      
      // Check if it's a 404 error (exam doesn't exist)
      const is404Error = e instanceof Error && (
        e.message.includes('404') || 
        e.message.includes('Not Found') ||
        e.message.includes('No Exam matches')
      );
      
      if (is404Error) {
        toast.info('This test no longer exists. Removing from list...');
        // Remove the phantom exam from the UI and reload data
        setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
        await loadTeacherData();
      } else {
        toast.error('Failed to load test details');
      }
    }
  };

  const handleSubmitForApproval = async (examId: number) => {
    if (window.confirm('Are you sure you want to submit this exam for approval? You won\'t be able to edit it until it\'s approved or rejected.')) {
      try {
        await ExamService.submitForApproval(examId);
        toast.success('Exam submitted for approval successfully!');
        await loadTeacherData();
      } catch (error) {
        console.error('Error submitting exam for approval:', error);
        toast.error('Failed to submit exam for approval. Please try again.');
      }
    }
  };

  const handleDeleteExam = async (examId: number) => {
  console.log('🔍 Deleting exam:', examId);
  
  const examToDelete = exams.find(e => e.id === examId);
  if (!examToDelete) {
    console.warn('⚠️ Exam not found in state, skipping delete');
    return;
  }
  
  if (!window.confirm(`Are you sure you want to delete "${examToDelete.title}"?`)) {
    return;
  }
  
  try {
    // Optimistically remove from UI
    setExams(prevExams => prevExams.filter(e => e.id !== examId));
    
    // Delete from backend
    await ExamService.deleteExam(examId);
    console.log('✅ Exam deleted successfully');
    toast.success('Exam deleted successfully!');
    
    // Reload to ensure sync
    await loadTeacherData();
  } catch (error) {
    console.error('❌ Error deleting exam:', error);
    
    const is404Error = error instanceof Error && (
      error.message.includes('404') || 
      error.message.includes('Not Found')
    );
    
    if (is404Error) {
      // Already deleted, just confirm and sync
      toast.success('Exam removed successfully!');
      await loadTeacherData();
    } else {
      // Real error - restore exam and show error
      toast.error('Failed to delete exam. Please try again.');
      await loadTeacherData();
    }
  }
};

  const handleViewExam = async (exam: TeacherExamData) => {
  console.log('🔍 Viewing exam:', exam.id, exam.title);
  
  try {
    const full = await ExamService.getExam(exam.id);
    console.log('✅ Loaded full exam details:', full);

    // NORMALIZE DATA FOR DISPLAY
      const normalizedFull = normalizeExamDataForDisplay(full);
      console.log('✅ Normalized exam details:', normalizedFull);
    setSelectedExam(exam);
    setSelectedExamDetail(normalizedFull);
  } catch (e) {
    console.error('❌ Error loading exam details:', e);
    
    const is404Error = e instanceof Error && (
      e.message.includes('404') || 
      e.message.includes('Not Found') ||
      e.message.includes('No Exam matches')
    );
    
    if (is404Error) {
      toast.error('This exam no longer exists. Refreshing list...');
      // Remove from state and reload
      setExams(prevExams => prevExams.filter(e => e.id !== exam.id));
      await loadTeacherData();
    } else {
      toast.error('Failed to load exam details. Please try again.');
    }
  }
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
    setSelectedExamDetail(null);
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

  // const uniqueTypes = useMemo(() => {
  //   const types = Array.from(new Set(exams.map(exam => exam.exam_type)));
  //   return types.sort();
  // }, [exams]);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2">
          <div className='p-3'>
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
            {filteredExams.filter(exam => exam.id !== 9).map((exam) => (
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
                    
                    {(exam.status === 'completed' || exam.status === 'in_progress') && (
                      <button
                        onClick={() => navigate('/teacher/results')}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        <span>Record Results</span>
                      </button>
                    )}
                    
                    {exam.status === 'draft' && (
                      <button
                        onClick={() => handleSubmitForApproval(exam.id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit for Approval</span>
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
          prefill={!editingExam && selectedExam ? {
            title: selectedExam.title,
            exam_type: selectedExam.exam_type,
            subject: 0,
            grade_level: 0,
          } : undefined}
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

              {/* Questions Preview */}
              {selectedExamDetail && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-6">
                  {(selectedExamDetail.objective_questions || []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Objective Questions</h3>
                      <div className="space-y-3">
                        {selectedExamDetail.objective_questions!.map((q: any, i: number) => (
                          <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded">
                            <div className="font-medium mb-2">{i + 1}. {q.question}</div>
                            {q.imageUrl && (
                              <img src={q.imageUrl} alt={q.imageAlt || 'question image'} className="max-h-40 object-contain mb-2" />
                            )}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>A. {q.optionA}</div>
                              <div>B. {q.optionB}</div>
                              <div>C. {q.optionC}</div>
                              <div>D. {q.optionD}</div>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Marks: {q.marks}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedExamDetail.theory_questions || []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Theory Questions</h3>
                      <div className="space-y-3">
                        {selectedExamDetail.theory_questions!.map((q: any, i: number) => (
                          <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded">
                            <div className="font-medium mb-2">{i + 1}. {q.question}</div>
                            {q.imageUrl && (
                              <img src={q.imageUrl} alt={q.imageAlt || 'theory image'} className="max-h-40 object-contain mb-2" />
                            )}
                            {q.table && (
                              <div className="overflow-auto mb-2">
                                <table className="min-w-[300px] border border-slate-300 dark:border-slate-600 text-sm">
                                  <tbody>
                                    {q.table.data.map((row: string[], r: number) => (
                                      <tr key={r}>
                                        {row.map((cell: string, c: number) => (
                                          <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">{cell}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {(q.subQuestions || []).length > 0 && (
                              <div className="space-y-2">
                                {q.subQuestions.map((sq: any, si: number) => (
                                  <div key={si} className="pl-3">
                                    <div className="mb-1">{i + 1}{String.fromCharCode(97 + si)}. {sq.question} ({sq.marks || 0} marks)</div>
                                    {(sq.subSubQuestions || []).length > 0 && (
                                      <div className="pl-3 space-y-1">
                                        {sq.subSubQuestions.map((ssq: any, ssi: number) => (
                                          <div key={ssi}>{i + 1}{String.fromCharCode(97 + si)}{String.fromCharCode(105 + ssi)}. {ssq.question} ({ssq.marks || 0})</div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">Marks: {q.marks}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedExamDetail.custom_sections || []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Custom Sections</h3>
                      <div className="space-y-3">
                        {selectedExamDetail.custom_sections!.map((s: any, si: number) => (
                          <div key={s.id || si} className="p-3 border border-slate-200 dark:border-slate-600 rounded">
                            <div className="font-medium mb-1">{s.name}</div>
                            {s.instructions && <div className="text-xs text-slate-500 mb-2">{s.instructions}</div>}
                            {(s.questions || []).map((q: any, qi: number) => (
                              <div key={q.id || qi} className="mt-2">
                                <div className="mb-1">{qi + 1}. {q.question}</div>
                                {q.imageUrl && (
                                  <img src={q.imageUrl} alt={q.imageAlt || 'custom image'} className="max-h-40 object-contain mb-2" />
                                )}
                                {q.table && (
                                  <div className="overflow-auto mb-2">
                                    <table className="min-w-[300px] border border-slate-300 dark:border-slate-600 text-sm">
                                      <tbody>
                                        {q.table.data.map((row: string[], r: number) => (
                                          <tr key={r}>
                                            {row.map((cell: string, c: number) => (
                                              <td key={c} className="border border-slate-300 dark:border-slate-600 p-1">{cell}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                                <div className="text-xs text-slate-500">Marks: {q.marks || 0}</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
