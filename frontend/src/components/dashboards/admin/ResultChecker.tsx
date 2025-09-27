import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, Users, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCheckerService, { 
  TermlyResult, 
  SessionResult, 
  ResultSearchFilters,
  TermInfo,
  StudentBasicInfo
} from '@/services/ResultCheckerService';
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
  const [termlyResults, setTermlyResults] = useState<TermlyResult[]>([]);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TermlyResult | SessionResult | null>(null);
  const [showResultView, setShowResultView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StudentBasicInfo[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [terms, setTerms] = useState<TermInfo[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [examSessions, setExamSessions] = useState<any[]>([]);

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load results when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0 && Object.values(filters).some(value => value !== undefined && value !== '')) {
      loadResults();
    }
  }, [filters, resultType]);

  const loadFilterOptions = async () => {
    try {
      const promises = [
        ResultCheckerService.getAvailableTerms(),
        ResultCheckerService.getAvailableSessions(),
        ResultCheckerService.getExamSessions(),
      ];

      // Add classes for admin/teacher roles
      if (userRole.role === 'admin' || userRole.role === 'teacher') {
        promises.push(ResultCheckerService.getAvailableClasses());
      }

      const results = await Promise.all(promises);
      
      setTerms(results[0] || []);
      setSessions(results[1] || []);
      setExamSessions(results[2] || []);
      
      if (results[3]) {
        setClasses(results[3]);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error('Failed to load filter options');
    }
  };

  const loadResults = async () => {
    setLoading(true);
    try {
      if (resultType === 'termly') {
        // Use the main result checker endpoint for comprehensive results
        const response = await ResultCheckerService.getResults(filters);
        setTermlyResults(response.termly_results || []);
        setSessionResults([]); // Clear session results when viewing termly
        
        if (response.termly_results.length > 0) {
          toast.success(`Found ${response.termly_results.length} termly result(s)`);
        } else {
          toast.error('No termly results found for the selected criteria');
        }
      } else {
        // For session results, use the session-specific endpoint
        const sessionResultsData = await ResultCheckerService.getSessionResults(filters);
        setSessionResults(sessionResultsData);
        setTermlyResults([]); // Clear termly results when viewing session
        
        if (sessionResultsData.length > 0) {
          toast.success(`Found ${sessionResultsData.length} session result(s)`);
        } else {
          toast.error('No session results found for the selected criteria');
        }
      }
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      setTermlyResults([]);
      setSessionResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ResultSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined // Convert empty strings to undefined
    }));
  };

  const handleSearch = async (searchValue: string) => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const searchData = await ResultCheckerService.searchStudents({ 
        search: searchValue,
        admission_number: searchValue // Also search by admission number
      });
      setSearchResults(searchData || []);
      
      if (searchData && searchData.length === 1) {
        toast.success('One student found. Click "View Results" to see their academic records.');
      }
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Failed to search students');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectStudent = async (student: StudentBasicInfo) => {
    try {
      setLoading(true);
      
      // Update filters with selected student
      const newFilters = {
        ...filters,
        student_id: student.id,
        education_level: student.education_level as 'SENIOR_SECONDARY' | 'JUNIOR_SECONDARY' | 'PRIMARY' | 'NURSERY'
      };
      
      setFilters(newFilters);
      
      // Clear search results and term
      setSearchResults([]);
      setSearchTerm('');
      
      toast.success(`Selected ${student.name} (${student.class}). Loading their results...`);
      
    } catch (error) {
      console.error('Error selecting student:', error);
      toast.error('Failed to select student');
      setLoading(false);
    }
  };

  const handleViewResult = async (result: TermlyResult | SessionResult) => {
    try {
      // Fetch full result details using the appropriate endpoint
      const educationLevel = result.student.education_level;
      const fullResult = await ResultCheckerService.getResultById(
        result.id, 
        educationLevel, 
        resultType
      );
      setSelectedResult(fullResult);
      setShowResultView(true);
    } catch (error) {
      console.error('Error loading result details:', error);
      toast.error('Failed to load result details');
    }
  };

  const handleCloseResultView = () => {
    setShowResultView(false);
    setSelectedResult(null);
  };

  const getResultComponent = (result: TermlyResult | SessionResult) => {
    const educationLevel = result.student.education_level.toUpperCase();
    
    switch (educationLevel) {
      case 'NURSERY':
        // Type assertion to ensure we're passing the correct type
        return <NurseryResult data={result as any} />;
      case 'PRIMARY':
        return <PrimaryResult 
          data={result as any}
          studentId={result.student.id}
        />;
      case 'JUNIOR_SECONDARY':
        return <JuniorSecondaryResult 
          data={result as any}
          studentId={result.student.id}
        />;
      case 'SENIOR_SECONDARY':
        return resultType === 'termly' 
          ? <SeniorSecondaryTermlyResult 
              studentId={result.student.id}
              examSessionId={filters.exam_session_id || ''}
              data={result as any}
            />
          : <SeniorSecondarySessionResult 
              studentId={result.student.id}
              academicSessionId={(result as SessionResult).academic_session.id}
              data={result as any}
            />;
      default:
        return <PrimaryResult 
          data={result as any}
          studentId={result.student.id}
        />;
    }
  };

  const clearFilters = () => {
    setFilters({});
    setTermlyResults([]);
    setSessionResults([]);
    setSearchTerm('');
    setSearchResults([]);
    toast.success('Filters cleared');
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

  const getResultScore = (result: TermlyResult | SessionResult) => {
    if (resultType === 'session') {
      return (result as SessionResult).average_for_year || 0;
    } else {
      const termlyResult = result as TermlyResult;
      // Handle different result types based on the interface
      if ('average_score' in termlyResult && termlyResult.average_score !== undefined) {
        return termlyResult.average_score;
      } else {
        // For NurseryResult, calculate percentage
        const nurseryResult = termlyResult as any;
        if (nurseryResult.max_marks_obtainable && nurseryResult.mark_obtained) {
          return (nurseryResult.mark_obtained / nurseryResult.max_marks_obtainable) * 100;
        } else if (nurseryResult.total_score) {
          return nurseryResult.total_score;
        }
        return 0;
      }
    }
  };

  const getResultGrade = (result: TermlyResult | SessionResult) => {
    if ('overall_grade' in result) {
      return result.overall_grade;
    }
    // For nursery results or results without overall_grade, calculate based on score
    if (result.student.education_level === 'NURSERY') {
      const score = getResultScore(result);
      if (score >= 80) return 'A';
      if (score >= 70) return 'B';
      if (score >= 60) return 'C';
      if (score >= 50) return 'D';
      if (score >= 40) return 'E';
      return 'F';
    }
    return 'N/A';
  };

  // Get current results based on result type
  const currentResults = resultType === 'termly' ? termlyResults : sessionResults;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{getRoleTitle()}</h1>
            <p className="text-gray-600">
              {userRole.role === 'admin' && 'View and manage all student results'}
              {userRole.role === 'teacher' && 'View results for your assigned classes'}
              {userRole.role === 'student' && 'View your academic performance'}
              {userRole.role === 'parent' && 'View your children\'s academic performance'}
            </p>
          </div>
          
          {/* Role Switcher for Testing */}
          <div className="flex items-center space-x-2">
            <select
              value={userRole.role}
              onChange={(e) => setUserRole({ 
                role: e.target.value as any, 
                permissions: ['view_all'] 
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>
        </div>
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
                placeholder="Search by username, name, or admission number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              Search Results ({searchResults.length} found):
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {searchResults.map((student) => (
                <div key={student.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">
                        {student.username && `Username: ${student.username} • `}
                        ID: {student.admission_number} • Class: {student.class} • Level: {student.education_level}
                        {student.house && ` • House: ${student.house}`}
                        {student.gender && ` • Gender: ${student.gender}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectStudent(student)}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'View Results'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected student info */}
        {filters.student_id && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Selected Student:</strong> {
                searchResults.find(s => s.id === filters.student_id)?.name || 
                'Student ID: ' + filters.student_id
              }
              {filters.education_level && ` • Level: ${filters.education_level}`}
            </p>
          </div>
        )}
      </div>

      {/* Filters and Results Type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Result Type Toggle */}
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

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2 inline" />
              Filters
            </button>
            
            {Object.keys(filters).some(key => filters[key as keyof ResultSearchFilters]) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Education Level Filter */}
            <select
              value={filters.education_level || ''}
              onChange={(e) => handleFilterChange('education_level', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Education Levels</option>
              <option value="NURSERY">Nursery</option>
              <option value="PRIMARY">Primary</option>
              <option value="JUNIOR_SECONDARY">Junior Secondary</option>
              <option value="SENIOR_SECONDARY">Senior Secondary</option>
            </select>

            {/* Term Filter */}
            <select
              value={filters.term_id || ''}
              onChange={(e) => handleFilterChange('term_id', e.target.value)}
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
              onChange={(e) => handleFilterChange('academic_session_id', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Academic Sessions</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.start_year}/{session.end_year})
                </option>
              ))}
            </select>

            {/* Exam Session Filter */}
            <select
              value={filters.exam_session_id || ''}
              onChange={(e) => handleFilterChange('exam_session_id', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Exam Sessions</option>
              {examSessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name || `Session ${session.id}`}
                </option>
              ))}
            </select>

            {/* Class Filter (Admin/Teacher only) */}
            {(userRole.role === 'admin' || userRole.role === 'teacher') && (
              <select
                value={filters.class_id || ''}
                onChange={(e) => handleFilterChange('class_id', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section && `(${cls.section})`}
                  </option>
                ))}
              </select>
            )}

            {/* Published Status Filter */}
            <select
              value={filters.is_published?.toString() || ''}
              onChange={(e) => handleFilterChange('is_published', 
                e.target.value === '' ? undefined : e.target.value === 'true'
              )}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Results</option>
              <option value="true">Published Only</option>
              <option value="false">Unpublished Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {resultType === 'termly' ? 'Termly' : 'Session'} Results 
            ({currentResults.length} found)
          </h2>
          {Object.keys(filters).some(key => filters[key as keyof ResultSearchFilters]) && (
            <p className="text-sm text-gray-600 mt-1">
              Filtered results based on your search criteria
            </p>
          )}
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading results...</p>
          </div>
        ) : currentResults.length === 0 ? (
          <div className="p-6 text-center">
            {Object.keys(filters).some(key => filters[key as keyof ResultSearchFilters]) ? (
              <>
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No results found for your search criteria</p>
                <p className="text-sm text-gray-500 mt-2">
                  The selected student may not have results for the current filters, or results might not be published yet.
                </p>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Adjust Filters
                  </button>
                </div>
              </>
            ) : (
              <>
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Search for a student to view their results</p>
                <p className="text-sm text-gray-500 mt-2">
                  Use the search bar above or apply filters to find student results
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentResults.map((result) => (
              <div key={result.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {result.student.name}
                      </h3>
                      {!result.is_published && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Unpublished
                        </span>
                      )}
                    </div>
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
                        Score: {getResultScore(result).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Grade: {getResultGrade(result)}
                      </p>
                      <p className="text-sm text-gray-500">
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
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedResult.student.name} - {resultType === 'termly' ? 'Termly' : 'Session'} Result
              </h2>
              <button
                onClick={handleCloseResultView}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
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