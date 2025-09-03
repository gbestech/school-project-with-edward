import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCheckerService, { 
  TermlyResult, 
  SessionResult, 
  ResultSearchFilters,
  TermInfo 
} from '../../../services/ResultCheckerService';
import SeniorSecondaryTermlyResult from '../student/SeniorSecondaryTermlyResult';
import SeniorSecondarySessionResult from '../student/SeniorSecondarySessionResult';
import JuniorSecondaryResult from '../student/JuniorSecondaryResult';
import PrimaryResult from '../student/PrimaryResult';
import NurseryResult from '../student/NurseryResult';

interface UserRole {
  role: 'admin' | 'teacher' | 'student' | 'parent';
  permissions: string[];
}

const ResultChecker: React.FC = () => {
  // State management
  const [userRole, setUserRole] = useState<UserRole>({ role: 'admin', permissions: ['view_all'] });
  const [resultType, setResultType] = useState<'termly' | 'session'>('termly');
  const [filters, setFilters] = useState<ResultSearchFilters>({});
  const [results, setResults] = useState<TermlyResult[] | SessionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TermlyResult | SessionResult | null>(null);
  const [showResultView, setShowResultView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Filter options
  const [terms, setTerms] = useState<TermInfo[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load results when filters change
  useEffect(() => {
    loadResults();
  }, [filters, resultType, userRole]);

  const loadFilterOptions = async () => {
    try {
      const [termsData, sessionsData, classesData] = await Promise.all([
        ResultCheckerService.getAvailableTerms(),
        ResultCheckerService.getAvailableSessions(),
        userRole.role === 'admin' || userRole.role === 'teacher' 
          ? ResultCheckerService.getAvailableClasses() 
          : Promise.resolve([])
      ]);

      setTerms(termsData);
      setSessions(sessionsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error('Failed to load filter options');
    }
  };

  const loadResults = async () => {
    setLoading(true);
    try {
      let resultsData: TermlyResult[] | SessionResult[] = [];

      switch (userRole.role) {
        case 'admin':
          if (resultType === 'termly') {
            resultsData = await ResultCheckerService.getTermlyResults(filters);
          } else {
            resultsData = await ResultCheckerService.getSessionResults(filters);
          }
          break;

        case 'teacher':
          if (resultType === 'termly') {
            resultsData = await ResultCheckerService.getTeacherTermlyResults(filters);
          } else {
            resultsData = await ResultCheckerService.getTeacherSessionResults(filters);
          }
          break;

        case 'student':
          if (resultType === 'termly') {
            resultsData = await ResultCheckerService.getStudentTermlyResults(filters);
          } else {
            resultsData = await ResultCheckerService.getStudentSessionResults(filters);
          }
          break;

        case 'parent':
          const parentResults = await ResultCheckerService.getParentResults(filters);
          resultsData = resultType === 'termly' 
            ? parentResults.termly_results 
            : parentResults.session_results;
          break;

        default:
          resultsData = [];
      }

      setResults(resultsData);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ResultSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = async (searchValue: string) => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setStudents([]);
      return;
    }

    setSearchLoading(true);
    try {
      const searchData = await ResultCheckerService.getStudents({ search: searchValue });
      setSearchResults(searchData);
      setStudents(searchData);
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Failed to search students');
      setSearchResults([]);
      setStudents([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewResult = (result: TermlyResult | SessionResult) => {
    setSelectedResult(result);
    setShowResultView(true);
  };

  const handleCloseResultView = () => {
    setShowResultView(false);
    setSelectedResult(null);
  };

  const getResultComponent = (result: TermlyResult | SessionResult) => {
    const studentData = {
      name: result.student.name,
      class: result.student.class,
      term: 'term' in result ? result.term.name : undefined,
      academicSession: 'academic_session' in result ? result.academic_session.name : undefined,
      resultType: resultType,
      house: result.student.house,
      timesOpened: 'attendance' in result ? result.attendance.times_opened?.toString() : undefined,
      timesPresent: 'attendance' in result ? result.attendance.times_present?.toString() : undefined,
    };

    // Determine which component to use based on class/education level
    const educationLevel = result.student.education_level.toLowerCase();
    
    if (educationLevel.includes('nursery')) {
      return <NurseryResult studentData={studentData} />;
    } else if (educationLevel.includes('primary')) {
      return <PrimaryResult studentData={studentData} />;
    } else if (educationLevel.includes('junior')) {
      return <JuniorSecondaryResult studentData={studentData} />;
    } else if (educationLevel.includes('senior')) {
      return resultType === 'termly' 
        ? <SeniorSecondaryTermlyResult studentData={studentData} />
        : <SeniorSecondarySessionResult studentData={studentData} />;
    } else {
      // Default to primary for unknown education levels
      return <PrimaryResult studentData={studentData} />;
    }
  };

  const getRoleTitle = () => {
    switch (userRole.role) {
      case 'admin': return 'Admin Result Checker';
      case 'teacher': return 'Teacher Result Checker';
      case 'student': return 'My Results';
      case 'parent': return 'Children Results';
      default: return 'Result Checker';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{getRoleTitle()}</h1>
        <p className="text-gray-600">
          {userRole.role === 'admin' && 'View and manage all student results'}
          {userRole.role === 'teacher' && 'View results for your assigned classes'}
          {userRole.role === 'student' && 'View your academic performance'}
          {userRole.role === 'parent' && 'View your children\'s academic performance'}
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search for Student Results</h2>
        <div className="flex gap-4 items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by username, name, or ID (e.g., STU/GTS/AUG/25/STU002)"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  // Debounce search
                  const timeoutId = setTimeout(() => {
                    handleSearch(value);
                  }, 500);
                  return () => clearTimeout(timeoutId);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => handleSearch(searchTerm)}
            disabled={searchLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">Search Results:</h3>
            <div className="space-y-3">
              {searchResults.map((student) => (
                <div key={student.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">
                        Username: {student.username} • ID: {student.admission_number} • Class: {student.class} • Level: {student.education_level}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Set filters to show results for this specific student
                        setFilters(prev => ({
                          ...prev,
                          student_id: student.id
                        }));
                        setSearchResults([]);
                        setSearchTerm('');
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters and Results Type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Result Type Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setResultType('termly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                resultType === 'termly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Termly Results
            </button>
            <button
              onClick={() => setResultType('session')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                resultType === 'session'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2 inline" />
              Session Results
            </button>
          </div>

          {/* Filter Button */}
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4 mr-2 inline" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Term Filter */}
          <select
            value={filters.term_id || ''}
            onChange={(e) => handleFilterChange('term_id', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Terms</option>
            {terms.map(term => (
              <option key={term.id} value={term.id}>
                {term.name} ({term.academic_session.name})
              </option>
            ))}
          </select>

          {/* Session Filter */}
          <select
            value={filters.academic_session_id || ''}
            onChange={(e) => handleFilterChange('academic_session_id', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sessions</option>
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>

          {/* Class Filter (Admin/Teacher only) */}
          {(userRole.role === 'admin' || userRole.role === 'teacher') && (
            <select
              value={filters.class_id || ''}
              onChange={(e) => handleFilterChange('class_id', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.section})
                </option>
              ))}
            </select>
          )}

          {/* Student Filter (Admin/Teacher only) */}
          {(userRole.role === 'admin' || userRole.role === 'teacher') && (
            <select
              value={filters.student_id || ''}
              onChange={(e) => handleFilterChange('student_id', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.admission_number}) - {student.username || 'No username'}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {resultType === 'termly' ? 'Termly' : 'Session'} Results 
            ({results.length} found)
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No results found</p>
            {filters.student_id && (
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your filters or search for a different student
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {results.map((result) => (
              <div key={result.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {result.student.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {result.student.admission_number} • {result.student.class} • {result.student.education_level}
                      {result.student.username && ` • Username: ${result.student.username}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {resultType === 'termly' 
                        ? `Term: ${(result as TermlyResult).term.name} (${(result as TermlyResult).term.academic_session.name})`
                        : `Session: ${(result as SessionResult).academic_session.name}`
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {resultType === 'termly' 
                          ? `Average: ${(result as TermlyResult).average_score}%`
                          : `Average: ${(result as SessionResult).average_for_year}%`
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        Position: {result.class_position}/{result.total_students}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewResult(result)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1 inline" />
                        View
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        <Download className="w-4 h-4 mr-1 inline" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result View Modal */}
      {showResultView && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedResult.student.name} - {resultType === 'termly' ? 'Termly' : 'Session'} Result
              </h2>
              <button
                onClick={handleCloseResultView}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {getResultComponent(selectedResult)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultChecker;
