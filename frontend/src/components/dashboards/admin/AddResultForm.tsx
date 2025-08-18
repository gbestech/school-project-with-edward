import React, { useState, useEffect } from 'react';
import { X, Save, User, BookOpen, Calendar, Calculator } from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import ResultService from '../../../services/ResultService';

interface AddResultFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Student {
  id: string;
  full_name: string;
  student_class: string;
  education_level: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface ExamSession {
  id: string;
  name: string;
  exam_type: string;
  term: string;
  academic_session: {
    id: string;
    name: string;
  };
}

const AddResultForm: React.FC<AddResultFormProps> = ({ onClose, onSuccess }) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    exam_session: '',
    ca_score: '',
    exam_score: '',
    remarks: ''
  });

  // Dropdown data
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  };

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        // In a real app, you would fetch these from the API
        // For now, using mock data
        setStudents([
          { id: '1', full_name: 'John Doe', student_class: 'SS1', education_level: 'SENIOR_SECONDARY' },
          { id: '2', full_name: 'Jane Smith', student_class: 'SS1', education_level: 'SENIOR_SECONDARY' },
          { id: '3', full_name: 'Mike Johnson', student_class: 'SS2', education_level: 'SENIOR_SECONDARY' },
        ]);
        
        setSubjects([
          { id: '1', name: 'Mathematics', code: 'MATH' },
          { id: '2', name: 'English Language', code: 'ENG' },
          { id: '3', name: 'Physics', code: 'PHY' },
          { id: '4', name: 'Chemistry', code: 'CHEM' },
          { id: '5', name: 'Biology', code: 'BIO' },
        ]);
        
        setExamSessions([
          {
            id: '1',
            name: 'First Term Examination',
            exam_type: 'FINAL_EXAM',
            term: 'FIRST',
            academic_session: { id: '1', name: '2024/2025' }
          },
          {
            id: '2',
            name: 'Second Term Examination',
            exam_type: 'FINAL_EXAM',
            term: 'SECOND',
            academic_session: { id: '1', name: '2024/2025' }
          }
        ]);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        setError('Failed to load form data');
      }
    };

    loadDropdownData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const ca = parseFloat(formData.ca_score) || 0;
    const exam = parseFloat(formData.exam_score) || 0;
    return ca + exam;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student || !formData.subject || !formData.exam_session) {
      setError('Please fill in all required fields');
      return;
    }

    const caScore = parseFloat(formData.ca_score);
    const examScore = parseFloat(formData.exam_score);
    
    if (isNaN(caScore) || isNaN(examScore)) {
      setError('Please enter valid scores');
      return;
    }

    if (caScore < 0 || caScore > 30 || examScore < 0 || examScore > 70) {
      setError('CA score must be 0-30, Exam score must be 0-70');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resultData = {
        student: formData.student,
        subject: formData.subject,
        exam_session: formData.exam_session,
        grading_system: '1', // Default grading system
        ca_score: caScore,
        exam_score: examScore,
        remarks: formData.remarks
      };

      await ResultService.createStudentResult(resultData);
      onSuccess();
    } catch (err) {
      console.error('Error creating result:', err);
      setError(err instanceof Error ? err.message : 'Failed to create result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgPrimary} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
            Add New Result
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Student Selection */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
              <User size={16} className="inline mr-2" />
              Student *
            </label>
            <select
              name="student"
              value={formData.student}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.full_name} - {student.student_class}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
              <BookOpen size={16} className="inline mr-2" />
              Subject *
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          {/* Exam Session Selection */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
              <Calendar size={16} className="inline mr-2" />
              Exam Session *
            </label>
            <select
              name="exam_session"
              value={formData.exam_session}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Select Exam Session</option>
              {examSessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name} - {session.academic_session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                CA Score (0-30) *
              </label>
              <input
                type="number"
                name="ca_score"
                value={formData.ca_score}
                onChange={handleInputChange}
                min="0"
                max="30"
                step="0.5"
                required
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter CA score"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
                Exam Score (0-70) *
              </label>
              <input
                type="number"
                name="exam_score"
                value={formData.exam_score}
                onChange={handleInputChange}
                min="0"
                max="70"
                step="0.5"
                required
                className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter exam score"
              />
            </div>
          </div>

          {/* Total Score Display */}
          <div className={`p-4 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                <Calculator size={16} className="inline mr-2" />
                Total Score:
              </span>
              <span className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                {calculateTotal()}/100
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter any remarks about the result"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors disabled:opacity-50`}
            >
              <Save size={16} />
              <span>{loading ? 'Creating...' : 'Create Result'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResultForm;




