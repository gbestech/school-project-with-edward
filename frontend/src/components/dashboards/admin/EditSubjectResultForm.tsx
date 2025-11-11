import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, BookOpen, Calculator } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import api from '../../../services/api';

// Interface matching the StudentResult from EnhancedResultsManagement
interface StudentResult {
  id: string;
  student: {
    id: string;
    full_name: string;
    username: string;
    student_class: string;
    education_level: string;
    profile_picture?: string;
  };
  academic_session: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  term: string;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  total_score: number;
  average_score: number;
  gpa: number;
  class_position: number | null;
  total_students: number;
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED';
  remarks: string;
  next_term_begins?: string;
  subject_results: SubjectResult[];
  created_at: string;
  updated_at: string;
}

interface SubjectResult {
  id: string;
  subject: {
    name: string;
    code: string;
  };
  total_ca_score: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  grade_point: number;
  is_passed: boolean;
  status: string;
  // Nursery-specific fields
  max_marks_obtainable?: number;
  mark_obtained?: number;
  academic_comment?: string;
  // Breakdown object for nursery results
  breakdown?: {
    max_marks_obtainable?: number;
    mark_obtained?: number;
    physical_development?: string;
    health?: string;
    cleanliness?: string;
    general_conduct?: string;
  };
}

interface EditSubjectResultFormProps {
  result: StudentResult;
  onClose: () => void;
  onSuccess: () => void;
}

interface SubjectFormData {
  // Senior Secondary specific fields
  first_test_score: number;
  second_test_score: number;
  third_test_score: number;
  
  // Primary/Junior Secondary specific fields
  continuous_assessment_score: number;
  take_home_test_score: number;
  practical_score: number;
  appearance_score: number;
  project_score: number;
  note_copying_score: number;
  
  // Common fields
  exam_score: number;
  grade: string;
  status: string;
  
  // Nursery specific fields
  max_marks_obtainable: number;
}

