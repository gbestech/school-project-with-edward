import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit,  
  Eye, 
  CheckCircle, 
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  FileText,
  Award,
  Grid3X3,
  List,
  User,
  MoreVertical,
  X,
  AlertCircle
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import StudentService, { Student } from '@/services/StudentService';
import ResultService from '../../../services/ResultService';
import EnhancedResultRecording from './EnhancedResultRecording';
import EditResultForm from './EditResultForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
 

interface EnhancedResultManagementProps {}

const EnhancedResultManagement: React.FC<EnhancedResultManagementProps> = () => {
  const { isDarkMode } = useGlobalTheme();
  const navigate = useNavigate();
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [educationLevelFilter, setEducationLevelFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);

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
    buttonWarning: isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white',
    buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
  };

  // Education level and class choices
  const EDUCATION_LEVEL_CHOICES = [
    { value: 'NURSERY', label: 'Nursery' },
    { value: 'PRIMARY', label: 'Primary' },
    { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
    { value: 'SENIOR_SECONDARY', label: 'Senior Secondary' },
  ];

  const CLASS_CHOICES = [
    // Nursery
    { value: 'PRE_NURSERY', label: 'Pre-nursery', level: 'NURSERY' },
    { value: 'NURSERY_1', label: 'Nursery 1', level: 'NURSERY' },
    { value: 'NURSERY_2', label: 'Nursery 2', level: 'NURSERY' },
    // Primary
    { value: 'PRIMARY_1', label: 'Primary 1', level: 'PRIMARY' },
    { value: 'PRIMARY_2', label: 'Primary 2', level: 'PRIMARY' },
    { value: 'PRIMARY_3', label: 'Primary 3', level: 'PRIMARY' },
    { value: 'PRIMARY_4', label: 'Primary 4', level: 'PRIMARY' },
    { value: 'PRIMARY_5', label: 'Primary 5', level: 'PRIMARY' },
    { value: 'PRIMARY_6', label: 'Primary 6', level: 'PRIMARY' },
    // Junior Secondary
    { value: 'JSS_1', label: 'JSS 1', level: 'JUNIOR_SECONDARY' },
    { value: 'JSS_2', label: 'JSS 2', level: 'JUNIOR_SECONDARY' },
    { value: 'JSS_3', label: 'JSS 3', level: 'JUNIOR_SECONDARY' },
    // Senior Secondary
    { value: 'SSS_1', label: 'SSS 1', level: 'SENIOR_SECONDARY' },
    { value: 'SSS_2', label: 'SSS 2', level: 'SENIOR_SECONDARY' },
    { value: 'SSS_3', label: 'SSS 3', level: 'SENIOR_SECONDARY' },
  ];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, resultsData] = await Promise.all([
        StudentService.getStudents(),
        ResultService.getStudentResults()
      ]);
      
      setStudents(studentsData.results || studentsData);
      setResults(resultsData);
      
      // Debug logging
      console.log('Loaded results:', resultsData);
      console.log('Loaded students:', studentsData.results || studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEducationLevel = !educationLevelFilter || student.education_level === educationLevelFilter;
      const matchesClass = !classFilter || student.student_class === classFilter;
      const matchesGender = !genderFilter || student.gender === genderFilter;
      
      return matchesSearch && matchesEducationLevel && matchesClass && matchesGender;
    });
  }, [students, searchTerm, educationLevelFilter, classFilter, genderFilter]);

  // Get results for a specific student
  const getStudentResults = (studentId: number) => {
    const studentResults = results.filter(result => {
      // Handle both cases: when student is an object with id, or when it's just the id
      const resultStudentId = typeof result.student === 'object' ? result.student.id : result.student;
      return resultStudentId === studentId;
    });
    
    // Debug logging for specific student
    if (studentResults.length > 0) {
      console.log(`Student ${studentId} has ${studentResults.length} results:`, studentResults);
    }
    
    return studentResults;
  };

  // (Removed unused handleStatusChange to satisfy linter)

  // Handle form close
  const handleFormClose = () => {
    setShowAddForm(false);
  };

  // Handle form success (unused) removed

  // Handle edit result
  const handleEditResult = (result: any, student: Student) => {
    setEditingResult({ result, student });
  };

  // Get status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100 dark:bg-gray-500/15', fg: 'text-gray-700 dark:text-gray-300', icon: Clock, label: 'Draft' },
      SUBMITTED: { bg: 'bg-blue-100 dark:bg-blue-500/15', fg: 'text-blue-700 dark:text-blue-300', icon: FileText, label: 'Submitted' },
      APPROVED: { bg: 'bg-green-100 dark:bg-green-500/15', fg: 'text-green-700 dark:text-green-300', icon: CheckCircle, label: 'Approved' },
      PUBLISHED: { bg: 'bg-purple-100 dark:bg-purple-500/15', fg: 'text-purple-700 dark:text-purple-300', icon: Award, label: 'Published' }
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${config.bg} ${config.fg}`}>
        <IconComponent className="w-3.5 h-3.5 mr-1" />
        {config.label}
      </span>
    );
  };

  // getResultDetails removed (unused)

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} ${themeClasses.textPrimary}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} ${themeClasses.textPrimary}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadData}
              className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary}`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 ${themeClasses.textPrimary}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-800/60 border-b ${themeClasses.border}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Result Management</h1>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Manage and track student results across all education levels
            </p>
          </div>
          
          {/* Add Result Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center ${themeClasses.buttonPrimary} transition-all duration-200 active:scale-[.98] shadow-sm`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Result
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSecondary} transition-all duration-200 active:scale-[.98] ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSecondary} transition-all duration-200 active:scale-[.98] ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid3X3 className="w-4 h-4 mr-2" />}
              {viewMode === 'grid' ? 'List' : 'Grid'}
            </button>
            
            <button
              onClick={loadData}
              className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSecondary} transition-all duration-200 active:scale-[.98] ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`mt-4 p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                  Education Level
                </label>
                <select
                  value={educationLevelFilter}
                  onChange={(e) => setEducationLevelFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">All Levels</option>
                  {EDUCATION_LEVEL_CHOICES.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                  Class
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">All Classes</option>
                  {CLASS_CHOICES
                    .filter(cls => !educationLevelFilter || cls.level === educationLevelFilter)
                    .map(cls => (
                      <option key={cls.value} value={cls.value}>{cls.label}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-2xl ${themeClasses.bgCard} border ${themeClasses.border} shadow-sm ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}>
            <div className="flex items-center">
              <Users className={`w-8 h-8 ${themeClasses.iconPrimary} mr-3`} />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Total Students</p>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl ${themeClasses.bgCard} border ${themeClasses.border} shadow-sm ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}>
            <div className="flex items-center">
              <BookOpen className={`w-8 h-8 ${themeClasses.iconPrimary} mr-3`} />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Total Results</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl ${themeClasses.bgCard} border ${themeClasses.border} shadow-sm ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}>
            <div className="flex items-center">
              <CheckCircle className={`w-8 h-8 text-green-500 mr-3`} />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Published Results</p>
                <p className="text-2xl font-bold">{results.filter(r => r.status === 'PUBLISHED').length}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl ${themeClasses.bgCard} border ${themeClasses.border} shadow-sm ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}>
            <div className="flex items-center">
              <Clock className={`w-8 h-8 text-yellow-500 mr-3`} />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Draft Results</p>
                <p className="text-2xl font-bold">{results.filter(r => r.status === 'DRAFT').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students List/Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const studentResults = getStudentResults(student.id);
              return (
                <div key={student.id} className={`p-5 rounded-2xl ${themeClasses.bgCard} border ${themeClasses.border} shadow-sm ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'} transition-transform duration-200 hover:shadow-md hover:-translate-y-[1px]`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full ${themeClasses.bgSecondary} flex items-center justify-center mr-3 ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold leading-tight">{student.full_name}</h3>
                        <p className={`text-xs ${themeClasses.textSecondary}`}>ID: {student.id}</p>
                      </div>
                    </div>
                    <MoreVertical className={`w-5 h-5 ${themeClasses.iconSecondary} cursor-pointer`} />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Class:</span>
                      <span className="text-sm font-medium">{student.student_class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Level:</span>
                      <span className="text-sm font-medium">{student.education_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>Results:</span>
                      <span className="text-sm font-medium">{studentResults.length}</span>
                    </div>
                  </div>
                  
                  {/* Result Status Summary */}
                  {studentResults.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>Result Status</h4>
                      <div className="space-y-1.5">
                        {studentResults.map((result) => (
                          <div key={result.id} className="flex items-center justify-between">
                            <span className="text-xs truncate max-w-[60%]" title={result.subject?.name || result.subject_name || 'Unknown Subject'}>
                              {result.subject?.name || result.subject_name || 'Unknown Subject'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {getStatusBadge(result.status)}
                              <button
                                onClick={() => handleEditResult(result, student)}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title="Edit Result"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/results/student/${student.id}`)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm flex items-center justify-center ${themeClasses.buttonSecondary} transition-all duration-200 active:scale-[.98] ring-1 ring-inset ${isDarkMode ? 'ring-gray-700' : 'ring-gray-200'}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`rounded-lg ${themeClasses.bgCard} border ${themeClasses.border} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${themeClasses.bgSecondary} border-b ${themeClasses.border}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Results</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const studentResults = getStudentResults(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full ${themeClasses.bgSecondary} flex items-center justify-center mr-3`}>
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{student.full_name}</div>
                              <div className={`text-sm ${themeClasses.textSecondary}`}>ID: {student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.student_class}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.education_level}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{studentResults.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {studentResults.slice(0, 3).map((result) => (
                              <div key={result.id} className="flex items-center justify-between">
                                <span className="text-xs">{result.subject?.name || result.subject_name || 'Unknown Subject'}</span>
                                {getStatusBadge(result.status)}
                              </div>
                            ))}
                            {studentResults.length > 3 && (
                              <span className="text-xs text-gray-500">+{studentResults.length - 3} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/admin/results/student/${student.id}`)}
                            className={`px-3 py-1 rounded text-sm ${themeClasses.buttonSecondary}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No students found</h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>

      {/* Add Result Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Result
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <EnhancedResultRecording />
            </div>
          </div>
        </div>
      )}

      {/* Edit Result Form Modal */}
      {editingResult && (
        <EditResultForm
          result={editingResult.result}
          student={editingResult.student}
          onClose={() => setEditingResult(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default EnhancedResultManagement;
