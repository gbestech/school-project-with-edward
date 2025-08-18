import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  RefreshCw,
  Printer,
  FileText,
  Award,
  TrendingUp
} from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import ResultService, { 
  StudentResult, 
  ExamSession, 
  StudentTermResult,
  ClassStatistics 
} from '../../../services/ResultService';
import AddResultForm from './AddResultForm';

// Mock data for fallback
const MOCK_STUDENT_RESULTS: StudentResult[] = [
  {
    id: '1',
    student: {
      id: '1',
      full_name: 'John Doe',
      username: 'john.doe',
      student_class: 'SS1',
      education_level: 'SENIOR_SECONDARY',
      profile_picture: undefined
    },
    subject: {
      id: '1',
      name: 'Mathematics',
      code: 'MATH'
    },
    exam_session: {
      id: '1',
      name: 'First Term Examination',
      exam_type: 'FINAL_EXAM',
      term: 'FIRST',
      academic_session: {
        id: '1',
        name: '2024/2025'
      },
      start_date: '2024-09-01',
      end_date: '2024-09-30',
      is_published: true,
      is_active: true
    },
    ca_score: 25,
    exam_score: 65,
    total_score: 90,
    percentage: 90,
    grade: 'A',
    grade_point: 4.0,
    is_passed: true,
    position: 1,
    remarks: 'Excellent performance',
    status: 'PUBLISHED',
    assessment_scores: [],
    created_at: '2024-09-15T10:00:00Z'
  },
  {
    id: '2',
    student: {
      id: '2',
      full_name: 'Jane Smith',
      username: 'jane.smith',
      student_class: 'SS1',
      education_level: 'SENIOR_SECONDARY',
      profile_picture: undefined
    },
    subject: {
      id: '2',
      name: 'English Language',
      code: 'ENG'
    },
    exam_session: {
      id: '1',
      name: 'First Term Examination',
      exam_type: 'FINAL_EXAM',
      term: 'FIRST',
      academic_session: {
        id: '1',
        name: '2024/2025'
      },
      start_date: '2024-09-01',
      end_date: '2024-09-30',
      is_published: true,
      is_active: true
    },
    ca_score: 28,
    exam_score: 72,
    total_score: 100,
    percentage: 100,
    grade: 'A+',
    grade_point: 4.0,
    is_passed: true,
    position: 1,
    remarks: 'Outstanding performance',
    status: 'PUBLISHED',
    assessment_scores: [],
    created_at: '2024-09-15T10:00:00Z'
  },
  {
    id: '3',
    student: {
      id: '3',
      full_name: 'Mike Johnson',
      username: 'mike.johnson',
      student_class: 'SS2',
      education_level: 'SENIOR_SECONDARY',
      profile_picture: undefined
    },
    subject: {
      id: '3',
      name: 'Physics',
      code: 'PHY'
    },
    exam_session: {
      id: '2',
      name: 'Second Term Examination',
      exam_type: 'FINAL_EXAM',
      term: 'SECOND',
      academic_session: {
        id: '1',
        name: '2024/2025'
      },
      start_date: '2024-12-01',
      end_date: '2024-12-30',
      is_published: true,
      is_active: true
    },
    ca_score: 22,
    exam_score: 58,
    total_score: 80,
    percentage: 80,
    grade: 'B',
    grade_point: 3.0,
    is_passed: true,
    position: 3,
    remarks: 'Good performance',
    status: 'APPROVED',
    assessment_scores: [],
    created_at: '2024-12-15T10:00:00Z'
  }
];

const MOCK_EXAM_SESSIONS: ExamSession[] = [
  {
    id: '1',
    name: 'First Term Examination',
    exam_type: 'FINAL_EXAM',
    term: 'FIRST',
    academic_session: {
      id: '1',
      name: '2024/2025'
    },
    start_date: '2024-09-01',
    end_date: '2024-09-30',
    result_release_date: '2024-10-15',
    is_published: true,
    is_active: true
  },
  {
    id: '2',
    name: 'Second Term Examination',
    exam_type: 'FINAL_EXAM',
    term: 'SECOND',
    academic_session: {
      id: '1',
      name: '2024/2025'
    },
    start_date: '2024-12-01',
    end_date: '2024-12-30',
    result_release_date: '2025-01-15',
    is_published: true,
    is_active: true
  }
];

const MOCK_CLASS_STATISTICS: ClassStatistics = {
  total_students: 25,
  average_score: 75.5,
  highest_score: 100,
  lowest_score: 45,
  passed_count: 20,
  failed_count: 5
};

interface ResultManagementProps {}

const ResultManagement: React.FC<ResultManagementProps> = () => {
  const { isDarkMode } = useGlobalTheme();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // UI State
  const [viewMode, setViewMode] = useState<'list' | 'statistics' | 'bulk'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [examSessionFilter, setExamSessionFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    borderHover: isDarkMode ? 'border-gray-600' : 'border-gray-300',
    iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    iconSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
    buttonWarning: isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white',
    buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
  };

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resultsData, sessionsData] = await Promise.all([
        ResultService.getStudentResults(),
        ResultService.getExamSessions({ is_active: true })
      ]);
      
      setResults(Array.isArray(resultsData) ? resultsData : []);
      setExamSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setUsingMockData(false);
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Failed to load results from API. Using mock data instead.');
      setUsingMockData(true);
      setResults(MOCK_STUDENT_RESULTS);
      setExamSessions(MOCK_EXAM_SESSIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = searchTerm === '' || 
        result.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subject.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
      const matchesClass = classFilter === 'all' || result.student.student_class === classFilter;
      const matchesExamSession = examSessionFilter === 'all' || result.exam_session.id === examSessionFilter;
      const matchesSubject = subjectFilter === 'all' || result.subject.id === subjectFilter;
      
      return matchesSearch && matchesStatus && matchesClass && matchesExamSession && matchesSubject;
    });
  }, [results, searchTerm, statusFilter, classFilter, examSessionFilter, subjectFilter]);

  // Statistics
  const statistics = useMemo(() => {
    const total = results.length;
    const published = results.filter(r => r.status === 'PUBLISHED').length;
    const approved = results.filter(r => r.status === 'APPROVED').length;
    const draft = results.filter(r => r.status === 'DRAFT').length;
    const passed = results.filter(r => r.is_passed).length;
    const failed = results.filter(r => !r.is_passed).length;
    const averageScore = total > 0 ? results.reduce((sum, r) => sum + r.total_score, 0) / total : 0;

    return {
      total,
      published,
      approved,
      draft,
      passed,
      failed,
      averageScore: Math.round(averageScore * 100) / 100
    };
  }, [results]);

  // Unique filter options
  const uniqueClasses = useMemo(() => 
    Array.from(new Set(results.map(r => r.student.student_class))).sort(), 
    [results]
  );
  
  const uniqueSubjects = useMemo(() => 
    Array.from(new Set(results.map(r => r.subject.name))).sort(), 
    [results]
  );

  const uniqueStatuses = useMemo(() => 
    Array.from(new Set(results.map(r => r.status))).sort(), 
    [results]
  );

  // Event handlers
  const handleAddResult = () => {
    setShowAddForm(true);
  };

  const handleEditResult = (result: StudentResult) => {
    setSelectedResult(result);
    setShowEditForm(true);
  };

  const handleViewResult = (result: StudentResult) => {
    setSelectedResult(result);
    setShowViewModal(true);
  };

  const handleDeleteResult = async (resultId: string) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await ResultService.deleteStudentResult(resultId);
        setResults(prev => prev.filter(r => r.id !== resultId));
      } catch (err) {
        console.error('Error deleting result:', err);
        alert('Failed to delete result');
      }
    }
  };

  const handleApproveResult = async (resultId: string) => {
    try {
      await ResultService.approveStudentResult(resultId);
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, status: 'APPROVED' } : r
      ));
    } catch (err) {
      console.error('Error approving result:', err);
      alert('Failed to approve result');
    }
  };

  const handlePublishResult = async (resultId: string) => {
    try {
      await ResultService.publishStudentResult(resultId);
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, status: 'PUBLISHED' } : r
      ));
    } catch (err) {
      console.error('Error publishing result:', err);
      alert('Failed to publish result');
    }
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowViewModal(false);
    setSelectedResult(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800 border-green-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600';
    if (grade === 'B' || grade === 'B+') return 'text-blue-600';
    if (grade === 'C' || grade === 'C+') return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bgPrimary} p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} mb-2`}>
              Result Management
            </h1>
            <p className={`text-lg ${themeClasses.textSecondary}`}>
              Manage student results, grades, and academic performance
            </p>
            {usingMockData && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                ⚠️ Using mock data - API connection failed
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            
            <button
              onClick={handleAddResult}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
            >
              <Plus size={20} />
              <span>Add Result</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Results</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.total}</p>
              </div>
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <FileText size={24} className={themeClasses.iconPrimary} />
              </div>
            </div>
          </div>

          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Published</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.published}</p>
              </div>
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Passed</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.passed}</p>
              </div>
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <Award size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Average Score</p>
                <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.averageScore}</p>
              </div>
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${themeClasses.bgCard} rounded-xl p-4 shadow-lg border ${themeClasses.border} mb-4`}>
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
            }`}
          >
            <FileText size={16} />
            <span>Results List</span>
          </button>
          
          <button
            onClick={() => setViewMode('statistics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'statistics' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
            }`}
          >
            <BarChart3 size={16} />
            <span>Statistics</span>
          </button>
          
          <button
            onClick={() => setViewMode('bulk')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'bulk' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
            }`}
          >
            <Upload size={16} />
            <span>Bulk Operations</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`${themeClasses.bgCard} rounded-xl p-4 shadow-lg border ${themeClasses.border} mb-6`}>
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconSecondary}`} />
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Classes</option>
            {uniqueClasses.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg bg-red-100 border border-red-300 ${isDarkMode ? 'bg-red-900 border-red-700' : ''}`}>
          <p className={`text-red-700 ${isDarkMode ? 'text-red-300' : ''}`}>{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {viewMode === 'list' && (
          <div className={`${themeClasses.bgCard} rounded-xl shadow-lg border ${themeClasses.border} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${themeClasses.bgSecondary} border-b ${themeClasses.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Student
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Subject
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Class
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      CA Score
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Exam Score
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Total
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Grade
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${themeClasses.textPrimary}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResults.map((result) => (
                    <tr key={result.id} className={`hover:bg-gray-50 ${isDarkMode ? 'hover:bg-gray-700' : ''} transition-colors`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-medium ${themeClasses.textPrimary}`}>
                            {result.student.full_name}
                          </div>
                          <div className={`text-sm ${themeClasses.textSecondary}`}>
                            {result.student.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-medium ${themeClasses.textPrimary}`}>
                            {result.subject.name}
                          </div>
                          <div className={`text-sm ${themeClasses.textSecondary}`}>
                            {result.subject.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${themeClasses.textSecondary}`}>
                          {result.student.student_class}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${themeClasses.textPrimary}`}>
                          {result.ca_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${themeClasses.textPrimary}`}>
                          {result.exam_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${themeClasses.textPrimary}`}>
                          {result.total_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewResult(result)}
                            className={`p-1 rounded ${themeClasses.buttonSecondary}`}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditResult(result)}
                            className={`p-1 rounded ${themeClasses.buttonSecondary}`}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          {result.status === 'DRAFT' && (
                            <button
                              onClick={() => handleApproveResult(result.id)}
                              className={`p-1 rounded ${themeClasses.buttonSuccess}`}
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {result.status === 'APPROVED' && (
                            <button
                              onClick={() => handlePublishResult(result.id)}
                              className={`p-1 rounded ${themeClasses.buttonWarning}`}
                              title="Publish"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteResult(result.id)}
                            className={`p-1 rounded ${themeClasses.buttonDanger}`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredResults.length === 0 && (
              <div className="text-center py-8">
                <p className={`text-lg ${themeClasses.textSecondary}`}>
                  No results found matching your criteria
                </p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'statistics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border}`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>
                Performance Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Total Results</span>
                  <span className={`font-bold ${themeClasses.textPrimary}`}>{statistics.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Published</span>
                  <span className="font-bold text-green-600">{statistics.published}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Approved</span>
                  <span className="font-bold text-blue-600">{statistics.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Draft</span>
                  <span className="font-bold text-yellow-600">{statistics.draft}</span>
                </div>
              </div>
            </div>

            <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border}`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>
                Academic Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Passed</span>
                  <span className="font-bold text-green-600">{statistics.passed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Failed</span>
                  <span className="font-bold text-red-600">{statistics.failed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Pass Rate</span>
                  <span className="font-bold text-blue-600">
                    {statistics.total > 0 ? Math.round((statistics.passed / statistics.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${themeClasses.textSecondary}`}>Average Score</span>
                  <span className="font-bold text-purple-600">{statistics.averageScore}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'bulk' && (
          <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border}`}>
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>
              Bulk Operations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className={`font-medium ${themeClasses.textPrimary}`}>Import Results</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                  <p className={`${themeClasses.textSecondary} mb-2`}>
                    Upload CSV file with results
                  </p>
                  <button className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary}`}>
                    Choose File
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={`font-medium ${themeClasses.textPrimary}`}>Export Results</h4>
                <div className="space-y-2">
                  <button className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonSecondary}`}>
                    <Download size={16} />
                    <span>Export to CSV</span>
                  </button>
                  <button className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonSecondary}`}>
                    <Printer size={16} />
                    <span>Print Results</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddForm && (
        <AddResultForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* EditResultForm and ViewResultModal components would be implemented separately */}
    </div>
  );
};

export default ResultManagement;
