import React, { useState, useEffect } from 'react';
import { Trophy, Download, Printer, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import ResultService from '@/services/ResultService';
import { toast } from 'react-hot-toast';

// Import result templates based on education level
import NurseryResult from '../student/NurseryResult';
import PrimaryResult from '../student/PrimaryResult';
import JuniorSecondaryResult from '../student/JuniorSecondaryResult';
import SeniorSecondarySessionResult from '../student/SeniorSecondarySessionResult';
import SeniorSecondaryTermlyResult from '../student/SeniorSecondaryTermlyResult';

interface StudentData {
  id: string;
  full_name: string;
  username: string;
  student_class: string;
  education_level: string;
  profile_picture?: string;
}

interface SelectionData {
  academicSession: string;
  term: string;
  class: string;
  resultType?: string;
}

interface StudentResultDisplayProps {
  student: StudentData;
  selections: SelectionData;
}

const StudentResultDisplay: React.FC<StudentResultDisplayProps> = ({ student, selections }) => {
  const { isDarkMode } = useGlobalTheme();
  const [results, setResults] = useState<any[]>([]);
  const [termResults, setTermResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Convert selections to API parameters
  const getApiParams = () => {
    const termMap: { [key: string]: string } = {
      '1st Term': 'FIRST',
      '2nd Term': 'SECOND',
      '3rd Term': 'THIRD'
    };

    return {
      student: student.id,
      term: termMap[selections.term] || selections.term,
      academic_session: selections.academicSession
    };
  };

  // Load results data
  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = getApiParams();
        
        // Fetch both individual results and term results
        const [resultsData, termResultsData] = await Promise.all([
          ResultService.getResultsByStudent(student.id),
          ResultService.getTermResultsByStudent(student.id)
        ]);

        // Filter results by selected criteria
        const filteredResults = (resultsData || []).filter((result: any) => {
          const matchesTerm = result.exam_session?.term === params.term;
          const matchesSession = result.exam_session?.academic_session?.name === params.academic_session;
          return matchesTerm && matchesSession;
        });

        const filteredTermResults = (termResultsData || []).filter((termResult: any) => {
          const matchesTerm = termResult.term === params.term;
          const matchesSession = termResult.academic_session?.name === params.academic_session;
          return matchesTerm && matchesSession;
        });

        setResults(filteredResults);
        setTermResults(filteredTermResults);

        if (filteredResults.length === 0 && filteredTermResults.length === 0) {
          setError('No results found for the selected criteria');
        }
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load results. Please try again.');
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [student.id, selections]);

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 bg-green-100';
    if (grade === 'B' || grade === 'B+') return 'text-blue-600 bg-blue-100';
    if (grade === 'C' || grade === 'C+') return 'text-yellow-600 bg-yellow-100';
    if (grade === 'D' || grade === 'D+') return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'text-green-600 bg-green-100';
      case 'APPROVED': return 'text-blue-600 bg-blue-100';
      case 'DRAFT': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    toast.success('Download functionality will be implemented');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h4>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          <p><strong>Student:</strong> {student.full_name}</p>
          <p><strong>Class:</strong> {student.student_class}</p>
          <p><strong>Academic Session:</strong> {selections.academicSession}</p>
          <p><strong>Term:</strong> {selections.term}</p>
          {selections.resultType && <p><strong>Result Type:</strong> {selections.resultType}</p>}
        </div>
      </div>
    );
  }

  // Determine which result template to use based on education level
  const getResultTemplate = () => {
    const educationLevel = student.education_level?.toLowerCase() || '';
    const className = student.student_class?.toLowerCase() || '';
    
    // Nursery classes
    if (className.includes('nursery') || educationLevel.includes('nursery')) {
      return (
        <NurseryResult 
          studentData={{ 
            name: student.full_name,
            class: student.student_class,
            term: selections.term,
            date: new Date().toLocaleDateString(),
            house: 'Blue House',
            timesOpened: '120',
            timesPresent: '115'
          }} 
        />
      );
    }
    
    // Primary classes
    if (className.includes('primary') || educationLevel.includes('primary')) {
      return (
        <PrimaryResult 
          studentData={{ 
            name: student.full_name,
            class: student.student_class,
            term: selections.term,
            academicSession: selections.academicSession
          }} 
        />
      );
    }
    
    // Junior Secondary classes (JSS)
    if (className.includes('jss') || educationLevel.includes('junior')) {
      return (
        <JuniorSecondaryResult 
          studentData={{ 
            name: student.full_name,
            class: student.student_class,
            term: selections.term,
            academicSession: selections.academicSession,
            resultType: selections.resultType
          }} 
        />
      );
    }
    
    // Senior Secondary classes (SSS)
    if (className.includes('sss') || educationLevel.includes('senior')) {
      // Use SessionResult for Annually, TermlyResult for Termly
      if (selections.resultType === 'annually') {
        return (
          <SeniorSecondarySessionResult 
            studentData={{ 
              name: student.full_name,
              class: student.student_class,
              term: selections.term,
              academicSession: selections.academicSession,
              resultType: selections.resultType
            }} 
          />
        );
      } else {
        return (
          <SeniorSecondaryTermlyResult 
            studentData={{ 
              name: student.full_name,
              class: student.student_class,
              term: selections.term,
              academicSession: selections.academicSession,
              resultType: selections.resultType
            }} 
          />
        );
      }
    }
    
    // Default fallback - show the generic result display
    return (
      <div className="space-y-6 print:space-y-4">
        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block print:mb-6">
          <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">GOD'S TREASURE SCHOOLS</h1>
            <p className="text-gray-600">Student Result Report</p>
            <p className="text-sm text-gray-500 mt-2">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p><strong>Student Name:</strong> {student.full_name}</p>
              <p><strong>Username:</strong> {student.username}</p>
              <p><strong>Class:</strong> {student.student_class}</p>
            </div>
            <div>
              <p><strong>Academic Session:</strong> {selections.academicSession}</p>
              <p><strong>Term:</strong> {selections.term}</p>
              <p><strong>Education Level:</strong> {student.education_level}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex items-center justify-end space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${themeClasses.buttonSecondary}`}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${themeClasses.buttonPrimary}`}
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>

        {/* Term Results Summary */}
        {termResults.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 print:bg-white print:border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center print:text-black">
              <Trophy className="w-5 h-5 text-blue-600 mr-2" />
              Term Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {termResults.map((termResult, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 print:border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 print:text-black">
                      {termResult.term} Term
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(termResult.status)} print:bg-gray-200 print:text-black`}>
                      {termResult.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Total Subjects:</span>
                      <span className="font-semibold print:text-black">{termResult.total_subjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Passed:</span>
                      <span className="font-semibold text-green-600 print:text-black">{termResult.subjects_passed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Failed:</span>
                      <span className="font-semibold text-red-600 print:text-black">{termResult.subjects_failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Average:</span>
                      <span className="font-semibold print:text-black">{termResult.average_score?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">GPA:</span>
                      <span className="font-semibold print:text-black">{termResult.gpa?.toFixed(2)}</span>
                    </div>
                    {termResult.class_position && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">Position:</span>
                        <span className="font-semibold print:text-black">{termResult.class_position}/{termResult.total_students}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Subject Results */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden print:border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-black">
                Subject Results
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 print:bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
                      CA Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
                      Exam Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-black print:border-b print:border-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-300">
                  {results.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-transparent">
                      <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white print:text-black">
                            {result.subject?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300 print:text-black">
                            {result.subject?.code || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
                        {result.ca_score || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
                        {result.exam_score || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
                        {result.total_score || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white print:text-black print:border-b print:border-gray-200">
                        {result.percentage?.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)} print:bg-gray-200 print:text-black`}>
                          {result.grade || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap print:border-b print:border-gray-200">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)} print:bg-gray-200 print:text-black`}>
                          {result.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {results.length === 0 && termResults.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Results Available
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              No results have been published for this student yet.
            </p>
          </div>
        )}

        {/* Print Footer - Only visible when printing */}
        <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-gray-300">
          <div className="text-center text-sm text-gray-500">
            <p>This is an official result document from GOD'S TREASURE SCHOOLS</p>
            <p>Generated by Admin Portal on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Action Buttons - Hidden when printing */}
      <div className="flex items-center justify-end space-x-3 print:hidden">
        <button
          onClick={handlePrint}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${themeClasses.buttonSecondary}`}
        >
          <Printer size={16} />
          <span>Print</span>
        </button>
        <button
          onClick={handleDownload}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${themeClasses.buttonPrimary}`}
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>

      {/* Display the appropriate result template */}
      {getResultTemplate()}
    </div>
  );
};

export default StudentResultDisplay;
