import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
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
  created_at: string;
  updated_at: string;
}

interface EditTermResultFormProps {
  result: StudentResult;
  onClose: () => void;
  onSuccess: () => void;
}

interface TermResultFormData {
  status: string;
  remarks: string;
  class_position: number | null;
  next_term_begins: string;
}

const EditTermResultForm: React.FC<EditTermResultFormProps> = ({
  result,
  onClose,
  onSuccess,
}) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Safe score formatting function
  const formatScore = (score: any): string => {
    if (score === null || score === undefined) return 'N/A';
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (typeof numScore !== 'number' || isNaN(numScore)) return 'N/A';
    return `${numScore.toFixed(1)}%`;
  };

  const [formData, setFormData] = useState<TermResultFormData>({
    status: result.status || 'DRAFT',
    remarks: result.remarks || '',
    class_position: result.class_position || null,
    next_term_begins: result.next_term_begins || '',
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.class_position !== null && (formData.class_position < 1 || formData.class_position > result.total_students || 0)) {
      newErrors.class_position = `Position must be between 1 and ${result.total_students || 'N/A'}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TermResultFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
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
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // Update the StudentTermResult
      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        class_position: formData.class_position,
        next_term_begins: formData.next_term_begins || null,
      };

      console.log('Updating term result:', result.id, updateData);

      // Use the student-term-results endpoint
      await api.put(`/api/results/student-term-results/${result.id}/`, updateData);
      
      toast.success('Term result updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating term result:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update term result';
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
          Edit Term Result - {result.student?.full_name}
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
            <span className="text-gray-600">Average Score:</span>
            <span className="ml-2 font-medium">{formatScore(result.average_score)}</span>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.status ? 'border-red-500' : ''}`}
          >
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
          </select>
          {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
        </div>

        {/* Class Position */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
            Class Position
          </label>
          <input
            type="number"
            min="1"
            max={result.total_students || undefined}
            value={formData.class_position || ''}
            onChange={(e) => handleInputChange('class_position', e.target.value ? parseInt(e.target.value) : null)}
            className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class_position ? 'border-red-500' : ''}`}
            placeholder={`1-${result.total_students || 'N/A'}`}
          />
          {errors.class_position && <p className="text-red-500 text-xs mt-1">{errors.class_position}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Total students in class: {result.total_students || 'N/A'}
          </p>
        </div>
      </div>

      {/* Next Term Begins */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
          Next Term Begins
        </label>
        <input
          type="date"
          value={formData.next_term_begins}
          onChange={(e) => handleInputChange('next_term_begins', e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <p className="text-xs text-gray-500 mt-1">
          When the next term begins (optional)
        </p>
      </div>

      {/* Remarks */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
          Remarks
        </label>
        <textarea
          rows={4}
          value={formData.remarks}
          onChange={(e) => handleInputChange('remarks', e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Additional remarks or comments..."
        />
      </div>

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
          disabled={loading}
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

export default EditTermResultForm;
