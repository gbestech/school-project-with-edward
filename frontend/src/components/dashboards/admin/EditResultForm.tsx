import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save,   
  Target,
  Star,
  RefreshCw
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import SubjectService,{Subject} from '@/services/SubjectService';
import { toast } from 'react-toastify';
import api from '@/services/api';
import ResultService from '@/services/ResultService';

interface EditResultFormProps {
  result: any;
  student: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditResultForm: React.FC<EditResultFormProps> = ({ result, student, onClose, onSuccess }) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalScores, setOriginalScores] = useState<any>({});
  const [showRemarkWarning, setShowRemarkWarning] = useState(false);

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

  // Initialize form data with proper field mapping
  useEffect(() => {
    if (result) {
      console.log('Initializing form with result:', result);
      
      const initialData = {
        subject: result.subject?.id || result.subject,
        exam_session: result.exam_session?.id || result.exam_session,
        status: result.status || 'DRAFT',
        teacher_remark: result.teacher_remark || result.remarks || '',
        grading_system: result.grading_system?.id || result.grading_system,
        
        // Senior Secondary fields
        first_test_score: result.first_test_score || result.breakdown?.first_test_score || '',
        second_test_score: result.second_test_score || result.breakdown?.second_test_score || '',
        third_test_score: result.third_test_score || result.breakdown?.third_test_score || '',
        
        // Primary/Junior Secondary fields
        continuous_assessment_score: result.continuous_assessment_score || result.breakdown?.continuous_assessment_score || '',
        take_home_test_score: result.take_home_test_score || result.breakdown?.take_home_test_score || '',
        appearance_score: result.appearance_score || result.breakdown?.appearance_score || '',
        practical_score: result.practical_score || result.breakdown?.practical_score || '',
        project_score: result.project_score || result.breakdown?.project_score || '',
        note_copying_score: result.note_copying_score || result.breakdown?.note_copying_score || '',
        
        // Common fields
        exam_score: result.exam_score || result.breakdown?.exam_score || '',
        
        // Calculated fields (can be input manually or auto-calculated)
        ca_total: result.ca_total || result.breakdown?.ca_total || '',
        total_score: result.total_score || result.breakdown?.total_score || '',
        grade: result.grade || result.breakdown?.grade || '',
        position: result.position || result.breakdown?.position || '',
        class_average: result.class_average || result.breakdown?.class_average || '',
        highest_in_class: result.highest_in_class || result.breakdown?.highest_in_class || '',
        lowest_in_class: result.lowest_in_class || result.breakdown?.lowest_in_class || '',
        
        // Optional stream if present
        stream: result.stream?.id || result.stream,
      };
      
      console.log('Initial form data:', initialData);
      setFormData(initialData);
      
      // Store original scores for comparison
      setOriginalScores({
        total_score: result.total_score || result.breakdown?.total_score || 0,
        exam_score: result.exam_score || result.breakdown?.exam_score || 0,
        ca_total: result.ca_total || result.breakdown?.ca_total || 0,
        grade: result.grade || result.breakdown?.grade || '',
        teacher_remark: result.teacher_remark || result.remarks || ''
      });
    }
  }, [result]);

  // Load subjects for the student's education level
  useEffect(() => {
    if (student?.education_level) {
      loadSubjects();
    }
  }, [student]);

  const loadSubjects = async () => {
    try {
      const subjects = await SubjectService.getSubjects({ education_level: student.education_level });
      // SubjectService.getSubjects already returns Subject[] directly
      setSubjects(Array.isArray(subjects) ? subjects : []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
      // Set empty array on error to prevent undefined map calls
      setSubjects([]);
    }
  };

  // Generate automatic teacher remark based on score and grade
  const generateTeacherRemark = (totalScore: number, grade: string, previousRemark: string = ''): string => {
    const score = Number(totalScore) || 0;
    
    // Define remark templates based on grade ranges
    const remarkTemplates = {
      'A+': [
        'Excellent performance! Outstanding work and dedication.',
        'Exceptional achievement. Keep up the excellent work!',
        'Outstanding performance. You are a model student.',
        'Brilliant work! Your dedication is commendable.'
      ],
      'A': [
        'Very good performance. Well done!',
        'Excellent work. Keep maintaining this standard.',
        'Great achievement. Continue to excel.',
        'Very good performance. You should be proud.'
      ],
      'B+': [
        'Good performance. Keep up the good work.',
        'Well done! Continue to improve.',
        'Good effort. You are making progress.',
        'Satisfactory performance. Keep working hard.'
      ],
      'B': [
        'Fair performance. Room for improvement.',
        'Average work. Try to do better next time.',
        'Satisfactory performance. Keep working hard.',
        'Fair effort. Focus on areas that need improvement.'
      ],
      'C+': [
        'Below average performance. More effort needed.',
        'Needs improvement. Focus on your studies.',
        'Below expectations. Work harder next time.',
        'Poor performance. Seek help and improve.'
      ],
      'C': [
        'Poor performance. Significant improvement needed.',
        'Below average. You need to work much harder.',
        'Unsatisfactory. Seek extra help immediately.',
        'Very poor performance. Parent consultation needed.'
      ],
      'D': [
        'Very poor performance. Immediate intervention required.',
        'Failing grade. Urgent attention needed.',
        'Unsatisfactory performance. Parent meeting required.',
        'Critical performance. Seek academic support.'
      ],
      'F': [
        'Failed. Immediate remedial action required.',
        'Complete failure. Urgent academic intervention needed.',
        'Failed grade. Parent consultation and support required.',
        'Critical failure. Seek immediate academic help.'
      ]
    };

    // Get appropriate remarks based on grade
    let gradeRemarks = remarkTemplates[grade as keyof typeof remarkTemplates] || remarkTemplates['F'];
    
    // If no grade provided, determine based on score
    if (!grade && score > 0) {
      if (score >= 90) gradeRemarks = remarkTemplates['A+'];
      else if (score >= 80) gradeRemarks = remarkTemplates['A'];
      else if (score >= 70) gradeRemarks = remarkTemplates['B+'];
      else if (score >= 60) gradeRemarks = remarkTemplates['B'];
      else if (score >= 50) gradeRemarks = remarkTemplates['C+'];
      else if (score >= 40) gradeRemarks = remarkTemplates['C'];
      else if (score >= 30) gradeRemarks = remarkTemplates['D'];
      else gradeRemarks = remarkTemplates['F'];
    }

    // Return a random remark from the appropriate category
    return gradeRemarks[Math.floor(Math.random() * gradeRemarks.length)];
  };

  // Check if scores have changed significantly (pass/fail status change)
  const hasSignificantScoreChange = (): boolean => {
    if (!originalScores.total_score) return false;
    
    const originalScore = Number(originalScores.total_score) || 0;
    const currentScore = Number(formData.total_score) || 0;
    const passThreshold = 50; // Default pass mark
    
    // Check if pass/fail status has changed
    const wasPassing = originalScore >= passThreshold;
    const isNowPassing = currentScore >= passThreshold;
    
    return wasPassing !== isNowPassing;
  };

  // Auto-update remark when significant score changes occur
  const handleScoreChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    
    // Recalculate total if individual scores changed
    if (['first_test_score', 'second_test_score', 'third_test_score', 'exam_score', 
         'continuous_assessment_score', 'take_home_test_score', 'appearance_score', 
         'practical_score', 'project_score', 'note_copying_score'].includes(field)) {
      
      // Calculate new total based on education level
      let newTotal = 0;
      if (student.education_level === 'SENIOR_SECONDARY') {
        newTotal = (Number(newFormData.first_test_score) || 0) + 
                   (Number(newFormData.second_test_score) || 0) + 
                   (Number(newFormData.third_test_score) || 0) + 
                   (Number(newFormData.exam_score) || 0);
      } else {
        // Primary/Junior Secondary calculation
        newTotal = (Number(newFormData.continuous_assessment_score) || 0) + 
                   (Number(newFormData.exam_score) || 0);
      }
      
      newFormData.total_score = newTotal;
    }
    
    setFormData(newFormData);
    
    // Check if significant change occurred and suggest remark update
    if (hasSignificantScoreChange()) {
      setShowRemarkWarning(true);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    // Use handleScoreChange for score-related fields
    if (['first_test_score', 'second_test_score', 'third_test_score', 'exam_score', 
         'continuous_assessment_score', 'take_home_test_score', 'appearance_score', 
         'practical_score', 'project_score', 'note_copying_score', 'total_score'].includes(field)) {
      handleScoreChange(field, value);
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Helper function to render calculated fields
  const renderCalculatedFields = () => (
    <div className="mt-6">
      <h4 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Calculated Fields (Auto-calculated or Manual Input)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CA Total - only for Primary/Junior Secondary */}
        {(student.education_level === 'PRIMARY' || student.education_level === 'JUNIOR_SECONDARY') && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
              CA Total
            </label>
            <input
              type="number"
              min="0"
              max="35"
              step="0.01"
              value={formData.ca_total || ''}
              onChange={(e) => handleInputChange('ca_total', parseFloat(e.target.value) || '')}
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ca_total ? 'border-red-500' : ''}`}
              placeholder="Sum of CA components"
            />
            <p className="text-xs text-gray-500 mt-1">Sum of CA components</p>
          </div>
        )}
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Total Score
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.total_score || ''}
            onChange={(e) => handleInputChange('total_score', parseFloat(e.target.value) || '')}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.total_score ? 'border-red-500' : ''}`}
            placeholder="Total score"
          />
          <p className="text-xs text-gray-500 mt-1">CA Total + Exam Score</p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Grade
          </label>
          <input
            type="text"
            value={formData.grade || ''}
            onChange={(e) => handleInputChange('grade', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.grade ? 'border-red-500' : ''}`}
            placeholder="A, B, C, D, F"
          />
          <p className="text-xs text-gray-500 mt-1">A, B, C, D, F</p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Position
          </label>
          <input
            type="number"
            min="1"
            value={formData.position || ''}
            onChange={(e) => handleInputChange('position', parseInt(e.target.value) || '')}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.position ? 'border-red-500' : ''}`}
            placeholder="Position in class"
          />
          <p className="text-xs text-gray-500 mt-1">Position in class</p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Class Average
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.class_average || ''}
            onChange={(e) => handleInputChange('class_average', parseFloat(e.target.value) || '')}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class_average ? 'border-red-500' : ''}`}
            placeholder="Class average score"
          />
          <p className="text-xs text-gray-500 mt-1">Class average score</p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Highest in Class
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.highest_in_class || ''}
            onChange={(e) => handleInputChange('highest_in_class', parseFloat(e.target.value) || '')}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.highest_in_class ? 'border-red-500' : ''}`}
            placeholder="Highest score in class"
          />
          <p className="text-xs text-gray-500 mt-1">Highest score in class</p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Lowest in Class
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.lowest_in_class || ''}
            onChange={(e) => handleInputChange('lowest_in_class', parseFloat(e.target.value) || '')}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lowest_in_class ? 'border-red-500' : ''}`}
            placeholder="Lowest score in class"
          />
          <p className="text-xs text-gray-500 mt-1">Lowest score in class</p>
        </div>
      </div>
    </div>
  );

  // Validation function with proper field names
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.exam_session) {
      newErrors.exam_session = 'Exam session is required';
    }

    if (!formData.grading_system) {
      newErrors.grading_system = 'Grading system is required';
    }

    // Education level specific validations
    switch (student.education_level) {
      case 'SENIOR_SECONDARY':
        if (formData.first_test_score && (formData.first_test_score < 0 || formData.first_test_score > 10)) {
          newErrors.first_test_score = 'Test 1 score must be between 0 and 10';
        }
        if (formData.second_test_score && (formData.second_test_score < 0 || formData.second_test_score > 10)) {
          newErrors.second_test_score = 'Test 2 score must be between 0 and 10';
        }
        if (formData.third_test_score && (formData.third_test_score < 0 || formData.third_test_score > 10)) {
          newErrors.third_test_score = 'Test 3 score must be between 0 and 10';
        }
        if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 70)) {
          newErrors.exam_score = 'Exam score must be between 0 and 70';
        }
        break;
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        if (formData.continuous_assessment_score && (formData.continuous_assessment_score < 0 || formData.continuous_assessment_score > 15)) {
          newErrors.continuous_assessment_score = 'CA score must be between 0 and 15';
        }
        if (formData.appearance_score && (formData.appearance_score < 0 || formData.appearance_score > 5)) {
          newErrors.appearance_score = 'Appearance score must be between 0 and 5';
        }
        if (formData.practical_score && (formData.practical_score < 0 || formData.practical_score > 5)) {
          newErrors.practical_score = 'Practical score must be between 0 and 5';
        }
        if (formData.take_home_test_score && (formData.take_home_test_score < 0 || formData.take_home_test_score > 5)) {
          newErrors.take_home_test_score = 'Take Home Test score must be between 0 and 5';
        }
        if (formData.project_score && (formData.project_score < 0 || formData.project_score > 5)) {
          newErrors.project_score = 'Project score must be between 0 and 5';
        }
        if (formData.note_copying_score && (formData.note_copying_score < 0 || formData.note_copying_score > 5)) {
          newErrors.note_copying_score = 'Note copying score must be between 0 and 5';
        }
        if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 60)) {
          newErrors.exam_score = 'Exam score must be between 0 and 60';
        }
        break;
      case 'NURSERY':
        if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 100)) {
          newErrors.exam_score = 'Exam score must be between 0 and 100';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // Use ResultService instead of direct API calls
      const resultService = new ResultService();

      // Build payload with proper foreign key handling
      const baseForeignKeys = {
        student: student?.id ?? result.student?.id ?? result.student,
        subject: formData.subject?.id ?? formData.subject,
        exam_session: formData.exam_session?.id ?? formData.exam_session,
        grading_system: formData.grading_system?.id ?? formData.grading_system,
      };

      let payload: Record<string, any> = { 
        status: formData.status || 'DRAFT', 
        ...baseForeignKeys 
      };

      // Add education level specific fields
      if (student.education_level === 'SENIOR_SECONDARY') {
        payload = {
          ...payload,
          first_test_score: Number(formData.first_test_score ?? 0),
          second_test_score: Number(formData.second_test_score ?? 0),
          third_test_score: Number(formData.third_test_score ?? 0),
          exam_score: Number(formData.exam_score ?? 0),
          teacher_remark: formData.teacher_remark || '',
          ...(formData.stream ? { stream: formData.stream?.id ?? formData.stream } : {}),
        };
      } else if (student.education_level === 'PRIMARY' || student.education_level === 'JUNIOR_SECONDARY') {
        payload = {
          ...payload,
          continuous_assessment_score: Number(formData.continuous_assessment_score ?? 0),
          take_home_test_score: Number(formData.take_home_test_score ?? 0),
          appearance_score: Number(formData.appearance_score ?? 0),
          practical_score: Number(formData.practical_score ?? 0),
          project_score: Number(formData.project_score ?? 0),
          note_copying_score: Number(formData.note_copying_score ?? 0),
          exam_score: Number(formData.exam_score ?? 0),
          teacher_remark: formData.teacher_remark || '',
        };
      } else if (student.education_level === 'NURSERY') {
        payload = {
          ...payload,
          mark_obtained: Number(formData.exam_score ?? 0),
          academic_comment: formData.teacher_remark || '',
        };
      }

      console.log('Sending payload:', payload);

      // Use ResultService to update the result
      await resultService.updateStudentResult(result.id, payload, student.education_level);
      toast.success('Result updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating result:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update result';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderEducationLevelFields = () => {
    switch (student.education_level) {
      case 'SENIOR_SECONDARY':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Test 1 Score
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={formData.first_test_score || ''}
                onChange={(e) => handleInputChange('first_test_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.first_test_score ? 'border-red-500' : ''}`}
                placeholder="0-10"
              />
              {errors.first_test_score && <p className="text-red-500 text-xs mt-1">{errors.first_test_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Test 2 Score
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={formData.second_test_score || ''}
                onChange={(e) => handleInputChange('second_test_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.second_test_score ? 'border-red-500' : ''}`}
                placeholder="0-10"
              />
              {errors.second_test_score && <p className="text-red-500 text-xs mt-1">{errors.second_test_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Test 3 Score
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={formData.third_test_score || ''}
                onChange={(e) => handleInputChange('third_test_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.third_test_score ? 'border-red-500' : ''}`}
                placeholder="0-10"
              />
              {errors.third_test_score && <p className="text-red-500 text-xs mt-1">{errors.third_test_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Exam Score
              </label>
              <input
                type="number"
                min="0"
                max="70"
                step="0.01"
                value={formData.exam_score || ''}
                onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
                placeholder="0-70"
              />
              {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
            </div>
          </div>
        );
       
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Continuous Assessment (CA)
              </label>
              <input
                type="number"
                min="0"
                max="15"
                step="0.01"
                value={formData.continuous_assessment_score || ''}
                onChange={(e) => handleInputChange('continuous_assessment_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.continuous_assessment_score ? 'border-red-500' : ''}`}
                placeholder="0-15"
              />
              {errors.continuous_assessment_score && <p className="text-red-500 text-xs mt-1">{errors.continuous_assessment_score}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Appearance Score
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={formData.appearance_score || ''}
                onChange={(e) => handleInputChange('appearance_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.appearance_score ? 'border-red-500' : ''}`}
                placeholder="0-5"
              />
              {errors.appearance_score && <p className="text-red-500 text-xs mt-1">{errors.appearance_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Practical Score
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={formData.practical_score || ''}
                onChange={(e) => handleInputChange('practical_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.practical_score ? 'border-red-500' : ''}`}
                placeholder="0-5"
              />
              {errors.practical_score && <p className="text-red-500 text-xs mt-1">{errors.practical_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Take Home Test Score
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={formData.take_home_test_score || ''}
                onChange={(e) => handleInputChange('take_home_test_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.take_home_test_score ? 'border-red-500' : ''}`}
                placeholder="0-5"
              />
              {errors.take_home_test_score && <p className="text-red-500 text-xs mt-1">{errors.take_home_test_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Project Score
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={formData.project_score || ''}
                onChange={(e) => handleInputChange('project_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.project_score ? 'border-red-500' : ''}`}
                placeholder="0-5"
              />
              {errors.project_score && <p className="text-red-500 text-xs mt-1">{errors.project_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Note Copying Score
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={formData.note_copying_score || ''}
                onChange={(e) => handleInputChange('note_copying_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.note_copying_score ? 'border-red-500' : ''}`}
                placeholder="0-5"
              />
              {errors.note_copying_score && <p className="text-red-500 text-xs mt-1">{errors.note_copying_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Exam Score
              </label>
              <input
                type="number"
                min="0"
                max="60"
                step="0.01"
                value={formData.exam_score || ''}
                onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
                placeholder="0-60"
              />
              {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
            </div>
          </div>
        );

      case 'NURSERY':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Exam Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.exam_score || ''}
                onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
            </div>
          </div>
        );

      default:
        return <div className="text-red-500">Unsupported education level</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgCard} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Edit Result</h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Editing result for {student?.full_name} - {result?.subject?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary}`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Assessment Scores
              </h3>
              {renderEducationLevelFields()}
            </div>

            {/* Calculated Fields */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Calculated Fields
              </h3>
              {renderCalculatedFields()}
            </div>

            {/* Comments */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Teacher's Remark
              </h3>
              
              {/* Warning for significant score changes */}
              {showRemarkWarning && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Score Change Detected
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>The student's pass/fail status has changed. Consider updating the teacher's remark to reflect this change.</p>
                      </div>
                      <div className="mt-3 flex space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            const newRemark = generateTeacherRemark(
                              Number(formData.total_score) || 0, 
                              formData.grade || '', 
                              formData.teacher_remark || ''
                            );
                            setFormData(prev => ({ ...prev, teacher_remark: newRemark }));
                            setShowRemarkWarning(false);
                          }}
                          className="bg-yellow-100 px-3 py-1 rounded text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                        >
                          Auto-Update Remark
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRemarkWarning(false)}
                          className="bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-800 hover:bg-gray-200"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teacher's Remark
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newRemark = generateTeacherRemark(
                      Number(formData.total_score) || 0, 
                      formData.grade || '', 
                      formData.teacher_remark || ''
                    );
                    setFormData(prev => ({ ...prev, teacher_remark: newRemark }));
                  }}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                >
                  Generate Remark
                </button>
              </div>
              
              <textarea
                value={formData.teacher_remark || ''}
                onChange={(e) => handleInputChange('teacher_remark', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter teacher's remark or click 'Generate Remark' for automatic suggestion..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Use the "Generate Remark" button to get automatic suggestions based on the student's performance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${themeClasses.buttonSecondary}`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg flex items-center ${themeClasses.buttonSuccess}`}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Updating...' : 'Update Result'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditResultForm;