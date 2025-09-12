import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save,  
  BookOpen, 
  Target,
  Star,
  RefreshCw
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import SubjectService from '@/services/SubjectService';
import { toast } from 'react-toastify';
import api from '@/services/api';

interface EditResultFormProps {
  result: any;
  student: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface Subject {
  id: number;
  name: string;
  education_level: string;
}

const EditResultForm: React.FC<EditResultFormProps> = ({ result, student, onClose, onSuccess }) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Initialize form data based on education level
  // useEffect(() => {
  //   if (result) {
  //     const initialData = {
  //       subject: result.subject?.id || result.subject,
  //       exam_session: result.exam_session?.id || result.exam_session,
  //       status: result.status || 'DRAFT',
  //       comments: result.comments || result.teacher_remark || '',
  //       // Education level specific fields
  //       test1_score: result.first_test_score || 0,
  //       test2_score: result.second_test_score || 0,
  //       test3_score: result.third_test_score || 0,
  //       continuous_assessment_score: result.continuous_assessment_score || result.ca_score || 0,
  //       take_home_test_score: result.take_home_test_score || result.take_home_score || 0,
  //       practical_score: result.practical_score || 0,
  //       project_score: result.project_score || 0,
  //       note_copying_score: result.note_copying_score || 0,
  //       exam_score: result.exam_score || 0,
  //       // Optional stream if present
  //       grading_system: result.grading_system?.id || result.grading_system,
  //       ...result
  //     };
  //     setFormData(initialData);
  //   }
  // }, [result]);

  useEffect(() => {
  if (result) {
    const initialData = {
      subject: result.subject?.id || result.subject,
      exam_session: result.exam_session?.id || result.exam_session,
      status: result.status || 'DRAFT',
      teacher_remark: result.comments || result.teacher_remark || '',
      exam_score: result.exam_score || 0,
      grading_system: result.grading_system?.id || result.grading_system,
      
      // Use backend field names directly
      first_test_score: result.first_test_score || 0,
      second_test_score: result.second_test_score || 0,
      third_test_score: result.third_test_score || 0,
      continuous_assessment_score: result.continuous_assessment_score || result.ca_score || 0,
      take_home_test_score: result.take_home_test_score || result.take_home_score || 0,
      practical_score: result.practical_score || 0,
      project_score: result.project_score || 0,
      note_copying_score: result.note_copying_score || 0,
      
      // Optional stream if present
      stream: result.stream?.id || result.stream,
    };
    setFormData(initialData);
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
      const subjectsData = await SubjectService.getSubjects({ education_level: student.education_level });
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // const validateForm = () => {
  //   const newErrors: Record<string, string> = {};

  //   if (!formData.subject) {
  //     newErrors.subject = 'Subject is required';
  //   }

  //   if (!formData.exam_session) {
  //     newErrors.exam_session = 'Exam session is required';
  //   }

  //   if (!formData.grading_system) {
  //     newErrors.grading_system = 'Grading system is required';
  //   }

  //   // Education level specific validations
  //   switch (student.education_level) {
  //     case 'SENIOR_SECONDARY':
  //       if (formData.test1_score && (formData.test1_score < 0 || formData.test1_score > 10)) {
  //         newErrors.test1_score = 'Test 1 score must be between 0 and 10';
  //       }
  //       if (formData.test2_score && (formData.test2_score < 0 || formData.test2_score > 10)) {
  //         newErrors.test2_score = 'Test 2 score must be between 0 and 10';
  //       }
  //       if (formData.test3_score && (formData.test3_score < 0 || formData.test3_score > 10)) {
  //         newErrors.test3_score = 'Test 3 score must be between 0 and 10';
  //       }
  //       if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 70)) {
  //         newErrors.exam_score = 'Exam score must be between 0 and 70';
  //       }
  //       break;
  //     case 'PRIMARY':
  //     case 'JUNIOR_SECONDARY':
  //       if (formData.continuous_assessment_score && (formData.continuous_assessment_score < 0 || formData.continuous_assessment_score > 15)) {
  //         newErrors.continuous_assessment_score = 'CA score must be between 0 and 15';
  //       }
  //       if (formData.practical_score && (formData.practical_score < 0 || formData.practical_score > 5)) {
  //         newErrors.practical_score = 'Practical score must be between 0 and 5';
  //       }
  //       if (formData.take_home_test_score && (formData.take_home_test_score < 0 || formData.take_home_test_score > 5)) {
  //         newErrors.take_home_test_score = 'Take Home Test score must be between 0 and 5';
  //       }
  //       if (formData.project_score && (formData.project_score < 0 || formData.project_score > 5)) {
  //         newErrors.project_score = 'Project score must be between 0 and 5';
  //       }
  //       if (formData.note_copying_score && (formData.note_copying_score < 0 || formData.note_copying_score > 5)) {
  //         newErrors.note_copying_score = 'Note copying score must be between 0 and 5';
  //       }
  //       if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 60)) {
  //         newErrors.exam_score = 'Exam score must be between 0 and 60';
  //       }
  //       break;
  //     case 'NURSERY':
  //       if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 100)) {
  //         newErrors.exam_score = 'Exam score must be between 0 and 100';
  //       }
  //       break;
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // 2. UPDATE VALIDATION FUNCTION
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

  // Education level specific validations with backend field names
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
      
      // Determine the correct endpoint based on education level
      let endpoint = '';
      switch (student.education_level) {
        case 'NURSERY':
          endpoint = `/api/results/nursery-results/${result.id}/`;
          break;
        case 'PRIMARY':
          endpoint = `/api/results/primary-results/${result.id}/`;
          break;
        case 'JUNIOR_SECONDARY':
          endpoint = `/api/results/junior-secondary-results/${result.id}/`;
          break;
        case 'SENIOR_SECONDARY':
          endpoint = `/api/results/senior-secondary-results/${result.id}/`;
          break;
        default:
          throw new Error('Invalid education level');
      }

      // Build payload with only fields accepted by the backend CreateUpdate serializers
      const baseForeignKeys = {
        student: student?.id ?? result.student?.id ?? result.student,
        subject: formData.subject?.id ?? formData.subject,
        exam_session: formData.exam_session?.id ?? formData.exam_session,
        grading_system: formData.grading_system?.id ?? formData.grading_system,
      } as Record<string, any>;

      let payload: Record<string, any> = { status: formData.status || 'DRAFT', ...baseForeignKeys };

      if (student.education_level === 'SENIOR_SECONDARY') {
        payload = {
          ...payload,
          // first_test_score: formData.first_test_score ?? formData.test1_score ?? 0,
          // second_test_score: formData.second_test_score ?? formData.test2_score ?? 0,
          // third_test_score: formData.third_test_score ?? formData.test3_score ?? 0,
          // exam_score: formData.exam_score ?? 0,
          // teacher_remark: formData.teacher_remark || formData.comments || '',
          first_test_score: formData.first_test_score ?? 0,
        second_test_score: formData.second_test_score ?? 0,
        third_test_score: formData.third_test_score ?? 0,
        exam_score: formData.exam_score ?? 0,
        teacher_remark: formData.teacher_remark || '',
          // Optional stream if present
          ...(formData.stream ? { stream: formData.stream?.id ?? formData.stream } : {}),
        };
      } else if (student.education_level === 'PRIMARY' || student.education_level === 'JUNIOR_SECONDARY') {
        payload = {
          ...payload,
          // continuous_assessment_score: formData.continuous_assessment_score ?? formData.ca_score ?? 0,
          // take_home_test_score: formData.take_home_test_score ?? formData.take_home_score ?? 0,
          // practical_score: formData.practical_score ?? 0,
          // project_score: formData.project_score ?? 0,
          // note_copying_score: formData.note_copying_score ?? 0,
          // exam_score: formData.exam_score ?? 0,
          // teacher_remark: formData.teacher_remark || formData.comments || '',
          continuous_assessment_score: formData.continuous_assessment_score ?? 0,
        take_home_test_score: formData.take_home_test_score ?? 0,
        practical_score: formData.practical_score ?? 0,
        project_score: formData.project_score ?? 0,
        note_copying_score: formData.note_copying_score ?? 0,
        exam_score: formData.exam_score ?? 0,
        teacher_remark: formData.teacher_remark || '',
        };
      } else if (student.education_level === 'NURSERY') {
        payload = {
          ...payload,
          exam_score: formData.exam_score ?? 0,
          teacher_remark: formData.teacher_remark || formData.comments || '',
        };
      }

      // Send the minimal, correct payload
      await api.put(endpoint, payload);
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
        //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        //     <div>
        //       <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
        //         Test 1 Score
        //       </label>
        //       <input
        //         type="number"
        //         min="0"
        //         max="10"
        //         step="0.01"
        //         value={formData.test1_score || ''}
        //         onChange={(e) => handleInputChange('test1_score', parseFloat(e.target.value) || 0)}
        //         className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.test1_score ? 'border-red-500' : ''}`}
        //         placeholder="0-10"
        //       />
        //       {errors.test1_score && <p className="text-red-500 text-xs mt-1">{errors.test1_score}</p>}
        //     </div>
            
        //     <div>
        //       <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
        //         Test 2 Score
        //       </label>
        //       <input
        //         type="number"
        //         min="0"
        //         max="10"
        //         step="0.01"
        //         value={formData.test2_score || ''}
        //         onChange={(e) => handleInputChange('test2_score', parseFloat(e.target.value) || 0)}
        //         className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.test2_score ? 'border-red-500' : ''}`}
        //         placeholder="0-10"
        //       />
        //       {errors.test2_score && <p className="text-red-500 text-xs mt-1">{errors.test2_score}</p>}
        //     </div>
            
        //     <div>
        //       <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
        //         Test 3 Score
        //       </label>
        //       <input
        //         type="number"
        //         min="0"
        //         max="10"
        //         step="0.01"
        //         value={formData.test3_score || ''}
        //         onChange={(e) => handleInputChange('test3_score', parseFloat(e.target.value) || 0)}
        //         className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.test3_score ? 'border-red-500' : ''}`}
        //         placeholder="0-10"
        //       />
        //       {errors.test3_score && <p className="text-red-500 text-xs mt-1">{errors.test3_score}</p>}
        //     </div>
            
        //     <div>
        //       <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
        //         Exam Score
        //       </label>
        //       <input
        //         type="number"
        //         min="0"
        //         max="70"
        //         step="0.01"
        //         value={formData.exam_score || ''}
        //         onChange={(e) => handleInputChange('exam_score', parseFloat(e.target.value) || 0)}
        //         className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exam_score ? 'border-red-500' : ''}`}
        //         placeholder="0-70"
        //       />
        //       {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
        //     </div>
        //   </div>
        // );

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
                <BookOpen className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Subject
                  </label>
                  <select
                    value={formData.subject || ''}
                    onChange={(e) => handleInputChange('subject', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                    Status
                  </label>
                  <select
                    value={formData.status || 'DRAFT'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Education Level Specific Fields */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Scores
              </h3>
              {renderEducationLevelFields()}
            </div>

            {/* Comments */}
            <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Comments
              </h3>
              <textarea
                value={formData.comments || ''}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter any additional comments..."
              />
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


