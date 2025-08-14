import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { LessonService, LessonUpdateData, Lesson } from '../../../services/LessonService';

interface EditLessonFormProps {
  lesson: Lesson;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLessonForm: React.FC<EditLessonFormProps> = ({ lesson, onClose, onSuccess }) => {
  const { isDarkMode } = useGlobalTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<LessonUpdateData>({
    title: lesson.title,
    description: lesson.description || '',
    lesson_type: lesson.lesson_type,
    difficulty_level: lesson.difficulty_level,
    status: lesson.status,
    actual_start_time: lesson.actual_start_time || '',
    actual_end_time: lesson.actual_end_time || '',
    completion_percentage: lesson.completion_percentage || 0,
    learning_objectives: lesson.learning_objectives || [],
    key_concepts: lesson.key_concepts || [],
    materials_needed: lesson.materials_needed || [],
    assessment_criteria: lesson.assessment_criteria || [],
    teacher_notes: lesson.teacher_notes || '',
    lesson_notes: lesson.lesson_notes || '',
    student_feedback: lesson.student_feedback || '',
    admin_notes: lesson.admin_notes || '',
    attendance_count: lesson.attendance_count || 0,
    participation_score: lesson.participation_score || 0,
    resources: lesson.resources || [],
    attachments: lesson.attachments || [],
  });

  const [newObjective, setNewObjective] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
    buttonWarning: isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white',
  };

  const handleInputChange = (field: keyof LessonUpdateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: 'learning_objectives' | 'key_concepts' | 'materials_needed' | 'assessment_criteria', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'learning_objectives' | 'key_concepts' | 'materials_needed' | 'assessment_criteria', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Lesson title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await LessonService.updateLesson(lesson.id, formData);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lesson');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      postponed: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${themeClasses.bgCard} rounded-2xl shadow-2xl max-w-md w-full p-8 text-center`}>
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>Success!</h2>
          <p className={`${themeClasses.textSecondary}`}>Lesson updated successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgCard} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>Edit Lesson</h2>
              <p className={`${themeClasses.textSecondary} mt-1`}>Update lesson details and status</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(lesson.status)}`}>
                  {lesson.status_display}
                </span>
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  ID: {lesson.id}
                </span>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}>
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className={`mb-6 p-4 rounded-lg bg-red-100 border border-red-300 ${isDarkMode ? 'bg-red-900 border-red-700' : ''}`}>
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-600" />
                <p className={`text-red-700 ${isDarkMode ? 'text-red-300' : ''}`}>{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center space-x-2`}>
                <BookOpen size={20} className={themeClasses.iconPrimary} />
                <span>Basic Information</span>
              </h3>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Lesson Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter lesson title"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter lesson description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Lesson Type</label>
                  <select
                    value={formData.lesson_type}
                    onChange={(e) => handleInputChange('lesson_type', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {LessonService.getLessonTypes().map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Difficulty Level</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {LessonService.getDifficultyLevels().map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status and Progress */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center space-x-2`}>
                <Target size={20} className={themeClasses.iconPrimary} />
                <span>Status & Progress</span>
              </h3>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {LessonService.getLessonStatuses().map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Actual Start Time</label>
                  <input
                    type="time"
                    value={formData.actual_start_time}
                    onChange={(e) => handleInputChange('actual_start_time', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Actual End Time</label>
                  <input
                    type="time"
                    value={formData.actual_end_time}
                    onChange={(e) => handleInputChange('actual_end_time', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Completion Percentage</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.completion_percentage}
                    onChange={(e) => handleInputChange('completion_percentage', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className={themeClasses.textSecondary}>0%</span>
                    <span className={themeClasses.textPrimary}>{formData.completion_percentage}%</span>
                    <span className={themeClasses.textSecondary}>100%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Attendance Count</label>
                  <input
                    type="number"
                    value={formData.attendance_count}
                    onChange={(e) => handleInputChange('attendance_count', parseInt(e.target.value))}
                    min="0"
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Participation Score</label>
                  <input
                    type="number"
                    value={formData.participation_score}
                    onChange={(e) => handleInputChange('participation_score', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            {/* Lesson Details */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center space-x-2`}>
                <Target size={20} className={themeClasses.iconPrimary} />
                <span>Lesson Details</span>
              </h3>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Learning Objectives</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('learning_objectives', newObjective);
                          setNewObjective('');
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Add learning objective"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('learning_objectives', newObjective);
                        setNewObjective('');
                      }}
                      className={`px-3 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                  {formData.learning_objectives && formData.learning_objectives.length > 0 && (
                    <div className="space-y-1">
                      {formData.learning_objectives.map((objective, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm text-blue-800">{objective}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('learning_objectives', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Key Concepts</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newConcept}
                      onChange={(e) => setNewConcept(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('key_concepts', newConcept);
                          setNewConcept('');
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Add key concept"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('key_concepts', newConcept);
                        setNewConcept('');
                      }}
                      className={`px-3 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                  {formData.key_concepts && formData.key_concepts.length > 0 && (
                    <div className="space-y-1">
                      {formData.key_concepts.map((concept, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-800">{concept}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('key_concepts', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Materials Needed</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('materials_needed', newMaterial);
                          setNewMaterial('');
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Add material"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('materials_needed', newMaterial);
                        setNewMaterial('');
                      }}
                      className={`px-3 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
                    >
                      Add
                    </button>
                  </div>
                  {formData.materials_needed && formData.materials_needed.length > 0 && (
                    <div className="space-y-1">
                      {formData.materials_needed.map((material, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm text-orange-800">{material}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('materials_needed', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes and Feedback */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center space-x-2`}>
                <BookOpen size={20} className={themeClasses.iconPrimary} />
                <span>Notes & Feedback</span>
              </h3>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Teacher Notes</label>
                <textarea
                  value={formData.teacher_notes}
                  onChange={(e) => handleInputChange('teacher_notes', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Add teacher notes"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Lesson Notes</label>
                <textarea
                  value={formData.lesson_notes}
                  onChange={(e) => handleInputChange('lesson_notes', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Add lesson notes"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Student Feedback</label>
                <textarea
                  value={formData.student_feedback}
                  onChange={(e) => handleInputChange('student_feedback', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Add student feedback"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Admin Notes</label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Add admin notes"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
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
              className={`px-6 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors flex items-center space-x-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Lesson</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLessonForm;
