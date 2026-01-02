
import React from 'react';
import { X, User, BookOpen, Calendar, Award, CheckCircle, Edit, Archive } from 'lucide-react';
import { StudentResult } from '@/types/types';

interface ViewResultModalProps {
  result: StudentResult;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (result: StudentResult) => void;
}

const ViewResultModal: React.FC<ViewResultModalProps> = ({
  result,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen) return null;

  const isSeniorSecondary = result.education_level === 'SENIOR_SECONDARY';

  const getStatusBadge = (status: string = 'DRAFT') => {
    const STATUS_CONFIG = {
      DRAFT: { color: 'bg-yellow-100 text-yellow-800', icon: Edit },
      PUBLISHED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      ARCHIVED: { color: 'bg-gray-100 text-gray-800', icon: Archive },
    } as const;

    const upper = (status || 'DRAFT').toString().toUpperCase() as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[upper] ?? STATUS_CONFIG.DRAFT;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {upper}
      </span>
    );
  };

  const getGradeColor = (grade?: string) => {
    const map: Record<string, string> = {
      A: 'text-green-600 bg-green-100',
      B: 'text-blue-600 bg-blue-100',
      C: 'text-yellow-600 bg-yellow-100',
      D: 'text-orange-600 bg-orange-100',
      F: 'text-red-600 bg-red-100',
    };
    return map[(grade || '').toUpperCase()] || 'text-gray-600 bg-gray-100';
  };

  const formatEducationLevel = (level: string) => {
    return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal - Constrained to viewport height */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Student Result Details
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(result)}
                className="flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Student Information - Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Student Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 mr-3">
                  {result.student.profile_picture ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={result.student.profile_picture}
                      alt={result.student.full_name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {result.student.full_name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Reg: {result.student.registration_number}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatEducationLevel(result.education_level)}
                  </p>
                </div>
              </div>
            </div>

            {/* Subject & Session Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <BookOpen className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Subject</span>
                </div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                  {result.subject.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {result.subject.code}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Session</span>
                </div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 truncate">
                  {result.exam_session.academic_session}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {result.exam_session.term} Term - {result.exam_session.academic_session}
                </p>
              </div>
            </div>
          </div>

          {/* Scores Section - Compact */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Score Breakdown
            </h4>

            {isSeniorSecondary ? (
              // Senior Secondary - More compact
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Test 1</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {result.first_test_score}
                  </p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Test 2</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {result.second_test_score}
                  </p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Test 3</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {result.third_test_score}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">CA Total</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {result.ca_score ?? result.ca_total}
                  </p>
                </div>
              </div>
            ) : (
              // Primary/Junior Secondary - More compact
              <div className="grid grid-cols-6 gap-2 mb-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">CA</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {result.continuous_assessment_score}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Project</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {result.project_score}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Take Home</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {result.take_home_test_score}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Practical</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {result.practical_score}
                  </p>
                </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Appearance</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {result.appearance_score}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {result.note_copying_score}
                  </p>
                </div>
              </div>
            )}

            {/* Final Scores - Compact */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">CA Score</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {result.ca_score ?? result.ca_total}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Exam Score</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {result.exam_score}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.total_score}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-3 h-3 mr-1 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Grade</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getGradeColor(result.grade)}`}>
                  {result.grade ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Status and Metadata - Compact */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">Status:</span>
                {getStatusBadge(result.status)}
              </div>
              
              {(result.created_at || result.updated_at) && (
                <div className="text-right">
                  {result.created_at && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(result.created_at).toLocaleDateString()}
                    </p>
                  )}
                  {result.updated_at && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated: {new Date(result.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {result.remarks && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Remarks</p>
                <p className="text-sm text-gray-900 dark:text-white">{result.teacher_remark}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResultModal;