import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboardService from '@/services/TeacherDashboardService';
import { ExamService, ExamCreateData } from '@/services/ExamService';
import { toast } from 'react-toastify';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface ExamCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: () => void;
  editingExam?: any;
}

const ExamCreationForm: React.FC<ExamCreationFormProps> = ({
  isOpen,
  onClose,
  onExamCreated,
  editingExam
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions'>('basic');
  
  const [formData, setFormData] = useState<ExamCreateData>({
    title: '',
    subject: 0,
    grade_level: 0,
    exam_type: 'test',
    difficulty_level: 'medium',
    exam_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 45,
    total_marks: 100,
    pass_marks: 50,
    venue: '',
    instructions: '',
    status: 'scheduled',
    is_practical: false,
    requires_computer: false,
    is_online: false,
    objective_questions: [],
    theory_questions: [],
    practical_questions: [],
    custom_sections: [],
    objective_instructions: '',
    theory_instructions: '',
    practical_instructions: ''
  });

  const [objectiveQuestions, setObjectiveQuestions] = useState<any[]>([]);
  const [theoryQuestions, setTheoryQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (editingExam) {
      setFormData({
        title: editingExam.title || '',
        subject: editingExam.subject?.id || 0,
        grade_level: editingExam.grade_level?.id || 0,
        exam_type: editingExam.exam_type || 'test',
        difficulty_level: editingExam.difficulty_level || 'medium',
        exam_date: editingExam.exam_date || '',
        start_time: editingExam.start_time || '',
        end_time: editingExam.end_time || '',
        duration_minutes: editingExam.duration_minutes || 45,
        total_marks: editingExam.total_marks || 100,
        pass_marks: editingExam.pass_marks || 50,
        venue: editingExam.venue || '',
        instructions: editingExam.instructions || '',
        status: editingExam.status || 'scheduled',
        is_practical: editingExam.is_practical || false,
        requires_computer: editingExam.requires_computer || false,
        is_online: editingExam.is_online || false,
        objective_questions: editingExam.objective_questions || [],
        theory_questions: editingExam.theory_questions || [],
        practical_questions: editingExam.practical_questions || [],
        custom_sections: editingExam.custom_sections || [],
        objective_instructions: editingExam.objective_instructions || '',
        theory_instructions: editingExam.theory_instructions || '',
        practical_instructions: editingExam.practical_instructions || ''
      });
    }
  }, [editingExam]);

  const handleInputChange = (field: keyof ExamCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addObjectiveQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      marks: 1
    };
    setObjectiveQuestions(prev => [...prev, newQuestion]);
  };

  const addTheoryQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      expectedPoints: '',
      marks: 5,
      wordLimit: ''
    };
    setTheoryQuestions(prev => [...prev, newQuestion]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter an exam title');
      return;
    }

    try {
      setLoading(true);
      
      const examData = {
        ...formData,
        objective_questions: objectiveQuestions,
        theory_questions: theoryQuestions
      };

      if (editingExam) {
        await ExamService.updateExam(editingExam.id, examData);
        toast.success('Exam updated successfully!');
      } else {
        await ExamService.createExam(examData);
        toast.success('Exam created successfully!');
      }

      onExamCreated();
      onClose();
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error('Failed to save exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700">
            {['basic', 'questions'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'basic' ? 'Basic Information' : 'Questions'}
              </button>
            ))}
          </div>

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Exam Type *
                  </label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) => handleInputChange('exam_type', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="test">Class Test</option>
                    <option value="mid_term">Mid-Term</option>
                    <option value="final_exam">Final Exam</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => handleInputChange('exam_date', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter exam instructions for students..."
                />
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Objective Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Objective Questions
                  </h3>
                  <button
                    type="button"
                    onClick={addObjectiveQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {objectiveQuestions.map((question, index) => (
                    <div key={question.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          Question {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setObjectiveQuestions(prev => prev.filter(q => q.id !== question.id))}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Question *
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => {
                              const updated = [...objectiveQuestions];
                              updated[index].question = e.target.value;
                              setObjectiveQuestions(updated);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the question..."
                          />
                        </div>

                        {['A', 'B', 'C', 'D'].map((option) => (
                          <div key={option}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Option {option} *
                            </label>
                            <input
                              type="text"
                              value={question[`option${option}` as keyof typeof question] as string}
                              onChange={(e) => {
                                const updated = [...objectiveQuestions];
                                updated[index][`option${option}` as keyof typeof question] = e.target.value;
                                setObjectiveQuestions(updated);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${option}`}
                            />
                          </div>
                        ))}

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Correct Answer *
                          </label>
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => {
                              const updated = [...objectiveQuestions];
                              updated[index].correctAnswer = e.target.value;
                              setObjectiveQuestions(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Answer</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Marks *
                          </label>
                          <input
                            type="number"
                            value={question.marks}
                            onChange={(e) => {
                              const updated = [...objectiveQuestions];
                              updated[index].marks = parseInt(e.target.value);
                              setObjectiveQuestions(updated);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theory Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Theory Questions
                  </h3>
                  <button
                    type="button"
                    onClick={addTheoryQuestion}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {theoryQuestions.map((question, index) => (
                    <div key={question.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          Question {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setTheoryQuestions(prev => prev.filter(q => q.id !== question.id))}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Question *
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => {
                              const updated = [...theoryQuestions];
                              updated[index].question = e.target.value;
                              setTheoryQuestions(updated);
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the theory question..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Expected Points
                            </label>
                            <textarea
                              value={question.expectedPoints}
                              onChange={(e) => {
                                const updated = [...theoryQuestions];
                                updated[index].expectedPoints = e.target.value;
                                setTheoryQuestions(updated);
                              }}
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Key points to look for..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Marks *
                            </label>
                            <input
                              type="number"
                              value={question.marks}
                              onChange={(e) => {
                                const updated = [...theoryQuestions];
                                updated[index].marks = parseInt(e.target.value);
                                setTheoryQuestions(updated);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="1"
                              max="20"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Word Limit
                            </label>
                            <input
                              type="text"
                              value={question.wordLimit}
                              onChange={(e) => {
                                const updated = [...theoryQuestions];
                                updated[index].wordLimit = e.target.value;
                                setTheoryQuestions(updated);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., 100-150 words"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex space-x-3">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ← Basic Info
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : (editingExam ? 'Update Exam' : 'Create Exam')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamCreationForm;