const EditSubjectResultForm: React.FC<EditSubjectResultFormProps> = ({
  result,
  onClose,
  onSuccess,
}) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectResult | null>(null);

  const [formData, setFormData] = useState<SubjectFormData>({
    // Senior Secondary fields
    first_test_score: 0,
    second_test_score: 0,
    third_test_score: 0,
    
    // Primary/Junior Secondary fields
    continuous_assessment_score: 0,
    take_home_test_score: 0,
    practical_score: 0,
    appearance_score: 0,
    project_score: 0,
    note_copying_score: 0,
    
    // Common fields
    exam_score: 0,
    grade: '',
    status: 'DRAFT',
    
    // Nursery specific fields
    max_marks_obtainable: 100,
  });

  const themeClasses = {
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-300',
    inputBg: isDarkMode ? 'bg-gray-700' : 'bg-white',
    inputText: isDarkMode ? 'text-white' : 'text-gray-900',
    buttonPrimary: isDarkMode 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode 
      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
      : 'bg-gray-500 hover:bg-gray-600 text-white',
  };

  // Safe score formatting function
  const formatScore = (score: any): string => {
    if (score === null || score === undefined) return 'N/A';
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (typeof numScore !== 'number' || isNaN(numScore)) return 'N/A';
    return `${numScore.toFixed(1)}%`;
  };

  // Calculate total score and percentage based on education level
  const calculateTotalScore = (): number => {
    const examScore = formData.exam_score || 0;
    
    if (result.student.education_level === 'SENIOR_SECONDARY') {
      // Senior Secondary: Test 1 + Test 2 + Test 3 (30 marks) + Exam (70 marks)
      const testTotal = (formData.first_test_score || 0) + (formData.second_test_score || 0) + (formData.third_test_score || 0);
      return testTotal + examScore;
    } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
      // Primary/Junior Secondary: CA breakdown (40 marks) + Exam (60 marks)
      const caTotal = (formData.continuous_assessment_score || 0) + 
                     (formData.take_home_test_score || 0) + 
                     (formData.practical_score || 0) + 
                     (formData.appearance_score || 0) + 
                     (formData.project_score || 0) + 
                     (formData.note_copying_score || 0);
      return caTotal + examScore;
    } else {
      // Nursery or other levels
      return examScore;
    }
  };

  const calculatePercentage = (): number => {
    const total = calculateTotalScore();
    if (result.student.education_level === 'NURSERY') {
      // Nursery uses max_marks_obtainable as the denominator
      return total > 0 ? (total / formData.max_marks_obtainable) * 100 : 0;
    } else {
      // All other levels use 100 as max score
      return total > 0 ? (total / 100) * 100 : 0;
    }
  };

  // Calculate CA total for display
  const calculateCATotal = (): number => {
    if (result.student.education_level === 'SENIOR_SECONDARY') {
      return (formData.first_test_score || 0) + (formData.second_test_score || 0) + (formData.third_test_score || 0);
    } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
      return (formData.continuous_assessment_score || 0) + 
             (formData.take_home_test_score || 0) + 
             (formData.practical_score || 0) + 
             (formData.appearance_score || 0) + 
             (formData.project_score || 0) + 
             (formData.note_copying_score || 0);
    }
    return 0;
  };

  // Determine grade based on percentage
  const determineGrade = (percentage: number): string => {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'D';
    if (percentage >= 39) return 'E';
    return 'F';
  };

  // Handle subject selection
  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subject = result.subject_results.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      
      // Populate form data based on education level
      const baseFormData = {
        exam_score: subject.exam_score || 0,
        grade: subject.grade || '',
        status: subject.status || 'DRAFT',
      };

      if (result.student.education_level === 'SENIOR_SECONDARY') {
        // Senior Secondary: Use test scores
        setFormData({
          ...baseFormData,
          first_test_score: (subject as any).first_test_score || 0,
          second_test_score: (subject as any).second_test_score || 0,
          third_test_score: (subject as any).third_test_score || 0,
          // Set other fields to 0
          continuous_assessment_score: 0,
          take_home_test_score: 0,
          practical_score: 0,
          appearance_score: 0,
          project_score: 0,
          note_copying_score: 0,
          // Preserve/assign max marks for compatibility with SubjectFormData
          max_marks_obtainable: (subject as any)?.breakdown?.max_marks_obtainable ?? formData.max_marks_obtainable ?? 100,
        });
        setFormData({
          ...baseFormData,
          continuous_assessment_score: (subject as any).continuous_assessment_score || 0,
          take_home_test_score: (subject as any).take_home_test_score || 0,
          practical_score: (subject as any).practical_score || 0,
          appearance_score: (subject as any).appearance_score || 0,
          project_score: (subject as any).project_score || 0,
          note_copying_score: (subject as any).note_copying_score || 0,
          // Set test scores to 0
          first_test_score: 0,
          second_test_score: 0,
          third_test_score: 0,
          // Preserve/assign max marks for compatibility with SubjectFormData
          max_marks_obtainable: (subject as any)?.breakdown?.max_marks_obtainable ?? formData.max_marks_obtainable ?? 100,
        });
       
      } else {
        // Nursery or other levels: Use basic structure
        setFormData({
          ...baseFormData,
          // For nursery, use mark_obtained from breakdown if available, otherwise exam_score
          exam_score: (subject as any).breakdown?.mark_obtained || subject.exam_score || 0,
          // Set max_marks_obtainable from the breakdown data
          max_marks_obtainable: (subject as any).breakdown?.max_marks_obtainable || 100,
          // Set all other fields to 0
          first_test_score: 0,
          second_test_score: 0,
          third_test_score: 0,
          continuous_assessment_score: 0,
          take_home_test_score: 0,
          practical_score: 0,
          appearance_score: 0,
          project_score: 0,
          note_copying_score: 0,
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedSubject) {
      newErrors.subject = 'Please select a subject to edit';
    }

    // Validate based on education level
    if (result.student.education_level === 'SENIOR_SECONDARY') {
      // Senior Secondary: Test scores (10 marks each) + Exam (70 marks)
      if (formData.first_test_score < 0 || formData.first_test_score > 10) {
        newErrors.first_test_score = 'Test 1 score must be between 0 and 10';
      }
      if (formData.second_test_score < 0 || formData.second_test_score > 10) {
        newErrors.second_test_score = 'Test 2 score must be between 0 and 10';
      }
      if (formData.third_test_score < 0 || formData.third_test_score > 10) {
        newErrors.third_test_score = 'Test 3 score must be between 0 and 10';
      }
      if (formData.exam_score < 0 || formData.exam_score > 70) {
        newErrors.exam_score = 'Exam score must be between 0 and 70';
      }
    } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
      // Primary/Junior Secondary: CA breakdown (40 marks total) + Exam (60 marks)
      if (formData.continuous_assessment_score < 0 || formData.continuous_assessment_score > 15) {
        newErrors.continuous_assessment_score = 'Continuous Assessment must be between 0 and 15';
      }
      if (formData.take_home_test_score < 0 || formData.take_home_test_score > 5) {
        newErrors.take_home_test_score = 'Take Home Test must be between 0 and 5';
      }
      if (formData.practical_score < 0 || formData.practical_score > 5) {
        newErrors.practical_score = 'Practical must be between 0 and 5';
      }
      if (formData.appearance_score < 0 || formData.appearance_score > 5) {
        newErrors.appearance_score = 'Appearance must be between 0 and 5';
      }
      if (formData.project_score < 0 || formData.project_score > 5) {
        newErrors.project_score = 'Project must be between 0 and 5';
      }
      if (formData.note_copying_score < 0 || formData.note_copying_score > 5) {
        newErrors.note_copying_score = 'Note Copying must be between 0 and 5';
      }
      if (formData.exam_score < 0 || formData.exam_score > 60) {
        newErrors.exam_score = 'Exam score must be between 0 and 60';
      }
    } else {
      // Nursery or other levels: Basic validation
      if (formData.exam_score < 0 || formData.exam_score > formData.max_marks_obtainable) {
        newErrors.exam_score = `Score must be between 0 and ${formData.max_marks_obtainable}`;
      }
      if (formData.max_marks_obtainable <= 0) {
        newErrors.max_marks_obtainable = 'Max marks obtainable must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SubjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Auto-calculate grade when any score changes
    const scoreFields = ['first_test_score', 'second_test_score', 'third_test_score', 
                        'continuous_assessment_score', 'take_home_test_score', 'practical_score',
                        'appearance_score', 'project_score', 'note_copying_score', 'exam_score'];
    
    if (scoreFields.includes(field)) {
      // Recalculate grade after a short delay to ensure state is updated
      setTimeout(() => {
        const newPercentage = calculatePercentage();
        const newGrade = determineGrade(newPercentage);
        setFormData(prev => ({
          ...prev,
          grade: newGrade,
        }));
      }, 100);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedSubject) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // Update the individual subject result with correct field names based on education level
      let updateData: any = {
        status: formData.status,
      };

      // Set the correct field names based on education level
      if (result.student.education_level === 'SENIOR_SECONDARY') {
        // Senior Secondary: Use test scores (30 marks CA + 70 marks Exam)
        updateData.first_test_score = formData.first_test_score;
        updateData.second_test_score = formData.second_test_score;
        updateData.third_test_score = formData.third_test_score;
        updateData.exam_score = formData.exam_score;
        // Note: grade is calculated automatically by backend, don't send it
      } else if (result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') {
        // Primary/Junior Secondary: Use CA breakdown (40 marks CA + 60 marks Exam)
        updateData.continuous_assessment_score = formData.continuous_assessment_score;
        updateData.take_home_test_score = formData.take_home_test_score;
        updateData.practical_score = formData.practical_score;
        updateData.appearance_score = formData.appearance_score;
        updateData.project_score = formData.project_score;
        updateData.note_copying_score = formData.note_copying_score;
        updateData.exam_score = formData.exam_score;
        // Note: grade is calculated automatically by backend, don't send it
      } else {
        // Nursery: Use mark_obtained instead of exam_score
        updateData.mark_obtained = formData.exam_score;
        // Include max_marks_obtainable from form data
        updateData.max_marks_obtainable = formData.max_marks_obtainable;
        // Note: grade is calculated automatically by backend, don't send it
      }

      console.log('Updating subject result:', selectedSubject.id, updateData);

      // Check if the individual result ID exists by trying to get it first
      let endpoint = '';
      if (result.student.education_level === 'SENIOR_SECONDARY') {
        endpoint = `/api/results/senior-secondary/results/${selectedSubject.id}/`;
      } else if (result.student.education_level === 'JUNIOR_SECONDARY') {
        endpoint = `/api/results/junior-secondary/results/${selectedSubject.id}/`;
      } else if (result.student.education_level === 'PRIMARY') {
        endpoint = `/api/results/primary/results/${selectedSubject.id}/`;
      } else if (result.student.education_level === 'NURSERY') {
        endpoint = `/api/results/nursery/results/${selectedSubject.id}/`;
      } else {
        endpoint = `/api/results/student-results/${selectedSubject.id}/`;
      }

      // First, try to get the individual result to verify it exists
      try {
        await api.get(endpoint);
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error(`Individual result with ID ${selectedSubject.id} not found. This might be a term report ID. Please refresh the page and try again.`);
        }
        throw error;
      }

      await api.put(endpoint, updateData);
      
      toast.success('Subject result updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating subject result:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update subject result';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Edit Subject Results - {result.student?.full_name}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Term Information Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Term Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Term:</span>
            <span className="ml-2 font-medium">{result.term}</span>
          </div>
          <div>
            <span className="text-gray-600">Session:</span>
            <span className="ml-2 font-medium">{result.academic_session?.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Class:</span>
            <span className="ml-2 font-medium">{result.student?.student_class}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Subjects:</span>
            <span className="ml-2 font-medium">{result.subject_results?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Subject Selection */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
          Select Subject to Edit *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {result.subject_results?.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => handleSubjectSelect(subject.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedSubjectId === subject.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{subject.subject.name}</div>
                  <div className="text-sm text-gray-500">{subject.subject.code}</div>
                  <div className="text-sm text-gray-600">
                    Current: {formatScore(subject.percentage)} ({subject.grade})
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
      </div>

      {/* Subject Edit Form */}
      {selectedSubject && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Edit {selectedSubject.subject.name} Scores
          </h4>
          
          <div className="space-y-6">
            {/* Education Level Specific Fields */}
            {result.student.education_level === 'SENIOR_SECONDARY' && (
              <div className="space-y-4">
                <h5 className={`font-medium ${themeClasses.textPrimary}`}>Senior Secondary - CA Scores (30 marks total)</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Test 1 (0-10) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.first_test_score}
                      onChange={(e) => handleInputChange('first_test_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.first_test_score ? 'border-red-500' : ''}`}
                      placeholder="0-10"
                    />
                    {errors.first_test_score && <p className="text-red-500 text-xs mt-1">{errors.first_test_score}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Test 2 (0-10) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.second_test_score}
                      onChange={(e) => handleInputChange('second_test_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.second_test_score ? 'border-red-500' : ''}`}
                      placeholder="0-10"
                    />
                    {errors.second_test_score && <p className="text-red-500 text-xs mt-1">{errors.second_test_score}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Test 3 (0-10) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.third_test_score}
                      onChange={(e) => handleInputChange('third_test_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.third_test_score ? 'border-red-500' : ''}`}
                      placeholder="0-10"
                    />
                    {errors.third_test_score && <p className="text-red-500 text-xs mt-1">{errors.third_test_score}</p>}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Exam Score (0-70) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="70"
                    step="0.1"
                    value={formData.exam_score}
                    onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
                    placeholder="0-70"
                  />
                  {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
                </div>
              </div>
            )}

            {(result.student.education_level === 'PRIMARY' || result.student.education_level === 'JUNIOR_SECONDARY') && (
              <div className="space-y-4">
                <h5 className={`font-medium ${themeClasses.textPrimary}`}>Primary/Junior Secondary - CA Scores (40 marks total)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Continuous Assessment (0-15) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="0.1"
                      value={formData.continuous_assessment_score}
                      onChange={(e) => handleInputChange('continuous_assessment_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.continuous_assessment_score ? 'border-red-500' : ''}`}
                      placeholder="0-15"
                    />
                    {errors.continuous_assessment_score && <p className="text-red-500 text-xs mt-1">{errors.continuous_assessment_score}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Take Home Test (0-5) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.take_home_test_score}
                      onChange={(e) => handleInputChange('take_home_test_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.take_home_test_score ? 'border-red-500' : ''}`}
                      placeholder="0-5"
                    />
                    {errors.take_home_test_score && <p className="text-red-500 text-xs mt-1">{errors.take_home_test_score}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Practical (0-5) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.practical_score}
                      onChange={(e) => handleInputChange('practical_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.practical_score ? 'border-red-500' : ''}`}
                      placeholder="0-5"
                    />
                    {errors.practical_score && <p className="text-red-500 text-xs mt-1">{errors.practical_score}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Appearance (0-5) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.appearance_score}
                      onChange={(e) => handleInputChange('appearance_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.appearance_score ? 'border-red-500' : ''}`}
                      placeholder="0-5"
                    />
                    {errors.appearance_score && <p className="text-red-500 text-xs mt-1">{errors.appearance_score}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Project (0-5) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.project_score}
                      onChange={(e) => handleInputChange('project_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.project_score ? 'border-red-500' : ''}`}
                      placeholder="0-5"
                    />
                    {errors.project_score && <p className="text-red-500 text-xs mt-1">{errors.project_score}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                      Note Copying (0-5) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.note_copying_score}
                      onChange={(e) => handleInputChange('note_copying_score', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.note_copying_score ? 'border-red-500' : ''}`}
                      placeholder="0-5"
                    />
                    {errors.note_copying_score && <p className="text-red-500 text-xs mt-1">{errors.note_copying_score}</p>}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Exam Score (0-60) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="0.1"
                    value={formData.exam_score}
                    onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
                    placeholder="0-60"
                  />
                  {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
                </div>
              </div>
            )}

            {result.student.education_level === 'NURSERY' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Max Marks Obtainable *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={formData.max_marks_obtainable}
                    onChange={(e) => handleInputChange('max_marks_obtainable', parseFloat(e.target.value) || 100)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.max_marks_obtainable ? 'border-red-500' : ''}`}
                    placeholder="100"
                  />
                  {errors.max_marks_obtainable && <p className="text-red-500 text-xs mt-1">{errors.max_marks_obtainable}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Mark Obtained (0-{formData.max_marks_obtainable}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.max_marks_obtainable}
                    step="0.1"
                    value={formData.exam_score}
                    onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
                    placeholder={`0-${formData.max_marks_obtainable}`}
                  />
                  {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
                </div>
              </div>
            )}

            {/* Calculated Values Display */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Calculated Results</h5>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">CA Total:</span>
                    <span className="ml-2 font-medium">{calculateCATotal() && typeof calculateCATotal() === 'number' ? calculateCATotal().toFixed(1) : '0.0'}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Score:</span>
                    <span className="ml-2 font-medium">{calculateTotalScore() && typeof calculateTotalScore() === 'number' ? calculateTotalScore().toFixed(1) : '0.0'}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Percentage:</span>
                    <span className="ml-2 font-medium">{calculatePercentage() && typeof calculatePercentage() === 'number' ? calculatePercentage().toFixed(1) : '0.0'}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Grade:</span>
                    <span className="ml-2 font-medium">{formData.grade}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className={`px-4 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors duration-200`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !selectedSubject}
          className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors duration-200 flex items-center space-x-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditSubjectResultForm;
