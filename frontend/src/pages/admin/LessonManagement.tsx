import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  BookOpen, 
  Plus, 
  Search, 
  Play,
  CheckCircle,
  CalendarDays,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useGlobalTheme } from '../../contexts/GlobalThemeContext';
import LessonList from '../../components/dashboards/admin/LessonList';
import AddLessonForm from '../../components/dashboards/admin/AddLessonForm';
import EditLessonForm from '../../components/dashboards/admin/EditLessonForm';
import LessonViewModal from '../../components/dashboards/admin/LessonViewModal';
import LessonCalendar from '../../components/dashboards/admin/LessonCalendar';
import LessonStatisticsComponent from '../../components/dashboards/admin/LessonStatistics';
import { LessonService, type Lesson, type LessonStatistics } from '../../services/LessonService';

const LessonManagement: React.FC = () => {
  const { theme, isDarkMode } = useGlobalTheme();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [statistics, setStatistics] = useState<LessonStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'statistics'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [teacherFilter, setTeacherFilter] = useState<number | null>(null);
  const [classroomFilter, setClassroomFilter] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<number | null>(null);

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
  };

  // Load lessons and statistics
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [lessonsData, statsData] = await Promise.all([
        LessonService.getLessons({
          search: searchTerm,
          status_filter: statusFilter !== 'all' ? statusFilter : undefined,
          date_filter: dateFilter !== 'all' ? dateFilter : undefined,
          teacher_id: teacherFilter || undefined,
          classroom_id: classroomFilter || undefined,
          subject_id: subjectFilter || undefined,
        }),
        LessonService.getStatistics()
      ]);
      
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      const safeStatsData = statsData || {
        total_lessons: 0,
        completed_lessons: 0,
        scheduled_lessons: 0,
        in_progress_lessons: 0,
        cancelled_lessons: 0,
        avg_completion_percentage: 0,
        upcoming_lessons: 0,
        overdue_lessons: 0,
        lessons_by_type: [],
        lessons_by_status: []
      };
      
      // Ensure arrays are always arrays
      safeStatsData.lessons_by_type = Array.isArray(safeStatsData.lessons_by_type) ? safeStatsData.lessons_by_type : [];
      safeStatsData.lessons_by_status = Array.isArray(safeStatsData.lessons_by_status) ? safeStatsData.lessons_by_status : [];
      
      setStatistics(safeStatsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lessons');
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, dateFilter, teacherFilter, classroomFilter, subjectFilter]);

  // Handle lesson actions
  const handleStartLesson = async (lessonId: number) => {
    try {
      await LessonService.startLesson(lessonId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start lesson');
    }
  };

  const handleCompleteLesson = async (lessonId: number) => {
    try {
      await LessonService.completeLesson(lessonId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete lesson');
    }
  };

  const handleCancelLesson = async (lessonId: number) => {
    try {
      await LessonService.cancelLesson(lessonId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await LessonService.deleteLesson(lessonId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson');
    }
  };

  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowViewModal(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowEditForm(true);
  };

  const handleAddLesson = () => {
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowViewModal(false);
    setSelectedLesson(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadData(); // Refresh data
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'postponed', label: 'Postponed' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this_week', label: 'This Week' },
    { value: 'next_week', label: 'Next Week' },
    { value: 'overdue', label: 'Overdue' },
  ];

  if (loading && lessons.length === 0) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPrimary} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bgPrimary} p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} mb-2`}>
              Lesson Management
            </h1>
            <p className={`text-lg ${themeClasses.textSecondary}`}>
              Schedule, manage, and track all classroom lessons
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadData()}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            
            <button
              onClick={handleAddLesson}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
            >
              <Plus size={20} />
              <span>Add Lesson</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Lessons</p>
                  <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.total_lessons}</p>
                </div>
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                  <BookOpen size={24} className={themeClasses.iconPrimary} />
                </div>
              </div>
            </div>

            <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Completed</p>
                  <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.completed_lessons}</p>
                </div>
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Scheduled</p>
                  <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.scheduled_lessons}</p>
                </div>
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-900' : 'bg-orange-100'}`}>
                  <Clock size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} transition-all duration-300 hover:shadow-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>In Progress</p>
                  <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.in_progress_lessons}</p>
                </div>
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                  <Play size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border} mb-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
              }`}
            >
              <BookOpen size={16} />
              <span>List</span>
            </button>
            
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
              }`}
            >
              <CalendarDays size={16} />
              <span>Calendar</span>
            </button>
            
            <button
              onClick={() => setViewMode('statistics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'statistics' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
              }`}
            >
              <BarChart3 size={16} />
              <span>Statistics</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconSecondary}`} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg bg-red-100 border border-red-300 ${isDarkMode ? 'bg-red-900 border-red-700' : ''}`}>
          <p className={`text-red-700 ${isDarkMode ? 'text-red-300' : ''}`}>{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {viewMode === 'list' && (
          <LessonList
            lessons={lessons}
            onStartLesson={handleStartLesson}
            onCompleteLesson={handleCompleteLesson}
            onCancelLesson={handleCancelLesson}
            onDeleteLesson={handleDeleteLesson}
            onViewLesson={handleViewLesson}
            onEditLesson={handleEditLesson}
            loading={loading}
          />
        )}

        {viewMode === 'calendar' && (
          <LessonCalendar
            lessons={lessons}
            onViewLesson={handleViewLesson}
            onEditLesson={handleEditLesson}
            loading={loading}
          />
        )}

                    {viewMode === 'statistics' && statistics && (
              <LessonStatisticsComponent
                statistics={statistics}
                lessons={lessons}
              />
            )}
      </div>

      {/* Modals */}
      {showAddForm && (
        <AddLessonForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showEditForm && selectedLesson && (
        <EditLessonForm
          lesson={selectedLesson}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showViewModal && selectedLesson && (
        <LessonViewModal
          lesson={selectedLesson}
          onClose={handleFormClose}
          onEdit={() => {
            setShowViewModal(false);
            handleEditLesson(selectedLesson);
          }}
        />
      )}
    </div>
  );
};

export default LessonManagement;
