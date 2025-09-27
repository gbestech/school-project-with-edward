import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Calculator,
  Target,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import ResultService from '@/services/ResultService';
import { AcademicSession} from '@/types/types'
import SubjectService, {Subject} from '@/services/SubjectService';
import { toast } from 'react-toastify';
import api from '@/services/api';

interface AddResultFormProps {
  onClose: () => void;
  onSuccess: () => void;
  preSelectedStudent?: any;
}

interface Student {
  id: string;
  full_name: string;
  student_class: string;
  education_level: string;
}

interface ExamSession {
  id: string;
  name: string;
  exam_type: string;
  term: string;
  academic_session?: AcademicSession;
}

interface GradingSystem {
  id: string;
  name: string;
  grading_type: string;
  min_score: number;
  max_score: number;
  pass_mark: number;
}

interface Stream {
  id: string;
  name: string;
  stream_type: string;
}

const AddResultForm: React.FC<AddResultFormProps> = ({ onClose, onSuccess, preSelectedStudent }) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // FIXED: Initialize form data with empty strings instead of 0 for better UX
  const [formData, setFormData] = useState({
    student: preSelectedStudent?.id || '',
    subject: '',
    exam_session: '',
    grading_system: '',
    stream: '',
    status: 'DRAFT',
    teacher_remark: '',
    
    // Senior Secondary fields
    first_test_score: '',
    second_test_score: '',
    third_test_score: '',
    
    // Primary/Junior Secondary fields
    continuous_assessment_score: '',
    take_home_test_score: '',
    appearance_score: '',
    practical_score: '',
    project_score: '',
    note_copying_score: '',
    
    // Common fields
    exam_score: '',
    
    // Nursery specific
    max_marks_obtainable: '100',
    physical_development: '',
    health: '',
    cleanliness: '',
    general_conduct: '',
  });

  // Dropdown data
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [gradingSystems, setGradingSystems] = useState<GradingSystem[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(preSelectedStudent || null);

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    borderError: 'border-red-500',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
  };

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (selectedStudent?.education_level) {
      loadSubjectsForEducationLevel(selectedStudent.education_level);
      loadGradingSystemsForEducationLevel(selectedStudent.education_level);
      if (selectedStudent.education_level === 'SENIOR_SECONDARY') {
        loadStreams();
      }
    }
  }, [selectedStudent]);

  const loadDropdownData = async () => {
    try {
      setLoadingData(true);
      
      const [studentsResponse, examSessionsResponse] = await Promise.all([
        api.get('/api/students/'),
        ResultService.getExamSessions()
      ]);
      
      setStudents(studentsResponse.data?.results || studentsResponse.data || []);
      setExamSessions(examSessionsResponse);
      
      if (preSelectedStudent && studentsResponse.data) {
        const fullStudent = (studentsResponse.data?.results || studentsResponse.data).find(
          (s: Student) => s.id === preSelectedStudent.id
        );
        if (fullStudent) {
          setSelectedStudent(fullStudent);
        }
      }
      
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const loadSubjectsForEducationLevel = async (educationLevel: string) => {
    try {
      // FIXED: Access the correct response structure based on SubjectService
      const subjectsResponse = await SubjectService.getSubjects({ 
        education_level: educationLevel,
        is_active: true 
      });
      // FIXED: SubjectService returns response.data structure
      setSubjects(subjectsResponse.data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const loadGradingSystemsForEducationLevel = async (educationLevel: string) => {
    try {
      const gradingSystemsResponse = await api.get('/api/grading-systems/', {
        params: { education_level: educationLevel }
      });
      setGradingSystems(gradingSystemsResponse.data?.results || gradingSystemsResponse.data || []);
    } catch (error) {
      console.error('Error loading grading systems:', error);
      toast.error('Failed to load grading systems');
    }
  };

  const loadStreams = async () => {
    try {
      const streamsResponse = await ResultService.getAvailableStreams();
      setStreams(streamsResponse?.results || streamsResponse || []);
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  // FIXED: Simplified handleInputChange function
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Handle student selection
    if (field === 'student') {
      const student = students.find(s => s.id === value);
      setSelectedStudent(student || null);
      // Reset dependent fields when student changes
      setFormData(prev => ({
        ...prev,
        subject: '',
        grading_system: '',
        stream: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.student) newErrors.student = 'Student is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.exam_session) newErrors.exam_session = 'Exam session is required';
    if (!formData.grading_system) newErrors.grading_system = 'Grading system is required';

    // Education level specific validations
    if (selectedStudent) {
      const { education_level } = selectedStudent;
      
      const parseScore = (score: any) => parseFloat(score) || 0;
      
      switch (education_level) {
        case 'SENIOR_SECONDARY':
          const firstTest = parseScore(formData.first_test_score);
          const secondTest = parseScore(formData.second_test_score);
          const thirdTest = parseScore(formData.third_test_score);
          const examScore = parseScore(formData.exam_score);
          
          if (firstTest < 0 || firstTest > 10) {
            newErrors.first_test_score = 'Test 1 score must be between 0 and 10';
          }
          if (secondTest < 0 || secondTest > 10) {
            newErrors.second_test_score = 'Test 2 score must be between 0 and 10';
          }
          if (thirdTest < 0 || thirdTest > 10) {
            newErrors.third_test_score = 'Test 3 score must be between 0 and 10';
          }
          if (examScore < 0 || examScore > 70) {
            newErrors.exam_score = 'Exam score must be between 0 and 70';
          }
          break;
          
        case 'PRIMARY':
        case 'JUNIOR_SECONDARY':
          const caScore = parseScore(formData.continuous_assessment_score);
          const takeHomeScore = parseScore(formData.take_home_test_score);
          const appearanceScore = parseScore(formData.appearance_score);
          const practicalScore = parseScore(formData.practical_score);
          const projectScore = parseScore(formData.project_score);
          const noteCopyingScore = parseScore(formData.note_copying_score);
          const primaryExamScore = parseScore(formData.exam_score);
          
          if (caScore < 0 || caScore > 15) {
            newErrors.continuous_assessment_score = 'CA score must be between 0 and 15';
          }
          if (takeHomeScore < 0 || takeHomeScore > 5) {
            newErrors.take_home_test_score = 'Take Home Test score must be between 0 and 5';
          }
          if (appearanceScore < 0 || appearanceScore > 5) {
            newErrors.appearance_score = 'Appearance score must be between 0 and 5';
          }
          if (practicalScore < 0 || practicalScore > 5) {
            newErrors.practical_score = 'Practical score must be between 0 and 5';
          }
          if (projectScore < 0 || projectScore > 5) {
            newErrors.project_score = 'Project score must be between 0 and 5';
          }
          if (noteCopyingScore < 0 || noteCopyingScore > 5) {
            newErrors.note_copying_score = 'Note copying score must be between 0 and 5';
          }
          if (primaryExamScore < 0 || primaryExamScore > 60) {
            newErrors.exam_score = 'Exam score must be between 0 and 60';
          }
          break;
          
        case 'NURSERY':
          const maxMarks = parseScore(formData.max_marks_obtainable);
          const nurseryScore = parseScore(formData.exam_score);
          
          if (nurseryScore < 0 || nurseryScore > maxMarks) {
            newErrors.exam_score = `Score must be between 0 and ${maxMarks}`;
          }
          if (maxMarks <= 0) {
            newErrors.max_marks_obtainable = 'Max marks must be greater than 0';
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    if (!selectedStudent) return 0;

    const parseScore = (score: any) => parseFloat(score) || 0;

    switch (selectedStudent.education_level) {
      case 'SENIOR_SECONDARY':
        return parseScore(formData.first_test_score) + 
               parseScore(formData.second_test_score) + 
               parseScore(formData.third_test_score) + 
               parseScore(formData.exam_score);
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        return parseScore(formData.continuous_assessment_score) + 
               parseScore(formData.take_home_test_score) + 
               parseScore(formData.appearance_score) + 
               parseScore(formData.practical_score) + 
               parseScore(formData.project_score) + 
               parseScore(formData.note_copying_score) + 
               parseScore(formData.exam_score);
      case 'NURSERY':
        return parseScore(formData.exam_score);
      default:
        return 0;
    }
  };

  const getMaxTotal = () => {
    if (!selectedStudent) return 100;
    
    switch (selectedStudent.education_level) {
      case 'SENIOR_SECONDARY':
        return 100;
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        return 100;
      case 'NURSERY':
        return parseFloat(formData.max_marks_obtainable) || 100;
      default:
        return 100;
    }
  };

  // FIXED: Completely rewritten buildPayload with proper field handling
  const buildPayload = () => {
    if (!selectedStudent) throw new Error('No student selected');

    // Helper function to safely parse and convert values
    const parseNumericValue = (value: any): number => {
      if (value === '' || value === null || value === undefined) return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Base payload - ensure all IDs are properly formatted
    const basePayload = {
      student: formData.student,
      subject: formData.subject,
      exam_session: formData.exam_session,
      grading_system: formData.grading_system,
      status: formData.status
    };

    console.log('Building payload for education level:', selectedStudent.education_level);
    console.log('Form data:', formData);

    switch (selectedStudent.education_level) {
      case 'SENIOR_SECONDARY':
        const seniorPayload = {
          ...basePayload,
          first_test_score: parseNumericValue(formData.first_test_score),
          second_test_score: parseNumericValue(formData.second_test_score),
          third_test_score: parseNumericValue(formData.third_test_score),
          exam_score: parseNumericValue(formData.exam_score),
          teacher_remark: formData.teacher_remark || '',
          ...(formData.stream ? { stream: formData.stream } : {})
        };
        console.log('Senior Secondary payload:', seniorPayload);
        return seniorPayload;
        
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        const primaryJuniorPayload = {
          ...basePayload,
          continuous_assessment_score: parseNumericValue(formData.continuous_assessment_score),
          take_home_test_score: parseNumericValue(formData.take_home_test_score),
          practical_score: parseNumericValue(formData.practical_score),
          project_score: parseNumericValue(formData.project_score),
          note_copying_score: parseNumericValue(formData.note_copying_score),
          exam_score: parseNumericValue(formData.exam_score),
          teacher_remark: formData.teacher_remark || '',
          // FIXED: Include appearance_score for both PRIMARY and JUNIOR_SECONDARY
          appearance_score: parseNumericValue(formData.appearance_score)
        };
        console.log('Primary/Junior Secondary payload:', primaryJuniorPayload);
        return primaryJuniorPayload;
        
      case 'NURSERY':
        const nurseryPayload = {
          ...basePayload,
          max_marks_obtainable: parseNumericValue(formData.max_marks_obtainable),
          mark_obtained: parseNumericValue(formData.exam_score),
          academic_comment: formData.teacher_remark || '',
          physical_development: formData.physical_development || '',
          health: formData.health || '',
          cleanliness: formData.cleanliness || '',
          general_conduct: formData.general_conduct || ''
        };
        console.log('Nursery payload:', nurseryPayload);
        return nurseryPayload;
        
      default:
        throw new Error(`Invalid education level: ${selectedStudent.education_level}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started...');
    console.log('Current formData:', formData);
    console.log('Selected student:', selectedStudent);
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      const payload = buildPayload();
      
      console.log('Final payload being sent:', payload);
      console.log('Education Level:', selectedStudent!.education_level);
      
      const response = await ResultService.createStudentResult(payload, selectedStudent!.education_level);
      
      console.log('API Response:', response);
      
      toast.success('Result created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating result:', error);
      console.error('Error response:', error.response?.data);
      
      // FIXED: Better error handling for different error structures
      let errorMessage = 'Failed to create result';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Improved InputField component with better value handling
  const InputField = ({ label, field, min, max, placeholder, step = "0.01" }: {
    label: string;
    field: string;
    min: number;
    max: number;
    placeholder?: string;
    step?: string;
  }) => {
    const fieldValue = formData[field as keyof typeof formData] as string;
    
    return (
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
          {label} ({min}-{max})
        </label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={fieldValue}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border ${
            errors[field] ? themeClasses.borderError : themeClasses.border
          } ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder={placeholder || `${min}-${max}`}
        />
        {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
      </div>
    );
  };

  const renderScoreFields = () => {
    if (!selectedStudent) {
      return (
        <div className={`p-8 text-center ${themeClasses.textSecondary}`}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Please select a student first</p>
        </div>
      );
    }

    switch (selectedStudent.education_level) {
      case 'SENIOR_SECONDARY':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField label="Test 1 Score" field="first_test_score" min={0} max={10} />
            <InputField label="Test 2 Score" field="second_test_score" min={0} max={10} />
            <InputField label="Test 3 Score" field="third_test_score" min={0} max={10} />
            <InputField label="Exam Score" field="exam_score" min={0} max={70} />
          </div>
        );
       
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField label="Continuous Assessment" field="continuous_assessment_score" min={0} max={15} />
            <InputField label="Take Home Test" field="take_home_test_score" min={0} max={5} />
            <InputField label="Appearance Score" field="appearance_score" min={0} max={5} />
            <InputField label="Practical Score" field="practical_score" min={0} max={5} />
            <InputField label="Project Score" field="project_score" min={0} max={5} />
            <InputField label="Note Copying" field="note_copying_score" min={0} max={5} />
            <InputField label="Exam Score" field="exam_score" min={0} max={60} />
          </div>
        );

      case 'NURSERY':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Max Marks Obtainable" 
                field="max_marks_obtainable" 
                min={1} 
                max={100} 
              />
              <InputField 
                label="Mark Obtained" 
                field="exam_score" 
                min={0} 
                max={parseFloat(formData.max_marks_obtainable) || 100} 
              />
            </div>
            
            {/* Nursery Assessment Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                  Physical Development
                </label>
                <select
                  value={formData.physical_development}
                  onChange={(e) => handleInputChange('physical_development', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                  Health
                </label>
                <select
                  value={formData.health}
                  onChange={(e) => handleInputChange('health', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                  Cleanliness
                </label>
                <select
                  value={formData.cleanliness}
                  onChange={(e) => handleInputChange('cleanliness', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                  General Conduct
                </label>
                <select
                  value={formData.general_conduct}
                  onChange={(e) => handleInputChange('general_conduct', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-red-500">Unsupported education level</div>;
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${themeClasses.bgCard} rounded-lg p-8 flex items-center space-x-3`}>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className={themeClasses.textPrimary}>Loading form data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgCard} rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>Add New Result</h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Create a new student result record
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary}`}
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.textPrimary}`}>
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {!preSelectedStudent && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Student *
                    </label>
                    <select
                      value={formData.student}
                      onChange={(e) => handleInputChange('student', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.student ? themeClasses.borderError : themeClasses.border
                      } ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={loading}
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.full_name} - {student.student_class}
                        </option>
                      ))}
                    </select>
                    {errors.student && <p className="text-red-500 text-xs mt-1">{errors.student}</p>}
                  </div>
                )}

                {preSelectedStudent && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Student
                    </label>
                    <div className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary}`}>
                      {preSelectedStudent.full_name} - {preSelectedStudent.student_class}
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.subject ? themeClasses.borderError : themeClasses.border
                    } ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={!selectedStudent || loading}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Exam Session *
                  </label>
                  <select
                    value={formData.exam_session}
                    onChange={(e) => handleInputChange('exam_session', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.exam_session ? themeClasses.borderError : themeClasses.border
                    } ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={loading}
                  >
                    <option value="">Select Exam Session</option>
                    {examSessions.map(session => (
                      <option key={session.id} value={session.id}>
                        {session.name} - {session.academic_session?.name || 'No Session'}
                      </option>
                    ))}
                  </select>
                  {errors.exam_session && <p className="text-red-500 text-xs mt-1">{errors.exam_session}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Grading System *
                  </label>
                  <select
                    value={formData.grading_system}
                    onChange={(e) => handleInputChange('grading_system', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.grading_system ? themeClasses.borderError : themeClasses.border
                    } ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={!selectedStudent || loading}
                  >
                    <option value="">Select Grading System</option>
                    {gradingSystems.map(system => (
                      <option key={system.id} value={system.id}>
                        {system.name} ({system.grading_type})
                      </option>
                    ))}
                  </select>
                  {errors.grading_system && <p className="text-red-500 text-xs mt-1">{errors.grading_system}</p>}
                </div>

                {selectedStudent?.education_level === 'SENIOR_SECONDARY' && streams.length > 0 && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Stream
                    </label>
                    <select
                      value={formData.stream}
                      onChange={(e) => handleInputChange('stream', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={loading}
                    >
                      <option value="">Select Stream (Optional)</option>
                      {streams.map(stream => (
                        <option key={stream.id} value={stream.id}>
                          {stream.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={loading}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>

              {/* Display selected student's education level */}
              {selectedStudent && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    <strong>Education Level:</strong> {selectedStudent.education_level.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>

            {/* Scores Section */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.textPrimary}`}>
                <Target className="w-5 h-5 mr-2" />
                Assessment Scores
                {selectedStudent && (
                  <span className={`ml-2 text-sm font-normal px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200`}>
                    {selectedStudent.education_level.replace('_', ' ')}
                  </span>
                )}
              </h3>
              {renderScoreFields()}
            </div>

            {/* Total Score Display */}
            {selectedStudent && (
              <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-medium ${themeClasses.textSecondary} flex items-center`}>
                    <Calculator size={20} className="mr-2" />
                    Total Score:
                  </span>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
                      {calculateTotal()}/{getMaxTotal()}
                    </span>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      Percentage: {getMaxTotal() > 0 ? ((calculateTotal() / getMaxTotal()) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.textPrimary}`}>
                <Star className="w-5 h-5 mr-2" />
                {selectedStudent?.education_level === 'NURSERY' ? 'Academic Comment' : 'Teacher Remarks'}
              </h3>
              <textarea
                value={formData.teacher_remark}
                onChange={(e) => handleInputChange('teacher_remark', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={
                  selectedStudent?.education_level === 'NURSERY' 
                    ? "Enter academic comment for the student..." 
                    : "Enter teacher remarks about the student's performance..."
                }
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.buttonSuccess} transition-colors`}
                disabled={loading || !selectedStudent || !formData.student || !formData.subject || !formData.exam_session || !formData.grading_system}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Result
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddResultForm;