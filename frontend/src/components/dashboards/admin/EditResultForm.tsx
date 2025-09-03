import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  BookOpen, 
  User, 
  Calendar,
  Target,
  Award,
  TrendingUp,
  TrendingDown,
  Trophy,
  Star,
  Check,
  RefreshCw
} from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import SubjectService from '../../../services/SubjectService';
import ResultService from '../../../services/ResultService';
import { toast } from 'react-toastify';
import api from '../../../services/api';

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
  useEffect(() => {
    if (result) {
      const initialData = {
        subject: result.subject?.id || result.subject,
        exam_session: result.exam_session?.id || result.exam_session,
        grading_system: result.grading_system?.id || result.grading_system,
        ...result
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
    setFormData(prev => ({
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
        if (formData.test1_score && (formData.test1_score < 0 || formData.test1_score > 100)) {
          newErrors.test1_score = 'Test 1 score must be between 0 and 100';
        }
        if (formData.test2_score && (formData.test2_score < 0 || formData.test2_score > 100)) {
          newErrors.test2_score = 'Test 2 score must be between 0 and 100';
        }
        if (formData.test3_score && (formData.test3_score < 0 || formData.test3_score > 100)) {
          newErrors.test3_score = 'Test 3 score must be between 0 and 100';
        }
        if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 100)) {
          newErrors.exam_score = 'Exam score must be between 0 and 100';
        }
        break;
      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        if (formData.ca_score && (formData.ca_score < 0 || formData.ca_score > 100)) {
          newErrors.ca_score = 'CA score must be between 0 and 100';
        }
        if (formData.appearance_score && (formData.appearance_score < 0 || formData.appearance_score > 100)) {
          newErrors.appearance_score = 'Appearance score must be between 0 and 100';
        }
        if (formData.take_home_score && (formData.take_home_score < 0 || formData.take_home_score > 100)) {
          newErrors.take_home_score = 'Take Home score must be between 0 and 100';
        }
        if (formData.project_score && (formData.project_score < 0 || formData.project_score > 100)) {
          newErrors.project_score = 'Project score must be between 0 and 100';
        }
        if (formData.note_copying_score && (formData.note_copying_score < 0 || formData.note_copying_score > 100)) {
          newErrors.note_copying_score = 'Note copying score must be between 0 and 100';
        }
        if (formData.exam_score && (formData.exam_score < 0 || formData.exam_score > 100)) {
          newErrors.exam_score = 'Exam score must be between 0 and 100';
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

      await api.put(endpoint, formData);
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
                max="100"
                step="0.01"
                value={formData.test1_score || ''}
                onChange={(e) => handleInputChange('test1_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.test1_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.test1_score && <p className="text-red-500 text-xs mt-1">{errors.test1_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Test 2 Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.test2_score || ''}
                onChange={(e) => handleInputChange('test2_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.test2_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.test2_score && <p className="text-red-500 text-xs mt-1">{errors.test2_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Test 3 Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.test3_score || ''}
                onChange={(e) => handleInputChange('test3_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.test3_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.test3_score && <p className="text-red-500 text-xs mt-1">{errors.test3_score}</p>}
            </div>
            
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

      case 'PRIMARY':
      case 'JUNIOR_SECONDARY':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                CA Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.ca_score || ''}
                onChange={(e) => handleInputChange('ca_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ca_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.ca_score && <p className="text-red-500 text-xs mt-1">{errors.ca_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Appearance Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.appearance_score || ''}
                onChange={(e) => handleInputChange('appearance_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.appearance_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.appearance_score && <p className="text-red-500 text-xs mt-1">{errors.appearance_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Take Home Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.take_home_score || ''}
                onChange={(e) => handleInputChange('take_home_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.take_home_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
              />
              {errors.take_home_score && <p className="text-red-500 text-xs mt-1">{errors.take_home_score}</p>}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                Project Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.project_score || ''}
                onChange={(e) => handleInputChange('project_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.project_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
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
                max="100"
                step="0.01"
                value={formData.note_copying_score || ''}
                onChange={(e) => handleInputChange('note_copying_score', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.note_copying_score ? 'border-red-500' : ''}`}
                placeholder="0-100"
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


