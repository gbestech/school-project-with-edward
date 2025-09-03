import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Calendar, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  Star,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import EditResultForm from './EditResultForm';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import StudentService, { Student } from '../../../services/StudentService';
import ResultService from '../../../services/ResultService';
import { toast } from 'react-toastify';
import api from '../../../services/api';

interface StudentResultDetailProps {}

const StudentResultDetail: React.FC<StudentResultDetailProps> = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useGlobalTheme();
  
  // Data State
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
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

  // Load data on component mount
  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentData, resultsData] = await Promise.all([
        StudentService.getStudent(parseInt(studentId!)),
        ResultService.getStudentResults({ student: studentId })
      ]);
      
      setStudent(studentData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load student data');
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit result
  const handleEditResult = (result: any) => {
    setEditingResult(result);
  };

  // Handle status change
  const handleStatusChange = async (resultId: string, newStatus: string, educationLevel: string) => {
    try {
      setUpdatingStatus(resultId);
      let endpoint = '';
      switch (educationLevel) {
        case 'NURSERY':
          endpoint = `/api/results/nursery-results/${resultId}/${newStatus === 'APPROVED' ? 'approve' : 'publish'}/`;
          break;
        case 'PRIMARY':
          endpoint = `/api/results/primary-results/${resultId}/${newStatus === 'APPROVED' ? 'approve' : 'publish'}/`;
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = `/api/results/junior-secondary-results/${resultId}/${newStatus === 'APPROVED' ? 'approve' : 'publish'}/`;
          break;
        case 'SENIOR_SECONDARY':
          endpoint = `/api/results/senior-secondary-results/${resultId}/${newStatus === 'APPROVED' ? 'approve' : 'publish'}/`;
          break;
        default:
          throw new Error('Invalid education level');
      }

      await api.post(endpoint, {});
      toast.success(`Result ${newStatus.toLowerCase()} successfully`);
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error(`Failed to ${newStatus.toLowerCase()} result`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Get status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-500', icon: Clock, label: 'Draft' },
      SUBMITTED: { color: 'bg-blue-500', icon: FileText, label: 'Submitted' },
      APPROVED: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
      PUBLISHED: { color: 'bg-purple-500', icon: Award, label: 'Published' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-2" />
        {config.label}
      </span>
    );
  };

  // Get detailed result information based on education level
  const getResultDetails = (result: any, educationLevel: string) => {
    switch (educationLevel) {
      case 'SENIOR_SECONDARY':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">Test 1</span>
              </div>
              <div className="text-2xl font-bold">{result.test1_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">Test 2</span>
              </div>
              <div className="text-2xl font-bold">{result.test2_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">Test 3</span>
              </div>
              <div className="text-2xl font-bold">{result.test3_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Exam Score</span>
              </div>
              <div className="text-2xl font-bold">{result.exam_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm font-medium">Average</span>
              </div>
              <div className="text-2xl font-bold">{result.average_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Highest</span>
              </div>
              <div className="text-2xl font-bold">{result.highest_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                <span className="text-sm font-medium">Lowest</span>
              </div>
              <div className="text-2xl font-bold">{result.lowest_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 mr-2 text-orange-500" />
                <span className="text-sm font-medium">Obtainable</span>
              </div>
              <div className="text-2xl font-bold">{result.obtainable_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Obtained</span>
              </div>
              <div className="text-2xl font-bold">{result.obtained_score || 0}</div>
            </div>
          </div>
        );
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">CA Score</span>
              </div>
              <div className="text-2xl font-bold">{result.ca_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <User className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Appearance</span>
              </div>
              <div className="text-2xl font-bold">{result.appearance_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm font-medium">Take Home</span>
              </div>
              <div className="text-2xl font-bold">{result.take_home_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 mr-2 text-orange-500" />
                <span className="text-sm font-medium">Project</span>
              </div>
              <div className="text-2xl font-bold">{result.project_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="text-sm font-medium">Note Copying</span>
              </div>
              <div className="text-2xl font-bold">{result.note_copying_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Exam Score</span>
              </div>
              <div className="text-2xl font-bold">{result.exam_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm font-medium">Average</span>
              </div>
              <div className="text-2xl font-bold">{result.average_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Highest</span>
              </div>
              <div className="text-2xl font-bold">{result.highest_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                <span className="text-sm font-medium">Lowest</span>
              </div>
              <div className="text-2xl font-bold">{result.lowest_score || 0}</div>
            </div>
          </div>
        );
      case 'NURSERY':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Exam Score</span>
              </div>
              <div className="text-2xl font-bold">{result.exam_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">Total Score</span>
              </div>
              <div className="text-2xl font-bold">{result.total_score || 0}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="text-sm font-medium">Grade</span>
              </div>
              <div className="text-2xl font-bold">{result.grade || 'N/A'}</div>
            </div>
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm font-medium">Position</span>
              </div>
              <div className="text-2xl font-bold">{result.position || 'N/A'}</div>
            </div>
          </div>
        );
      default:
        return <div className="text-sm text-gray-500">No details available</div>;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} ${themeClasses.textPrimary}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} ${themeClasses.textPrimary}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-gray-500 mb-4">{error || 'Student not found'}</p>
            <button
              onClick={() => navigate('/admin/results')}
              className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bgPrimary} ${themeClasses.textPrimary}`}>
      {/* Header */}
      <div className={`p-6 ${themeClasses.bgCard} border-b ${themeClasses.border}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/results')}
              className={`p-2 rounded-lg mr-4 ${themeClasses.buttonSecondary}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Student Results</h1>
              <p className={`text-lg ${themeClasses.textSecondary}`}>
                Detailed results for {student.full_name}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSecondary}`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSecondary}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSecondary}`}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Student Info */}
        <div className={`p-6 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className={`w-16 h-16 rounded-full ${themeClasses.bgCard} flex items-center justify-center mr-4`}>
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{student.full_name}</h3>
                <p className={`text-sm ${themeClasses.textSecondary}`}>ID: {student.id}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-3 text-blue-500" />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Class</p>
                <p className="font-semibold">{student.student_class}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-3 text-green-500" />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Education Level</p>
                <p className="font-semibold">{student.education_level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {results.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              This student doesn't have any recorded results yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className={`p-6 rounded-lg ${themeClasses.bgCard} border ${themeClasses.border}`}>
                {/* Result Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {result.subject?.name || result.subject_name || 'Unknown Subject'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`${themeClasses.textSecondary}`}>
                        Session: {result.exam_session?.name || 'N/A'}
                      </span>
                      <span className={`${themeClasses.textSecondary}`}>
                        Term: {result.term || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(result.status)}
                    
                    {/* Status Management Buttons */}
                    {result.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusChange(result.id, 'APPROVED', student.education_level)}
                        disabled={updatingStatus === result.id}
                        className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSuccess} disabled:opacity-50`}
                      >
                        {updatingStatus === result.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </button>
                    )}
                    
                    {result.status === 'APPROVED' && (
                      <button
                        onClick={() => handleStatusChange(result.id, 'PUBLISHED', student.education_level)}
                        disabled={updatingStatus === result.id}
                        className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonPrimary} disabled:opacity-50`}
                      >
                        {updatingStatus === result.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Award className="w-4 h-4 mr-2" />
                        )}
                        Publish
                      </button>
                    )}
                    
                    {result.status === 'PUBLISHED' && (
                      <span className="text-green-600 font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Published
                      </span>
                    )}
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditResult(result)}
                      className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSecondary}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Result Details */}
                <div className="mb-6">
                  {getResultDetails(result, student.education_level)}
                </div>

                {/* Additional Info */}
                <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
                  <h4 className="font-semibold mb-3">Additional Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className={`${themeClasses.textSecondary}`}>Entered By:</span>
                      <p className="font-medium">{result.entered_by?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`${themeClasses.textSecondary}`}>Date Entered:</span>
                      <p className="font-medium">
                        {result.created_at ? new Date(result.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {result.approved_by && (
                      <div>
                        <span className={`${themeClasses.textSecondary}`}>Approved By:</span>
                        <p className="font-medium">{result.approved_by.full_name}</p>
                      </div>
                    )}
                    {result.approved_date && (
                      <div>
                        <span className={`${themeClasses.textSecondary}`}>Approved Date:</span>
                        <p className="font-medium">
                          {new Date(result.approved_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Result Form Modal */}
      {editingResult && (
        <EditResultForm
          result={editingResult}
          student={student}
          onClose={() => setEditingResult(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default StudentResultDetail;
