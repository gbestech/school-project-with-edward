import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { lessonAPI } from '@/services/TeacherLessonService';

// Enhanced Lesson interface based on the API
interface Lesson {
  id: number;
  title: string;
  description?: string;
  lesson_type: string;
  lesson_type_display: string;
  difficulty_level: string;
  difficulty_level_display: string;
  status: string;
  status_display: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  duration_formatted?: string;
  time_slot?: string;
  teacher_id: number;
  teacher_name: string;
  classroom_id: number;
  classroom_name: string;
  classroom_stream_name?: string;
  subject_id: number;
  subject_name: string;
  learning_objectives?: string[];
  materials_needed?: string[];
  teacher_notes?: string;
  completion_percentage: number;
  attendance_count?: number;
  requires_special_equipment: boolean;
  is_online_lesson: boolean;
  is_recurring: boolean;
  is_overdue: boolean;
  is_today: boolean;
  is_upcoming: boolean;
  can_start: boolean;
  can_complete: boolean;
  can_cancel: boolean;
  can_edit: boolean;
  can_delete: boolean;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at: string;
  updated_at: string;
}

interface TeacherLessonListProps {
  lessons: Lesson[];
  loading: boolean;
  error?: string | null;
  onStartLesson: (lessonId: number) => Promise<void>;
  onCompleteLesson: (lessonId: number) => Promise<void>;
  onCancelLesson: (lessonId: number) => Promise<void>;
  onDeleteLesson: (lessonId: number) => Promise<void>;
  onViewLesson: (lesson: Lesson) => void;
  onEditLesson: (lesson: Lesson) => void;
  onRefresh?: () => void;
  showFilters?: boolean;
  compactView?: boolean;
}

// Fixed and Enhanced TeacherLessonService
const TeacherLessonService = {
  getStatusColor: (status: string): string => {
    const statusColors: Record<string, string> = {
      'scheduled': 'blue',
      'in_progress': 'orange',
      'completed': 'green',
      'cancelled': 'red',
      'overdue': 'red',
      'draft': 'gray'
    };
    return statusColors[status.toLowerCase()] || 'gray';
  },

  getLessonTypeIcon: (lessonType: string): string => {
    const icons: Record<string, string> = {
      'lecture': '📚',
      'practical': '🔬',
      'tutorial': '💡',
      'assessment': '📝',
      'field_trip': '🚌',
      'online': '💻',
      'workshop': '🛠️'
    };
    return icons[lessonType.toLowerCase()] || '📖';
  },

  getLessonPriority: (lesson: Lesson): 'high' | 'medium' | 'low' | 'normal' => {
    if (lesson.is_overdue) return 'high';
    if (lesson.is_today) return 'medium';
    if (lesson.is_upcoming) return 'low';
    return 'normal';
  },

  formatTimeSlot: (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return 'Time not set';
    
    try {
      // Handle various time formats
      const formatTime = (timeStr: string): string => {
        // If it's already in HH:MM format
        if (timeStr.match(/^\d{2}:\d{2}$/)) {
          const [hours, minutes] = timeStr.split(':');
          const hour24 = parseInt(hours, 10);
          const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
          const ampm = hour24 < 12 ? 'AM' : 'PM';
          return `${hour12}:${minutes} ${ampm}`;
        }
        
        // If it's a full datetime string
        if (timeStr.includes('T') || timeStr.includes(' ')) {
          const date = new Date(timeStr);
          if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true
            });
          }
        }
        
        // Fallback: try to parse as time
        const date = new Date(`2000-01-01T${timeStr}`);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true
          });
        }
        
        return timeStr; // Return as-is if can't parse
      };

      const formattedStart = formatTime(startTime);
      const formattedEnd = formatTime(endTime);
      return `${formattedStart} - ${formattedEnd}`;
    } catch (error) {
      console.warn('Error formatting time slot:', error);
      return `${startTime} - ${endTime}`;
    }
  },

  formatDuration: (minutes: number): string => {
    if (!minutes || minutes <= 0) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  },

  canStartLesson: (lesson: Lesson): boolean => {
    return lesson.can_start && lesson.status.toLowerCase() === 'scheduled';
  },

  canCompleteLesson: (lesson: Lesson): boolean => {
    return lesson.can_complete && lesson.status.toLowerCase() === 'in_progress';
  },

  canCancelLesson: (lesson: Lesson): boolean => {
    return lesson.can_cancel && ['scheduled', 'in_progress'].includes(lesson.status.toLowerCase());
  },

  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  },

  getCompletionColor: (percentage: number): string => {
    if (percentage >= 100) return 'green';
    if (percentage >= 75) return 'blue';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 25) return 'orange';
    return 'red';
  }
};

const TeacherLessonList: React.FC<TeacherLessonListProps> = ({
  lessons = [], // Default to empty array
  loading = false,
  error = null,
  onStartLesson,
  onCompleteLesson,
  onCancelLesson,
  onDeleteLesson,
  onViewLesson,
  onEditLesson,
  onRefresh,
  showFilters = true,
  compactView = false
}) => {
  const { isDarkMode } = useGlobalTheme();
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});

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
    input: isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
  };

  // Enhanced filtering and sorting with null safety
  const filteredAndSortedLessons = useMemo(() => {
    if (!Array.isArray(lessons)) return [];
    
    let filtered = [...lessons];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lesson => {
        const searchableFields = [
          lesson.title,
          lesson.teacher_name,
          lesson.subject_name,
          lesson.classroom_name,
          lesson.description
        ];
        
        return searchableFields.some(field => 
          field?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(lesson => lesson.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(lesson => lesson.lesson_type === typeFilter);
    }

    // Apply sorting with null safety
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'teacher_name':
          aValue = a.teacher_name || '';
          bValue = b.teacher_name || '';
          break;
        case 'classroom_name':
          aValue = a.classroom_name || '';
          bValue = b.classroom_name || '';
          break;
        case 'subject_name':
          aValue = a.subject_name || '';
          bValue = b.subject_name || '';
          break;
        case 'date':
          aValue = new Date(a.date || 0);
          bValue = new Date(b.date || 0);
          break;
        case 'start_time':
          aValue = a.start_time || '';
          bValue = b.start_time || '';
          break;
        default:
          aValue = a[sortField as keyof Lesson] || '';
          bValue = b[sortField as keyof Lesson] || '';
      }

      // Handle comparison
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [lessons, searchTerm, statusFilter, typeFilter, sortField, sortDirection]);

  // Handle async actions with better error handling
  const handleAsyncAction = async (lessonId: number, action: string, actionFn: () => Promise<void>) => {
    setActionLoading(prev => ({ ...prev, [lessonId]: action }));
    try {
      await actionFn();
    } catch (error) {
      console.error(`Error performing ${action} on lesson ${lessonId}:`, error);
      // You might want to show a toast notification here
    } finally {
      setActionLoading(prev => {
        const { [lessonId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status badge with enhanced styling
  const getStatusBadge = (lesson: Lesson) => {
    const statusColor = TeacherLessonService.getStatusColor(lesson.status);
    const statusClasses = {
      blue: isDarkMode ? 'bg-blue-900 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200',
      orange: isDarkMode ? 'bg-orange-900 text-orange-300 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200',
      green: isDarkMode ? 'bg-green-900 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
      red: isDarkMode ? 'bg-red-900 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200',
      purple: isDarkMode ? 'bg-purple-900 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200',
      gray: isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200',
      yellow: isDarkMode ? 'bg-yellow-900 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    const colorClass = statusClasses[statusColor as keyof typeof statusClasses] || statusClasses.gray;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
        {lesson.status_display || lesson.status}
      </span>
    );
  };

  // Get priority indicator with null safety
  const getPriorityIndicator = (lesson: Lesson) => {
    if (lesson.is_overdue) {
      return (
        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
          <AlertTriangle size={14} />
          <span className="text-xs font-medium">Overdue</span>
        </div>
      );
    }
    
    if (lesson.is_today) {
      return (
        <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
          <Clock size={14} />
          <span className="text-xs font-medium">Today</span>
        </div>
      );
    }
    
    if (lesson.is_upcoming) {
      return (
        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
          <Calendar size={14} />
          <span className="text-xs font-medium">Upcoming</span>
        </div>
      );
    }
    
    return null;
  };

  // Enhanced action buttons with proper validation
  const getActionButtons = (lesson: Lesson) => {
    const buttons = [];
    const currentAction = actionLoading[lesson.id];

    // View button (always available)
    buttons.push(
      <button
        key="view"
        onClick={() => onViewLesson(lesson)}
        className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors hover:scale-105`}
        title="View Details"
        disabled={!!currentAction}
      >
        <Eye size={16} />
      </button>
    );

    // Edit button
    if (lesson.can_edit) {
      buttons.push(
        <button
          key="edit"
          onClick={() => onEditLesson(lesson)}
          className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors hover:scale-105`}
          title="Edit Lesson"
          disabled={!!currentAction}
        >
          <Edit size={16} />
        </button>
      );
    }

    // Start button
    if (TeacherLessonService.canStartLesson(lesson)) {
      buttons.push(
        <button
          key="start"
          onClick={() => handleAsyncAction(lesson.id, 'start', () => onStartLesson(lesson.id))}
          className={`p-2 rounded-lg ${themeClasses.buttonSuccess} transition-colors hover:scale-105 disabled:opacity-50`}
          title="Start Lesson"
          disabled={!!currentAction}
        >
          {currentAction === 'start' ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
        </button>
      );
    }

    // Complete button
    if (TeacherLessonService.canCompleteLesson(lesson)) {
      buttons.push(
        <button
          key="complete"
          onClick={() => handleAsyncAction(lesson.id, 'complete', () => onCompleteLesson(lesson.id))}
          className={`p-2 rounded-lg ${themeClasses.buttonSuccess} transition-colors hover:scale-105 disabled:opacity-50`}
          title="Complete Lesson"
          disabled={!!currentAction}
        >
          {currentAction === 'complete' ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <CheckCircle size={16} />
          )}
        </button>
      );
    }

    // Cancel button
    if (TeacherLessonService.canCancelLesson(lesson)) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleAsyncAction(lesson.id, 'cancel', () => onCancelLesson(lesson.id))}
          className={`p-2 rounded-lg ${themeClasses.buttonWarning} transition-colors hover:scale-105 disabled:opacity-50`}
          title="Cancel Lesson"
          disabled={!!currentAction}
        >
          {currentAction === 'cancel' ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <XCircle size={16} />
          )}
        </button>
      );
    }

    // Delete button
    if (lesson.can_delete) {
      buttons.push(
        <button
          key="delete"
          onClick={() => handleAsyncAction(lesson.id, 'delete', () => onDeleteLesson(lesson.id))}
          className={`p-2 rounded-lg ${themeClasses.buttonDanger} transition-colors hover:scale-105 disabled:opacity-50`}
          title="Delete Lesson"
          disabled={!!currentAction}
        >
          {currentAction === 'delete' ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      );
    }

    return buttons;
  };

  // Get unique values for filters with null safety
  const getUniqueStatuses = () => {
    if (!Array.isArray(lessons)) return [];
    
    const statuses = new Set(lessons.map(lesson => lesson.status).filter(Boolean));
    return Array.from(statuses).map(status => ({
      value: status,
      label: lessons.find(l => l.status === status)?.status_display || status
    }));
  };

  const getUniqueTypes = () => {
    if (!Array.isArray(lessons)) return [];
    
    const types = new Set(lessons.map(lesson => lesson.lesson_type).filter(Boolean));
    return Array.from(types).map(type => ({
      value: type,
      label: lessons.find(l => l.lesson_type === type)?.lesson_type_display || type
    }));
  };

  // Sortable header component
  const SortableHeader = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
        sortField === field ? 'text-blue-600 dark:text-blue-400' : ''
      }`}
    >
      <span>{label}</span>
      {sortField === field ? (
        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      ) : (
        <div className="w-4 h-4" />
      )}
    </button>
  );

  // Error state
  if (error) {
    return (
      <div className={`${themeClasses.bgCard} rounded-xl p-8 text-center border ${themeClasses.border}`}>
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>
          Error Loading Lessons
        </h3>
        <p className={`${themeClasses.textSecondary} mb-4`}>
          {error}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className={`ml-3 ${themeClasses.textSecondary}`}>Loading lessons...</span>
      </div>
    );
  }

  // Empty state
  if (filteredAndSortedLessons.length === 0) {
    return (
      <div className={`${themeClasses.bgCard} rounded-xl p-8 text-center border ${themeClasses.border}`}>
        <BookOpen size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
        <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>
          {searchTerm || statusFilter || typeFilter ? 'No Matching Lessons' : 'No Lessons Found'}
        </h3>
        <p className={`${themeClasses.textSecondary} mb-4`}>
          {searchTerm || statusFilter || typeFilter 
            ? 'No lessons match your current filters. Try adjusting your search criteria.'
            : 'No lessons are available. Create a new lesson to get started.'
          }
        </p>
        {(searchTerm || statusFilter || typeFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
            }}
            className={`px-4 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      {showFilters && (
        <div className={`${themeClasses.bgCard} rounded-xl p-4 border ${themeClasses.border}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconSecondary}`} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">All Statuses</option>
              {getUniqueStatuses().map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors flex items-center justify-center space-x-2`}
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lessons Table */}
      <div className={`${themeClasses.bgCard} rounded-xl shadow-lg border ${themeClasses.border} overflow-hidden w-full`}>
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className={`px-6 py-4 border-b ${themeClasses.border} ${themeClasses.bgSecondary}`}>
            <div className={`grid ${compactView ? 'grid-cols-8' : 'grid-cols-12'} gap-4 items-center min-w-[1200px]`}>
              <div className="col-span-2">
                <SortableHeader field="title" label="Lesson" />
              </div>
              {!compactView && (
                <div className="col-span-2">
                  <SortableHeader field="teacher_name" label="Teacher" />
                </div>
              )}
              <div className="col-span-1">
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
              <div className="col-span-2">
                <span>Actions</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className={`divide-y ${themeClasses.border}`}>
            {filteredAndSortedLessons.map((lesson) => (
              <div key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                {/* Main Row */}
                <div className="px-6 py-4">
                  <div className={`grid ${compactView ? 'grid-cols-8' : 'grid-cols-12'} gap-4 items-center min-w-[1200px]`}>
                    {/* Lesson Title */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {TeacherLessonService.getLessonTypeIcon(lesson.lesson_type)}
                        </span>
                        <div>
                          <h3 className={`font-medium ${themeClasses.textPrimary} hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer`}>
                            {lesson.title}
                          </h3>
                          <p className={`text-sm ${themeClasses.textTertiary} group-hover:text-gray-700 dark:group-hover:text-gray-300 truncate`}>
                            {lesson.lesson_type_display} • {lesson.difficulty_level_display}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Teacher (only in full view) */}
                    {!compactView && (
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className={themeClasses.iconSecondary} />
                          <span className={`${themeClasses.textSecondary} group-hover:text-gray-900 dark:group-hover:text-white truncate`}>
                            {lesson.teacher_name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Classroom */}
                    <div className="col-span-1">
                      <span className={`${themeClasses.textSecondary} group-hover:text-gray-900 dark:group-hover:text-white truncate`}>
                        {lesson.classroom_name}
                      </span>
                    </div>

                    {/* Subject */}
                    <div className="col-span-1">
                      <span className={`${themeClasses.textSecondary} group-hover:text-gray-900 dark:group-hover:text-white truncate`}>
                        {lesson.subject_name}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-1">
                      <div className="flex flex-col">
                        <span className={`text-sm ${themeClasses.textSecondary} group-hover:text-gray-900 dark:group-hover:text-white`}>
                          {new Date(lesson.date).toLocaleDateString()}
                        </span>
                        {getPriorityIndicator(lesson)}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="col-span-1">
                      <div className="flex flex-col">
                        <span className={`text-sm ${themeClasses.textSecondary} group-hover:text-gray-900 dark:group-hover:text-white`}>
                          {lesson.time_slot || TeacherLessonService.formatTimeSlot(lesson.start_time, lesson.end_time)}
                        </span>
                        <span className={`text-xs ${themeClasses.textTertiary} group-hover:text-gray-700 dark:group-hover:text-gray-300`}>
                          {lesson.duration_formatted || TeacherLessonService.formatDuration(lesson.duration_minutes)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <div className="space-y-2">
                        {getStatusBadge(lesson)}
                        {lesson.status === 'in_progress' && (
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                            <div 
                              className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${lesson.completion_percentage || 0}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-1">
                        {getActionButtons(lesson)}
                        <button
                          onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                          className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors hover:scale-105`}
                          title="More Details"
                        >
                          {expandedLesson === lesson.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Expanded Details */}
                {expandedLesson === lesson.id && (
                  <div className={`px-6 py-4 ${themeClasses.bgSecondary} border-t ${themeClasses.border}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Description */}
                      <div>
                        <h4 className={`font-medium ${themeClasses.textPrimary} mb-2 flex items-center space-x-2`}>
                          <FileText size={16} />
                          <span>Description</span>
                        </h4>
                        <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}>
                          {lesson.description || 'No description provided'}
                        </p>
                      </div>

                      {/* Learning Objectives */}
                      <div>
                        <h4 className={`font-medium ${themeClasses.textPrimary} mb-2 flex items-center space-x-2`}>
                          <BookOpen size={16} />
                          <span>Learning Objectives</span>
                        </h4>
                        {lesson.learning_objectives && lesson.learning_objectives.length > 0 ? (
                          <ul className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                            {lesson.learning_objectives.map((objective, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                                <span className="leading-relaxed">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={`text-sm ${themeClasses.textTertiary} italic`}>No objectives set</p>
                        )}
                      </div>

                      {/* Materials Needed */}
                      <div>
                        <h4 className={`font-medium ${themeClasses.textPrimary} mb-2 flex items-center space-x-2`}>
                          <Users size={16} />
                          <span>Materials Needed</span>
                        </h4>
                        {lesson.materials_needed && lesson.materials_needed.length > 0 ? (
                          <ul className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                            {lesson.materials_needed.map((material, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0">•</span>
                                <span className="leading-relaxed">{material}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={`text-sm ${themeClasses.textTertiary} italic`}>No materials specified</p>
                        )}
                      </div>

                      {/* Progress and Timing */}
                      <div>
                        <h4 className={`font-medium ${themeClasses.textPrimary} mb-2 flex items-center space-x-2`}>
                          <Clock size={16} />
                          <span>Progress & Timing</span>
                        </h4>
                        <div className="space-y-3">
                          {/* Completion Progress */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className={themeClasses.textSecondary}>Completion</span>
                              <span className={themeClasses.textPrimary}>{lesson.completion_percentage || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${lesson.completion_percentage || 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Timing Info */}
                          <div className="text-sm space-y-1">
                            {lesson.actual_start_time && (
                              <div className="flex justify-between">
                                <span className={themeClasses.textSecondary}>Started:</span>
                                <span className={themeClasses.textPrimary}>
                                  {new Date(lesson.actual_start_time).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            )}
                            {lesson.actual_end_time && (
                              <div className="flex justify-between">
                                <span className={themeClasses.textSecondary}>Ended:</span>
                                <span className={themeClasses.textPrimary}>
                                  {new Date(lesson.actual_end_time).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Teacher Notes */}
                      <div>
                        <h4 className={`font-medium ${themeClasses.textPrimary} mb-2 flex items-center space-x-2`}>
                          <Edit size={16} />
                          <span>Teacher Notes</span>
                        </h4>
                        <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}>
                          {lesson.teacher_notes || 'No notes added'}
                        </p>
                      </div>

                      {/* Additional Information */}
                      <div>
                        <h4 className={`font-medium ${themeClasses.textPrimary} mb-2 flex items-center space-x-2`}>
                          <AlertTriangle size={16} />
                          <span>Additional Info</span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className={themeClasses.textSecondary}>Special Equipment:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              lesson.requires_special_equipment 
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {lesson.requires_special_equipment ? 'Required' : 'Not Required'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={themeClasses.textSecondary}>Online Lesson:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              lesson.is_online_lesson 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {lesson.is_online_lesson ? 'Online' : 'In-Person'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={themeClasses.textSecondary}>Recurring:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              lesson.is_recurring 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {lesson.is_recurring ? 'Recurring' : 'One-time'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={themeClasses.textSecondary}>Attendance:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>
                              {lesson.attendance_count || 0} students
                            </span>
                          </div>
                          {compactView && (
                            <div className="flex justify-between items-center">
                              <span className={themeClasses.textSecondary}>Teacher:</span>
                              <span className={themeClasses.textPrimary}>
                                {lesson.teacher_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons in Expanded View */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => onViewLesson(lesson)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors hover:scale-105`}
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                        
                        {lesson.can_edit && (
                          <button
                            onClick={() => onEditLesson(lesson)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors hover:scale-105`}
                          >
                            <Edit size={16} />
                            <span>Edit Lesson</span>
                          </button>
                        )}

                        {/* Quick Report Download */}
                        <button
                          onClick={async () => {
                            try {
                              await lessonAPI.downloadLessonReport(lesson.id);
                            } catch (error) {
                              console.error('Error downloading report:', error);
                            }
                          }}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors hover:scale-105`}
                        >
                          <Download size={16} />
                          <span>Download Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`text-sm ${themeClasses.textSecondary} text-center`}>
        Showing {filteredAndSortedLessons.length} of {lessons.length} lessons
        {(searchTerm || statusFilter || typeFilter) && (
          <span> (filtered)</span>
        )}
      </div>
    </div>
  );
};

export default TeacherLessonList;