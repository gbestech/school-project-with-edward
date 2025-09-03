import React, { useState, useEffect } from 'react';
import { Search, User, GraduationCap, Calendar, BookOpen, ArrowRight, Download, Trophy, Eye, X } from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import ResultService from '../../../services/ResultService';
import ResultCheckerService from '../../../services/ResultCheckerService';
import StudentResultDisplay from './StudentResultDisplay';
import { toast } from 'react-hot-toast';

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

interface StudentResultCheckerProps {
  onClose: () => void;
}

const StudentResultChecker: React.FC<StudentResultCheckerProps> = ({ onClose }) => {
  const { isDarkMode } = useGlobalTheme();
  const [username, setUsername] = useState('');
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<SelectionData>({
    academicSession: '',
    term: '',
    class: '',
    resultType: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);

  // Mock data for selections
  const academicSessions = ['2023/2024', '2024/2025', '2025/2026'];
  const terms = ['1st Term', '2nd Term', '3rd Term'];
  const classes = [
    // Nursery Classes
    'Nursery 1', 'Nursery 2', 'Nursery 3',
    // Primary Classes
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    // Junior Secondary Classes
    'JSS 1', 'JSS 2', 'JSS 3',
    // Senior Secondary Classes
    'SSS 1', 'SSS 2', 'SSS 3'
  ];

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

  const handleSearchStudent = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search for student by username using the working ResultCheckerService
      const students = await ResultCheckerService.getStudents({ search: username });
      
      if (students.length === 0) {
        setError('No student found with this username');
        setStudent(null);
        return;
      }

      // Find exact match by username
      const foundStudent = students.find((s: any) => s.username === username);
      if (!foundStudent) {
        setError('No student found with this exact username');
        setStudent(null);
        return;
      }

      // Transform the student data to match the expected interface
      const transformedStudent: StudentData = {
        id: foundStudent.id,
        full_name: foundStudent.name || 'Unknown',
        username: foundStudent.username || '',
        student_class: foundStudent.class || 'Unknown',
        education_level: foundStudent.education_level || 'Unknown',
        profile_picture: undefined
      };

      setStudent(transformedStudent);
      toast.success(`Found student: ${transformedStudent.full_name}`);
    } catch (err) {
      console.error('Error searching for student:', err);
      setError('Failed to search for student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = (field: keyof SelectionData, value: string) => {
    setSelections(prev => ({ ...prev, [field]: value }));
  };

  const getNextStep = () => {
    const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
    const maxSteps = isSecondaryClass ? 4 : 3;
    
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const getPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
    
    switch (currentStep) {
      case 1: return selections.academicSession !== '';
      case 2: return selections.term !== '';
      case 3: return selections.class !== '';
      case 4: return isSecondaryClass ? selections.resultType !== '' : true;
      default: return false;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Academic Session</h3>
              <p className="text-gray-600">Choose the academic year for the result</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {academicSessions.map((session) => (
                <button
                  key={session}
                  onClick={() => handleSelection('academicSession', session)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selections.academicSession === session
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">{session}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Term</h3>
              <p className="text-gray-600">Choose the term for the result</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {terms.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelection('term', term)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selections.term === term
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">{term}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Class</h3>
              <p className="text-gray-600">Choose the class for the result</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((className) => (
                <button
                  key={className}
                  onClick={() => handleSelection('class', className)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selections.class === className
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">{className}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
        if (!isSecondaryClass) return null;
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Result Type</h3>
              <p className="text-gray-600">Choose the type of result to view</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSelection('resultType', 'termly')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  selections.resultType === 'termly'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg font-semibold">Termly Result</div>
                <div className="text-sm text-gray-600">View term-by-term performance</div>
              </button>
              <button
                onClick={() => handleSelection('resultType', 'annually')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  selections.resultType === 'annually'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg font-semibold">Annual Result</div>
                <div className="text-sm text-gray-600">View yearly performance summary</div>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const resetForm = () => {
    setUsername('');
    setStudent(null);
    setError(null);
    setSelections({
      academicSession: '',
      term: '',
      class: '',
      resultType: ''
    });
    setCurrentStep(1);
    setShowResult(false);
  };

  if (showResult && student) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className={`${themeClasses.bgCard} rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Student Result Viewer
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Viewing results for {student.full_name} ({student.username})
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowResult(false)}
                  className={`px-4 py-2 rounded-lg ${themeClasses.buttonSecondary}`}
                >
                  Back to Selection
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg ${themeClasses.buttonDanger}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Result Content */}
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {student.full_name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {student.student_class} • {selections.academicSession} • {selections.term}
                  {selections.resultType && ` • ${selections.resultType}`}
                </p>
              </div>
              
              {/* Real Result Display */}
              <StudentResultDisplay 
                student={student}
                selections={selections}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${themeClasses.bgCard} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Student Result Checker
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Check any student's results by entering their username
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${themeClasses.buttonDanger}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!student ? (
            // Step 1: Search for student
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Search className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Find Student</h3>
                <p className="text-gray-600">Enter the student's username to view their results</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Student Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter student username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSearchStudent}
                    disabled={loading || !username.trim()}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                      loading || !username.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors`}
                  >
                    {loading ? 'Searching...' : 'Search Student'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Result selection
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {student.full_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Username: {student.username} • Class: {student.student_class}
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change Student
                  </button>
                </div>
              </div>

              {/* Selection Steps */}
              <div className="space-y-6">
                {getStepContent()}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={getPreviousStep}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentStep === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : themeClasses.buttonSecondary
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={getNextStep}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
                    canProceed()
                      ? themeClasses.buttonPrimary
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>{currentStep === 4 ? 'View Result' : 'Next'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResultChecker;
