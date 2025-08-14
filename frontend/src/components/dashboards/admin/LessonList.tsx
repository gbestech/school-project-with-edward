import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Calendar,
  BookOpen,
  Users,
  AlertTriangle,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { Lesson, LessonService } from '../../../services/LessonService';

interface LessonListProps {
  lessons: Lesson[];
  onStartLesson: (lessonId: number) => void;
  onCompleteLesson: (lessonId: number) => void;
  onCancelLesson: (lessonId: number) => void;
  onDeleteLesson: (lessonId: number) => void;
  onViewLesson: (lesson: Lesson) => void;
  onEditLesson: (lesson: Lesson) => void;
  loading: boolean;
}

const LessonList: React.FC<LessonListProps> = ({
  lessons,
  onStartLesson,
  onCompleteLesson,
  onCancelLesson,
  onDeleteLesson,
  onViewLesson,
  onEditLesson,
  loading
}) => {
  const { isDarkMode } = useGlobalTheme();
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Theme classes
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
    buttonPrimary: isDarkMode 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode 
      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    buttonSuccess: isDarkMode 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-green-600 hover:bg-green-700 text-white',
    buttonDanger: isDarkMode 
      ? 'bg-red-600 hover:bg-red-700 text-white' 
      : 'bg-red-600 hover:bg-red-700 text-white',
    buttonWarning: isDarkMode 
      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
      : 'bg-orange-600 hover:bg-orange-700 text-white',
  };

  // Sort lessons - ensure lessons is an array
  const lessonsArray = Array.isArray(lessons) ? lessons : [];
  const sortedLessons = [...lessonsArray].sort((a, b) => {
    let aValue: any = a[sortField as keyof Lesson];
    let bValue: any = b[sortField as keyof Lesson];

    // Handle nested properties
    if (sortField === 'teacher_name') {
      aValue = a.teacher_name;
      bValue = b.teacher_name;
    } else if (sortField === 'classroom_name') {
      aValue = a.classroom_name;
      bValue = b.classroom_name;
    } else if (sortField === 'subject_name') {
      aValue = a.subject_name;
      bValue = b.subject_name;
    }

    // Handle date sorting
    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status badge
  const getStatusBadge = (lesson: Lesson) => {
    const statusColors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      postponed: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    const color = statusColors[lesson.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        {lesson.status_display}
      </span>
    );
  };

  // Get priority indicator
  const getPriorityIndicator = (lesson: Lesson) => {
    if (lesson.is_overdue) {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertTriangle size={14} />
          <span className="text-xs font-medium">Overdue</span>
        </div>
      );
    }
    
    if (lesson.is_today) {
      return (
        <div className="flex items-center space-x-1 text-orange-600">
          <Clock size={14} />
          <span className="text-xs font-medium">Today</span>
        </div>
      );
    }
    
    if (lesson.is_upcoming) {
      return (
        <div className="flex items-center space-x-1 text-blue-600">
          <Calendar size={14} />
          <span className="text-xs font-medium">Upcoming</span>
        </div>
      );
    }
    
    return null;
  };

  // Get action buttons
  const getActionButtons = (lesson: Lesson) => {
    const buttons = [];

    // View button
    buttons.push(
      <button
        key="view"
        onClick={() => onViewLesson(lesson)}
        className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
        title="View Details"
      >
        <Eye size={16} />
      </button>
    );

    // Edit button
    buttons.push(
      <button
        key="edit"
        onClick={() => onEditLesson(lesson)}
        className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
        title="Edit Lesson"
      >
        <Edit size={16} />
      </button>
    );

    // Action buttons based on status
    if (lesson.can_start) {
      buttons.push(
        <button
          key="start"
          onClick={() => onStartLesson(lesson.id)}
          className={`p-2 rounded-lg ${themeClasses.buttonSuccess} transition-colors`}
          title="Start Lesson"
        >
          <Play size={16} />
        </button>
      );
    }

    if (lesson.can_complete) {
      buttons.push(
        <button
          key="complete"
          onClick={() => onCompleteLesson(lesson.id)}
          className={`p-2 rounded-lg ${themeClasses.buttonSuccess} transition-colors`}
          title="Complete Lesson"
        >
          <CheckCircle size={16} />
        </button>
      );
    }

    if (lesson.can_cancel) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => onCancelLesson(lesson.id)}
          className={`p-2 rounded-lg ${themeClasses.buttonWarning} transition-colors`}
          title="Cancel Lesson"
        >
          <XCircle size={16} />
        </button>
      );
    }

    // Delete button
    buttons.push(
      <button
        key="delete"
        onClick={() => onDeleteLesson(lesson.id)}
        className={`p-2 rounded-lg ${themeClasses.buttonDanger} transition-colors`}
        title="Delete Lesson"
      >
        <Trash2 size={16} />
      </button>
    );

    return buttons;
  };

  // Sortable header
  const SortableHeader = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
    >
      <span>{label}</span>
      {sortField === field ? (
        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      ) : (
        <div className="w-4 h-4" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!Array.isArray(lessons) || lessons.length === 0) {
    return (
      <div className={`${themeClasses.bgCard} rounded-xl p-8 text-center border ${themeClasses.border}`}>
        <BookOpen size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
        <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>
          No Lessons Found
        </h3>
        <p className={`${themeClasses.textSecondary}`}>
          No lessons match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.bgCard} rounded-xl shadow-lg border ${themeClasses.border} overflow-hidden`}>
      {/* Table Header */}
      <div className={`px-6 py-4 border-b ${themeClasses.border} ${themeClasses.bgSecondary}`}>
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3">
            <SortableHeader field="title" label="Lesson" />
          </div>
          <div className="col-span-2">
            <SortableHeader field="teacher_name" label="Teacher" />
          </div>
          <div className="col-span-2">
            <SortableHeader field="classroom_name" label="Classroom" />
          </div>
          <div className="col-span-1">
            <SortableHeader field="subject_name" label="Subject" />
          </div>
          <div className="col-span-1">
            <SortableHeader field="date" label="Date" />
          </div>
          <div className="col-span-1">
            <SortableHeader field="start_time" label="Time" />
          </div>
          <div className="col-span-1">
            <span>Status</span>
          </div>
          <div className="col-span-1">
            <span>Actions</span>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {sortedLessons.map((lesson) => (
          <div key={lesson.id} className="hover:bg-gray-50 transition-colors">
            {/* Main Row */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Lesson Title */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg ${LessonService.getLessonTypeIcon(lesson.lesson_type)}`}>
                      {LessonService.getLessonTypeIcon(lesson.lesson_type)}
                    </span>
                    <div>
                      <h3 className={`font-medium ${themeClasses.textPrimary} hover:text-blue-600 cursor-pointer`}>
                        {lesson.title}
                      </h3>
                      <p className={`text-sm ${themeClasses.textTertiary} truncate`}>
                        {lesson.lesson_type_display} • {lesson.difficulty_level_display}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teacher */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className={themeClasses.iconSecondary} />
                    <span className={`${themeClasses.textSecondary} truncate`}>
                      {lesson.teacher_name}
                    </span>
                  </div>
                </div>

                {/* Classroom */}
                <div className="col-span-2">
                  <span className={`${themeClasses.textSecondary} truncate`}>
                    {lesson.classroom_name}
                  </span>
                </div>

                {/* Subject */}
                <div className="col-span-1">
                  <span className={`${themeClasses.textSecondary} truncate`}>
                    {lesson.subject_name}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-1">
                  <div className="flex flex-col">
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      {new Date(lesson.date).toLocaleDateString()}
                    </span>
                    {getPriorityIndicator(lesson)}
                  </div>
                </div>

                {/* Time */}
                <div className="col-span-1">
                  <div className="flex flex-col">
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      {lesson.time_slot}
                    </span>
                    <span className={`text-xs ${themeClasses.textTertiary}`}>
                      {lesson.duration_formatted}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  {getStatusBadge(lesson)}
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    {getActionButtons(lesson)}
                    <button
                      onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                      className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
                      title="More Details"
                    >
                      {expandedLesson === lesson.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedLesson === lesson.id && (
              <div className={`px-6 py-4 ${themeClasses.bgSecondary} border-t ${themeClasses.border}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Description */}
                  <div>
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>Description</h4>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      {lesson.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>Learning Objectives</h4>
                    {lesson.learning_objectives && lesson.learning_objectives.length > 0 ? (
                      <ul className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                        {Array.isArray(lesson.learning_objectives) && lesson.learning_objectives.map((objective, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-sm ${themeClasses.textTertiary}`}>No objectives set</p>
                    )}
                  </div>

                  {/* Materials Needed */}
                  <div>
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>Materials Needed</h4>
                    {lesson.materials_needed && lesson.materials_needed.length > 0 ? (
                      <ul className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                        {Array.isArray(lesson.materials_needed) && lesson.materials_needed.map((material, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-orange-600 mt-1">•</span>
                            <span>{material}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-sm ${themeClasses.textTertiary}`}>No materials specified</p>
                    )}
                  </div>

                  {/* Progress */}
                  <div>
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={themeClasses.textSecondary}>Completion</span>
                        <span className={themeClasses.textPrimary}>{lesson.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${lesson.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Notes */}
                  <div>
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>Teacher Notes</h4>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                      {lesson.teacher_notes || 'No notes added'}
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>Additional Info</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>Special Equipment:</span>
                        <span className={themeClasses.textPrimary}>
                          {lesson.requires_special_equipment ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>Online Lesson:</span>
                        <span className={themeClasses.textPrimary}>
                          {lesson.is_online_lesson ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={themeClasses.textSecondary}>Recurring:</span>
                        <span className={themeClasses.textPrimary}>
                          {lesson.is_recurring ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonList;
