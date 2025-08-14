import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  BookOpen,
  Target,
  AlertTriangle,
  CheckCircle,
  Play,
  XCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { Lesson, LessonService } from '../../../services/LessonService';

interface LessonCalendarProps {
  lessons: Lesson[];
  onViewLesson: (lesson: Lesson) => void;
  onEditLesson: (lesson: Lesson) => void;
  loading: boolean;
}

const LessonCalendar: React.FC<LessonCalendarProps> = ({ lessons, onViewLesson, onEditLesson, loading }) => {
  const { isDarkMode } = useGlobalTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
  };

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let filtered = Array.isArray(lessons) ? lessons : [];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(lesson => lesson.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [lessons, filterStatus, searchTerm]);

  // Get lessons for a specific date
  const getLessonsForDate = (date: Date) => {
    return filteredLessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate.toDateString() === date.toDateString();
    });
  };

  // Get status color
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

  // Get priority indicator
  const getPriorityIndicator = (lesson: Lesson) => {
    if (lesson.is_overdue) return 'bg-red-500';
    if (lesson.is_today) return 'bg-orange-500';
    if (lesson.is_upcoming) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Check if date is today
  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  // Check if date is current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.bgCard} rounded-xl shadow-lg border ${themeClasses.border} overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 border-b ${themeClasses.border} ${themeClasses.bgSecondary}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon size={24} className={themeClasses.iconPrimary} />
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>Lesson Calendar</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className={`px-4 py-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
            >
              Today
            </button>
            <button
              onClick={goToPreviousMonth}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextMonth}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Month/Year Display */}
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconSecondary}`} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgPrimary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgPrimary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`p-3 text-center font-semibold ${themeClasses.textSecondary}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((date, index) => {
            const dayLessons = getLessonsForDate(date);
            const isCurrentDay = isToday(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border ${themeClasses.border} ${
                  isCurrentDay 
                    ? 'bg-blue-50 border-blue-300' 
                    : isCurrentMonthDay 
                      ? themeClasses.bgPrimary 
                      : `${themeClasses.bgSecondary} opacity-50`
                } hover:bg-opacity-80 transition-colors cursor-pointer`}
                onClick={() => setSelectedDate(date)}
              >
                {/* Date Number */}
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentDay 
                    ? 'text-blue-600 font-bold' 
                    : isCurrentMonthDay 
                      ? themeClasses.textPrimary 
                      : themeClasses.textTertiary
                }`}>
                  {date.getDate()}
                </div>

                {/* Lessons */}
                <div className="space-y-1">
                  {dayLessons.slice(0, 3).map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className={`p-1 rounded text-xs cursor-pointer transition-all duration-200 hover:scale-105 ${
                        getStatusColor(lesson.status)
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLesson(lesson);
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityIndicator(lesson)}`}></div>
                        <span className="truncate font-medium">{lesson.title}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1 opacity-75">
                        <Clock size={10} />
                        <span className="text-xs">{lesson.time_slot}</span>
                      </div>
                    </div>
                  ))}
                  
                  {dayLessons.length > 3 && (
                    <div className={`text-xs ${themeClasses.textTertiary} text-center py-1`}>
                      +{dayLessons.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className={`p-6 border-t ${themeClasses.border} ${themeClasses.bgSecondary}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
            >
              <XCircle size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {getLessonsForDate(selectedDate).length > 0 ? (
              getLessonsForDate(selectedDate).map(lesson => (
                <div
                  key={lesson.id}
                  className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.bgPrimary} hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen size={16} className={themeClasses.iconPrimary} />
                      <h4 className={`font-semibold ${themeClasses.textPrimary}`}>{lesson.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lesson.status)}`}>
                        {lesson.status_display}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onViewLesson(lesson)}
                          className={`p-1 rounded ${themeClasses.buttonSecondary} transition-colors`}
                          title="View Details"
                        >
                          <Target size={14} />
                        </button>
                        <button
                          onClick={() => onEditLesson(lesson)}
                          className={`p-1 rounded ${themeClasses.buttonSecondary} transition-colors`}
                          title="Edit Lesson"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users size={14} className={themeClasses.iconSecondary} />
                      <span className={themeClasses.textSecondary}>{lesson.teacher_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} className={themeClasses.iconSecondary} />
                      <span className={themeClasses.textSecondary}>{lesson.time_slot}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen size={14} className={themeClasses.iconSecondary} />
                      <span className={themeClasses.textSecondary}>{lesson.subject_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target size={14} className={themeClasses.iconSecondary} />
                      <span className={themeClasses.textSecondary}>{lesson.classroom_name}</span>
                    </div>
                  </div>
                  
                  {lesson.description && (
                    <p className={`text-sm ${themeClasses.textSecondary} mt-2 line-clamp-2`}>
                      {lesson.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarIcon size={48} className={`mx-auto mb-4 ${themeClasses.iconSecondary}`} />
                <p className={`${themeClasses.textSecondary} mb-4`}>No lessons scheduled for this date</p>
                <button className={`px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}>
                  <Plus size={16} className="mr-2" />
                  Schedule Lesson
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`p-4 border-t ${themeClasses.border} ${themeClasses.bgSecondary}`}>
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className={themeClasses.textSecondary}>Upcoming</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className={themeClasses.textSecondary}>Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className={themeClasses.textSecondary}>Overdue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className={themeClasses.textSecondary}>Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCalendar;
