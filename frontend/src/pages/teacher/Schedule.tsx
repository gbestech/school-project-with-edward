import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, CheckCircle, Clock, RefreshCw, CalendarDays, BarChart3, Plus, Search } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherLessonList from '@/components/dashboards/teacher/TeacherLessonList';
import TeacherLessonView from '@/components/dashboards/teacher/TeacherLessonView';
import TeacherAddLesson from '@/components/dashboards/teacher/TeacherAddLesson';
import EditLessonForm from '@/components/dashboards/teacher/TeacherEditLesson';
import LessonCalendar from '@/components/dashboards/admin/LessonCalendar';
import LessonStatisticsComponent from '@/components/dashboards/admin/LessonStatistics';
import { lessonAPI } from '@/services/TeacherLessonService';

interface LessonItem {
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
  key_concepts?: string[];
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

const TeacherSchedulePage: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [statistics, setStatistics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [viewLesson, setViewLesson] = useState<LessonItem | null>(null);
  const [editLesson, setEditLesson] = useState<LessonItem | null>(null);

  // UI state similar to admin
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'statistics'>('list');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('this_week');
  const [streamFilter, setStreamFilter] = useState<string>('all');

  const themeClasses = {
    bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    iconPrimary: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [lessonsResp, statsResp] = await Promise.all([
        lessonAPI.getLessons({
          search: searchTerm || undefined,
          status_filter: statusFilter !== 'all' ? (statusFilter as any) : undefined,
          date_filter: dateFilter !== 'all' ? (dateFilter as any) : undefined,
          stream_filter: streamFilter !== 'all' ? streamFilter : undefined,
        }),
        lessonAPI.getLessonStatistics()
      ]);

      const items = Array.isArray((lessonsResp as any)?.results)
        ? (lessonsResp as any).results
        : Array.isArray(lessonsResp)
          ? lessonsResp
          : [];
      setLessons(items as LessonItem[]);

      const safeStats = statsResp || {
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
      setStatistics(safeStats);
    } catch (e: any) {
      setError(e?.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter, streamFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartLesson = async (lessonId: number) => {
    await lessonAPI.startLesson(lessonId);
    await loadData();
  };

  const handleCompleteLesson = async (lessonId: number) => {
    await lessonAPI.completeLesson(lessonId);
    await loadData();
  };

  const handleCancelLesson = async (lessonId: number) => {
    await lessonAPI.cancelLesson(lessonId);
    await loadData();
  };

  const handleDeleteLesson = async (lessonId: number) => {
    await lessonAPI.deleteLesson(lessonId);
    await loadData();
  };

  return (
    <TeacherDashboardLayout>
      <div className={`min-h-screen ${themeClasses.bgPrimary} p-6`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} mb-2`}>
                My Lesson Schedule
              </h1>
              <p className={`${themeClasses.textSecondary}`}>
                View, schedule, and track your classroom lessons
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
                onClick={() => setShowAdd(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} transition-colors`}
              >
                <Plus size={20} />
                <span>Create Lesson</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border}`}>
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
              <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Completed</p>
                    <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.completed_lessons}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-green-900' : 'bg-green-100'} p-3 rounded-full`}>
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Scheduled</p>
                    <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.scheduled_lessons}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-orange-900' : 'bg-orange-100'} p-3 rounded-full`}>
                    <Clock size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>
              <div className={`${themeClasses.bgCard} rounded-xl p-6 shadow-lg border ${themeClasses.border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>In Progress</p>
                    <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{statistics.in_progress_lessons}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} p-3 rounded-full`}>
                    <CalendarDays size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className={`${themeClasses.bgCard} rounded-xl p-4 shadow-lg border ${themeClasses.border} mb-4`}>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
              }`}
            >
              <BookOpen size={16} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
              }`}
            >
              <CalendarDays size={16} />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('statistics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'statistics' ? themeClasses.buttonPrimary : themeClasses.buttonSecondary
              }`}
            >
              <BarChart3 size={16} />
              <span>Statistics</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${themeClasses.bgCard} rounded-xl p-4 shadow-lg border ${themeClasses.border} mb-6`}>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconPrimary}`} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {[{ value: 'all', label: 'All Status' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'postponed', label: 'Postponed' }].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {[{ value: 'all', label: 'All Dates' }, { value: 'today', label: 'Today' }, { value: 'tomorrow', label: 'Tomorrow' }, { value: 'this_week', label: 'This Week' }, { value: 'next_week', label: 'Next Week' }, { value: 'overdue', label: 'Overdue' }].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {[{ value: 'all', label: 'All Streams' }, { value: 'Science', label: 'Science' }, { value: 'Arts', label: 'Arts' }, { value: 'Commercial', label: 'Commercial' }, { value: 'Technical', label: 'Technical' }].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg bg-red-100 border border-red-300 ${isDarkMode ? 'bg-red-900 border-red-700' : ''}`}>
            <p className={`text-red-700 ${isDarkMode ? 'text-red-300' : ''}`}>{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {viewMode === 'list' && (
            <TeacherLessonList
              lessons={lessons}
              loading={loading}
              error={error || undefined}
              onStartLesson={handleStartLesson}
              onCompleteLesson={handleCompleteLesson}
              onCancelLesson={handleCancelLesson}
              onDeleteLesson={handleDeleteLesson}
              onViewLesson={(l) => setViewLesson(l)}
              onEditLesson={(l) => setEditLesson(l)}
              onRefresh={loadData}
              showFilters
            />
          )}

          {viewMode === 'calendar' && (
            <LessonCalendar
              lessons={lessons as any}
              onViewLesson={(l: any) => setViewLesson(l)}
              onEditLesson={(l: any) => setEditLesson(l)}
              loading={loading}
            />
          )}

          {viewMode === 'statistics' && statistics && (
            <LessonStatisticsComponent statistics={statistics} lessons={lessons as any} />
          )}
        </div>

        {showAdd && (
          <TeacherAddLesson
            onClose={() => setShowAdd(false)}
            onSuccess={() => {
              setShowAdd(false);
              loadData();
            }}
          />
        )}

        {viewLesson && (
          <TeacherLessonView
            lesson={viewLesson as any}
            onClose={() => setViewLesson(null)}
            onEdit={() => {
              setEditLesson(viewLesson);
              setViewLesson(null);
            }}
            onLessonUpdate={() => loadData()}
          />
        )}

        {editLesson && (
          <EditLessonForm
            lesson={editLesson as any}
            onClose={() => setEditLesson(null)}
            onSuccess={() => {
              setEditLesson(null);
              loadData();
            }}
          />
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherSchedulePage;


